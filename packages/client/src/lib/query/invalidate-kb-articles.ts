import type { QueryClient } from "@tanstack/svelte-query";
import { kbKeys } from "./keys.js";

/**
 * Invalidates the article lists, the category list and the author list together.
 *
 * Each listed category carries its article count, so creating, moving or
 * deleting an article changes the categories as well as the lists. The author
 * list is the set of people who have written an article, so a new author's
 * first article changes it too.
 */
export function invalidateKbArticles(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: kbKeys.items() });
  void queryClient.invalidateQueries({ queryKey: kbKeys.categories() });
  void queryClient.invalidateQueries({ queryKey: kbKeys.authors() });
}
