import { ref } from "vue";
import { en, zh, type MessageKey } from "./messages.ts";

export const LOCALE_KEY = "simplecode:locale";
export type Locale = "zh" | "en";

export const messages = { zh, en };

/** Default is Chinese until `hydrateLocale` reads localStorage. */
export const locale = ref<Locale>("zh");

export function storedLocale(): Locale {
  try {
    return localStorage.getItem(LOCALE_KEY) === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

export function hydrateLocale() {
  locale.value = storedLocale();
}

export function setLocale(next: Locale) {
  locale.value = next === "en" ? "en" : "zh";
  try {
    localStorage.setItem(LOCALE_KEY, locale.value);
  } catch {
    /* private mode */
  }
}

function fill(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  let out = template;
  for (const [key, value] of Object.entries(vars)) out = out.split(`{${key}}`).join(String(value));
  return out;
}

/** Sidebar names for the two Pyodide rows. Other languages keep the manifest label. */
export function runtimeName(id: string, fallback: string): string {
  if (id === "numpy") return t("langNumpy");
  if (id === "np") return t("langNp");
  return fallback;
}

/** Drawer title for a book. The DeepLearning book uses the same name in both locales. */
export function bookName(id: string, fallback: string): string {
  if (id === "numpy") return t("bookNumpy");
  if (id === "dl") return t("bookDl");
  return fallback;
}

/** Reads `locale` so Vue templates and computeds refresh after a toggle. */
export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  const pack = locale.value === "en" ? en : zh;
  return fill(pack[key], vars);
}
