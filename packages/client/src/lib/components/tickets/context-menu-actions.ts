/**
 * Context menu action eligibility for follow-up long-press.
 *
 * Pure function: determines which actions to show based on follow-up
 * type/source/authorship and the current user's identity and role.
 * Extracted from TicketDetail for testability.
 */

export type ContextActionId = "copy" | "edit" | "delete";

export interface ContextAction {
  readonly id: ContextActionId;
  readonly label: string;
  readonly destructive?: boolean;
}

export interface ContextMenuEvent {
  readonly followUpId: string;
  readonly actions: readonly ContextAction[];
  /** Decrypted text content, for copy action. */
  readonly plaintext: string | undefined;
}

interface FollowUpFields {
  readonly type: string;
  readonly source: string;
  readonly createdBy: string | null;
}

interface Labels {
  readonly copy: string;
  readonly editNote: string;
  readonly deleteNote: string;
}

export function getContextMenuActions(
  fu: FollowUpFields,
  currentUserId: string | undefined,
  isAdmin: boolean,
  labels: Labels,
): ContextAction[] {
  const actions: ContextAction[] = [];

  // Copy is available for all decrypted message content
  actions.push({ id: "copy", label: labels.copy });

  // Edit/delete only for own internal notes
  if (fu.type === "internal_note" && fu.createdBy === currentUserId) {
    actions.push({ id: "edit", label: labels.editNote });
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
