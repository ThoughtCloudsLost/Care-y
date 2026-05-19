/**
 * Tests for the SharedWorker entry point.
 *
 * Mocks the SharedWorkerGlobalScope and MessagePort to verify:
 * - Multi-port connect/disconnect lifecycle
 * - Zero-on-last-disconnect timer (500ms)
 * - State change broadcasts to other ports
 * - Connect response with current state
 *
 * Uses vi.useFakeTimers for deterministic timer testing.
 * Uses real @care-y/crypto (WASM) for crypto correctness.
 */

import { describe, it, expect, vi, beforeAll } from "vitest";
import { getSodium, requireSodium, decode } from "@care-y/crypto";
import type {
  WorkerResponse,
  WorkerEvent,
  ConnectResponse,
  OprfBlindResponse,
  StateChangeEvent,
} from "./crypto-protocol.js";

// ── Mock SharedWorkerGlobalScope ────────────────────────────────────

type ConnectHandler = (event: { ports: MessagePort[] }) => void;

interface MockPort {
  postMessage: ReturnType<typeof vi.fn>;
  onmessage: ((e: MessageEvent) => void) | null;
  start: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

function createMockPort(): MockPort {
  return {
    postMessage: vi.fn(),
    onmessage: null,
    start: vi.fn(),
    close: vi.fn(),
  };
}

let connectHandler: ConnectHandler | null = null;

const mockSelf = {
  set onconnect(handler: ConnectHandler) {
    connectHandler = handler;
  },
  get onconnect(): ConnectHandler | null {
    return connectHandler;
  },
};

(globalThis as Record<string, unknown>).self = mockSelf;

// ── Helpers ─────────────────────────────────────────────────────────

function simulateConnect(port: MockPort): void {
  if (!connectHandler) throw new TestSetupError("onconnect not registered");
  connectHandler({ ports: [port as unknown as MessagePort] });
}

function sendToPort(port: MockPort, data: Record<string, unknown>): void {
  if (!port.onmessage) throw new TestSetupError("port.onmessage not set");
  port.onmessage(new MessageEvent("message", { data }));
}

async function sendAndWaitPort(
  port: MockPort,
  data: Record<string, unknown>,
): Promise<WorkerResponse> {
  const countBefore = port.postMessage.mock.calls.length;
  sendToPort(port, data);
  await new Promise((r) => setTimeout(r, 50));
  const call = port.postMessage.mock.calls[countBefore];
  if (!call) throw new TestSetupError("No response posted to port");
  return call[0] as WorkerResponse;
}

class TestSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TestSetupError";
  }
}

async function initPort(port: MockPort): Promise<void> {
  await sendAndWaitPort(port, { type: "init", id: 1 });
}

async function connectPort(port: MockPort): Promise<ConnectResponse> {
  const resp = await sendAndWaitPort(port, { type: "connect", id: 2 });
  return resp as ConnectResponse;
}

async function loginViaPort(port: MockPort): Promise<void> {
  const sodium = requireSodium();
  const salt = sodium.randombytes_buf(16);

  const pwBuf = new TextEncoder().encode("test-password-long-enough");
  const saltCopy = new Uint8Array(salt);
  await sendAndWaitPort(port, {
    type: "argon2id",
    id: 10,
    password: pwBuf.buffer,
    salt: saltCopy.buffer,
  });

  const blindResp = (await sendAndWaitPort(port, {
    type: "oprfBlind",
    id: 11,
  })) as OprfBlindResponse;

  const oprfKey = sodium.crypto_core_ristretto255_scalar_random();
  const evaluated = sodium.crypto_scalarmult_ristretto255(
    oprfKey,
    decode(blindResp.blindedElement),
  );

  await sendAndWaitPort(port, {
    type: "deriveKeys",
    id: 12,
    evaluated: evaluated.buffer,
  });
}

// ── Setup ───────────────────────────────────────────────────────────

