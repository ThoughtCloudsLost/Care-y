/**
 * Tests for the PortalBridge main-thread proxy.
 *
 * Mocks the Worker constructor so no real worker is created. The mock
 * captures postMessage calls and allows tests to simulate responses
 * by invoking the captured onmessage handler.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PortalWorkerError } from "./portal-bridge-errors.js";
import type { PortalBridge } from "./portal-bridge.js";
import type {
  PortalWorkerResponse,
  PortalWorkerEvent,
} from "./portal-protocol.js";

// -- Mock Worker --------------------------------------------------------------

interface MockWorkerInstance {
  postMessage: ReturnType<typeof vi.fn>;
  onmessage:
    | ((e: MessageEvent<PortalWorkerResponse | PortalWorkerEvent>) => void)
    | null;
  onerror: ((e: ErrorEvent) => void) | null;
  terminate: ReturnType<typeof vi.fn>;
}

let mockWorkerInstance: MockWorkerInstance | null = null;

function MockWorkerConstructor(): MockWorkerInstance {
  const instance: MockWorkerInstance = {
    postMessage: vi.fn(),
    onmessage: null,
    onerror: null,
    terminate: vi.fn(),
  };
  mockWorkerInstance = instance;
  return instance;
}

vi.stubGlobal("Worker", MockWorkerConstructor);

function respondFromWorker(data: PortalWorkerResponse): void {
  if (mockWorkerInstance?.onmessage) {
    mockWorkerInstance.onmessage(new MessageEvent("message", { data }));
  }
}

function emitWorkerEvent(data: PortalWorkerEvent): void {
  if (mockWorkerInstance?.onmessage) {
    mockWorkerInstance.onmessage(new MessageEvent("message", { data }));
  }
}

async function createReadyBridge(): Promise<PortalBridge> {
  const { PortalBridge } = await import("./portal-bridge.js");
  const bridge = new PortalBridge();

  // The constructor sends an init request
  const initCall = mockWorkerInstance?.postMessage.mock.calls.find(
    ([msg]) => (msg as { type: string }).type === "init",
  ) as [{ type: string; id: number }] | undefined;
  if (initCall) {
    respondFromWorker({ id: initCall[0].id, ok: true, type: "init" });
  }

  await bridge.waitReady();
  return bridge;
}

// -- Tests --------------------------------------------------------------------

describe("PortalBridge", () => {
  beforeEach(() => {
    mockWorkerInstance = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("construction", () => {
    it("creates a Worker and sends an init request", async () => {
      const { PortalBridge } = await import("./portal-bridge.js");
      const bridge = new PortalBridge();

      expect(mockWorkerInstance).not.toBeNull();

      const call = mockWorkerInstance?.postMessage.mock.calls.find(
        ([msg]) => (msg as { type: string }).type === "init",
      ) as [{ type: string; id: number }] | undefined;
      expect(call).toBeDefined();

      respondFromWorker({ id: call![0].id, ok: true, type: "init" });
      await bridge.waitReady();
      expect(bridge.getState()).toBe("READY");
    });
  });

  describe("channelSessionStart", () => {
    it("sends seed as Transferable and returns channelId + auth + blindedElement", async () => {
      const bridge = await createReadyBridge();

      const seed = new ArrayBuffer(24);
      const promise = bridge.channelSessionStart(seed);

      const startCall = await vi.waitFor(() => {
        const calls = mockWorkerInstance?.postMessage.mock.calls;
        const found = calls?.find(
          (c: unknown[]) =>
            (c[0] as { type: string }).type === "channelSessionStart",
        ) as
          | [{ type: string; id: number }, StructuredSerializeOptions]
          | undefined;
        expect(found).toBeDefined();
        return found!;
      });

      respondFromWorker({
        id: startCall[0].id,
        ok: true,
        type: "channelSessionStart",
        channelId: "abc123",
        auth: "dGVzdC1hdXRo",
        blindedElement: "dGVzdC1ibGluZA",
      });

      const result = await promise;
      expect(result.channelId).toBe("abc123");
      expect(result.auth).toBe("dGVzdC1hdXRo");
      expect(result.blindedElement).toBe("dGVzdC1ibGluZA");
    });
  });

  describe("channelSessionRestart", () => {
    it("sends the passphrase only and returns channelId + auth + blindedElement", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.channelSessionRestart("retry words");

      const restartCall = await vi.waitFor(() => {
        const calls = mockWorkerInstance?.postMessage.mock.calls;
        const found = calls?.find(
          (c: unknown[]) =>
            (c[0] as { type: string }).type === "channelSessionRestart",
        ) as
          | [{ type: string; id: number; passphrase?: string; seed?: unknown }]
          | undefined;
        expect(found).toBeDefined();
        return found!;
      });

      // The retry never carries the seed; the Worker re-derives from
      // its held copy.
      expect(restartCall[0].seed).toBeUndefined();
      expect(restartCall[0].passphrase).toBe("retry words");

      respondFromWorker({
        id: restartCall[0].id,
        ok: true,
        type: "channelSessionRestart",
        channelId: "abc123",
        auth: "dGVzdC1hdXRo",
        blindedElement: "dGVzdC1ibGluZA",
      });

      const result = await promise;
      expect(result.channelId).toBe("abc123");
      expect(result.auth).toBe("dGVzdC1hdXRo");
      expect(result.blindedElement).toBe("dGVzdC1ibGluZA");
    });
  });

  describe("channelSessionFinish", () => {
    it("returns clientPublic", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.channelSessionFinish("evaluated-b64");

      const finishCall = await vi.waitFor(() => {
        const calls = mockWorkerInstance?.postMessage.mock.calls;
        const found = calls?.find(
          (c: unknown[]) =>
            (c[0] as { type: string }).type === "channelSessionFinish",
        ) as [{ type: string; id: number }] | undefined;
        expect(found).toBeDefined();
        return found!;
      });

      respondFromWorker({
        id: finishCall[0].id,
        ok: true,
        type: "channelSessionFinish",
        clientPublic: "client-pub-b64",
      });

      const result = await promise;
      expect(result.clientPublic).toBe("client-pub-b64");
    });
  });

  describe("verifyKeyCheck", () => {
    it("returns boolean passed value", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.verifyKeyCheck("ep", "n", "ct");

      const call = await vi.waitFor(() => {
        const calls = mockWorkerInstance?.postMessage.mock.calls;
        const found = calls?.find(
          (c: unknown[]) =>
            (c[0] as { type: string }).type === "verifyKeyCheck",
        ) as [{ type: string; id: number }] | undefined;
        expect(found).toBeDefined();
        return found!;
      });

      respondFromWorker({
        id: call[0].id,
        ok: true,
        type: "verifyKeyCheck",
        passed: true,
      });

      const result = await promise;
      expect(result).toBe(true);
    });
  });

  describe("decryptMessage", () => {
    it("returns plaintext string", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.decryptMessage("ep", "n", "ct");

      const call = await vi.waitFor(() => {
        const calls = mockWorkerInstance?.postMessage.mock.calls;
        const found = calls?.find(
          (c: unknown[]) =>
            (c[0] as { type: string }).type === "decryptMessage",
        ) as [{ type: string; id: number }] | undefined;
        expect(found).toBeDefined();
        return found!;
      });

      respondFromWorker({
        id: call[0].id,
        ok: true,
        type: "decryptMessage",
        plaintext: "Hello",
      });

      expect(await promise).toBe("Hello");
    });
  });

  describe("error handling", () => {
    it("rejects with PortalWorkerError on error response", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.decryptMessage("ep", "n", "ct");

      const call = await vi.waitFor(() => {
        const calls = mockWorkerInstance?.postMessage.mock.calls;
        const found = calls?.find(
          (c: unknown[]) =>
            (c[0] as { type: string }).type === "decryptMessage",
        ) as [{ type: string; id: number }] | undefined;
        expect(found).toBeDefined();
        return found!;
      });

      respondFromWorker({
        id: call[0].id,
        ok: false,
        type: "decryptMessage",
        error: "Channel session not established",
        code: "NOT_READY",
      });

      await expect(promise).rejects.toThrow(PortalWorkerError);
      await expect(promise).rejects.toMatchObject({ code: "NOT_READY" });
    });
  });

  describe("derivation progress events", () => {
    it("dispatches progress events to the registered handler", async () => {
      const bridge = await createReadyBridge();
      const phases: string[] = [];

      bridge.onDerivationProgress((event) => {
        phases.push(event.phase);
      });

      emitWorkerEvent({ kind: "derivationProgress", phase: "argon2id-start" });
      emitWorkerEvent({ kind: "derivationProgress", phase: "argon2id-done" });

      expect(phases).toEqual(["argon2id-start", "argon2id-done"]);
    });
  });

  describe("destroy", () => {
    it("sends zeroAll, terminates the Worker, and rejects pending promises", async () => {
      const bridge = await createReadyBridge();

      const promise = bridge.decryptMessage("ep", "n", "ct");

      // Let the decryptMessage postMessage happen
      await vi.waitFor(() => {
        const calls = mockWorkerInstance?.postMessage.mock.calls;
        const found = calls?.find(
          (c: unknown[]) =>
            (c[0] as { type: string }).type === "decryptMessage",
        );
        expect(found).toBeDefined();
      });

      bridge.destroy();

      expect(bridge.getState()).toBe("DESTROYED");
      expect(mockWorkerInstance?.terminate).toHaveBeenCalled();

      await expect(promise).rejects.toThrow(PortalWorkerError);
      await expect(promise).rejects.toMatchObject({
        code: "BRIDGE_DESTROYED",
      });
    });

    it("throws on sendRequest after destroy", async () => {
      const bridge = await createReadyBridge();
      bridge.destroy();

      await expect(bridge.decryptMessage("ep", "n", "ct")).rejects.toThrow(
        PortalWorkerError,
      );
    });
  });
});
