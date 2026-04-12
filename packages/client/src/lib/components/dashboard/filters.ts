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

// --- Single-pass bucketing (optimized path for dashboard) ---

export interface DashboardBuckets<T> {
  needsAttention: T[];
  myOpen: T[];
  unassigned: T[];
  onHold: T[];
}

/**
 * Bucket all tickets in a single O(N) pass instead of 4 separate filter calls.
 *
 * On-hold tickets go into onHold only (not duplicated into other buckets).
 * A ticket can appear in both needsAttention and myOpen/unassigned since
 * "needs attention" is a severity overlay, not a mutually exclusive state.
 */
export function bucketTickets<T extends DashboardTicket>(
  tickets: T[],
  currentUserId: string | undefined,
): DashboardBuckets<T> {
  const result: DashboardBuckets<T> = {
    needsAttention: [],
    myOpen: [],
    unassigned: [],
    onHold: [],
  };

  for (const t of tickets) {
    if (t.onHold) {
      result.onHold.push(t);
      continue;
    }
    if (t.status !== "open") continue;

    if (t.assignedTo === null) result.unassigned.push(t);
    if (t.assignedTo === currentUserId) result.myOpen.push(t);

    const isHigh = t.priority === "urgent" || t.priority === "high";
    if (isHigh && t.assignedTo === null) {
      result.needsAttention.push(t);
    } else if (
      isHigh &&
      t.assignedTo === currentUserId &&
      t.followUpCount > 0
    ) {
      result.needsAttention.push(t);
    }
  }

  return result;
}
