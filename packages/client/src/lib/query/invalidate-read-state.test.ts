import { describe, it, expect, vi } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import { invalidateReadState } from "./invalidate-read-state.ts";
import { ticketsKeys } from "./keys.ts";

describe("invalidateReadState", () => {
  it("invalidates both read-state families and nothing else", () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, "invalidateQueries");

    invalidateReadState(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ticketsKeys.readStates() });
    expect(spy).toHaveBeenCalledWith({
      queryKey: ticketsKeys.readStateSweep(),
    });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
