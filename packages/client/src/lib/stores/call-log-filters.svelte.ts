/**
 * Call log filter store for the admin logs page. Server-side filtering
 * via the reports.callLog query (direction, callStatus, dateFrom, dateTo).
 *
 * No sort state: the endpoint returns newest-first with no sort input.
 */

import type { CallStatus } from "@care-y/shared";

export type CallDirectionFilter = "inbound" | "outbound" | null;

function createCallLogFilterStore(): {
  readonly direction: CallDirectionFilter;
  readonly callStatus: CallStatus | null;
  readonly dateFrom: Date | null;
  readonly dateTo: Date | null;
  readonly activeCount: number;
  setDirection(v: CallDirectionFilter): void;
  setCallStatus(v: CallStatus | null): void;
  setDateRange(from: Date | null, to: Date | null): void;
  clearAll(): void;
} {
  let direction = $state<CallDirectionFilter>(null);
  let callStatus = $state<CallStatus | null>(null);
  let dateFrom = $state<Date | null>(null);
  let dateTo = $state<Date | null>(null);

  const activeCount = $derived(
    (direction !== null ? 1 : 0) +
      (callStatus !== null ? 1 : 0) +
      (dateFrom !== null || dateTo !== null ? 1 : 0),
  );

  return {
    get direction(): CallDirectionFilter {
      return direction;
    },
    setDirection(v: CallDirectionFilter): void {
      direction = v;
    },

    get callStatus(): CallStatus | null {
      return callStatus;
    },
    setCallStatus(v: CallStatus | null): void {
      callStatus = v;
    },

    get dateFrom(): Date | null {
      return dateFrom;
    },
    get dateTo(): Date | null {
      return dateTo;
    },
    setDateRange(from: Date | null, to: Date | null): void {
      dateFrom = from;
      dateTo = to;
    },

    get activeCount(): number {
      return activeCount;
    },

    clearAll(): void {
      direction = null;
      callStatus = null;
      dateFrom = null;
      dateTo = null;
    },
  };
}

export const callLogFilterStore = createCallLogFilterStore();
