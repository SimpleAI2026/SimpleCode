export type DocEdition = "zh" | "en";

export type EnglishGap = "book" | "chapter" | null;

export function chapterId(book: string, slug: string, edition: DocEdition): string {
  return edition === "en" ? `en/${book}/${slug}` : `${book}/${slug}`;
}

export function chapterSlug(id: string): string {
  const parts = id.split("/");
  // en/<book>/<slug...> or <book>/<slug...>. DeepLearning slugs include chapter_*/file.
  const rest = parts[0] === "en" ? parts.slice(2) : parts.slice(1);
  return rest.join("/") || id;
}

/** Which English placeholder to show. A full English book hides it. */
export function englishGap(opts: { edition: DocEdition; slugs: readonly string[]; slug?: string; viewingChapter: boolean }): EnglishGap {
  if (opts.edition !== "en") return null;
  if (opts.slugs.length === 0) return "book";
  if (opts.viewingChapter && opts.slug && !opts.slugs.includes(opts.slug)) return "chapter";
  return null;
}
