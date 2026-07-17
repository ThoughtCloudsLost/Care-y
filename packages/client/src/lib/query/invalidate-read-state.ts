import type { QueryClient } from "@tanstack/svelte-query";
import { ticketsKeys } from "./keys.js";

/**
 * Invalidates both list read-state families together.
 *
 * A new follow-up (or a flushed read cursor) shifts the read-state
 * window and the sweep's latest activity, so both families refetch
 * immediately rather than waiting for the SSE broadcast round trip.
 */
export function invalidateReadState(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: ticketsKeys.readStates() });
  void queryClient.invalidateQueries({
    queryKey: ticketsKeys.readStateSweep(),
  });
}
