/**
 * Dedicated Worker entry point for portal crypto operations.
 *
 * Thin shell that delegates all logic to portal-core.ts via the Sink
 * abstraction. A portal session is one tab by design; no SharedWorker
 * variant exists (ADR-091).
 *
 * See portal-core.ts for state machine, key management, and handlers.
 */

import { createPortalDispatcher, type PortalSink } from "./portal-core.js";
import type { PortalWorkerRequest } from "./portal-protocol.js";

const sink: PortalSink = (msg, transfer): void => {
  self.postMessage(msg, { transfer: transfer ?? [] });
};

const dispatch = createPortalDispatcher(sink);

self.addEventListener(
  "message",
  (event: MessageEvent<PortalWorkerRequest>): void => {
    dispatch(event.data);
  },
);
