import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { formatMB, languageAssetIds, languageSize, loadManifest, type LanguageSpec, type Manifest } from "@/core/manifest";
import { LinuxKilled, attachLinuxConsole, linuxMachine } from "@/core/linux";
import { cancelRustCompile } from "@/rustc/compile";
import { clearRustCache, ensureRustToolchain, rustCacheBytes, rustDownloadBytes, rustIsCached, rustReady } from "@/rustc/toolchain";
import { cancelJavaRun } from "@/teavm/run";
import { cancelPyodide } from "@/pyodide/run";
import { runtimeName } from "@/i18n";
import { canonicalRuntime, runtimeFromHash } from "@/docs/runtime";
import { clearJavaCache, ensureJavaToolchain, javaCacheBytes, javaDownloadBytes, javaIsCached, javaReady } from "@/teavm/toolchain";
import { cacheUsage, clearCache as clearWasmCache, ensureAsset, getLoaded, isCached, pruneCache } from "@/core/wasmLoader";
import { terminal } from "@/core/terminal";
import type { MessageKey } from "@/i18n/messages.ts";
import { useRunStore } from "./run";

export type LangStatus = "idle" | "cached" | "downloading" | "ready" | "error";

export interface LangState {
  status: LangStatus;
  loaded: number;
  total: number;
  error?: string;
  /** "boot" while the Linux guest is restoring its snapshot. */
  detail?: "download" | "boot";
}

const SELECTED_KEY = "simplecode:language";

function readStoredLanguage(): string {
  try {
    const raw = localStorage.getItem(SELECTED_KEY) || "python";
    const id = canonicalRuntime(raw);
    if (id !== raw) localStorage.setItem(SELECTED_KEY, id);
    return id;
  } catch {
    return "python";
  }
}

function readInitialLanguage(): string {
  const fromHash = typeof location !== "undefined" ? runtimeFromHash(location.hash) : undefined;
  return fromHash ?? readStoredLanguage();
}

