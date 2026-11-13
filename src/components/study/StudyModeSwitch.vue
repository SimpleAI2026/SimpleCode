<script setup lang="ts">
import { computed } from "vue";
import { BookOpen, ListChecks } from "lucide-vue-next";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isLeetCodeRuntime } from "@/docs/leetcode";
import { t } from "@/i18n";
import { useDocsStore } from "@/stores/docs";
import { useLanguageStore } from "@/stores/language";
import { useStudyStore } from "@/stores/study";

const docs = useDocsStore();
const study = useStudyStore();
const langs = useLanguageStore();
const showLeetCode = computed(() => isLeetCodeRuntime(langs.selectedId));

function learn() {
  study.pickLearn();
}
function leetcode() {
  study.pickLeet();
}
</script>

<template>
  <div
    class="flex h-7 items-center rounded-md border border-border p-0.5"
    role="group"
    :aria-label="t('studyModeGroup')"
    data-testid="study-mode"
  >
    <Tooltip>
      <TooltipTrigger as-child>
        <button
          type="button"
          data-testid="study-mode-learn"
          class="flex h-6 items-center gap-1 rounded px-2 text-xs"
          :class="study.mode === 'learn' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'"
          :aria-pressed="study.mode === 'learn'"
          :aria-expanded="docs.open && study.mode === 'learn'"
          aria-controls="docs-drawer"
          @click="learn"
        >
          <BookOpen class="size-3.5" />
          <span class="max-md:sr-only">{{ t("quickStart") }}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{{ t("openQuickStartShort") }}</TooltipContent>
    </Tooltip>
    <Tooltip v-if="showLeetCode">
      <TooltipTrigger as-child>
        <button
          type="button"
          data-testid="study-mode-leetcode"
          class="flex h-6 items-center gap-1 rounded px-2 text-xs"
          :class="study.mode === 'leetcode' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'"
          :aria-pressed="study.mode === 'leetcode'"
          :aria-expanded="docs.open && study.mode === 'leetcode'"
          aria-controls="docs-drawer"
          @click="leetcode"
        >
          <ListChecks class="size-3.5" />
          <span class="max-md:sr-only">LeetCode</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{{ t("openLeetCode") }}</TooltipContent>
    </Tooltip>
  </div>
</template>
