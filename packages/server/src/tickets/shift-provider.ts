/**
 * Interface for shift-based volunteer availability.
 *
 * The stub returns all queue members as available (no shift filtering).
 * The shift schedule implementation replaces this with real schedule queries.
 */

import type { QueueId, UserId } from "@care-y/shared";

export interface ShiftProvider {
  /**
   * Returns user IDs of volunteers currently on shift for the given queue.
   * Empty array means no one is currently on shift.
   */
  getCurrentShiftVolunteers(queueId: QueueId): Promise<UserId[]>;

  /**
   * Returns user IDs of volunteers on the next future shift for the given queue.
   * Used for no-coverage assignment: when no one is currently on shift,
   * assign to the next-shift volunteer with fewest tickets.
   * Empty array means no future shifts are scheduled.
   */
  getNextShiftVolunteers(queueId: QueueId): Promise<UserId[]>;
}

/**
 * Stub that treats all queue members as always available.
 */
export function createStubShiftProvider(
  getQueueMembers: (queueId: QueueId) => Promise<UserId[]>,
): ShiftProvider {
  return {
    async getCurrentShiftVolunteers(queueId) {
      return getQueueMembers(queueId);
    },
    async getNextShiftVolunteers(queueId) {
      return getQueueMembers(queueId);
    },
  };
}
