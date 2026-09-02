import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import type {
  PortalWorkerResponse,
  PortalWorkerEvent,
} from "$lib/workers/portal-protocol.js";

// -- Mock Worker (same pattern as portal-bridge.test.ts) ----------------------

interface MockWorkerInstance {
  postMessage: Mock<
    (msg: Record<string, unknown>, options?: StructuredSerializeOptions) => void
  >;
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

// Mock @care-y/crypto to avoid loading sodium
vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal()),
  encode: (buf: Uint8Array): string => Buffer.from(buf).toString("base64url"),
  requireSodium: () => ({
    memzero: vi.fn(),
  }),
}));

import { createPortalSessionState } from "./create-portal-session.svelte.js";
import { PortalBridge } from "$lib/workers/portal-bridge.js";
import type { FragmentData } from "./create-portal-fragment.svelte.js";
import type { ChannelEvaluateCallback } from "./create-portal-session.svelte.js";

function buildFragmentData(): FragmentData {
  return {
    seed: new Uint8Array(24).fill(0xab),
    auth: new Uint8Array(32).fill(0xcd),
    channelId: "test-channel-id",
  };
}

const noopPow = vi.fn().mockResolvedValue("noop");

function makeStubEvaluate(): ChannelEvaluateCallback {
  return vi.fn().mockResolvedValue({ evaluated: "evaluated-b64" });
}

/**
 * Helper: auto-respond to the bridge's init, channelSessionStart,
 * channelSessionRestart, channelSessionFinish, and verifyKeyCheck
 * requests as they arrive. Mimics a worker that succeeds on all
 * operations. `passed` may be a function so a test can flip the key
 * check result between attempts.
 */
function autoRespondSuccess(
  opts: { passed: boolean | (() => boolean) } = { passed: true },
): void {
  // Install an interceptor that responds automatically
  if (mockWorkerInstance) {
    const worker = mockWorkerInstance;
    const realPostMessage = worker.postMessage;

    const respond = (msg: Record<string, unknown>): void => {
      const type = msg.type as string;
      const id = msg.id as number;

      // Respond on next microtask to simulate async
      void Promise.resolve().then(() => {
        switch (type) {
          case "init":
            respondFromWorker({ id, ok: true, type: "init" });
            break;
          case "channelSessionStart":
            respondFromWorker({
              id,
              ok: true,
              type: "channelSessionStart",
              channelId: "test-channel-id",
              auth: "dGVzdC1hdXRo",
              blindedElement: "dGVzdC1ibGluZA",
            });
            break;
          case "channelSessionRestart":
            respondFromWorker({
              id,
              ok: true,
              type: "channelSessionRestart",
              channelId: "test-channel-id",
              auth: "dGVzdC1hdXRo",
              blindedElement: "dGVzdC1ibGluZA",
            });
            break;
          case "channelSessionFinish":
            respondFromWorker({
              id,
              ok: true,
              type: "channelSessionFinish",
              clientPublic: "client-pub-b64",
            });
            break;
          case "verifyKeyCheck":
            respondFromWorker({
              id,
              ok: true,
              type: "verifyKeyCheck",
              passed:
                typeof opts.passed === "function" ? opts.passed() : opts.passed,
            });
            break;
          case "zeroAll":
            respondFromWorker({ id, ok: true, type: "zeroAll" });
            break;
        }
      });
    };

    worker.postMessage = vi.fn(
      (msg: Record<string, unknown>, _options?: StructuredSerializeOptions) => {
        realPostMessage(msg, _options);
        respond(msg);
      },
    );

    // The bridge posts init at construction, before this interceptor
    // installs. Replay anything already recorded on the original mock so
    // those requests get answered too.
    for (const call of realPostMessage.mock.calls) {
      respond(call[0]);
    }
  }
}

