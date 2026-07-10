import type { QueryClient } from "@tanstack/svelte-query";
import { ticketsKeys } from "$lib/query/keys.js";
import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";

export interface ReplyFlowDeps {
  readonly queryClient: QueryClient;
  readonly getTickets: () => readonly {
    id: string;
    clientAlias: string;
    followUpCount: number;
  }[];
  readonly getPreviewFollowUps: (
    ticketId: string,
  ) => RawFollowUpPreview[] | undefined;
  readonly eagerLoadPreviews: (ticketIds: string[]) => Promise<void>;
}

export interface ReplyFlowState {
  readonly sheetOpen: boolean;
  readonly targetTicketId: string;
  readonly clientAlias: string;
  readonly previewFollowUps: RawFollowUpPreview[] | undefined;
  readonly followUpCount: number;
  open(ticketId: string): void;
  handleReplySent(ticketId: string): void;
  dismiss(): void;
}

export function createReplyFlow(deps: ReplyFlowDeps): ReplyFlowState {
  let sheetOpen = $state(false);
  let targetTicketId = $state("");
  let clientAlias = $state("");
  let previewFollowUps = $state<RawFollowUpPreview[] | undefined>(undefined);
  let followUpCount = $state(0);

  function open(ticketId: string): void {
    const ticket = deps.getTickets().find((t) => t.id === ticketId);
    if (!ticket) return;
    targetTicketId = ticketId;
    clientAlias = ticket.clientAlias;
    previewFollowUps = deps.getPreviewFollowUps(ticketId);
    followUpCount = ticket.followUpCount;
    sheetOpen = true;
  }

  function handleReplySent(ticketId: string): void {
    sheetOpen = false;
    void deps.queryClient.invalidateQueries({
      queryKey: ticketsKeys.lists(),
    });
    // A new follow-up shifts the read-state timestamp window and the
    // sweep's latest activity, so both families refetch immediately
    // rather than waiting for the SSE broadcast round trip.
    void deps.queryClient.invalidateQueries({
      queryKey: ticketsKeys.readStates(),
    });
    void deps.queryClient.invalidateQueries({
      queryKey: ticketsKeys.readStateSweep(),
    });
    void deps.eagerLoadPreviews([ticketId]);
  }

  function dismiss(): void {
    sheetOpen = false;
    targetTicketId = "";
    clientAlias = "";
    previewFollowUps = undefined;
    followUpCount = 0;
  }

  return {
    get sheetOpen(): boolean {
      return sheetOpen;
    },
    get targetTicketId(): string {
      return targetTicketId;
    },
    get clientAlias(): string {
      return clientAlias;
    },
    get previewFollowUps(): RawFollowUpPreview[] | undefined {
      return previewFollowUps;
    },
    get followUpCount(): number {
      return followUpCount;
    },
    open,
    handleReplySent,
    dismiss,
  };
}
