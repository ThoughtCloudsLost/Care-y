/**
 * Tests for the CryptoBridge main-thread proxy.
 *
 * Mocks the Worker constructor so no real Worker is created. The mock
 * captures postMessage calls and allows tests to simulate Worker responses
 * by invoking the captured onmessage handler.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CryptoWorkerError } from "./crypto-bridge-errors.js";
import type { CryptoBridge } from "./crypto-bridge.js";
import type { WorkerResponse } from "./crypto-protocol.js";

// ── Mock Worker ─────────────────────────────────────────────────────

interface MockWorkerInstance {
  postMessage: ReturnType<typeof vi.fn>;
  onmessage: ((e: MessageEvent<WorkerResponse>) => void) | null;
  terminate: ReturnType<typeof vi.fn>;
}

let mockWorkerInstance: MockWorkerInstance | null = null;

/** Mock Worker that captures its instance globally for test assertions. */
function MockWorkerConstructor(): MockWorkerInstance {
  const instance: MockWorkerInstance = {
    postMessage: vi.fn(),
    onmessage: null,
    terminate: vi.fn(),
  };
  mockWorkerInstance = instance;
  return instance;
}

// Install mock before CryptoBridge is imported
vi.stubGlobal("Worker", MockWorkerConstructor);

/** Simulate the Worker posting a response back to the bridge. */
function respondFromWorker(data: WorkerResponse): void {
  if (mockWorkerInstance?.onmessage) {
    mockWorkerInstance.onmessage(new MessageEvent("message", { data }));
  }
}

/**
 * Auto-respond to init requests so the bridge completes initialization.
 * Returns the bridge instance after it's ready.
 */
async function createReadyBridge(): Promise<CryptoBridge> {
  const { CryptoBridge } = await import("./crypto-bridge.js");
  const bridge = new CryptoBridge();

  // The constructor sends an init request. Find it and respond.
  const initCall = mockWorkerInstance?.postMessage.mock.calls[0] as
    | [{ type: string; id: number }]
    | undefined;
  if (initCall) {
    respondFromWorker({ id: initCall[0].id, ok: true, type: "init" });
  }

  await bridge.waitReady();
  return bridge;
}

// ── Tests ───────────────────────────────────────────────────────────

