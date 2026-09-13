import type { QueryClient } from "@tanstack/svelte-query";
import { ticketsKeys } from "$lib/query/keys.js";
import { invalidateReadState } from "$lib/query/invalidate-read-state.js";
import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";

export interface ReplyFlowDeps {
  readonly queryClient: QueryClient;
  readonly getTickets: () => readonly {
    id: string;
    clientAlias: string | null;
    hasPhone: boolean;
    followUpCount: number;
    portalChannel?: { clientPublic: string } | null;
  }[];
  readonly getPreviewFollowUps: (
    ticketId: string,
  ) => RawFollowUpPreview[] | undefined;
  readonly eagerLoadPreviews: (ticketIds: string[]) => Promise<void>;
}

export interface ReplyFlowState {
  readonly sheetOpen: boolean;
  readonly targetTicketId: string;
  readonly clientAlias: string | null;
  readonly hasPhone: boolean;
  readonly clientPublic: string | null;
  readonly previewFollowUps: RawFollowUpPreview[] | undefined;
  readonly followUpCount: number;
  open(ticketId: string): void;
  handleReplySent(ticketId: string): void;
  dismiss(): void;
}

export function createReplyFlow(deps: ReplyFlowDeps): ReplyFlowState {
  let sheetOpen = $state(false);
  let targetTicketId = $state("");
  let clientAlias = $state<string | null>("");
  let hasPhone = $state(false);
  let clientPublic = $state<string | null>(null);
  let previewFollowUps = $state<RawFollowUpPreview[] | undefined>(undefined);
  let followUpCount = $state(0);

  function open(ticketId: string): void {
    const ticket = deps.getTickets().find((t) => t.id === ticketId);
    if (!ticket) return;
    targetTicketId = ticketId;
    clientAlias = ticket.clientAlias;
    hasPhone = ticket.hasPhone;
    clientPublic = ticket.portalChannel?.clientPublic ?? null;
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
    clientPublic = null;
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
    get clientAlias(): string | null {
      return clientAlias;
    },
    get hasPhone(): boolean {
      return hasPhone;
    },
    get clientPublic(): string | null {
      return clientPublic;
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
