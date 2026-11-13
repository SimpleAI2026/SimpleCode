import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { isLeetCodeRuntime } from "@/docs/leetcode";
import { useDocsStore } from "./docs";
import { useLanguageStore } from "./language";
import { useLeetCodeStore } from "./leetcode";

const MODE_KEY = "simplecode:study-mode";
const REVEALED_KEY = "simplecode:leetcode:revealed";
const SOLVED_KEY = "simplecode:leetcode:solved";

export type StudyMode = "learn" | "leetcode";

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const useStudyStore = defineStore("study", () => {
  const docs = useDocsStore();
  const langs = useLanguageStore();
  const stored = localStorage.getItem(MODE_KEY);
  const mode = ref<StudyMode>(stored === "leetcode" ? "leetcode" : "learn");
  const revealed = ref<string[]>(loadJson(REVEALED_KEY, []));
  const solved = ref<number[]>(loadJson(SOLVED_KEY, []));

  function persistMode() {
    localStorage.setItem(MODE_KEY, mode.value);
  }
  function leetcodeHere() {
    return isLeetCodeRuntime(langs.selectedId);
  }
  function retreatToLearn() {
    if (leetcodeHere() || mode.value !== "leetcode") return;
    mode.value = "learn";
    persistMode();
    if (docs.open) docs.show();
  }
  function openLeet() {
    if (!leetcodeHere()) return;
    docs.open = true;
    useLeetCodeStore().align();
  }
  function openForMode() {
    if (!leetcodeHere()) {
      if (mode.value !== "learn") {
        mode.value = "learn";
        persistMode();
      }
      docs.show();
      return;
    }
    if (mode.value === "learn") docs.show();
    else openLeet();
  }
  function toggleDrawer() {
    if (docs.open) docs.close();
    else openForMode();
  }
  function pickLearn() {
    if (mode.value === "learn") {
      toggleDrawer();
      return;
    }
    mode.value = "learn";
    persistMode();
    docs.show();
  }
  function pickLeet() {
    if (!leetcodeHere()) return;
    if (mode.value === "leetcode") {
      toggleDrawer();
      return;
    }
    mode.value = "leetcode";
    persistMode();
    openLeet();
  }
  watch(() => langs.selectedId, retreatToLearn, { immediate: true, flush: "sync" });
  function revealKey(id: number, runtimeId: string) {
    return `${id}:${runtimeId}`;
  }
  function isRevealed(id: number, runtimeId: string) {
    return revealed.value.includes(revealKey(id, runtimeId));
  }
  function toggleReveal(id: number, runtimeId: string) {
    const key = revealKey(id, runtimeId);
    revealed.value = revealed.value.includes(key) ? revealed.value.filter((item) => item !== key) : [...revealed.value, key];
    localStorage.setItem(REVEALED_KEY, JSON.stringify(revealed.value));
  }
  function markSolved(id: number) {
    if (solved.value.includes(id)) return;
    solved.value = [...solved.value, id];
    localStorage.setItem(SOLVED_KEY, JSON.stringify(solved.value));
  }

  return { mode, revealed, solved, toggleDrawer, pickLearn, pickLeet, isRevealed, toggleReveal, markSolved };
});
