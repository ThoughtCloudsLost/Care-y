/**
 * SharedWorker entry point for crypto operations.
 *
 * Survives page refreshes via extendedLifetime (ADR-044). Each browser
 * tab connects as a separate MessagePort. Key material is shared across
 * all ports (same key derivation, same tkCache).
 *
 * Port lifecycle:
 *   1. Tab opens: onconnect fires, port added to set
 *   2. Bridge sends "connect": Worker replies with current state + public keys
 *   3. Bridge sends crypto requests: dispatched via createDispatcher per-port
 *   4. Tab closing: bridge sends "disconnect", port removed from set
 *   5. Last port removed: 500ms zero timer starts
 *   6. New port before timer: timer cancelled, keys preserved
 *   7. Timer fires: all keys zeroed, Worker stays alive but unkeyed
 *
 * State broadcasts:
 *   - zeroAll from any port: broadcast stateChange "READY" to all OTHER ports
 *   - deriveKeys completes: broadcast stateChange "KEYED" to all OTHER ports
 *
 * See crypto-core.ts for the shared handler logic.
 */

/// <reference lib="webworker" />

import {
  createDispatcher,
  getState,
  getPublicKeys,
  handleZeroAll,
  handleRewrapResult,
  onStateTransition,
  type Sink,
} from "./crypto-core.js";
import type {
  WorkerRequest,
  WorkerResponse,
  RewrapEvent,
  RewrapResultEvent,
  ConnectRequest,
  DisconnectRequest,
  StateChangeEvent,
} from "./crypto-protocol.js";

declare const self: SharedWorkerGlobalScope;

// ── Port tracking ───────────────────────────────────────────────────

const ports = new Set<MessagePort>();
let zeroTimer: ReturnType<typeof setTimeout> | null = null;

const ZERO_DELAY_MS = 500;

// Tracks which port triggered the current state transition so the
// broadcast callback can exclude it. Set before dispatching, cleared after.
let activePort: MessagePort | null = null;

// ── Broadcast helper ────────────────────────────────────────────────

function broadcastStateChange(excludePort: MessagePort | null): void {
  const event: StateChangeEvent = {
    kind: "stateChange",
    state: getState(),
  };
  for (const port of ports) {
    if (port !== excludePort) {
      port.postMessage(event);
    }
  }
}

// Register once: fires synchronously inside handleDeriveKeys and handleZeroAll.
onStateTransition(() => {
  broadcastStateChange(activePort);
});

// ── Per-port sink factory ───────────────────────────────────────────

function createPortSink(port: MessagePort): Sink {
  const boundPost = port.postMessage.bind(port);
  return (
    msg: WorkerResponse | RewrapEvent,
    transfer?: Transferable[],
  ): void => {
    boundPost(msg, { transfer: transfer ?? [] });
  };
}

// ── Connect handler ─────────────────────────────────────────────────

function handleConnect(req: ConnectRequest, sink: Sink): void {
  const keys = getPublicKeys();
  const msg: WorkerResponse = {
    id: req.id,
    ok: true,
    type: "connect",
    state: getState(),
    volPublic: keys.volPublic,
    orgPublicKey: keys.orgPublicKey,
  };
  sink(msg);
}

// ── Disconnect handler ──────────────────────────────────────────────

function handleDisconnect(
  req: DisconnectRequest,
  port: MessagePort,
  sink: Sink,
): void {
  ports.delete(port);
  port.close();

  const msg: WorkerResponse = {
    id: req.id,
    ok: true,
    type: "disconnect",
  };
  sink(msg);

  if (ports.size === 0) {
    zeroTimer = setTimeout(() => {
      zeroTimer = null;
      // Synthesize a zeroAll with id -1 (no port to respond to).
      // The sink is a no-op since no ports are connected.
      const noopSink: Sink = () => undefined;
      handleZeroAll(-1, noopSink);
    }, ZERO_DELAY_MS);
  }
}

// ── onconnect ───────────────────────────────────────────────────────

self.onconnect = (event: MessageEvent): void => {
  const port = event.ports[0];
  if (!port) return;
  ports.add(port);

  if (zeroTimer !== null) {
    clearTimeout(zeroTimer);
    zeroTimer = null;
  }

  const sink = createPortSink(port);
  const coreDispatch = createDispatcher(sink);

  port.onmessage = (
    e: MessageEvent<WorkerRequest | RewrapResultEvent>,
  ): void => {
    const req = e.data;

    if ("kind" in req) {
      handleRewrapResult(req);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check -- default delegates to coreDispatch
    switch (req.type) {
      case "connect":
        handleConnect(req, sink);
        return;
      case "disconnect":
        handleDisconnect(req, port, sink);
        return;
      default:
        // activePort is read by the onStateTransition callback (registered
        // above) to exclude the requesting port from broadcasts. Safe because
        // notifyStateTransition fires synchronously inside the handler.
        activePort = port;
        coreDispatch(req);
        activePort = null;
    }
  };

  port.start();
};
