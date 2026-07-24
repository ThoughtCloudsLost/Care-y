import type { QueryClient } from "@tanstack/svelte-query";
import { ticketsKeys } from "$lib/query/keys.js";
import { invalidateReadState } from "$lib/query/invalidate-read-state.js";
import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";

export interface ReplyFlowDeps {
  readonly queryClient: QueryClient;
  readonly getTickets: () => readonly {
    id: string;
    clientAlias: string;
    hasPhone: boolean;
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
  readonly hasPhone: boolean;
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
  let hasPhone = $state(false);
  let previewFollowUps = $state<RawFollowUpPreview[] | undefined>(undefined);
  let followUpCount = $state(0);

  function open(ticketId: string): void {
    const ticket = deps.getTickets().find((t) => t.id === ticketId);
    if (!ticket) return;
    targetTicketId = ticketId;
    clientAlias = ticket.clientAlias;
    hasPhone = ticket.hasPhone;
    previewFollowUps = deps.getPreviewFollowUps(ticketId);
    followUpCount = ticket.followUpCount;
    sheetOpen = true;
  }

  function handleReplySent(ticketId: string): void {
    sheetOpen = false;
    void deps.queryClient.invalidateQueries({
      queryKey: ticketsKeys.lists(),
    });
    invalidateReadState(deps.queryClient);
    void deps.eagerLoadPreviews([ticketId]);
  }

  function dismiss(): void {
    sheetOpen = false;
    targetTicketId = "";
    clientAlias = "";
    hasPhone = false;
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
    get hasPhone(): boolean {
      return hasPhone;
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
