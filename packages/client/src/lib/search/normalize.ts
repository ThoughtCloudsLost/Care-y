/**
 * Strip diacriticals and lowercase for accent-insensitive search.
 * "Articulo" -> "articulo", "Jose" -> "jose".
 * Uses Unicode NFD decomposition (splits base char + combining mark)
 * then removes the combining marks.
 */
export function normalizeForSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
