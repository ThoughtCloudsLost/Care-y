import type { QueryClient } from "@tanstack/svelte-query";
import { SvelteSet } from "svelte/reactivity";
import { ticketsKeys } from "$lib/query/keys.js";
import { optimisticMutation } from "$lib/utils/optimistic-mutation.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import { haptic } from "$lib/utils/haptic.js";
import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";

interface TicketPage {
  readonly id: string;
  readonly onHold: boolean;
  [key: string]: unknown;
}

export interface HoldActionDeps {
  readonly queryClient: QueryClient;
  readonly getQueryKey: () => readonly unknown[];
  readonly holdMutate: (ticketId: string, onHold: boolean) => Promise<unknown>;
}

export interface HoldActionState {
  isPending(ticketId: string): boolean;
  handleHold(ticketId: string, currentlyOnHold: boolean): Promise<void>;
}

export function createHoldAction(deps: HoldActionDeps): HoldActionState {
  const { queryClient, getQueryKey, holdMutate } = deps;

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
      await optimisticMutation<{
        pages: TicketPage[][];
        pageParams: unknown[];
      }>({
        queryClient,
        queryKey: getQueryKey(),
        update: (old) => ({
          ...old,
          pages: old.pages.map((pg) =>
            pg.map((t) => (t.id === ticketId ? { ...t, onHold } : t)),
          ),
        }),
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
        },
        onError: () => {
          toastStore.show(m.error_generic(), 3000);
        },
      });
    } finally {
      pendingHoldIds.delete(ticketId);
    }
  }

  return { isPending, handleHold };
}
