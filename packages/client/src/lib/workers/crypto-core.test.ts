/**
 * Tests for the crypto-core Sink abstraction and state management.
 *
 * Verifies that handlers route responses through the injected Sink
 * function, that state transitions fire the onStateTransition callback,
 * and that getState/getPublicKeys return correct values.
 *
 * Uses real @care-y/crypto (WASM) for crypto correctness. The core's
 * module-scoped state means tests must run sequentially and reset via
 * handleZeroAll between logical groups.
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { getSodium, requireSodium, decode } from "@care-y/crypto";
import type {
  WorkerResponse,
  RewrapEvent,
  OprfBlindResponse,
  DeriveKeysResponse,
  SharedWorkerState,
} from "./crypto-protocol.js";
import {
  createDispatcher,
  getState,
  getPublicKeys,
  handleZeroAll,
  onStateTransition,
  type Sink,
} from "./crypto-core.js";
import { CryptoWorkerTestError } from "$lib/errors.js";

// ── Sink capture ────────────────────────────────────────────────────

let sinkMessages: (WorkerResponse | RewrapEvent)[] = [];

const testSink: Sink = (msg) => {
  sinkMessages.push(msg);
};

function lastResponse(): WorkerResponse {
  const msg = sinkMessages[sinkMessages.length - 1];
  if (!msg || !("id" in msg))
    throw new CryptoWorkerTestError("No response in sink");
  return msg;
}

// ── Helpers ─────────────────────────────────────────────────────────

let dispatch: ReturnType<typeof createDispatcher>;

async function dispatchAndWait(
  data: Record<string, unknown>,
): Promise<WorkerResponse> {
  const countBefore = sinkMessages.length;
  dispatch(data as unknown as Parameters<typeof dispatch>[0]);
  await new Promise((r) => setTimeout(r, 50));
  const response = sinkMessages[countBefore];
  if (!response || !("id" in response)) {
    throw new CryptoWorkerTestError("No WorkerResponse in sink after dispatch");
  }
  return response;
}

async function loginFlow(
  password: string,
  salt: Uint8Array,
): Promise<{ volPublic: string }> {
  const sodium = requireSodium();

  await dispatchAndWait({ type: "init", id: 1 });

  const pwBuf = new TextEncoder().encode(password);
  const saltCopy = new Uint8Array(salt);
  await dispatchAndWait({
    type: "argon2id",
    id: 2,
    password: pwBuf.buffer,
    salt: saltCopy.buffer,
  });

  const blindResp = (await dispatchAndWait({
    type: "oprfBlind",
    id: 3,
  })) as OprfBlindResponse;

  const oprfKey = sodium.crypto_core_ristretto255_scalar_random();
  const blindedElem = decode(blindResp.blindedElement);
  const evaluated = sodium.crypto_scalarmult_ristretto255(oprfKey, blindedElem);

  const deriveResp = (await dispatchAndWait({
    type: "deriveKeys",
    id: 4,
    evaluated: evaluated.buffer,
  })) as DeriveKeysResponse;

  return { volPublic: deriveResp.volPublic };
}

// ── Setup ───────────────────────────────────────────────────────────

beforeAll(async () => {
  await getSodium();
});

beforeEach(() => {
  sinkMessages = [];
  dispatch = createDispatcher(testSink);
});

// ── Tests ───────────────────────────────────────────────────────────

describe("crypto-core Sink abstraction", () => {
  it("routes init response through the injected sink", async () => {
    await dispatchAndWait({ type: "init", id: 10 });

    const resp = lastResponse();
    expect(resp.ok).toBe(true);
    expect(resp.type).toBe("init");
    expect(resp.id).toBe(10);
  });

  it("routes error responses through the sink when state is wrong", async () => {
    await dispatchAndWait({ type: "init", id: 20 });

    const resp = await dispatchAndWait({ type: "oprfBlind", id: 21 });

    expect(resp.ok).toBe(false);
    if (!resp.ok) {
      expect(resp.code).toBe("INVALID_STATE");
    }
  });
});

describe("crypto-core state accessors", () => {
  it("getState returns READY after init", async () => {
    await dispatchAndWait({ type: "init", id: 30 });
    expect(getState()).toBe("READY");
  });

  it("getState returns KEYED after full login", async () => {
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);

    await loginFlow("test-password-long", salt);

    expect(getState()).toBe("KEYED");
  });

  it("getPublicKeys returns volPublic when keyed", async () => {
    const keys = getPublicKeys();
    expect(keys.volPublic).toBeDefined();
    expect(typeof keys.volPublic).toBe("string");
  });

  it("getState returns READY after zeroAll", async () => {
    handleZeroAll(-1, testSink);

    expect(getState()).toBe("READY");
    expect(getPublicKeys().volPublic).toBeUndefined();
  });
});

describe("crypto-core onStateTransition callback", () => {
  it("fires callback with KEYED on deriveKeys completion", async () => {
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const transitions: SharedWorkerState[] = [];

    onStateTransition((state) => {
      transitions.push(state);
    });

    await loginFlow("callback-test-password", salt);

    expect(transitions).toContain("KEYED");
  });

  it("fires callback with READY on zeroAll", () => {
    const transitions: SharedWorkerState[] = [];

    onStateTransition((state) => {
      transitions.push(state);
    });

    handleZeroAll(-1, testSink);

    expect(transitions).toContain("READY");
  });

  it("fires synchronously inside the handler (not async)", async () => {
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    let firedDuringDispatch = false;

    await dispatchAndWait({ type: "init", id: 60 });

    const pwBuf = new TextEncoder().encode("sync-test-password");
    const saltCopy = new Uint8Array(salt);
    await dispatchAndWait({
      type: "argon2id",
      id: 61,
      password: pwBuf.buffer,
      salt: saltCopy.buffer,
    });

    const blindResp = (await dispatchAndWait({
      type: "oprfBlind",
      id: 62,
    })) as OprfBlindResponse;

    const oprfKey = sodium.crypto_core_ristretto255_scalar_random();
    const evaluated = sodium.crypto_scalarmult_ristretto255(
      oprfKey,
      decode(blindResp.blindedElement),
    );

    // Register callback that sets flag synchronously
    onStateTransition(() => {
      firedDuringDispatch = true;
    });

    // Dispatch deriveKeys synchronously (the handler is sync internally)
    dispatch({
      type: "deriveKeys",
      id: 63,
      evaluated: evaluated.buffer,
    } as unknown as Parameters<typeof dispatch>[0]);

    // Flag should already be set before any await
    expect(firedDuringDispatch).toBe(true);

    // Clean up
    handleZeroAll(-1, testSink);
    // eslint-disable-next-line @typescript-eslint/no-empty-function -- reset handler after test
    onStateTransition(() => {});
  });
});
