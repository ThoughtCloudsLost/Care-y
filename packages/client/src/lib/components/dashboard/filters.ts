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

/** The structural subset of a ticket the needs-attention rule reads. */
export interface NeedsAttentionInput {
  readonly id: string;
  readonly status: string;
  readonly priority: string;
  readonly onHold: boolean;
  readonly assignedTo: string | null;
}

/**
 * One rule for the needs-attention overlay: urgent/high tickets that
 * are unassigned, or assigned to the viewer and carrying unread
 * replies. Shared by the dashboard bucket and the tickets-page
 * membership filter so the "See all" landing shows the same set.
 */
export function isNeedsAttention(
  t: NeedsAttentionInput,
  currentUserId: string | undefined,
  isUnread: (ticketId: string) => boolean,
): boolean {
  if (t.onHold || t.status !== "open") return false;
  if (t.priority !== "urgent" && t.priority !== "high") return false;
  if (t.assignedTo === null) return true;
  return t.assignedTo === currentUserId && isUnread(t.id);
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
 *
 * The "mine + high" needs-attention arm keys off real read state, not the
 * raw follow-up count: a high-priority ticket assigned to the current user
 * qualifies only when it carries genuinely unread replies (`isUnread`).
 * Membership settles as cursor decrypts land, so a freshly loaded dashboard
 * fills this arm in progressively rather than all at once.
 */
export function bucketTickets<T extends DashboardTicket>(
  tickets: T[],
  currentUserId: string | undefined,
  isUnread: (ticketId: string) => boolean,
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

    if (isNeedsAttention(t, currentUserId, isUnread)) {
      result.needsAttention.push(t);
    }
  }

  return result;
}
