/**
 * Dedicated Worker entry point for crypto operations.
 *
 * Thin shell that delegates all logic to crypto-core.ts via the Sink
 * abstraction. Used as the fallback when SharedWorker is unavailable,
 * and by password change flows that need an isolated Worker instance.
 *
 * See crypto-core.ts for state machine, key management, and handlers.
 * See ADR-044 for the SharedWorker migration decision.
 */

import { createDispatcher, type Sink } from "./crypto-core.js";
import type { WorkerRequest, RewrapResultEvent } from "./crypto-protocol.js";

const sink: Sink = (msg, transfer): void => {
  self.postMessage(msg, { transfer: transfer ?? [] });
};

const dispatch = createDispatcher(sink);

self.addEventListener(
  "message",
  (event: MessageEvent<WorkerRequest | RewrapResultEvent>): void => {
    dispatch(event.data);
  },
);
