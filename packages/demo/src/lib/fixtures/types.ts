/**
 * Plain-object types for demo fixture data.
 *
 * These mirror the shapes the server returns (TicketLikeRecord,
 * RawFollowUpPreview) but are hand-authored with string literals
 * and Date values. No server imports.
 */

import type { DisplayStatus } from "$lib/tickets/display-status.js";

export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketStatus = "open" | "closed";
export type FollowUpSource = "client" | "volunteer" | "system";
export type FollowUpType =
  | "message"
  | "sms_inbound"
  | "internal_note"
  | "volunteer_assigned"
  | "volunteer_unassigned"
  | "status_opened"
  | "status_closed"
  | "priority_changed"
  | "hold_placed"
  | "hold_removed";

/**
 * A demo ticket. All "encrypted" fields carry fake ciphertext
 * (filler of plaintext.length + 40) so DecryptPlaceholder can
 * estimate scramble width.
 */
export interface DemoTicket {
  readonly id: string;
  readonly queueId: string;
  readonly queueName: string;
  readonly status: TicketStatus;
  readonly onHold: boolean;
  readonly priority: TicketPriority;
  readonly clientAlias: string;
  readonly assignedTo: string | null;
  readonly assignedDisplayName: string | null;
  /** Plaintext title (used for search and cache seeding). */
  readonly title: string;
  /** Fake ciphertext: filler string of length title.length + 40. */
  readonly encryptedTitle: string;
  /** Plaintext description. */
  readonly description: string;
  /** Fake ciphertext: filler string of length description.length + 40. */
  readonly encryptedDescription: string;
  /**
   * null = no key wrap (DENIED state). Non-null = a truthy
   * placeholder so resolveAsyncDecrypt treats it as accessible.
   */
  readonly keyWrap: string | null;
  readonly createdAt: Date;
  readonly lastActivityAt: Date | null;
  readonly followUpCount: number;
  readonly displayStatus: DisplayStatus;
  readonly followUps: readonly DemoFollowUp[];
}

/**
 * A demo follow-up message or system event.
 */
export interface DemoFollowUp {
  readonly id: string;
  readonly ticketId: string;
  readonly source: FollowUpSource;
  readonly type: FollowUpType;
  readonly isPrivate: boolean;
  /** Plaintext content. */
  readonly content: string;
  /** Fake ciphertext: filler string of length content.length + 40. */
  readonly encryptedContent: string;
  /** Present on system events (volunteer_assigned, priority_changed, etc.). */
  readonly eventParams: Record<string, unknown> | null;
  readonly createdAt: Date;
  readonly hasRecording: boolean;
  readonly hasImage: boolean;
  readonly hasFile: boolean;
  readonly noteTypeId: string | null;
}