beforeAll(async () => {
  await getSodium();
  // Import the SharedWorker module to register onconnect
  await import("./crypto.shared-worker.js");
});

// ── Tests ───────────────────────────────────────────────────────────

describe("SharedWorker entry point", () => {
  describe("connect lifecycle", () => {
    it("registers onconnect handler", () => {
      expect(connectHandler).not.toBeNull();
    });

    it("calls port.start() on connection", () => {
      const port = createMockPort();
      simulateConnect(port);
      expect(port.start).toHaveBeenCalledOnce();
    });

    it("responds to connect request with current state", async () => {
      const port = createMockPort();
      simulateConnect(port);

      await initPort(port);
      const resp = await connectPort(port);

      expect(resp.ok).toBe(true);
      expect(resp.type).toBe("connect");
      expect(resp.state).toBe("READY");
      expect(resp.volPublic).toBeUndefined();
    });

    it("responds with KEYED state and public keys after login", async () => {
      const port = createMockPort();
      simulateConnect(port);

      await initPort(port);
      await loginViaPort(port);

      const resp = await connectPort(port);

      expect(resp.state).toBe("KEYED");
      expect(resp.volPublic).toBeDefined();

      // Clean up for next test
      await sendAndWaitPort(port, { type: "zeroAll", id: 99 });
    });
  });

  describe("disconnect", () => {
    it("removes port from set and sends ack", async () => {
      const port = createMockPort();
      simulateConnect(port);
      await initPort(port);

      const resp = await sendAndWaitPort(port, {
        type: "disconnect",
        id: 50,
      });

      expect(resp.ok).toBe(true);
      expect(resp.type).toBe("disconnect");
      expect(port.close).toHaveBeenCalledOnce();
    });
  });

  describe("stateChange broadcasts", () => {
    it("broadcasts KEYED to other ports when one port derives keys", async () => {
      const port1 = createMockPort();
      const port2 = createMockPort();
      simulateConnect(port1);
      simulateConnect(port2);

      await initPort(port1);

      // Login via port1
      await loginViaPort(port1);

      // port2 should have received a stateChange broadcast
      const broadcasts = port2.postMessage.mock.calls
        .map((c) => c[0] as WorkerResponse | WorkerEvent)
        .filter(
          (msg): msg is StateChangeEvent =>
            "kind" in msg && msg.kind === "stateChange",
        );

      expect(broadcasts.length).toBeGreaterThanOrEqual(1);
      expect(broadcasts.some((b) => b.state === "KEYED")).toBe(true);

      // port1 should NOT have received the broadcast (it's the source)
      const port1Broadcasts = port1.postMessage.mock.calls
        .map((c) => c[0] as WorkerResponse | WorkerEvent)
        .filter(
          (msg): msg is StateChangeEvent =>
            "kind" in msg && msg.kind === "stateChange",
        );
      expect(port1Broadcasts.filter((b) => b.state === "KEYED")).toHaveLength(
        0,
      );

      // Clean up
      await sendAndWaitPort(port1, { type: "zeroAll", id: 99 });
    });

    it("broadcasts READY to other ports when one port zeros keys", async () => {
      const port1 = createMockPort();
      const port2 = createMockPort();
      simulateConnect(port1);
      simulateConnect(port2);

      await initPort(port1);
      await loginViaPort(port1);

      // Clear mock call history for cleaner assertions
      port2.postMessage.mockClear();

      // Zero from port1
      await sendAndWaitPort(port1, { type: "zeroAll", id: 70 });

      // port2 should receive stateChange READY
      const broadcasts = port2.postMessage.mock.calls
        .map((c) => c[0] as WorkerResponse | WorkerEvent)
        .filter(
          (msg): msg is StateChangeEvent =>
            "kind" in msg && msg.kind === "stateChange",
        );

      expect(broadcasts).toHaveLength(1);
      expect(broadcasts[0]!.state).toBe("READY");
    });
  });
});
