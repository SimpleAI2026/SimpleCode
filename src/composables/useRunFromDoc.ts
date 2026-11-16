import { computed } from "vue";
import { terminal } from "@/core/terminal";
import { TranspileError, transpileTypeScript } from "@/core/transpile";
import { runtimeForFence, runtimeLabel, type RuntimeId } from "@/docs/runtime";
import { shouldBackup } from "@/docs/backup";
import { stripAnsi } from "@/docs/text";
import { useDocsStore } from "@/stores/docs";
import { useEditorStore, type JsDialect } from "@/stores/editor";
import { useLanguageStore } from "@/stores/language";
import { useRunStore } from "@/stores/run";
import { useToastStore } from "@/stores/toast";
import { t } from "@/i18n";

export interface RunFromDocOptions {
  blockId: string;
  /** Book that owns the fence, so a Pyodide block stays on that book's sidebar row. */
  book?: string;
  stdin?: string;
  useStdin?: boolean;
  stdinEOF?: boolean;
  expect?: string;
  confirmStop?: () => Promise<boolean>;
  keepDrawerOpen?: boolean;
}

export type RunFromDocResult =
  | { type: "unsupported"; lang: string }
  | { type: "cancelled" }
  | { type: "download-failed"; error?: string }
  | { type: "transpile-error"; message: string; line?: number; column?: number }
  | { type: "finished"; status: "done" | "failed" | "crash" | "terminated"; exitCode?: number; matchedExpect?: boolean };

const undoState: { runtimeId?: RuntimeId; bufferId?: string; code: string; dialect?: JsDialect; active: boolean } = {
  code: "",
  active: false,
};

function isTypeScript(lang: string) {
  const key = lang.toLowerCase();
  return key === "ts" || key === "typescript";
}

/** Doc blocks reuse the toolbar transpile. The editor then holds JavaScript, so Run does not strip types twice. */
async function typescriptForEditor(code: string): Promise<
  | { ok: true; code: string }
  | { ok: false; message: string; line?: number; column?: number }
> {
  try {
    const js = (await transpileTypeScript(code)).replace(/\s+$/, "");
    return { ok: true, code: `${t("tsBanner")}\n${js}\n` };
  } catch (e) {
    if (e instanceof TranspileError) return { ok: false, message: e.detail, line: e.line, column: e.column };
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message };
  }
}

export function useRunFromDoc() {
  const langs = useLanguageStore();
  const editor = useEditorStore();
  const run = useRunStore();
  const docs = useDocsStore();
  const toast = useToastStore();

  const activeBlockId = computed(() => {
    const src = run.source;
    if (!src || src === "editor") return undefined;
    return src;
  });

  async function runFromDoc(code: string, lang: string, opts: RunFromDocOptions): Promise<RunFromDocResult> {
    const runtimeId = runtimeForFence(lang, opts.book);
    if (!runtimeId) return { type: "unsupported", lang };

    if (run.running) {
      if (run.source === opts.blockId) {
        run.stop();
        return { type: "finished", status: "terminated" };
      }
      const ok = opts.confirmStop ? await opts.confirmStop() : false;
      if (!ok) return { type: "cancelled" };
      run.stop();
      const idle = await run.waitUntilIdle(1200);
      if (!idle) return { type: "cancelled" };
    }

    const switched = langs.selectedId !== runtimeId;
    const ready = await langs.select(runtimeId, "doc");
    if (!ready) return { type: "download-failed", error: langs.states[runtimeId]?.error };

    const prevDialect = editor.dialect;
    let finalCode = code;
    if (isTypeScript(lang)) {
      const transformed = await typescriptForEditor(code);
      if (!transformed.ok) return { type: "transpile-error", message: transformed.message, line: transformed.line, column: transformed.column };
      finalCode = transformed.code;
      editor.dialect = "js";
    }

    const bufferId = editor.activeBuffer(runtimeId);
    const prev = editor.get(bufferId);
    const last = editor.lastDocWrite(bufferId);
    const label = runtimeLabel(runtimeId);
    if (shouldBackup(prev, finalCode, last)) {
      localStorage.setItem(`simplecode:backup:${bufferId}`, JSON.stringify({ code: prev, at: Date.now(), reason: "doc-run" }));
      undoState.runtimeId = runtimeId;
      undoState.bufferId = bufferId;
      undoState.code = prev;
      undoState.dialect = prevDialect;
      undoState.active = true;
      const message = switched ? t("switchedReplaced", { label }) : t("replacedEditor", { label });
      toast.push(message, { label: t("undo"), run: () => undoLastReplace() }, 8000);
    } else if (switched) {
      toast.push(t("switchedTo", { label }), undefined, 4000);
    }

    editor.set(bufferId, finalCode, { origin: "doc", blockId: opts.blockId });

    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const keep = opts.keepDrawerOpen ?? !mobile;
    if (!keep) docs.close();

    const useStdin = opts.useStdin !== false && typeof opts.stdin === "string";
    await run.run({
      stdin: useStdin ? opts.stdin : undefined,
      stdinEOF: opts.stdinEOF !== false,
      source: opts.blockId,
    });
    terminal.focus();

    const status = run.status;
    const finished = status === "done" || status === "failed" || status === "crash" || status === "terminated" ? status : "failed";
    let matchedExpect: boolean | undefined;
    if (opts.expect != null) matchedExpect = stripAnsi(terminal.transcript).includes(opts.expect);
    return { type: "finished", status: finished, exitCode: run.exitCode, matchedExpect };
  }

  function stopFromDoc(_blockId?: string) {
    run.stop();
  }

  function undoLastReplace() {
    if (!undoState.active || !undoState.runtimeId || !undoState.bufferId) return;
    const runtimeId = undoState.runtimeId;
    const bufferId = undoState.bufferId;
    const code = undoState.code;
    const dialect = undoState.dialect;
    undoState.active = false;
    if (run.running) run.stop();
    if (langs.selectedId !== runtimeId) void langs.select(runtimeId, "doc");
    if (dialect) editor.dialect = dialect;
    editor.set(bufferId, code);
    localStorage.removeItem(`simplecode:backup:${bufferId}`);
    toast.dismissAll();
  }

  return { activeBlockId, runFromDoc, stopFromDoc, undoLastReplace };
}
