import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";
import type { DisplayStatus } from "$lib/tickets/display-status.js";

export type TicketQuickAction = "reply" | "call" | "hold" | "unhold" | "assign";

export type ViewMode = "list" | "grid";

export interface TicketCardProps {
  readonly viewMode: ViewMode;
  readonly ticketId: string;
  readonly queueName: string | null;
  readonly displayStatus: DisplayStatus;
  readonly priority: "low" | "normal" | "high" | "urgent";
  /** undefined = still decrypting */
  readonly title: string | undefined;
  /** Ciphertext for auto-sizing the title placeholder */
  readonly encryptedTitle?: unknown;
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
  readonly onencryptedhelp?: () => void;
  readonly loading?: boolean;
}
