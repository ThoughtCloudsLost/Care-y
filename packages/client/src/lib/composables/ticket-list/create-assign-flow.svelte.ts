import type { QueryClient } from "@tanstack/svelte-query";
import {
  isPagedRows,
  optimisticListsMutation,
  patchPagedRow,
  type PagedRows,
} from "$lib/utils/optimistic-mutation.js";
import { ticketsKeys } from "$lib/query/keys.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import { getErrorMessage } from "$lib/components/query-error-messages.js";
import { haptic } from "$lib/utils/haptic.js";
import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";

export interface AssignFlowDeps {
  readonly queryClient: QueryClient;
  readonly assignMutate: (
    ticketId: string,
    targetUserId: string | null,
  ) => Promise<unknown>;
  readonly resolveVolunteerName: (userId: string) => string;
  readonly getTickets: () => readonly {
    id: string;
    assignedTo: string | null;
  }[];
}

export interface AssignFlowState {
  readonly sheetOpen: boolean;
  readonly targetTicketId: string;
  readonly currentAssigneeId: string | null;
  open(ticketId: string): void;
  handleAssign(ticketId: string, targetUserId: string | null): Promise<void>;
  dismiss(): void;
}

export function createAssignFlow(deps: AssignFlowDeps): AssignFlowState {
  let sheetOpen = $state(false);
  let targetTicketId = $state("");
  let currentAssigneeId = $state<string | null>(null);

  function open(ticketId: string): void {
    const ticket = deps.getTickets().find((t) => t.id === ticketId);
    targetTicketId = ticketId;
    currentAssigneeId = ticket?.assignedTo ?? null;
    sheetOpen = true;
  }

  async function handleAssign(
    ticketId: string,
    targetUserId: string | null,
  ): Promise<void> {
    // Every cached list holding the row updates at once, so a ticket
    // moves between the dashboard's lanes as soon as it is assigned.
    await optimisticListsMutation<PagedRows>({
      queryClient: deps.queryClient,
      queryKey: ticketsKeys.lists(),
      isData: isPagedRows,
      update: (old) =>
        patchPagedRow(old, ticketId, { assignedTo: targetUserId }),
      mutate: async () => deps.assignMutate(ticketId, targetUserId),
      onSuccess: () => {
        haptic();
        if (targetUserId === null) {
          toastStore.show(m.ticket_toast_unassigned(withTerms()));
        } else {
          toastStore.show(
            m.ticket_toast_assigned({
              name: deps.resolveVolunteerName(targetUserId),
            }),
          );
        }
        void deps.queryClient.invalidateQueries({
          queryKey: ticketsKeys.lists(),
        });
        void deps.queryClient.invalidateQueries({
          queryKey: ticketsKeys.facetIndex(),
        });
      },
      onError: (err) => {
        toastStore.show(getErrorMessage(err), 3000);
      },
    });
  }

  function dismiss(): void {
    sheetOpen = false;
    targetTicketId = "";
    currentAssigneeId = null;
  }

  return {
    get sheetOpen(): boolean {
      return sheetOpen;
    },
    get targetTicketId(): string {
      return targetTicketId;
    },
    get currentAssigneeId(): string | null {
      return currentAssigneeId;
    },
    open,
    handleAssign,
    dismiss,
  };
}