describe("createPortalSessionState (bridge-backed)", () => {
  beforeEach(() => {
    mockWorkerInstance = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("tryNoPassphraseDerive", () => {
    it("succeeds and produces a session handle", async () => {
      const state = createPortalSessionState(() => new PortalBridge());
      const fragData = buildFragmentData();

      // Start the derive; the PortalBridge constructor fires immediately
      const promise = state.tryNoPassphraseDerive(
        fragData,
        { ephemeralPoint: "ep", nonce: "n", ciphertext: "ct" },
        makeStubEvaluate(),
        noopPow,
      );

      // Auto-respond to all bridge requests
      autoRespondSuccess();

      // Re-trigger by dispatching init response (bridge waits for init)
      // The autoRespond installed above handles everything from here
      const initCall = mockWorkerInstance?.postMessage.mock.calls.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "init",
      ) as [{ type: string; id: number }] | undefined;

      if (initCall) {
        respondFromWorker({ id: initCall[0].id, ok: true, type: "init" });
      }

      const result = await promise;
      expect(result).toBe(true);
      expect(state.keyCheckPassed).toBe(true);
      expect(state.session).not.toBeNull();
      expect(state.session!.channelId).toBe("test-channel-id");
      expect(state.session!.clientPublic).toBe("client-pub-b64");
    });

    it("returns false when key check fails", async () => {
      const state = createPortalSessionState(() => new PortalBridge());
      const fragData = buildFragmentData();

      const promise = state.tryNoPassphraseDerive(
        fragData,
        { ephemeralPoint: "ep", nonce: "n", ciphertext: "ct" },
        makeStubEvaluate(),
        noopPow,
      );

      autoRespondSuccess({ passed: false });

      const initCall = mockWorkerInstance?.postMessage.mock.calls.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "init",
      ) as [{ type: string; id: number }] | undefined;

      if (initCall) {
        respondFromWorker({ id: initCall[0].id, ok: true, type: "init" });
      }

      const result = await promise;
      expect(result).toBe(false);
      expect(state.keyCheckPassed).toBe(false);
      expect(state.session).toBeNull();
    });
  });

  describe("destroySession", () => {
    it("destroys the bridge and clears the session", async () => {
      const state = createPortalSessionState(() => new PortalBridge());
      const fragData = buildFragmentData();

      const promise = state.tryNoPassphraseDerive(
        fragData,
        { ephemeralPoint: "ep", nonce: "n", ciphertext: "ct" },
        makeStubEvaluate(),
        noopPow,
      );

      autoRespondSuccess();
      const initCall = mockWorkerInstance?.postMessage.mock.calls.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "init",
      ) as [{ type: string; id: number }] | undefined;
      if (initCall) {
        respondFromWorker({ id: initCall[0].id, ok: true, type: "init" });
      }

      await promise;
      expect(state.session).not.toBeNull();

      state.destroySession();
      expect(state.session).toBeNull();
      expect(mockWorkerInstance?.terminate).toHaveBeenCalled();
    });
  });

  describe("submitPassphrase", () => {
    it("succeeds with correct passphrase", async () => {
      const state = createPortalSessionState(() => new PortalBridge());
      const fragData = buildFragmentData();

      const promise = state.submitPassphrase(
        "test passphrase",
        fragData,
        { ephemeralPoint: "ep", nonce: "n", ciphertext: "ct" },
        makeStubEvaluate(),
        noopPow,
      );

      autoRespondSuccess();
      const initCall = mockWorkerInstance?.postMessage.mock.calls.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "init",
      ) as [{ type: string; id: number }] | undefined;
      if (initCall) {
        respondFromWorker({ id: initCall[0].id, ok: true, type: "init" });
      }

      await promise;
      expect(state.keyCheckPassed).toBe(true);
      expect(state.session).not.toBeNull();
      expect(state.passphraseError).toBe(false);
      expect(state.passphraseDerivePending).toBe(false);
    });

    it("retries through channelSessionRestart on the same worker after a failed key check", async () => {
      // Regression: the fragment seed is zeroed after the first
      // channelSessionStart, so a second attempt must reuse the
      // Worker-held seed instead of constructing a fresh bridge from
      // the zeroed main-thread copy.
      const state = createPortalSessionState(() => new PortalBridge());
      const fragData = buildFragmentData();
      const keyCheckWire = {
        ephemeralPoint: "ep",
        nonce: "n",
        ciphertext: "ct",
      };

      // Attempt 1: wrong passphrase. The key check passes only once a
      // channelSessionRestart has been seen (i.e., on the retry).
      const first = state.submitPassphrase(
        "wrong passphrase",
        fragData,
        keyCheckWire,
        makeStubEvaluate(),
        noopPow,
      );

      autoRespondSuccess({
        passed: () =>
          mockWorkerInstance?.postMessage.mock.calls.some(
            (c: unknown[]) =>
              (c[0] as { type: string }).type === "channelSessionRestart",
          ) ?? false,
      });
      const initCall = mockWorkerInstance?.postMessage.mock.calls.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "init",
      ) as [{ type: string; id: number }] | undefined;
      if (initCall) {
        respondFromWorker({ id: initCall[0].id, ok: true, type: "init" });
      }

      await first;
      expect(state.passphraseError).toBe(true);
      expect(state.session).toBeNull();

      const workerAfterFirst = mockWorkerInstance;

      // Attempt 2: correct passphrase retries on the SAME worker.
      await state.submitPassphrase(
        "correct passphrase",
        fragData,
        keyCheckWire,
        makeStubEvaluate(),
        noopPow,
      );

      expect(state.keyCheckPassed).toBe(true);
      expect(state.session).not.toBeNull();
      expect(state.passphraseError).toBe(false);
      expect(mockWorkerInstance).toBe(workerAfterFirst);

      const sentTypes = workerAfterFirst!.postMessage.mock.calls.map(
        (c: unknown[]) => (c[0] as { type: string }).type,
      );
      expect(sentTypes.filter((t) => t === "channelSessionStart")).toHaveLength(
        1,
      );
      expect(sentTypes).toContain("channelSessionRestart");
    });

    it("sets passphraseError when key check fails", async () => {
      const state = createPortalSessionState(() => new PortalBridge());
      const fragData = buildFragmentData();

      const promise = state.submitPassphrase(
        "wrong passphrase",
        fragData,
        { ephemeralPoint: "ep", nonce: "n", ciphertext: "ct" },
        makeStubEvaluate(),
        noopPow,
      );

      autoRespondSuccess({ passed: false });
      const initCall = mockWorkerInstance?.postMessage.mock.calls.find(
        (c: unknown[]) => (c[0] as { type: string }).type === "init",
      ) as [{ type: string; id: number }] | undefined;
      if (initCall) {
        respondFromWorker({ id: initCall[0].id, ok: true, type: "init" });
      }

      await promise;
      expect(state.keyCheckPassed).toBe(false);
      expect(state.session).toBeNull();
      expect(state.passphraseError).toBe(true);
      expect(state.passphraseDerivePending).toBe(false);
    });
  });
});
