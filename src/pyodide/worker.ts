import minitorchSource from "./minitorch.py?raw";
import fashionNote from "./FASHION.txt?raw";
import houseNote from "./HOUSE.txt?raw";
import airfoilNote from "./AIRFOIL.txt?raw";

interface InitFile {
  name: string;
  buffer: ArrayBuffer;
}

interface InitMessage {
  type: "init";
  indexURL: string;
  sab: SharedArrayBuffer;
  files: InitFile[];
}

interface RunMessage {
  type: "run";
  id: number;
  code: string;
}

type HostMessage = InitMessage | RunMessage;

const files = new Map<string, Uint8Array>();
const nativeFetch = globalThis.fetch.bind(globalThis);

function fileNameOf(url: string) {
  const path = url.split("?")[0] ?? url;
  const slash = path.lastIndexOf("/");
  return slash >= 0 ? path.slice(slash + 1) : path;
}

function contentType(name: string) {
  if (name.endsWith(".wasm")) return "application/wasm";
  if (name.endsWith(".json")) return "application/json";
  if (name.endsWith(".mjs") || name.endsWith(".js")) return "text/javascript";
  return "application/octet-stream";
}

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const name = fileNameOf(url);
  const bytes = files.get(name);
  if (!bytes) return nativeFetch(input, init);
  const copy = bytes.slice();
  return new Response(copy, { status: 200, headers: { "content-type": contentType(name) } });
}) as typeof fetch;

let py: {
  FS: {
    mkdirTree: (path: string) => void;
    writeFile: (path: string, data: string | Uint8Array) => void;
  };
  loadPackage: (name: string) => Promise<unknown>;
  setStdout: (opts: { batched: (text: string) => void }) => void;
  setStderr: (opts: { batched: (text: string) => void }) => void;
  setStdin: (opts: { stdin: () => string | null }) => void;
  runPython: (code: string) => unknown;
} | undefined;

let ctrl: Int32Array | undefined;
let raw: Uint8Array | undefined;
let pending = "";
let sawEof = false;

function readStdin(): string | null {
  if (!ctrl || !raw) return null;
  const decoder = new TextDecoder();
  while (true) {
    const nl = pending.indexOf("\n");
    if (nl >= 0) {
      const line = pending.slice(0, nl + 1);
      pending = pending.slice(nl + 1);
      return line;
    }
    if (sawEof) {
      if (!pending.length) return null;
      const rest = pending;
      pending = "";
      return rest;
    }
    Atomics.store(ctrl, 0, 0);
    postMessage({ type: "stdin" });
    Atomics.wait(ctrl, 0, 0);
    const n = Atomics.load(ctrl, 0);
    if (n < 0) sawEof = true;
    else pending += decoder.decode(raw.slice(0, n));
  }
}

async function boot(message: InitMessage) {
  for (const file of message.files) files.set(file.name, new Uint8Array(file.buffer));
  ctrl = new Int32Array(message.sab, 0, 1);
  raw = new Uint8Array(message.sab, 4);
  const indexURL = message.indexURL.endsWith("/") ? message.indexURL : `${message.indexURL}/`;
  const loaded = (await import(/* @vite-ignore */ new URL("pyodide.mjs", indexURL).href)) as {
    loadPyodide: (opts: Record<string, unknown>) => Promise<NonNullable<typeof py>>;
  };
  py = await loaded.loadPyodide({
    indexURL,
    packageBaseUrl: indexURL,
    fullStdLib: false,
  });
  py.setStdout({ batched: (text) => postMessage({ type: "stdout", text }) });
  py.setStderr({ batched: (text) => postMessage({ type: "stderr", text }) });
  py.setStdin({ stdin: () => readStdin() });
  await py.loadPackage("numpy");
  py.FS.mkdirTree("/opt/simplecode");
  py.FS.writeFile("/opt/simplecode/minitorch.py", minitorchSource);
  py.FS.mkdirTree("/data");
  const fashion = files.get("fashion-mnist.bin");
  if (!fashion) throw new Error("fashion-mnist.bin missing");
  py.FS.writeFile("/data/fashion-mnist.bin", fashion);
  py.FS.writeFile("/data/FASHION.txt", fashionNote);
  const house = files.get("house-tiny.csv");
  if (!house) throw new Error("house-tiny.csv missing");
  py.FS.writeFile("/data/house-tiny.csv", house);
  py.FS.writeFile("/data/HOUSE.txt", houseNote);
  const airfoil = files.get("airfoil-tiny.csv");
  if (!airfoil) throw new Error("airfoil-tiny.csv missing");
  py.FS.writeFile("/data/airfoil-tiny.csv", airfoil);
  py.FS.writeFile("/data/AIRFOIL.txt", airfoilNote);
  postMessage({ type: "ready" });
}

function runProgram(code: string): number {
  if (!py) throw new Error("pyodide is not ready");
  py.FS.writeFile("/program.py", code);
  const exit = py.runPython(`
import runpy, sys, traceback
if "/opt/simplecode" not in sys.path:
    sys.path.insert(0, "/opt/simplecode")
try:
    runpy.run_path("/program.py", run_name="__main__")
    _sc_exit = 0
except SystemExit as _sc_exc:
    _sc_code = _sc_exc.code
    _sc_exit = int(_sc_code) if isinstance(_sc_code, int) else 0
except Exception:
    traceback.print_exc()
    _sc_exit = 1
_sc_exit
`);
  return Number(exit);
}

self.onmessage = (event: MessageEvent<HostMessage>) => {
  const message = event.data;
  if (message.type === "init") {
    boot(message).catch((error: unknown) => {
      const text = error instanceof Error ? error.message : String(error);
      postMessage({ type: "init-error", error: text });
    });
    return;
  }
  pending = "";
  sawEof = false;
  try {
    const exit = runProgram(message.code);
    postMessage({ type: "done", id: message.id, exit });
  } catch (error: unknown) {
    const text = error instanceof Error ? error.message : String(error);
    postMessage({ type: "stderr", text: text.endsWith("\n") ? text : `${text}\n` });
    postMessage({ type: "done", id: message.id, exit: 1 });
  }
};