export const useLanguageStore = defineStore("language", () => {
  const manifest = ref<Manifest>();
  const manifestError = ref<string>();
  const selectedId = ref<string>(readInitialLanguage());
  const states = reactive<Record<string, LangState>>({});
  const usage = ref(0);
  const selectionOrigin = ref<"user" | "doc">("user");
  const controllers = new Map<string, AbortController>();
  const attempt = new Map<string, number>();
  const inflight = new Map<string, { token: number; promise: Promise<boolean> }>();

  function invalidate(id: string) {
    attempt.set(id, (attempt.get(id) ?? 0) + 1);
  }

  function claim(id: string) {
    const token = (attempt.get(id) ?? 0) + 1;
    attempt.set(id, token);
    return token;
  }

  function live(id: string, token: number) {
    return selectedId.value === id && attempt.get(id) === token;
  }

  function park(id: string) {
    const st = states[id];
    if (!st || st.status !== "downloading") return;
    st.detail = undefined;
    st.error = undefined;
    st.status = "idle";
  }

  const languages = computed(() => manifest.value?.languages ?? []);
  const selected = computed(() => languages.value.find((l) => l.id === selectedId.value));
  const selectedState = computed(() => (selectedId.value ? states[selectedId.value] : undefined));

  function sizeOf(lang: LanguageSpec) {
    if (lang.compiler === "weblings") return rustDownloadBytes();
    if (lang.compiler === "teavm") return javaDownloadBytes();
    return manifest.value ? languageSize(manifest.value, lang) : 0;
  }

  async function refreshUsage() {
    usage.value = (await cacheUsage()) + (await rustCacheBytes()) + (await javaCacheBytes());
  }

  async function refreshStatuses() {
    const m = manifest.value;
    if (!m) return;
    for (const lang of m.languages) {
      if (!states[lang.id]) states[lang.id] = { status: "idle", loaded: 0, total: sizeOf(lang) };
      const st = states[lang.id]; // re-read through the reactive proxy
      if (st.status === "downloading") continue;
      if (lang.compiler === "weblings" || lang.compiler === "teavm") {
        const ready = lang.compiler === "weblings" ? rustReady() : javaReady();
        const cached = lang.compiler === "weblings" ? await rustIsCached() : await javaIsCached();
        if (ready) st.status = "ready";
        else if (cached) st.status = "cached";
        else if (st.status !== "error") st.status = "idle";
        continue;
      }
      const ids = languageAssetIds(lang);
      if (ids.every((id) => getLoaded(id))) st.status = "ready";
      else if ((await Promise.all(ids.map((id) => isCached(m.assets[id])))).every(Boolean)) st.status = "cached";
      else if (st.status !== "error") st.status = "idle";
    }
  }

  async function init() {
    try {
      manifest.value = await loadManifest();
      manifestError.value = undefined;
    } catch (e) {
      manifestError.value = (e as Error).message;
      return;
    }
    const stored = canonicalRuntime(selectedId.value);
    selectedId.value = languages.value.some((l) => l.id === stored) ? stored : (languages.value[0]?.id ?? stored);
    try {
      if (selectedId.value) localStorage.setItem(SELECTED_KEY, selectedId.value);
    } catch {
      /* private mode */
    }
    writeLanguageHash(selectedId.value);
    await pruneCache(Object.values(manifest.value.assets)).catch(() => {});
    await refreshStatuses();
    void refreshUsage();
    void navigator.storage?.persist?.().catch(() => {});
    if (selected.value) void ensure(selected.value.id);
  }

  function compilerOf(id: string) {
    return manifest.value?.languages.find((lang) => lang.id === id)?.compiler;
  }

  function releaseRuntime(prev: string, next = "") {
    const sharePyodide = compilerOf(prev) === "pyodide" && compilerOf(next) === "pyodide";
    useRunStore().abandon();
    cancelRustCompile();
    cancelJavaRun();
    // DeepLearning and NumPy share one worker. An in-flight run still kills it
    // inside abandon(), because runPython cannot be interrupted. An idle switch
    // keeps the booted engine and the Cache API entries.
    if (!sharePyodide) cancelPyodide();
    for (const [cid, ctrl] of [...controllers]) {
      invalidate(cid);
      ctrl.abort();
      park(cid);
    }
    if (!controllers.has(prev)) invalidate(prev);
    if (prev === "linux" || linuxMachine.booted) {
      linuxMachine.shutdown();
      if (states.linux?.status === "ready") states.linux.status = "cached";
    }
    terminal.detachInput();
    terminal.clear();
  }

  function writeLanguageHash(id: string) {
    if (typeof location === "undefined" || typeof history === "undefined") return;
    if (!runtimeFromHash(location.hash)) return;
    const next = `#${id}`;
    if (location.hash === next) return;
    history.replaceState(history.state, "", `${location.pathname}${location.search}${next}`);
  }

  async function select(id: string, origin: "user" | "doc" = "user") {
    id = canonicalRuntime(id);
    const prev = selectedId.value;
    if (prev !== id) releaseRuntime(prev, id);
    selectionOrigin.value = origin;
    selectedId.value = id;
    try {
      localStorage.setItem(SELECTED_KEY, id);
    } catch {
      /* private mode */
    }
    writeLanguageHash(id);
    try {
      return await ensure(id);
    } catch (e) {
      // A language switch aborts the download. Resolve so a caller that
      // returns this promise does not surface AbortError to Vue.
      if ((e as Error).name === "AbortError") return false;
      throw e;
    }
  }

  function ensure(id: string): Promise<boolean> {
    const current = attempt.get(id) ?? 0;
    const flight = inflight.get(id);
    if (flight && flight.token === current) return flight.promise;
    const token = claim(id);
    const promise = doEnsure(id, token).finally(() => {
      if (inflight.get(id)?.token === token) inflight.delete(id);
    });
    inflight.set(id, { token, promise });
    return promise;
  }

  async function doEnsure(id: string, token: number): Promise<boolean> {
    const m = manifest.value;
    const lang = m?.languages.find((l) => l.id === id);
    if (!m || !lang || !live(id, token)) return false;
    // Sidebar buttons appear as soon as the manifest is assigned, which is
    // before refreshStatuses fills `states`. Selecting in that window must
    // not throw on a missing entry.
    if (!states[id]) states[id] = { status: "idle", loaded: 0, total: sizeOf(lang) };
    const st = states[id];
    if (st.status === "ready") return true;
    const label = runtimeName(lang.id, lang.label);
    const note = (key: MessageKey, vars?: Record<string, string | number>, color = "2") => {
      if (live(id, token)) terminal.system(key, vars, color);
    };
    if (lang.compiler === "weblings" || lang.compiler === "teavm") {
      const bytes = lang.compiler === "weblings" ? rustDownloadBytes : javaDownloadBytes;
      const readyNow = lang.compiler === "weblings" ? rustReady : javaReady;
      const ensure = lang.compiler === "weblings" ? ensureRustToolchain : ensureJavaToolchain;
      const fromNetwork = st.status !== "cached" && !readyNow();
      st.status = "downloading";
      st.error = undefined;
      st.total = bytes();
      st.loaded = 0;
      const ctrl = new AbortController();
      controllers.set(id, ctrl);
      if (fromNetwork) note("downloadingToolchain", { label, size: formatMB(st.total) });
      try {
        await ensure((loaded, total) => {
          if (!live(id, token)) return;
          st.loaded = loaded;
          st.total = total;
        }, ctrl.signal);
        if (!live(id, token)) return false;
        st.status = "ready";
        st.loaded = st.total;
        if (fromNetwork) note("readyCached", { label }, "32");
        await refreshStatuses();
        void refreshUsage();
        return true;
      } catch (e) {
        if (!live(id, token)) return false;
        const aborted = (e as Error).name === "AbortError";
        st.status = aborted ? "idle" : "error";
        st.error = aborted ? undefined : (e as Error).message;
        note(
          aborted ? "canceledDownload" : "downloadFailedLabel",
          aborted ? { label } : { label, error: (e as Error).message },
          aborted ? "2" : "31",
        );
        return false;
      } finally {
        if (controllers.get(id) === ctrl) controllers.delete(id);
      }
    }
    const ids = languageAssetIds(lang);
    const fromNetwork = st.status !== "cached";
    const progress: Record<string, number> = {};
    st.status = "downloading";
    st.detail = "download";
    st.error = undefined;
    st.total = sizeOf(lang);
    st.loaded = 0;
    const ctrl = new AbortController();
    controllers.set(id, ctrl);
    if (fromNetwork) note("downloadingRuntime", { label, size: formatMB(st.total) });
    try {
      await Promise.all(
        ids.map((assetId) =>
          ensureAsset(
            assetId,
            m.assets[assetId],
            (loaded) => {
              if (!live(id, token)) return;
              progress[assetId] = loaded;
              st.loaded = Object.values(progress).reduce((a, b) => a + b, 0);
            },
            ctrl.signal,
          ),
        ),
      );
      if (!live(id, token)) return false;
      if (lang.runtime === "v86") {
        st.detail = "boot";
        note("bootingLinux");
        await linuxMachine.bootFromAssets();
        if (!live(id, token)) {
          linuxMachine.shutdown();
          return false;
        }
        attachLinuxConsole();
        note("linuxReady", undefined, "32");
      }
      if (!live(id, token)) return false;
      st.detail = undefined;
      st.status = "ready";
      st.loaded = st.total;
      if (fromNetwork && lang.runtime !== "v86") note("readyCached", { label }, "32");
      await refreshStatuses();
      void refreshUsage();
      return true;
    } catch (e) {
      if (!live(id, token)) return false;
      const aborted = (e as Error).name === "AbortError";
      const stopped = e instanceof LinuxKilled;
      const booting = st.detail === "boot";
      st.detail = undefined;
      if (stopped) {
        if (st.status === "downloading") st.status = "cached";
        st.error = undefined;
        return false;
      }
      st.status = aborted ? "idle" : "error";
      st.error = aborted ? undefined : (e as Error).message;
      note(
        aborted ? (booting ? "canceledBoot" : "canceledDownload") : booting ? "failedBoot" : "downloadFailedLabel",
        aborted ? { label } : { label, error: (e as Error).message },
        aborted ? "2" : "31",
      );
      return false;
    } finally {
      if (controllers.get(id) === ctrl) controllers.delete(id);
    }
  }

  function cancel(id: string) {
    controllers.get(id)?.abort();
  }

  async function clearCache() {
    const prev = selectedId.value;
    releaseRuntime(prev);
    await clearWasmCache();
    await clearRustCache();
    await clearJavaCache();
    for (const s of Object.values(states)) if (s.status !== "downloading") s.status = "idle";
    await refreshUsage();
  }

  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", () => {
      const id = runtimeFromHash(location.hash);
      if (!id) return;
      if (id !== selectedId.value) void select(id);
      else writeLanguageHash(id);
    });
  }

  return { manifest, manifestError, languages, selectedId, selected, selectedState, states, usage, selectionOrigin, init, select, ensure, cancel, clearCache, sizeOf };
});
