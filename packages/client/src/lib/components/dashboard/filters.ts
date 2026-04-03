/**
 * Pure filter functions for dashboard ticket sections.
 *
 * Extracted from +page.svelte so the filtering logic can be unit
 * tested without rendering components or mocking Svelte context.
 */

export interface DashboardTicket {
  readonly id: string;
  readonly status: string;
  readonly priority: string;
  readonly onHold: boolean;
  readonly assignedTo: string | null;
  readonly followUpCount: number;
}

/**
 * Tickets that need immediate action: urgent/high priority tickets
 * that are unassigned, or assigned to the current user with unread
 * follow-ups.
 */
export function filterNeedsAttention<T extends DashboardTicket>(
  tickets: T[],
  currentUserId: string | undefined,
): T[] {
  return tickets.filter((t) => {
    if (t.status !== "open" || t.onHold) return false;
    const isHighPriority = t.priority === "urgent" || t.priority === "high";
    if (isHighPriority && t.assignedTo === null) return true;
    if (t.assignedTo === currentUserId && t.followUpCount > 0 && isHighPriority)
      return true;
    return false;
  });
}

/** Open tickets assigned to the current user (not on hold). */
export function filterMyOpen<T extends DashboardTicket>(
  tickets: T[],
  currentUserId: string | undefined,
): T[] {
  return tickets.filter(
    (t) => t.assignedTo === currentUserId && t.status === "open" && !t.onHold,
  );
}

/** Open tickets with no assignee. */
export function filterUnassigned<T extends DashboardTicket>(tickets: T[]): T[] {
  return tickets.filter((t) => t.assignedTo === null && t.status === "open");
}

/** Tickets currently on hold. */
export function filterOnHold<T extends DashboardTicket>(tickets: T[]): T[] {
  return tickets.filter((t) => t.onHold);
}
