import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";
import type { DisplayStatus } from "$lib/tickets/display-status.js";
import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
import type { QueueAppearance } from "$lib/utils/queue-appearance.js";
import type { ReactionSummary } from "@care-y/shared";

export type TicketQuickAction =
  "reply" | "call" | "hold" | "unhold" | "assign" | "take";

// The card carries all three Inkwell presentations; the union lives with
// the persisted stores so consumers and the switcher agree on one type.
export type { ViewMode } from "$lib/stores/view-mode.svelte.js";
import type { ViewMode } from "$lib/stores/view-mode.svelte.js";

export interface TicketCardProps {
  readonly viewMode: ViewMode;
  readonly ticketId: string;
  readonly queueName: string | null;
  /** Queue color/icon; omitted when the surface has no queues list. */
  readonly queueAppearance?: QueueAppearance;
  readonly displayStatus: DisplayStatus;
  readonly priority: "low" | "normal" | "high" | "urgent";
  readonly titleResult: DecryptResult;
  /** Ciphertext for auto-sizing the title placeholder */
  readonly encryptedTitle?: unknown;
  readonly clientAlias: string;
  readonly assignedName: string | null;
  /** Renders the bold "you" meta segment when assigned to the viewer. */
  readonly assignedIsSelf?: boolean;
  readonly createdAt: Date;
  readonly lastActivityAt: Date | null;
  readonly followUpCount: number;
  readonly unreadCount: number;
  /** undefined = not loaded from server yet */
  readonly previewFollowUps: RawFollowUpPreview[] | undefined;
  /** Reaction summaries keyed by follow-up ID (display-only in preview). */
  readonly previewReactions?: Record<string, ReactionSummary[]>;
  readonly selected?: boolean;
  readonly multiSelectActive?: boolean;
  readonly ontap: (ticketId: string) => void;
  readonly onfullopen?: (ticketId: string) => void;
  readonly onselect?: (ticketId: string) => void;
  readonly onaction?: (ticketId: string, action: TicketQuickAction) => void;
  readonly onencryptedhelp?: () => void;
  readonly loading?: boolean;
  readonly searchTerm?: string | null;
  readonly newRepliesFirst?: boolean;
}
