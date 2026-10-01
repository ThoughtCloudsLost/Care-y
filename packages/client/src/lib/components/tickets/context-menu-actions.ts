/**
 * Context menu action eligibility for follow-up long-press.
 *
 * Pure function: determines which actions to show based on follow-up
 * type/source/authorship and the current user's identity and role.
 * Extracted from TicketDetail for testability.
 */

import type { DisbursementNoteEnvelope } from "@care-y/shared";

export type ContextActionId =
  | "copy"
  | "edit"
  | "editMessage"
  | "editDisbursement"
  | "delete";

export interface ContextAction {
  readonly id: ContextActionId;
  readonly label: string;
  readonly destructive?: boolean;
}

export interface ContextMenuEvent {
  readonly followUpId: string;
  readonly actions: readonly ContextAction[];
  /**
   * Decrypted text content, for copy action. A disbursement note carries
   * its readable text here, never the envelope.
   */
  readonly plaintext: string | undefined;
  readonly noteTypeId: string | null;
  /** The envelope of a disbursement note, for the correction sheet. */
  readonly disbursement?: DisbursementNoteEnvelope;
}

interface FollowUpFields {
  readonly type: string;
  readonly source: string;
  readonly createdBy: string | null;
}

interface Labels {
  readonly copy: string;
  readonly editNote: string;
  readonly editMessage: string;
  readonly editDisbursement: string;
  readonly deleteNote: string;
}

/** Present when the note carries a disbursement envelope. */
export interface DisbursementNoteAccess {
  /** The account may correct disbursements at all. */
  readonly canRevise: boolean;
  /** The account may correct disbursements someone else recorded. */
  readonly canReviseOthers: boolean;
}

export function getContextMenuActions(
  fu: FollowUpFields,
  currentUserId: string | undefined,
  isAdmin: boolean,
  labels: Labels,
  disbursement?: DisbursementNoteAccess,
): ContextAction[] {
  const actions: ContextAction[] = [];

  // Copy is available for all decrypted message content
  actions.push({ id: "copy", label: labels.copy });

  // Edit for own outbound in-app messages (not sms_outbound, not client messages)
  if (
    fu.type === "message" &&
    fu.source === "volunteer" &&
    fu.createdBy === currentUserId
  ) {
    actions.push({ id: "editMessage", label: labels.editMessage });
  }

  // A disbursement note is corrected through its own sheet, which
  // rewrites the ledger and the note together. The plain note editor
  // would drop the envelope.
  const isOwn = fu.createdBy === currentUserId;
  if (
    fu.type === "internal_note" &&
    disbursement !== undefined &&
    disbursement.canRevise &&
    (isOwn || disbursement.canReviseOthers)
  ) {
    actions.push({ id: "editDisbursement", label: labels.editDisbursement });
  }

  // Edit/delete only for own internal notes
  if (fu.type === "internal_note" && isOwn) {
    if (disbursement === undefined) {
      actions.push({ id: "edit", label: labels.editNote });
    }
    actions.push({
      id: "delete",
      label: labels.deleteNote,
      destructive: true,
    });
  }

  // Admin can delete any internal note (not just their own)
  if (
    fu.type === "internal_note" &&
    isAdmin &&
    fu.createdBy !== currentUserId
  ) {
    actions.push({
      id: "delete",
      label: labels.deleteNote,
      destructive: true,
    });
  }

  return actions;
}
