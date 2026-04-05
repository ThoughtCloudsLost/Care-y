import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";
import type { DisplayStatus } from "$lib/tickets/display-status.js";

export type TicketQuickAction =
  | "reply"
  | "call"
  | "hold"
  | "unhold"
  | "take"
  | "assign"
  | "release";

export interface TicketCardProps {
  readonly ticketId: string;
  readonly queueName: string;
  readonly displayStatus: DisplayStatus;
  readonly priority: "low" | "normal" | "high" | "urgent";
  /** undefined = still decrypting */
  readonly title: string | undefined;
  readonly clientAlias: string;
  readonly assignedName: string | null;
  readonly createdAt: Date;
  readonly lastActivityAt: Date | null;
  readonly followUpCount: number;
  readonly unreadCount: number;
  /** undefined = not loaded from server yet */
  readonly previewFollowUps: RawFollowUpPreview[] | undefined;
  readonly selected?: boolean;
  readonly multiSelectActive?: boolean;
  readonly ontap: (ticketId: string) => void;
  readonly onselect?: (ticketId: string) => void;
  readonly onaction?: (ticketId: string, action: TicketQuickAction) => void;
}
