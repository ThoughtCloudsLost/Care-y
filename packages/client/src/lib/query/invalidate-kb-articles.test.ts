import { describe, it, expect, vi } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import { invalidateKbArticles } from "./invalidate-kb-articles.ts";
import { kbKeys } from "./keys.ts";

describe("invalidateKbArticles", () => {
  it("invalidates the article lists, categories and authors, nothing else", () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, "invalidateQueries");

    invalidateKbArticles(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: kbKeys.items() });
    expect(spy).toHaveBeenCalledWith({ queryKey: kbKeys.categories() });
    expect(spy).toHaveBeenCalledWith({ queryKey: kbKeys.authors() });
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
