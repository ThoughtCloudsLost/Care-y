import type { QueryClient } from "@tanstack/svelte-query";
import { kbKeys } from "./keys.js";

/**
 * Invalidates the article lists and the category list together.
 *
 * Each listed category carries its article count, so creating, moving or
 * deleting an article changes the categories as well as the lists.
 */
export function invalidateKbArticles(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: kbKeys.items() });
  void queryClient.invalidateQueries({ queryKey: kbKeys.categories() });
}