describe("CryptoBridge", () => {
  beforeEach(() => {
    mockWorkerInstance = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("construction", () => {
    it("creates a Worker and sends an init request", async () => {
      const { CryptoBridge } = await import("./crypto-bridge.js");
      const bridge = new CryptoBridge();

      expect(mockWorkerInstance).not.toBeNull();

      const call = mockWorkerInstance?.postMessage.mock.calls[0] as [
        { type: string; id: number },
      ];
      expect(call[0].type).toBe("init");

      // Respond to init so waitReady resolves
      respondFromWorker({ id: call[0].id, ok: true, type: "init" });
      await bridge.waitReady();
      expect(bridge.getState()).toBe("READY");
    });
  });

  describe("argon2id", () => {
    it("sends password and salt as Transferable and awaits response", async () => {
      const bridge = await createReadyBridge();

      const password = new ArrayBuffer(16);
      const salt = new ArrayBuffer(16);

      const promise = bridge.argon2id(password, salt);

      // Wait for the async argon2id method to reach postMessage after awaiting readyPromise.
      // vi.waitFor polls until the assertion passes (handles variable microtask timing).
      const argonCall = await vi.waitFor(() => {
        const calls = mockWorkerInstance?.postMessage.mock.calls;
        const found = calls?.find(
          (c: unknown[]) => (c[0] as { type: string }).type === "argon2id",
        ) as [{ type: string; id: number }, Transferable[]] | undefined;
        expect(found).toBeDefined();
        return found;
      });

      expect(argonCall?.[1]).toEqual({ transfer: [password, salt] });

      respondFromWorker({
        id: argonCall?.[0].id ?? 0,
        ok: true,
        type: "argon2id",
      });
      await promise;
    });
  });

  describe("oprfBlind", () => {
    it("returns the blinded element", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.oprfBlind();

      const calls = mockWorkerInstance?.postMessage.mock.calls;
      const blindCall = calls?.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "oprfBlind",
      ) as [{ type: string; id: number }] | undefined;

      respondFromWorker({
        id: blindCall?.[0].id ?? 0,
        ok: true,
        type: "oprfBlind",
        blindedElement: "dGVzdC1ibGluZGVk",
      });

      const result = await promise;
      expect(result.blindedElement).toBe("dGVzdC1ibGluZGVk");
    });
  });

  describe("deriveKeys", () => {
    it("sends evaluated as Transferable and returns volPublic", async () => {
      const bridge = await createReadyBridge();

      const evaluated = new ArrayBuffer(32);
      const promise = bridge.deriveKeys(evaluated);

      const calls = mockWorkerInstance?.postMessage.mock.calls;
      const deriveCall = calls?.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "deriveKeys",
      ) as [{ type: string; id: number }, Transferable[]] | undefined;

      expect(deriveCall?.[1]).toEqual({ transfer: [evaluated] });

      respondFromWorker({
        id: deriveCall?.[0].id ?? 0,
        ok: true,
        type: "deriveKeys",
        volPublic: "dGVzdC12b2xQdWJsaWM",
      });

      const result = await promise;
      expect(result.volPublic).toBe("dGVzdC12b2xQdWJsaWM");
      expect(bridge.getState()).toBe("KEYED");
    });
  });

  describe("decrypt", () => {
    it("sends decrypt request and returns plaintext", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.decrypt(
        "ticket-1",
        "ep-base64",
        "nonce-base64",
        "wk-base64",
        "ct-base64",
      );

      const calls = mockWorkerInstance?.postMessage.mock.calls;
      const decCall = calls?.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "decryptContent",
      ) as [{ type: string; id: number; ticketId: string }] | undefined;

      expect(decCall?.[0].ticketId).toBe("ticket-1");

      respondFromWorker({
        id: decCall?.[0].id ?? 0,
        ok: true,
        type: "decryptContent",
        plaintext: "Hello, decrypted!",
      });

      const result = await promise;
      expect(result).toBe("Hello, decrypted!");
    });
  });

  describe("encrypt", () => {
    it("sends encrypt request and returns ciphertext", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.encrypt("ticket-1", "Secret message");

      const calls = mockWorkerInstance?.postMessage.mock.calls;
      const encCall = calls?.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "encryptContent",
      ) as
        | [{ type: string; id: number; ticketId: string; plaintext: string }]
        | undefined;

      expect(encCall?.[0].plaintext).toBe("Secret message");

      respondFromWorker({
        id: encCall?.[0].id ?? 0,
        ok: true,
        type: "encryptContent",
        ciphertext: "ZW5jcnlwdGVk",
      });

      const result = await promise;
      expect(result).toBe("ZW5jcnlwdGVk");
    });
  });

  describe("evictTk", () => {
    it("sends eviction request", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.evictTk("ticket-99");

      const calls = mockWorkerInstance?.postMessage.mock.calls;
      const evictCall = calls?.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "evictTk",
      ) as [{ type: string; id: number }] | undefined;

      respondFromWorker({
        id: evictCall?.[0].id ?? 0,
        ok: true,
        type: "evictTk",
      });

      await promise;
    });
  });

  describe("zeroAll", () => {
    it("sends zero request and transitions state to READY", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.zeroAll();

      const calls = mockWorkerInstance?.postMessage.mock.calls;
      const zeroCall = calls?.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "zeroAll",
      ) as [{ type: string; id: number }] | undefined;

      respondFromWorker({
        id: zeroCall?.[0].id ?? 0,
        ok: true,
        type: "zeroAll",
      });

      await promise;
      expect(bridge.getState()).toBe("READY");
    });
  });

  describe("error handling", () => {
    it("rejects pending promise with CryptoWorkerError on Worker error", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.encrypt("ticket-fail", "data");

      const calls = mockWorkerInstance?.postMessage.mock.calls;
      const encCall = calls?.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "encryptContent",
      ) as [{ type: string; id: number }] | undefined;

      respondFromWorker({
        id: encCall?.[0].id ?? 0,
        ok: false,
        type: "encryptContent",
        error: "No cached tk for ticket ticket-fail",
        code: "TK_NOT_CACHED",
      });

      await expect(promise).rejects.toThrow(CryptoWorkerError);
      await expect(promise).rejects.toThrow("No cached tk");

      try {
        await promise;
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(CryptoWorkerError);
        expect((err as CryptoWorkerError).code).toBe("TK_NOT_CACHED");
      }
    });
  });

  describe("destroy", () => {
    it("terminates the Worker and rejects pending requests", async () => {
      const bridge = await createReadyBridge();

      // Start a request that won't be answered
      const promise = bridge.encrypt("ticket-pending", "data");

      bridge.destroy();

      expect(mockWorkerInstance?.terminate).toHaveBeenCalledTimes(1);
      expect(bridge.getState()).toBe("DESTROYED");

      await expect(promise).rejects.toThrow(CryptoWorkerError);
      await expect(promise).rejects.toThrow("Worker destroyed");
    });

    it("rejects new requests after destroy", async () => {
      const bridge = await createReadyBridge();
      bridge.destroy();

      await expect(bridge.encrypt("t", "data")).rejects.toThrow(
        CryptoWorkerError,
      );
      await expect(bridge.encrypt("t", "data")).rejects.toThrow(
        "Bridge is destroyed",
      );
    });

    it("is idempotent (double destroy does not throw)", async () => {
      const bridge = await createReadyBridge();
      bridge.destroy();
      bridge.destroy();
      expect(mockWorkerInstance?.terminate).toHaveBeenCalledTimes(1);
    });
  });

  describe("request queuing", () => {
    it("queues argon2id until init completes", async () => {
      const { CryptoBridge } = await import("./crypto-bridge.js");
      const bridge = new CryptoBridge();

      // Start argon2id before init responds
      const password = new ArrayBuffer(8);
      const salt = new ArrayBuffer(16);
      const argonPromise = bridge.argon2id(password, salt);

      // Now respond to init
      const initCall = mockWorkerInstance?.postMessage.mock.calls[0] as [
        { type: string; id: number },
      ];
      respondFromWorker({ id: initCall[0].id, ok: true, type: "init" });

      // Wait for init to complete, then argon2id should have been sent
      await bridge.waitReady();

      // Find and respond to the argon2id request
      const calls = mockWorkerInstance?.postMessage.mock.calls;
      const argonCall = calls?.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "argon2id",
      ) as [{ type: string; id: number }] | undefined;

      expect(argonCall).toBeDefined();

      respondFromWorker({
        id: argonCall?.[0].id ?? 0,
        ok: true,
        type: "argon2id",
      });

      await argonPromise;
    });
  });
});
