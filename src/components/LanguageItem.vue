<script setup lang="ts">
import { computed } from "vue";
import { AlertCircle, Check, Download, Loader2 } from "lucide-vue-next";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatMB, type LanguageSpec } from "@/core/manifest";
import type { LangState } from "@/stores/language";
import LanguageIcon from "./LanguageIcon.vue";
import { runtimeName, t } from "@/i18n";

const props = defineProps<{ lang: LanguageSpec; state?: LangState; size: number; selected: boolean; collapsed: boolean }>();
defineEmits<{ select: [] }>();

const status = computed(() => props.state?.status ?? "idle");
const pct = computed(() => (props.state?.total ? Math.round((props.state.loaded / props.state.total) * 100) : 0));
const sizeLabel = computed(() => formatMB(props.size).replace(".0", ""));
const label = computed(() => runtimeName(props.lang.id, props.lang.label));
const tip = computed(() => {
  const s = props.state;
  const shown = props.lang.id === "dl" && props.lang.version ? `${label.value} · ${props.lang.version}` : label.value;
  if (status.value === "downloading" && s?.detail === "boot") return t("bootingDetail", { label: shown });
  if (status.value === "downloading" && s) {
    return t("downloadingDetail", { label: shown, pct: pct.value, loaded: formatMB(s.loaded), total: formatMB(s.total) });
  }
  if (status.value === "error") return t("errorDetail", { label: shown, error: s?.error ?? t("downloadFailed") });
  if (status.value === "idle") return t("idleDetail", { label: shown, size: formatMB(props.size) });
  return t("cachedDetail", { label: label.value, version: props.lang.version ?? "" });
});
</script>

<template>
  <Tooltip :disabled="!collapsed && status !== 'error'">
    <TooltipTrigger as-child>
      <button
        type="button"
        :data-testid="`lang-${lang.id}`"
        :data-status="status"
        :aria-label="label"
        :aria-current="selected ? 'true' : undefined"
        :class="
          cn(
            'sidebar-item relative flex h-10 items-center overflow-hidden rounded-md text-left text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
            collapsed ? 'mx-auto w-10 justify-center px-0' : 'w-full gap-2.5 px-2',
            selected && 'bg-accent font-medium',
          )
        "
        @click="$emit('select')"
      >
        <LanguageIcon :short="lang.short" :status="status" :selected="selected" :progress="pct" />
        <template v-if="!collapsed">
          <span class="sidebar-expanded-only min-w-0 flex-1 truncate">
            {{ label }}<span v-if="lang.id === 'dl'" class="font-normal text-muted-foreground"> · {{ lang.version }}</span>
          </span>
          <span
            v-if="status === 'downloading'"
            class="sidebar-expanded-only flex shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground"
          >
            <Loader2 class="size-3.5 animate-spin" />{{ state?.detail === "boot" ? t("booting") : `${pct}%` }}
          </span>
          <span v-else-if="status === 'error'" class="sidebar-expanded-only flex shrink-0 items-center gap-1 text-xs text-foreground">
            <AlertCircle class="size-3.5" />{{ t("retry") }}
          </span>
          <span v-else-if="status === 'idle'" class="sidebar-expanded-only flex shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground">
            <Download class="size-3.5" />{{ sizeLabel }}
          </span>
          <Check v-else class="sidebar-expanded-only size-3.5 shrink-0 text-foreground" />
        </template>
        <Progress
          v-if="status === 'downloading'"
          data-testid="wasm-progress"
          :model-value="pct"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-0.5 rounded-none"
        />
      </button>
    </TooltipTrigger>
    <TooltipContent side="right">{{ tip }}</TooltipContent>
  </Tooltip>
</template>
