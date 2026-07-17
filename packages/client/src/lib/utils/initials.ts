/**
 * Person initials for avatar marks: the first character of each of the
 * first two whitespace-separated words, uppercased. A single-word name
 * yields one character. Empty or whitespace-only names yield null so
 * callers can render their own placeholder.
 *
 * charAt semantics: a character outside the BMP (surrogate pair)
 * contributes only its first code unit. Person display names in the
 * supported locales are unaffected; org marks use orgInitial, which is
 * grapheme-aware.
 */
export function personInitials(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed === "") return null;
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

/**
 * Org initial for seal marks: the first grapheme of the org name,
 * uppercased. Grapheme-first so an emoji or combining-mark initial
 * survives whole. Empty or whitespace-only names yield undefined so
 * callers can skip the seal.
 */
export function orgInitial(name: string): string | undefined {
  const trimmed = name.trim();
  if (trimmed === "") return undefined;
  return new Intl.Segmenter(undefined, { granularity: "grapheme" })
    .segment(trimmed)
    .containing(0)
    ?.segment.toUpperCase();
}
