import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { DIFFICULTIES, LEETCODE_RUNTIMES, type Difficulty, type Edition, type Problem, indexFor, loadProblem, tagsFor } from "@/docs/leetcode";
import { locale } from "@/i18n";
import { useLanguageStore } from "./language";

const runnable = new Set<string>(LEETCODE_RUNTIMES);

export const useLeetCodeStore = defineStore("leetcode", () => {
  const langs = useLanguageStore();
  const edition = computed<Edition>(() => (locale.value === "en" ? "en" : "zh"));
  const index = computed(() => indexFor(edition.value));
  const tags = computed(() => tagsFor(edition.value));
  const query = ref("");
  const difficulty = ref<Difficulty | "all">("all");
  const tag = ref("");
  const problemId = ref<number>();
  const problem = ref<Problem>();
  const loading = ref(false);
  const both = computed(() =>
    indexFor("zh").map((row) => ({
      zh: row,
      en: indexFor("en").find((item) => item.id === row.id)!,
    })),
  );

  const downloaded = computed(() =>
    langs.languages.filter((lang) => {
      const status = langs.states[lang.id]?.status;
      return status === "cached" || status === "ready";
    }),
  );
  const candidates = computed(() => downloaded.value.filter((lang) => runnable.has(lang.id)));
  const downloading = computed(() => langs.languages.some((lang) => langs.states[lang.id]?.status === "downloading"));
  const emptyReason = computed<"none" | "unusable" | "">(() => {
    if (!downloaded.value.length) return "none";
    if (!candidates.value.length) return "unusable";
    return "";
  });

  function align() {
    // Study mode calls this only while LeetCode is open on a runtime in LEETCODE_RUNTIMES.
    // A hidden section must stay selected; do not jump to the first cached language.
    if (!runnable.has(langs.selectedId)) return;
    if (candidates.value.some((lang) => lang.id === langs.selectedId)) return;
    if (downloading.value) return;
    const first = candidates.value[0];
    if (first) void langs.select(first.id);
  }

  const visible = computed(() => {
    const q = query.value.trim().toLowerCase();
    return both.value
      .filter(({ zh, en }) => {
        if (difficulty.value !== "all" && zh.difficulty !== difficulty.value) return false;
        if (tag.value && !zh.tags.includes(tag.value)) return false;
        if (!q) return true;
        const id = String(zh.id);
        const tagText = zh.tags.join(" ");
        const hay = `${id}\n${zh.title}\n${en.title}\n${zh.slug}\n${tagText}`.toLowerCase();
        return id === q || id.startsWith(q) || hay.includes(q);
      })
      .map(({ zh, en }) => (edition.value === "en" ? en : zh));
  });

  const groups = computed(() =>
    DIFFICULTIES.map((level) => ({
      level,
      items: visible.value.filter((row) => row.difficulty === level).sort((a, b) => a.id - b.id),
    })).filter((group) => group.items.length),
  );

  const counts = computed(() => {
    const rows = both.value.filter(({ zh }) => !tag.value || zh.tags.includes(tag.value));
    return {
      all: rows.length,
      easy: rows.filter(({ zh }) => zh.difficulty === "easy").length,
      medium: rows.filter(({ zh }) => zh.difficulty === "medium").length,
      hard: rows.filter(({ zh }) => zh.difficulty === "hard").length,
    };
  });

  async function openProblem(id: number) {
    problemId.value = id;
    loading.value = true;
    try {
      problem.value = await loadProblem(id, edition.value);
    } finally {
      loading.value = false;
    }
  }
  function backToList() {
    problemId.value = undefined;
    problem.value = undefined;
  }
  async function reloadEdition() {
    if (problemId.value) problem.value = await loadProblem(problemId.value, edition.value);
  }

  return {
    edition,
    index,
    tags,
    query,
    difficulty,
    tag,
    problemId,
    problem,
    loading,
    candidates,
    emptyReason,
    align,
    visible,
    groups,
    counts,
    openProblem,
    backToList,
    reloadEdition,
  };
});
