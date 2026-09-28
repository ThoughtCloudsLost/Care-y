import type { QueryClient } from "@tanstack/svelte-query";
import { SvelteSet } from "svelte/reactivity";
import { ticketsKeys } from "$lib/query/keys.js";
import {
  isPagedRows,
  optimisticListsMutation,
  patchPagedRow,
  type PagedRows,
} from "$lib/utils/optimistic-mutation.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import { getErrorMessage } from "$lib/components/query-error-messages.js";
import { haptic } from "$lib/utils/haptic.js";
import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";

export interface HoldActionDeps {
  readonly queryClient: QueryClient;
  readonly holdMutate: (ticketId: string, onHold: boolean) => Promise<unknown>;
}

export interface HoldActionState {
  isPending(ticketId: string): boolean;
  handleHold(ticketId: string, currentlyOnHold: boolean): Promise<void>;
}

export function createHoldAction(deps: HoldActionDeps): HoldActionState {
  const { queryClient, holdMutate } = deps;

  const pendingHoldIds = new SvelteSet<string>();

  function isPending(ticketId: string): boolean {
    return pendingHoldIds.has(ticketId);
  }

  async function handleHold(
    ticketId: string,
    currentlyOnHold: boolean,
  ): Promise<void> {
    const onHold = !currentlyOnHold;

    if (pendingHoldIds.has(ticketId)) return;
    pendingHoldIds.add(ticketId);

    try {
      // Every cached list holding the row updates at once, so on the
      // dashboard a held ticket leaves its lane and joins On hold together.
      await optimisticListsMutation<PagedRows>({
        queryClient,
        queryKey: ticketsKeys.lists(),
        isData: isPagedRows,
        update: (old) => patchPagedRow(old, ticketId, { onHold }),
        mutate: async () => holdMutate(ticketId, onHold),
        onSuccess: () => {
          haptic();
          toastStore.show(
            onHold
              ? m.ticket_toast_held(withTerms())
              : m.ticket_toast_unheld(withTerms()),
          );
          void queryClient.invalidateQueries({
            queryKey: ticketsKeys.lists(),
          });
          void queryClient.invalidateQueries({
            queryKey: ticketsKeys.facetIndex(),
          });
        },
        onError: (err) => {
          toastStore.show(getErrorMessage(err), 3000);
        },
      });
    } finally {
      pendingHoldIds.delete(ticketId);
    }
  }

  return { isPending, handleHold };
}
