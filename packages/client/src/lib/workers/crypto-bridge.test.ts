/**
 * Tests for the CryptoBridge main-thread proxy.
 *
 * Mocks the Worker and SharedWorker constructors so no real workers are
 * created. The mocks capture postMessage calls and allow tests to simulate
 * responses by invoking the captured onmessage handler.
 *
 * The default constructor (no mode arg) tries SharedWorker first. Since
 * SharedWorker is not mocked in the dedicated-mode tests, the bridge
 * falls back to dedicated Worker automatically.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CryptoWorkerError } from "./crypto-bridge-errors.js";
import type { CryptoBridge } from "./crypto-bridge.js";
import type {
  WorkerResponse,
  WorkerEvent,
  StateChangeEvent,
} from "./crypto-protocol.js";

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

  // The constructor sends an init request. Find it by type (not position).
  const initCall = mockWorkerInstance?.postMessage.mock.calls.find(
    ([msg]) => (msg as { type: string }).type === "init",
  ) as [{ type: string; id: number }] | undefined;
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

      const call = mockWorkerInstance?.postMessage.mock.calls.find(
        ([msg]) => (msg as { type: string }).type === "init",
      ) as [{ type: string; id: number }] | undefined;
      expect(call).toBeDefined();

      // Respond to init so waitReady resolves
      respondFromWorker({ id: call![0].id, ok: true, type: "init" });
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
        "title",
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

      const promise = bridge.encrypt("ticket-1", "title", "Secret message");

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

  describe("unwrapTk", () => {
    it("sends unwrapTk request with key wrap fields", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.unwrapTk(
        "ticket-tk",
        "ticket-tk",
        "ep-b64",
        "n-b64",
        "wk-b64",
      );

      const calls = mockWorkerInstance?.postMessage.mock.calls;
      const tkCall = await vi.waitFor(() => {
        const found = calls?.find(
          (c: unknown[]) => (c[0] as { type: string }).type === "unwrapTk",
        ) as
          | [
              {
                type: string;
                id: number;
                ticketId: string;
                ephemeralPoint: string;
                nonce: string;
                wrappedKey: string;
              },
            ]
          | undefined;
        expect(found).toBeDefined();
        return found;
      });

      expect(tkCall?.[0].ticketId).toBe("ticket-tk");
      expect(tkCall?.[0].ephemeralPoint).toBe("ep-b64");
      expect(tkCall?.[0].nonce).toBe("n-b64");
      expect(tkCall?.[0].wrappedKey).toBe("wk-b64");

      respondFromWorker({
        id: tkCall?.[0].id ?? 0,
        ok: true,
        type: "unwrapTk",
      });

      await promise;
    });
  });

  describe("wrapWithVolPublic", () => {
    it("sends data and returns ECIES output", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.wrapWithVolPublic("dGVzdC1kYXRh");

      const calls = mockWorkerInstance?.postMessage.mock.calls;
      const wrapCall = await vi.waitFor(() => {
        const found = calls?.find(
          (c: unknown[]) =>
            (c[0] as { type: string }).type === "wrapWithVolPublic",
        ) as [{ type: string; id: number; data: string }] | undefined;
        expect(found).toBeDefined();
        return found;
      });

      expect(wrapCall?.[0].data).toBe("dGVzdC1kYXRh");

      respondFromWorker({
        id: wrapCall?.[0].id ?? 0,
        ok: true,
        type: "wrapWithVolPublic",
        ephemeralPoint: "ZXBoZW1lcmFs",
        nonce: "bm9uY2U=",
        wrappedKey: "d3JhcHBlZA==",
      });

      const result = await promise;
      expect(result.ephemeralPoint).toBe("ZXBoZW1lcmFs");
      expect(result.nonce).toBe("bm9uY2U=");
      expect(result.wrappedKey).toBe("d3JhcHBlZA==");
    });
  });

  describe("createTicketEncryption", () => {
    it("sends createTicketKey request and returns structured result", async () => {
      const bridge = await createReadyBridge();

      const fields = [
        { name: "title", plaintext: "Test title" },
        { name: "description", plaintext: "Test desc" },
      ];
      const promise = bridge.createTicketEncryption("ticket-cte-1", fields);

      const calls = mockWorkerInstance?.postMessage.mock.calls;
      const createCall = await vi.waitFor(() => {
        const found = calls?.find(
          (c: unknown[]) =>
            (c[0] as { type: string }).type === "createTicketKey",
        ) as
          | [
              {
                type: string;
                id: number;
                fields: Array<{ name: string; plaintext: string }>;
              },
            ]
          | undefined;
        expect(found).toBeDefined();
        return found;
      });

      expect(createCall?.[0].fields).toEqual(fields);

      respondFromWorker({
        id: createCall?.[0].id ?? 0,
        ok: true,
        type: "createTicketKey",
        encryptedFields: [
          { name: "title", ciphertext: "ZW5jLXRpdGxl" },
          { name: "description", ciphertext: "ZW5jLWRlc2M=" },
        ],
        keyWrap: {
          ephemeralPoint: "ZXBoZW1lcmFs",
          nonce: "bm9uY2U=",
          wrappedKey: "d3JhcHBlZA==",
        },
        keyGeneration: "550e8400-e29b-41d4-a716-446655440000",
      });

      const result = await promise;
      expect(result.encryptedFields).toHaveLength(2);
      expect(result.encryptedFields[0]!.name).toBe("title");
      expect(result.encryptedFields[0]!.ciphertext).toBe("ZW5jLXRpdGxl");
      expect(result.keyWrap.ephemeralPoint).toBe("ZXBoZW1lcmFs");
      expect(result.keyWrap.nonce).toBe("bm9uY2U=");
      expect(result.keyWrap.wrappedKey).toBe("d3JhcHBlZA==");
      expect(result.keyGeneration).toBe("550e8400-e29b-41d4-a716-446655440000");
    });
  });

  describe("error handling", () => {
    it("rejects pending promise with CryptoWorkerError on Worker error", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.encrypt("ticket-fail", "title", "data");

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
      const promise = bridge.encrypt("ticket-pending", "title", "data");

      bridge.destroy();

      expect(mockWorkerInstance?.terminate).toHaveBeenCalledTimes(1);
      expect(bridge.getState()).toBe("DESTROYED");

      await expect(promise).rejects.toThrow(CryptoWorkerError);
      await expect(promise).rejects.toThrow("Worker destroyed");
    });

    it("rejects new requests after destroy", async () => {
      const bridge = await createReadyBridge();
      bridge.destroy();

      await expect(bridge.encrypt("t", "title", "data")).rejects.toThrow(
        CryptoWorkerError,
      );
      await expect(bridge.encrypt("t", "title", "data")).rejects.toThrow(
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
      const initCall = mockWorkerInstance?.postMessage.mock.calls.find(
        ([msg]) => (msg as { type: string }).type === "init",
      ) as [{ type: string; id: number }] | undefined;
      respondFromWorker({ id: initCall![0].id, ok: true, type: "init" });

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

// ── SharedWorker mode tests ─────────────────────────────────────────

interface MockPort {
  postMessage: ReturnType<typeof vi.fn>;
  onmessage: ((e: MessageEvent<WorkerResponse | WorkerEvent>) => void) | null;
  start: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

interface MockSharedWorkerInstance {
  port: MockPort;
  onerror: ((e: Event) => void) | null;
}

let mockSharedWorkerInstance: MockSharedWorkerInstance | null = null;

function MockSharedWorkerConstructor(): MockSharedWorkerInstance {
  const port: MockPort = {
    postMessage: vi.fn(),
    onmessage: null,
    start: vi.fn(),
    close: vi.fn(),
  };
  const instance: MockSharedWorkerInstance = {
    port,
    onerror: null,
  };
  mockSharedWorkerInstance = instance;
  return instance;
}

function respondFromSharedWorker(data: WorkerResponse | WorkerEvent): void {
  if (mockSharedWorkerInstance?.port.onmessage) {
    mockSharedWorkerInstance.port.onmessage(
      new MessageEvent("message", { data }),
    );
  }
}

async function createReadySharedBridge(
  connectState: "READY" | "KEYED" = "READY",
  keys?: { volPublic?: string; orgPublicKey?: string },
): Promise<CryptoBridge> {
  const { CryptoBridge } = await import("./crypto-bridge.js");
  const bridge = new CryptoBridge();

  const port = mockSharedWorkerInstance?.port;

  // Respond to init (find by type, not position)
  const initCall = port?.postMessage.mock.calls.find(
    ([msg]) => (msg as { type: string }).type === "init",
  ) as [{ type: string; id: number }] | undefined;
  if (initCall) {
    respondFromSharedWorker({
      id: initCall[0].id,
      ok: true,
      type: "init",
    });
  }

  // Respond to connect (sent after init resolves)
  await vi.waitFor(() => {
    const calls = port?.postMessage.mock.calls;
    const found = calls?.find(
      (c: unknown[]) => (c[0] as { type: string }).type === "connect",
    );
    expect(found).toBeDefined();
  });

  const connectCall = port?.postMessage.mock.calls.find(
    (c: unknown[]) => (c[0] as { type: string }).type === "connect",
  ) as [{ type: string; id: number }] | undefined;

  respondFromSharedWorker({
    id: connectCall?.[0].id ?? 0,
    ok: true,
    type: "connect",
    state: connectState,
    volPublic: keys?.volPublic,
    orgPublicKey: keys?.orgPublicKey,
  });

  await bridge.waitReady();
  return bridge;
}

describe("CryptoBridge (SharedWorker mode)", () => {
  beforeEach(() => {
    mockSharedWorkerInstance = null;
    mockWorkerInstance = null;
    vi.clearAllMocks();
    vi.stubGlobal("SharedWorker", MockSharedWorkerConstructor);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal("Worker", MockWorkerConstructor);
    vi.restoreAllMocks();
  });

  describe("construction", () => {
    it("creates a SharedWorker with extendedLifetime and sends init + connect", async () => {
      const bridge = await createReadySharedBridge();

      expect(mockSharedWorkerInstance).not.toBeNull();
      expect(mockSharedWorkerInstance?.port.start).toHaveBeenCalledOnce();
      expect(bridge.getState()).toBe("READY");
      expect(bridge.getMode()).toBe("shared");
    });

    it("falls back to dedicated Worker when SharedWorker is unavailable", async () => {
      vi.stubGlobal("SharedWorker", undefined);

      const { CryptoBridge } = await import("./crypto-bridge.js");
      const bridge = new CryptoBridge();

      expect(mockWorkerInstance).not.toBeNull();
      expect(mockSharedWorkerInstance).toBeNull();
      expect(bridge.getMode()).toBe("dedicated");

      // Respond to init
      const initCall = mockWorkerInstance?.postMessage.mock.calls.find(
        ([msg]) => (msg as { type: string }).type === "init",
      ) as [{ type: string; id: number }] | undefined;
      respondFromWorker({ id: initCall![0].id, ok: true, type: "init" });
      await bridge.waitReady();
    });
  });

  describe("reconnection", () => {
    it("detects KEYED state on connect and sets bridge to KEYED", async () => {
      const bridge = await createReadySharedBridge("KEYED", {
        volPublic: "dm9sUHVibGlj",
        orgPublicKey: "b3JnUHVibGlj",
      });

      expect(bridge.getState()).toBe("KEYED");
      expect(bridge.isReconnected()).toBe(true);
      expect(bridge.getReconnectData()).toEqual({
        volPublic: "dm9sUHVibGlj",
        orgPublicKey: "b3JnUHVibGlj",
      });
    });

    it("reports not reconnected on fresh READY state", async () => {
      const bridge = await createReadySharedBridge("READY");

      expect(bridge.getState()).toBe("READY");
      expect(bridge.isReconnected()).toBe(false);
      expect(bridge.getReconnectData()).toEqual({
        volPublic: undefined,
        orgPublicKey: undefined,
      });
    });
  });

  describe("disconnect", () => {
    it("sends disconnect message and sets state to DESTROYED", async () => {
      const bridge = await createReadySharedBridge();

      bridge.disconnect();

      const port = mockSharedWorkerInstance?.port;
      const disconnectCall = port?.postMessage.mock.calls.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "disconnect",
      );
      expect(disconnectCall).toBeDefined();
      expect(bridge.getState()).toBe("DESTROYED");
    });

    it("rejects pending requests on disconnect", async () => {
      const bridge = await createReadySharedBridge();

      const promise = bridge.encrypt("ticket-pending", "title", "data");
      bridge.disconnect();

      await expect(promise).rejects.toThrow(CryptoWorkerError);
      await expect(promise).rejects.toThrow("Bridge disconnected");
    });
  });

  describe("stateChange handler", () => {
    it("fires onStateChange callback when Worker broadcasts state change", async () => {
      const bridge = await createReadySharedBridge();

      const handler = vi.fn();
      bridge.onStateChange(handler);

      const event: StateChangeEvent = { kind: "stateChange", state: "READY" };
      respondFromSharedWorker(event);

      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith(event);
    });

    it("updates bridge state on stateChange READY (another tab logged out)", async () => {
      const bridge = await createReadySharedBridge("KEYED", {
        volPublic: "dm9sUHVibGlj",
      });

      expect(bridge.getState()).toBe("KEYED");

      bridge.onStateChange(() => undefined);
      respondFromSharedWorker({ kind: "stateChange", state: "READY" });

      expect(bridge.getState()).toBe("READY");
    });

    it("updates bridge state on stateChange KEYED (another tab logged in)", async () => {
      const bridge = await createReadySharedBridge("READY");

      expect(bridge.getState()).toBe("READY");

      bridge.onStateChange(() => undefined);
      respondFromSharedWorker({ kind: "stateChange", state: "KEYED" });

      expect(bridge.getState()).toBe("KEYED");
    });
  });

  describe("dedicated mode (explicit)", () => {
    it("creates a dedicated Worker when mode is 'dedicated'", async () => {
      const { CryptoBridge } = await import("./crypto-bridge.js");
      const bridge = new CryptoBridge("dedicated");

      expect(mockWorkerInstance).not.toBeNull();
      expect(mockSharedWorkerInstance).toBeNull();
      expect(bridge.getMode()).toBe("dedicated");

      const initCall = mockWorkerInstance?.postMessage.mock.calls.find(
        ([msg]) => (msg as { type: string }).type === "init",
      ) as [{ type: string; id: number }] | undefined;
      respondFromWorker({ id: initCall![0].id, ok: true, type: "init" });
      await bridge.waitReady();
    });

    it("destroy() terminates dedicated Worker", async () => {
      const { CryptoBridge } = await import("./crypto-bridge.js");
      const bridge = new CryptoBridge("dedicated");

      const initCall = mockWorkerInstance?.postMessage.mock.calls.find(
        ([msg]) => (msg as { type: string }).type === "init",
      ) as [{ type: string; id: number }] | undefined;
      respondFromWorker({ id: initCall![0].id, ok: true, type: "init" });
      await bridge.waitReady();

      bridge.destroy();

      expect(mockWorkerInstance?.terminate).toHaveBeenCalledOnce();
      expect(bridge.getState()).toBe("DESTROYED");
    });
  });
});
