export interface TrackedCall {
  readonly ticketId: string;
  readonly userId: string | null;
  readonly direction: "inbound" | "outbound";
  readonly orgSchema: string;
  readonly clientId: string | null;
  readonly createdAt: number;
}

export interface CallTracker {
  track(callSid: string, call: TrackedCall): void;
  get(callSid: string): TrackedCall | undefined;
  remove(callSid: string): void;
  readonly size: number;
}

const TTL_MS = 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000;

export function createCallTracker(): CallTracker {
  const calls = new Map<string, TrackedCall>();

  const timer = setInterval(() => {
    const cutoff = Date.now() - TTL_MS;
    for (const [sid, call] of calls) {
      if (call.createdAt < cutoff) calls.delete(sid);
    }
  }, CLEANUP_INTERVAL_MS);

  timer.unref();

  return {
    track(callSid, call) {
      calls.set(callSid, call);
    },
    get(callSid) {
      return calls.get(callSid);
    },
    remove(callSid) {
      calls.delete(callSid);
    },
    get size() {
      return calls.size;
    },
  };
}
