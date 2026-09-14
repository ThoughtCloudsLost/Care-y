import type { QueryClient } from "@tanstack/svelte-query";
import type { SvelteSet } from "svelte/reactivity";
import { ticketsKeys } from "$lib/query/keys.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import { haptic } from "$lib/utils/haptic.js";
import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import type { TicketPriority } from "@care-y/shared";

interface BulkActionsDeps {
  readonly selectedIds: SvelteSet<string>;
  readonly exitMultiSelect: () => void;
  readonly queryClient: QueryClient;
  readonly assignTo: (
    ticketId: string,
    targetUserId: string,
  ) => Promise<unknown>;
  readonly holdTicket: (ticketId: string) => Promise<unknown>;
  readonly updateTicket: (args: {
    ticketId: string;
    priority?: TicketPriority;
    queueId?: string;
  }) => Promise<unknown>;
  readonly resolveVolunteerName: (userId: string) => string;
}

interface BatchResult {
  readonly succeeded: number;
  readonly total: number;
  readonly failed: boolean;
}

async function batchMutate(
  ids: readonly string[],
  action: (ticketId: string) => Promise<unknown>,
): Promise<BatchResult> {
  let succeeded = 0;
  for (const id of ids) {
    try {
      await action(id);
      succeeded++;
    } catch {
      return { succeeded, total: ids.length, failed: true };
    }
  }
  return { succeeded, total: ids.length, failed: false };
}

export interface BulkActions {
  handleBulkAssignTo: (
    _ticketId: string,
    targetUserId: string | null,
  ) => Promise<void>;
  handleBulkHold: () => Promise<void>;
  handleBulkPriority: (priority: TicketPriority) => Promise<void>;
  handleBulkQueue: (queueId: string) => Promise<void>;
}

export function createBulkActions(deps: BulkActionsDeps): BulkActions {
  const {
    selectedIds,
    exitMultiSelect,
    queryClient,
    assignTo,
    holdTicket,
    updateTicket,
    resolveVolunteerName,
  } = deps;

  async function handleBulkAssignTo(
    _ticketId: string,
    targetUserId: string | null,
  ): Promise<void> {
    if (targetUserId === null) return;

    const ids = [...selectedIds];
    const { succeeded, total, failed } = await batchMutate(ids, async (tid) =>
      assignTo(tid, targetUserId),
    );

    const name = resolveVolunteerName(targetUserId);

    if (failed) {
      toastStore.show(
        m.ticket_toast_bulk_assigned(
          withTerms({ count: String(succeeded), name }),
        ) + ` (${String(total - succeeded)} failed)`,
        3000,
      );
    } else {
      haptic();
      toastStore.show(
        m.ticket_toast_bulk_assigned(
          withTerms({ count: String(succeeded), name }),
        ),
      );
    }

    exitMultiSelect();
    void queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
  }

  async function handleBulkHold(): Promise<void> {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    const { succeeded, total, failed } = await batchMutate(ids, holdTicket);

    if (failed) {
      toastStore.show(
        m.ticket_toast_bulk_held(withTerms({ count: String(succeeded) })) +
          ` (${String(total - succeeded)} failed)`,
        3000,
      );
    } else {
      haptic();
      toastStore.show(
        m.ticket_toast_bulk_held(withTerms({ count: String(succeeded) })),
      );
    }

    exitMultiSelect();
    void queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
  }

  async function handleBulkPriority(priority: TicketPriority): Promise<void> {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    const { succeeded, total, failed } = await batchMutate(ids, async (tid) =>
      updateTicket({ ticketId: tid, priority }),
    );

    if (failed) {
      toastStore.show(
        m.ticket_toast_bulk_priority(withTerms({ count: String(succeeded) })) +
          ` (${String(total - succeeded)} failed)`,
        3000,
      );
    } else {
      haptic();
      toastStore.show(
        m.ticket_toast_bulk_priority(withTerms({ count: String(succeeded) })),
      );
    }

    exitMultiSelect();
    void queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
  }

  async function handleBulkQueue(queueId: string): Promise<void> {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    const { succeeded, total, failed } = await batchMutate(ids, async (tid) =>
      updateTicket({ ticketId: tid, queueId }),
    );

    if (failed) {
      toastStore.show(
        m.ticket_toast_bulk_queue(withTerms({ count: String(succeeded) })) +
          ` (${String(total - succeeded)} failed)`,
        3000,
      );
    } else {
      haptic();
      toastStore.show(
        m.ticket_toast_bulk_queue(withTerms({ count: String(succeeded) })),
      );
    }

    exitMultiSelect();
    void queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
  }

  return {
    handleBulkAssignTo,
    handleBulkHold,
    handleBulkPriority,
    handleBulkQueue,
  };
}
