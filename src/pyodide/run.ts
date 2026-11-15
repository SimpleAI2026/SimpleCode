import { getLoaded } from "@/core/wasmLoader";
import { t } from "@/i18n";

const CAP = 65536;
const FILE_ASSETS = [
  ["pyodide-mjs", "pyodide.mjs"],
  ["pyodide-asm-mjs", "pyodide.asm.mjs"],
  ["pyodide-wasm", "pyodide.asm.wasm"],
  ["pyodide-stdlib", "python_stdlib.zip"],
  ["pyodide-lock", "pyodide-lock.json"],
  ["pyodide-numpy", "numpy-2.4.6-cp314-cp314-pyemscripten_2026_0_wasm32.whl"],
  ["pyodide-fashion", "fashion-mnist.bin"],
  ["pyodide-house", "house-tiny.csv"],
  ["pyodide-airfoil", "airfoil-tiny.csv"],
] as const;

interface DoneMessage {
  type: "done";
  id: number;
  exit: number;
}

let worker: Worker | undefined;
let ready: Promise<void> | undefined;
let seq = 0;
let current: { id: number; resolve: (exit: number) => void; reject: (error: Error) => void } | undefined;
let sab: SharedArrayBuffer | undefined;
let ctrl: Int32Array | undefined;
let raw: Uint8Array | undefined;
let queued = "";
let eof = false;
let waiting = false;

function resetStdin(preset: string | undefined, stdinEOF: boolean) {
  queued = preset ?? "";
  eof = stdinEOF && preset !== undefined;
  waiting = false;
}

function flushStdin() {
  if (!waiting || !ctrl || !raw) return;
  if (!queued) {
    if (!eof) return;
    Atomics.store(ctrl, 0, -1);
    Atomics.notify(ctrl, 0);
    waiting = false;
    return;
  }
  const encoded = new TextEncoder().encode(queued);
  const n = Math.min(encoded.length, CAP);
  raw.set(encoded.subarray(0, n));
  queued = new TextDecoder().decode(encoded.subarray(n));
  Atomics.store(ctrl, 0, n);
  Atomics.notify(ctrl, 0);
  waiting = false;
}

export function pushPyodideStdin(text: string) {
  queued += text;
  flushStdin();
}

export function pushPyodideEOF() {
  eof = true;
  flushStdin();
}

export function cancelPyodide() {
  const slot = current;
  current = undefined;
  ready = undefined;
  worker?.terminate();
  worker = undefined;
  sab = undefined;
  ctrl = undefined;
  raw = undefined;
  queued = "";
  eof = false;
  waiting = false;
  slot?.reject(new DOMException("pyodide terminated", "AbortError"));
}

function assetBytes(id: string, file: string): ArrayBuffer {
  const loaded = getLoaded(id);
  if (!loaded?.bytes) throw new Error(t("pyodideMissing", { file }));
  return loaded.bytes.slice().buffer;
}

function engine(): Promise<Worker> {
  if (!ready) {
    const indexURL = new URL(`${import.meta.env.BASE_URL}wasm/pyodide/`, location.origin).href;
    const shared = new SharedArrayBuffer(4 + CAP);
    sab = shared;
    ctrl = new Int32Array(shared, 0, 1);
    raw = new Uint8Array(shared, 4);
    const files = FILE_ASSETS.map(([id, name]) => ({ name, buffer: assetBytes(id, name) }));
    const currentWorker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    worker = currentWorker;
    ready = new Promise<void>((resolve, reject) => {
      const fail = (error: Error) => {
        if (worker === currentWorker) {
          ready = undefined;
          worker = undefined;
        }
        reject(error);
      };
      currentWorker.onmessage = (event: MessageEvent) => {
        const message = event.data;
        if (message.type === "ready") {
          resolve();
          return;
        }
        if (message.type === "init-error") {
          fail(new Error(message.error || t("pyodideWorker")));
          return;
        }
        if (message.type === "stdin") {
          waiting = true;
          flushStdin();
          return;
        }
        const slot = current;
        if (!slot) return;
        if (message.type === "stdout") slot && message.text && postOut(slot, "stdout", message.text);
        else if (message.type === "stderr") postOut(slot, "stderr", message.text);
        else if (message.type === "done" && message.id === slot.id) {
          current = undefined;
          slot.resolve((message as DoneMessage).exit);
        }
      };
      currentWorker.onerror = (event) => {
        fail(new Error(event.message || t("pyodideWorker")));
      };
    });
    const transfers = files.map((file) => file.buffer);
    currentWorker.postMessage({ type: "init", indexURL, sab: shared, files }, transfers);
  }
  return ready.then(() => {
    if (!worker) throw new Error(t("pyodideWorker"));
    return worker;
  });
}

const outs = new Map<number, { stdout: (text: string) => void; stderr: (text: string) => void }>();

function postOut(slot: { id: number }, kind: "stdout" | "stderr", text: string) {
  const handlers = outs.get(slot.id);
  if (!handlers || !text) return;
  handlers[kind](text);
}

export interface PyodideRunHandlers {
  stdin?: string;
  stdinEOF?: boolean;
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  onRunning: () => void;
}

export async function runPyodide(code: string, handlers: PyodideRunHandlers): Promise<number> {
  const host = await engine();
  handlers.onRunning();
  const id = ++seq;
  resetStdin(handlers.stdin, handlers.stdinEOF !== false);
  outs.set(id, handlers);
  const exit = await new Promise<number>((resolve, reject) => {
    current = { id, resolve, reject };
    host.postMessage({ type: "run", id, code });
  }).finally(() => {
    outs.delete(id);
  });
  return exit;
}
