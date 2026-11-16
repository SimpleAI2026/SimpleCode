import { defineStore } from "pinia";
import { reactive, ref, watch } from "vue";
import { locale } from "@/i18n";
import { isUntouchedSample, sampleFor } from "@/samples";

const key = (id: string) => `simplecode:code:${id}`;
const DIALECT_KEY = "simplecode:quickjs:dialect";
const LEGACY_QUICKJS = "simplecode:code:quickjs";
const LEGACY_DL = "simplecode:code:numpy";

export type JsDialect = "js" | "ts";

export function bufferId(langId: string, dialect: JsDialect) {
  return langId === "quickjs" ? `quickjs:${dialect}` : langId;
}

export function syntaxFor(langId: string, syntax: string, dialect: JsDialect) {
  if (langId !== "quickjs") return syntax;
  return dialect === "ts" ? "typescript" : "javascript";
}

export function fileNameFor(langId: string, fileName: string, dialect: JsDialect) {
  if (langId !== "quickjs") return fileName;
  return dialect === "ts" ? "main.ts" : "main.js";
}

export interface DocWrite {
  blockId: string;
  code: string;
}

export const useEditorStore = defineStore("editor", () => {
  const codes = reactive<Record<string, string>>({});
  const docWrites: Record<string, DocWrite> = {};
  const origins: Record<string, "user" | "doc" | "model"> = {};
  const stored = localStorage.getItem(DIALECT_KEY);
  const dialect = ref<JsDialect>(stored === "ts" ? "ts" : "js");
  watch(dialect, (d) => localStorage.setItem(DIALECT_KEY, d));
  watch(locale, (next) => {
    for (const id of Object.keys(codes)) {
      if (!isUntouchedSample(id, codes[id])) continue;
      const nextCode = sampleFor(id, next);
      codes[id] = nextCode;
      try {
        localStorage.setItem(key(id), nextCode);
      } catch {
        /* private mode */
      }
    }
  });

  function activeBuffer(langId: string) {
    return bufferId(langId, dialect.value);
  }

  function get(id: string) {
    if (!(id in codes)) {
      let saved = localStorage.getItem(key(id));
      if (saved === null && id === "dl") {
        const legacy = localStorage.getItem(LEGACY_DL);
        if (legacy !== null) {
          saved = legacy;
          try {
            localStorage.setItem(key(id), legacy);
            localStorage.removeItem(LEGACY_DL);
          } catch {
            /* private mode */
          }
        }
      }
      if (saved === null && id === "quickjs:js") {
        const legacy = localStorage.getItem(LEGACY_QUICKJS);
        if (legacy !== null) {
          saved = legacy;
          localStorage.setItem(key(id), legacy);
          localStorage.removeItem(LEGACY_QUICKJS);
        }
      }
      if (saved !== null && isUntouchedSample(id, saved)) {
        const localized = sampleFor(id, locale.value);
        if (saved !== localized) {
          saved = localized;
          try {
            localStorage.setItem(key(id), saved);
          } catch {
            /* private mode */
          }
        }
      }
      codes[id] = saved ?? sampleFor(id, locale.value);
    }
    return codes[id];
  }
  function set(id: string, code: string, opts?: { origin?: "user" | "doc" | "model"; blockId?: string }) {
    const origin = opts?.origin ?? "user";
    origins[id] = origin;
    if (origin === "doc" && opts?.blockId) docWrites[id] = { blockId: opts.blockId, code };
    codes[id] = code;
    if (origin !== "model") localStorage.setItem(key(id), code);
  }
  function reset(id: string) {
    localStorage.removeItem(key(id));
    origins[id] = "user";
    delete docWrites[id];
    codes[id] = sampleFor(id, locale.value);
  }
  function lastDocWrite(id: string): DocWrite | undefined {
    return docWrites[id];
  }
  function consumeOrigin(id: string): "user" | "doc" | "model" {
    const origin = origins[id] ?? "user";
    origins[id] = "user";
    return origin;
  }
  return { codes, dialect, activeBuffer, get, set, reset, lastDocWrite, consumeOrigin };
});
