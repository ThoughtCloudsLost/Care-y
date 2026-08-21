// Email/SMS outbox for inspection. Lives in its own module so phone-side
// code can subscribe to deliveries without a static import of the engine
// module, which must stay off the initial chunk (the engine loads through
// a dynamic import behind the login resting state).

import { emitFlowEvent, buildFlowDetail } from "../flow-events.js";

export interface OutboxEntry {
  readonly type: "email" | "sms";
  readonly to: string;
  readonly subject?: string;
  readonly body?: string;
}

const outbox: OutboxEntry[] = [];
const outboxListeners: ((entry: OutboxEntry) => void)[] = [];

/** Appends an entry and notifies subscribers. Called by the engine's delivery stubs. */
export function appendToOutbox(entry: OutboxEntry): void {
  outbox.push(entry);
  // Recipients and bodies stay out of the preview: addresses carry PII
  // and bodies carry 2FA codes.
  const queueDepth = outbox.length;
  emitFlowEvent({
    lane: "server",
    direction: "local",
    label: `${entry.type} delivery`,
    seamKey: "outbox-delivery",
    detail: buildFlowDetail({
      input: [{ name: "type", value: entry.type, kind: "identifier" }],
      result: [
        {
          name: "queue depth",
          value: String(queueDepth),
          kind: "metadata",
        },
      ],
    }),
  });
  for (const cb of outboxListeners) {
    cb(entry);
  }
}

/** Registers a callback fired each time a new entry is appended to the outbox. Returns an unsubscribe function. */
export function onOutboxAppend(cb: (entry: OutboxEntry) => void): () => void {
  outboxListeners.push(cb);
  return () => {
    const idx = outboxListeners.indexOf(cb);
    if (idx >= 0) {
      outboxListeners.splice(idx, 1);
    }
  };
}
