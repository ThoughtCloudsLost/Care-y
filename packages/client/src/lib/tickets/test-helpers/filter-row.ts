import type { TicketForServerFilter } from "../ticket-list-utils.js";

/**
 * A ticket row for filter and facet tests. Defaults to a New ticket: open,
 * not held, no follow-ups and no response, unassigned, normal priority, in
 * the general queue, created 2024-01-10.
 */
export function filterRow(
  overrides: Partial<TicketForServerFilter> & { id: string },
): TicketForServerFilter {
  return {
    status: "open",
    onHold: false,
    followUpCount: 0,
    hasResponse: false,
    queueId: "q-general",
    priority: "normal",
    assignedTo: null,
    createdAt: "2024-01-10T12:00:00Z",
    ...overrides,
  };
}
