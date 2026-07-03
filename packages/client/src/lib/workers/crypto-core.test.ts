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

import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import {
  getSodium,
  requireSodium,
  encode,
  decode,
  eciesEncrypt,
  encryptContent,
  decryptContent,
  generateContentKey,
  buildContentAad,
  followupSlot,
  type Ciphertext,
  type RistrettoPoint,
  type SymmetricKey,
} from "@care-y/crypto";
import type {
  WorkerResponse,
  RewrapEvent,
  ErrorResponse,
  OprfBlindResponse,
  DeriveKeysResponse,
  DecryptContentResponse,
  EncryptContentResponse,
  GetVolPublicResponse,
  CreateTicketKeyResponse,
  WrapWithVolPublicResponse,
  UnwrapOrgKeyResponse,
  OrgEncryptResponse,
  OrgDecryptResponse,
  OrgDecryptBatchResponse,
  SharedWorkerState,
} from "./crypto-protocol.js";
import {
  createDispatcher,
  getState,
  getPublicKeys,
  handleZeroAll,
  handleRewrapResult,
  onStateTransition,
  IDLE_SELF_ZERO_MS,
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
  if (vi.isFakeTimers()) {
    await vi.advanceTimersByTimeAsync(50);
  } else {
    await new Promise((r) => setTimeout(r, 50));
  }
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
  it(
    "fires callback with KEYED on deriveKeys completion",
    { timeout: 30_000 },
    async () => {
      const sodium = requireSodium();
      const salt = sodium.randombytes_buf(16);
      const transitions: SharedWorkerState[] = [];

      onStateTransition((state) => {
        transitions.push(state);
      });

      await loginFlow("callback-test-password", salt);

      expect(transitions).toContain("KEYED");
    },
  );

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

// ── KEYED-state handler tests ──────────────────────────────────────

describe("crypto-core decrypt/encrypt roundtrip", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("roundtrip-test-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  it("decrypts content encrypted with a wrapped tk", async () => {
    const sodium = requireSodium();
    const tk = generateContentKey();
    const plaintext = new TextEncoder().encode("secret message");
    const ct = encryptContent(
      plaintext,
      tk,
      buildContentAad("t-decrypt", "title"),
    );
    const wrap = eciesEncrypt(tk, decode(volPublicStr) as RistrettoPoint);

    const resp = (await dispatchAndWait({
      type: "decryptContent",
      id: 100,
      ticketId: "t-decrypt",
      keyCacheId: "t-decrypt",
      slot: "title",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
      ciphertext: encode(ct),
    })) as DecryptContentResponse;

    expect(resp.ok).toBe(true);
    expect(resp.plaintext).toBe("secret message");
    sodium.memzero(tk);
  });

  it("rejects content relocated to a different slot (AAD mismatch)", async () => {
    const sodium = requireSodium();
    const tk = generateContentKey();
    const ct = encryptContent(
      new TextEncoder().encode("bound to title"),
      tk,
      buildContentAad("t-relocate", "title"),
    );
    const wrap = eciesEncrypt(tk, decode(volPublicStr) as RistrettoPoint);

    const resp = await dispatchAndWait({
      type: "decryptContent",
      id: 110,
      ticketId: "t-relocate",
      keyCacheId: "t-relocate",
      slot: "description",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
      ciphertext: encode(ct),
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("DECRYPT_FAILED");
    sodium.memzero(tk);
  });

  it("encrypts content using a cached tk", async () => {
    const sodium = requireSodium();
    const tk = generateContentKey();
    const text = new TextEncoder().encode("cache me");
    const ct = encryptContent(text, tk, buildContentAad("t-enc", "title"));
    const wrap = eciesEncrypt(tk, decode(volPublicStr) as RistrettoPoint);

    await dispatchAndWait({
      type: "decryptContent",
      id: 101,
      ticketId: "t-enc",
      keyCacheId: "t-enc",
      slot: "title",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
      ciphertext: encode(ct),
    });

    sinkMessages = [];
    const encResp = (await dispatchAndWait({
      type: "encryptContent",
      id: 102,
      ticketId: "t-enc",
      slot: followupSlot("fu-enc-1"),
      plaintext: "encrypt this",
    })) as EncryptContentResponse;

    expect(encResp.ok).toBe(true);
    expect(encResp.ciphertext).toBeDefined();
    const roundTripped = decryptContent(
      decode(encResp.ciphertext) as Ciphertext,
      tk as SymmetricKey,
      buildContentAad("t-enc", followupSlot("fu-enc-1")),
    );
    expect(new TextDecoder().decode(roundTripped)).toBe("encrypt this");
    sodium.memzero(tk);
  });

  it("rejects encryptContent when no tk is cached", async () => {
    const resp = await dispatchAndWait({
      type: "encryptContent",
      id: 103,
      ticketId: "t-no-cache",
      plaintext: "fail",
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("TK_NOT_CACHED");
  });

  it("evicts a cached tk", async () => {
    const sodium = requireSodium();
    const tk = generateContentKey();
    const ct = encryptContent(
      new TextEncoder().encode("evict"),
      tk,
      buildContentAad("t-evict", "title"),
    );
    const wrap = eciesEncrypt(tk, decode(volPublicStr) as RistrettoPoint);

    await dispatchAndWait({
      type: "decryptContent",
      id: 104,
      ticketId: "t-evict",
      keyCacheId: "t-evict",
      slot: "title",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
      ciphertext: encode(ct),
    });

    await dispatchAndWait({ type: "evictTk", id: 105, ticketId: "t-evict" });

    const failResp = await dispatchAndWait({
      type: "encryptContent",
      id: 106,
      ticketId: "t-evict",
      plaintext: "should fail",
    });
    expect(failResp.ok).toBe(false);
    expect((failResp as ErrorResponse).code).toBe("TK_NOT_CACHED");
    sodium.memzero(tk);
  });

  it("returns volPublic via getVolPublic handler", async () => {
    const resp = (await dispatchAndWait({
      type: "getVolPublic",
      id: 107,
    })) as GetVolPublicResponse;

    expect(resp.ok).toBe(true);
    expect(resp.volPublic).toBe(volPublicStr);
  });

  it("rejects getVolPublic when not keyed", async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    await dispatchAndWait({ type: "init", id: 108 });

    const resp = await dispatchAndWait({ type: "getVolPublic", id: 109 });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });
});

describe("crypto-core createTicketKey", () => {
  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("createtk-test-pw", salt);
    sinkMessages = [];
  });

  it("generates a tk, encrypts fields, and returns a key wrap", async () => {
    const resp = (await dispatchAndWait({
      type: "createTicketKey",
      id: 200,
      ticketId: "t-create-1",
      fields: [
        { name: "title", plaintext: "Test Title" },
        { name: "description", plaintext: "Test Description" },
      ],
    })) as CreateTicketKeyResponse;

    expect(resp.ok).toBe(true);
    expect(resp.encryptedFields).toHaveLength(2);
    expect(resp.encryptedFields[0]?.name).toBe("title");
    expect(resp.encryptedFields[1]?.name).toBe("description");
    expect(resp.keyWrap).toBeDefined();
    expect(resp.keyWrap.ephemeralPoint).toBeDefined();
    expect(resp.keyWrap.nonce).toBeDefined();
    expect(resp.keyWrap.wrappedKey).toBeDefined();
    expect(resp.keyGeneration).toBeDefined();
  });
});

describe("crypto-core wrapWithVolPublic", () => {
  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("wrap-test-pw", salt);
    sinkMessages = [];
  });

  it("ECIES-encrypts data with the worker volPublic", async () => {
    const sodium = requireSodium();
    const data = sodium.randombytes_buf(32);

    const resp = (await dispatchAndWait({
      type: "wrapWithVolPublic",
      id: 300,
      data: encode(data),
    })) as WrapWithVolPublicResponse;

    expect(resp.ok).toBe(true);
    expect(resp.ephemeralPoint).toBeDefined();
    expect(resp.nonce).toBeDefined();
    expect(resp.wrappedKey).toBeDefined();
  });
});

describe("crypto-core org key operations", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("org-test-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  async function loadOrgKey(): Promise<string> {
    const sodium = requireSodium();
    const orgSecret = sodium.crypto_core_ristretto255_scalar_random();
    const wrap = eciesEncrypt(
      orgSecret,
      decode(volPublicStr) as RistrettoPoint,
    );

    const resp = (await dispatchAndWait({
      type: "unwrapOrgKey",
      id: 400,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
    })) as UnwrapOrgKeyResponse;

    expect(resp.ok).toBe(true);
    sodium.memzero(orgSecret);
    return resp.orgPublicKey;
  }

  it("unwraps an org key and returns the public key", async () => {
    const orgPub = await loadOrgKey();
    expect(orgPub).toBeDefined();
    expect(decode(orgPub).length).toBe(32);
  });

  it("encrypts and decrypts with the org key (sealed box roundtrip)", async () => {
    await loadOrgKey();
    sinkMessages = [];

    const sodium = requireSodium();
    const plaintext = sodium.randombytes_buf(64);

    const encResp = (await dispatchAndWait({
      type: "orgEncrypt",
      id: 401,
      plaintext: encode(plaintext),
    })) as OrgEncryptResponse;

    expect(encResp.ok).toBe(true);

    const decResp = (await dispatchAndWait({
      type: "orgDecrypt",
      id: 402,
      ciphertext: encResp.ciphertext,
    })) as OrgDecryptResponse;

    expect(decResp.ok).toBe(true);
    expect(decode(decResp.plaintext)).toEqual(plaintext);
    sodium.memzero(plaintext);
  });

  it("batch-decrypts multiple org-encrypted items", async () => {
    await loadOrgKey();
    sinkMessages = [];

    const sodium = requireSodium();
    const items = ["alice", "bob"].map((name) => {
      const pt = new TextEncoder().encode(name);
      const orgPubBytes = decode(getPublicKeys().orgPublicKey!);
      const ct = sodium.crypto_box_seal(pt, orgPubBytes);
      return { cacheKey: `user:${name}`, ciphertext: encode(ct) };
    });

    const resp = (await dispatchAndWait({
      type: "orgDecryptBatch",
      id: 403,
      items,
    })) as OrgDecryptBatchResponse;

    expect(resp.ok).toBe(true);
    expect(resp.results).toHaveLength(2);
    expect(resp.results[0]?.plaintext).toBe("alice");
    expect(resp.results[1]?.plaintext).toBe("bob");
  });

  it("rejects org operations when org key is not loaded", async () => {
    const resp = await dispatchAndWait({
      type: "orgEncrypt",
      id: 404,
      plaintext: encode(new Uint8Array(16)),
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("exports org secret key as ArrayBuffer", async () => {
    await loadOrgKey();
    sinkMessages = [];

    const resp = await dispatchAndWait({
      type: "exportOrgSecretKey",
      id: 405,
    });

    expect(resp.ok).toBe(true);
    expect(resp.type).toBe("exportOrgSecretKey");
  });

  it("returns org public key via getOrgPublicKey handler", async () => {
    await loadOrgKey();
    sinkMessages = [];

    const resp = await dispatchAndWait({
      type: "getOrgPublicKey",
      id: 406,
    });

    expect(resp.ok).toBe(true);
  });
});

describe("crypto-core unwrapTk", () => {
  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("unwraptk-test-pw", salt);
    sinkMessages = [];
  });

  it("pre-loads a ticket key into the cache", async () => {
    const tk = generateContentKey();
    const volPub = decode(getPublicKeys().volPublic!) as RistrettoPoint;
    const wrap = eciesEncrypt(tk, volPub);

    const resp = await dispatchAndWait({
      type: "unwrapTk",
      id: 500,
      ticketId: "t-preload",
      keyCacheId: "t-preload",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
    });

    expect(resp.ok).toBe(true);

    const sodium = requireSodium();
    const text = new TextEncoder().encode("after preload");
    const ct = encryptContent(text, tk, buildContentAad("t-preload", "title"));

    const decResp = (await dispatchAndWait({
      type: "decryptContent",
      id: 501,
      ticketId: "t-preload",
      keyCacheId: "t-preload",
      slot: "title",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
      ciphertext: encode(ct),
    })) as DecryptContentResponse;

    expect(decResp.ok).toBe(true);
    expect(decResp.plaintext).toBe("after preload");
    sodium.memzero(tk);
  });
});

describe("crypto-core decryptAndRewrap", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("rewrap-test-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  it("decrypts with tk_temp and emits a RewrapEvent", async () => {
    const sodium = requireSodium();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    const canonicalTk = generateContentKey();
    const wrapCanonical = eciesEncrypt(canonicalTk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 600,
      ticketId: "t-rewrap",
      keyCacheId: "t-rewrap",
      ephemeralPoint: encode(wrapCanonical.ephemeralPoint),
      nonce: encode(wrapCanonical.nonce),
      wrappedKey: encode(wrapCanonical.ciphertext),
    });

    const tkTemp = generateContentKey();
    const wrapTemp = eciesEncrypt(tkTemp, volPub);
    const tempPlaintext = new TextEncoder().encode("rewrap me");
    const tempCt = encryptContent(
      tempPlaintext,
      tkTemp,
      buildContentAad("t-rewrap", followupSlot("fu-001")),
    );

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "decryptAndRewrap",
      id: 601,
      ticketId: "t-rewrap",
      followUpId: "fu-001",
      ephemeralPoint: encode(wrapTemp.ephemeralPoint),
      nonce: encode(wrapTemp.nonce),
      wrappedKey: encode(wrapTemp.ciphertext),
      ciphertext: encode(tempCt),
    })) as WorkerResponse;

    expect(resp.ok).toBe(true);
    expect((resp as { plaintext: string }).plaintext).toBe("rewrap me");

    const rewrapEvent = sinkMessages.find((m): m is RewrapEvent => "kind" in m);
    expect(rewrapEvent).toBeDefined();
    expect(rewrapEvent?.followUpId).toBe("fu-001");
    expect(rewrapEvent?.ticketId).toBe("t-rewrap");

    // The rewrap re-encrypts under the canonical tk with the SAME
    // followup-slot AAD (ADR-053).
    const reEncrypted = decryptContent(
      decode(rewrapEvent!.encryptedContent) as Ciphertext,
      canonicalTk as SymmetricKey,
      buildContentAad("t-rewrap", followupSlot("fu-001")),
    );
    expect(new TextDecoder().decode(reEncrypted)).toBe("rewrap me");

    handleRewrapResult({
      kind: "rewrap-result",
      followUpId: "fu-001",
      success: true,
    });

    sodium.memzero(canonicalTk);
    sodium.memzero(tkTemp);
  });
});

describe("crypto-core error paths", () => {
  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    await dispatchAndWait({ type: "init", id: 700 });
    sinkMessages = [];
  });

  it("rejects decryptContent when not keyed", async () => {
    const resp = await dispatchAndWait({
      type: "decryptContent",
      id: 701,
      ticketId: "t-fail",
      ephemeralPoint: "x",
      nonce: "x",
      wrappedKey: "x",
      ciphertext: "x",
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("rejects encryptContent when not keyed", async () => {
    const resp = await dispatchAndWait({
      type: "encryptContent",
      id: 702,
      ticketId: "t-fail",
      plaintext: "fail",
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("rejects unwrapOrgKey when not keyed", async () => {
    const resp = await dispatchAndWait({
      type: "unwrapOrgKey",
      id: 703,
      ephemeralPoint: "x",
      nonce: "x",
      wrappedOrgKey: "x",
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("rejects orgEncrypt when org key not loaded", async () => {
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("error-path-pw", salt);
    sinkMessages = [];

    const resp = await dispatchAndWait({
      type: "orgEncrypt",
      id: 704,
      plaintext: encode(new Uint8Array(16)),
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("rejects orgDecrypt when org key not loaded", async () => {
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("error-path-pw2", salt);
    sinkMessages = [];

    const resp = await dispatchAndWait({
      type: "orgDecrypt",
      id: 705,
      ciphertext: encode(new Uint8Array(48)),
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("rejects orgDecryptBatch when org key not loaded", async () => {
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("error-path-pw3", salt);
    sinkMessages = [];

    const resp = await dispatchAndWait({
      type: "orgDecryptBatch",
      id: 706,
      items: [{ cacheKey: "k1", ciphertext: encode(new Uint8Array(48)) }],
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("rejects exportOrgSecretKey when org key not loaded", async () => {
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("error-path-pw4", salt);
    sinkMessages = [];

    const resp = await dispatchAndWait({
      type: "exportOrgSecretKey",
      id: 707,
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("rejects getOrgPublicKey when org key not loaded", async () => {
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("error-path-pw5", salt);
    sinkMessages = [];

    const resp = await dispatchAndWait({
      type: "getOrgPublicKey",
      id: 708,
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("returns DECRYPT_FAILED for corrupt ciphertext", async () => {
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const { volPublic } = await loginFlow("corrupt-ct-pw", salt);
    sinkMessages = [];

    const tk = generateContentKey();
    const wrap = eciesEncrypt(tk, decode(volPublic) as RistrettoPoint);

    const resp = await dispatchAndWait({
      type: "decryptContent",
      id: 709,
      ticketId: "t-corrupt",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
      ciphertext: encode(new Uint8Array(64)),
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("DECRYPT_FAILED");
    sodium.memzero(tk);
  });

  it("returns DECRYPT_FAILED for corrupt ECIES key wrap", async () => {
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("corrupt-wrap-pw", salt);
    sinkMessages = [];

    const resp = await dispatchAndWait({
      type: "decryptContent",
      id: 710,
      ticketId: "t-bad-wrap",
      ephemeralPoint: encode(sodium.randombytes_buf(32)),
      nonce: encode(sodium.randombytes_buf(24)),
      wrappedKey: encode(sodium.randombytes_buf(48)),
      ciphertext: encode(new Uint8Array(64)),
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("DECRYPT_FAILED");
  });

  it("rejects rewrapTk when no tk cached", async () => {
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("rewraptk-err-pw", salt);
    sinkMessages = [];

    const resp = await dispatchAndWait({
      type: "rewrapTk",
      id: 711,
      ticketId: "t-no-tk",
      recipientVolPublic: encode(sodium.randombytes_buf(32)),
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("TK_NOT_CACHED");
  });

  it("rejects rewrapBlob when no tk_temp cached", async () => {
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("rewrapblob-err-pw", salt);
    sinkMessages = [];

    const resp = await dispatchAndWait({
      type: "rewrapBlob",
      id: 712,
      ticketId: "t-no-temp",
      followUpId: "fu-miss",
      ciphertext: encode(new Uint8Array(64)),
      blobKey: "blob-key",
      category: "image",
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("TK_NOT_CACHED");
  });

  it("rejects decryptBlob when not keyed", async () => {
    const resp = await dispatchAndWait({
      type: "decryptBlob",
      id: 713,
      ticketId: "t-fail",
      ephemeralPoint: "x",
      nonce: "x",
      wrappedKey: "x",
      ciphertext: "x",
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("rejects wrapWithVolPublic when not keyed", async () => {
    const resp = await dispatchAndWait({
      type: "wrapWithVolPublic",
      id: 714,
      data: encode(new Uint8Array(32)),
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("rejects createTicketKey when not keyed", async () => {
    const resp = await dispatchAndWait({
      type: "createTicketKey",
      id: 715,
      fields: [{ name: "title", plaintext: "fail" }],
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("rejects unwrapTk when not keyed", async () => {
    const resp = await dispatchAndWait({
      type: "unwrapTk",
      id: 716,
      ticketId: "t-fail",
      ephemeralPoint: "x",
      nonce: "x",
      wrappedKey: "x",
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("rejects decryptAndRewrap when not keyed", async () => {
    const resp = await dispatchAndWait({
      type: "decryptAndRewrap",
      id: 717,
      ticketId: "t-fail",
      followUpId: "fu-fail",
      ephemeralPoint: "x",
      nonce: "x",
      wrappedKey: "x",
      ciphertext: "x",
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("rejects rewrapBlob when not keyed", async () => {
    const resp = await dispatchAndWait({
      type: "rewrapBlob",
      id: 718,
      ticketId: "t-fail",
      followUpId: "fu-fail",
      ciphertext: "x",
      blobKey: "k",
      category: "image",
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });
});

describe("crypto-core dispatcher edge cases", () => {
  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
  });

  it("silently ignores connect/disconnect messages", async () => {
    await dispatchAndWait({ type: "init", id: 800 });
    const countBefore = sinkMessages.length;

    dispatch({
      type: "connect",
      id: 801,
    } as unknown as Parameters<typeof dispatch>[0]);
    await new Promise((r) => setTimeout(r, 50));

    dispatch({
      type: "disconnect",
      id: 802,
    } as unknown as Parameters<typeof dispatch>[0]);
    await new Promise((r) => setTimeout(r, 50));

    expect(sinkMessages.length).toBe(countBefore);
  });
});

describe("crypto-core orgDecryptBatch error branch", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("batch-err-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  it("returns null plaintext for a corrupt item in a batch", async () => {
    const sodium = requireSodium();
    const orgSecret = sodium.crypto_core_ristretto255_scalar_random();
    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(orgSecret, volPub);

    await dispatchAndWait({
      type: "unwrapOrgKey",
      id: 810,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
    });
    sinkMessages = [];

    const orgPubBytes = decode(getPublicKeys().orgPublicKey!);
    const validPt = new TextEncoder().encode("valid");
    const validCt = sodium.crypto_box_seal(validPt, orgPubBytes);

    const resp = (await dispatchAndWait({
      type: "orgDecryptBatch",
      id: 811,
      items: [
        { cacheKey: "good", ciphertext: encode(validCt) },
        { cacheKey: "bad", ciphertext: encode(new Uint8Array(16)) },
      ],
    })) as OrgDecryptBatchResponse;

    expect(resp.ok).toBe(true);
    expect(resp.results).toHaveLength(2);
    expect(resp.results.at(0)?.plaintext).toBe("valid");
    expect(resp.results.at(1)?.plaintext).toBeNull();

    sodium.memzero(orgSecret);
  });
});

describe("crypto-core idle self-zero", () => {
  // Every test starts with a real-timer handleZeroAll: it resets module
  // state AND cancels any idle timer armed under real timers by earlier
  // tests. Only then are fake timers installed, so every timer the test
  // advances was created through the fake clock.
  beforeEach(() => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it(
    "zeroes key material after the idle interval with no requests",
    { timeout: 30_000 },
    async () => {
      const sodium = requireSodium();
      await loginFlow("idle-zero-password-1", sodium.randombytes_buf(16));
      expect(getState()).toBe("KEYED");

      await vi.advanceTimersByTimeAsync(IDLE_SELF_ZERO_MS);

      expect(getState()).toBe("READY");
      expect(getPublicKeys().volPublic).toBeUndefined();
    },
  );

  it(
    "resets the idle clock on every request",
    { timeout: 30_000 },
    async () => {
      const sodium = requireSodium();
      await loginFlow("idle-zero-password-2", sodium.randombytes_buf(16));

      await vi.advanceTimersByTimeAsync(IDLE_SELF_ZERO_MS - 60_000);
      const resp = await dispatchAndWait({ type: "getVolPublic", id: 910 });
      expect(resp.ok).toBe(true);

      // One minute short of the interval since the last request: still keyed.
      await vi.advanceTimersByTimeAsync(IDLE_SELF_ZERO_MS - 60_000);
      expect(getState()).toBe("KEYED");

      await vi.advanceTimersByTimeAsync(60_000);
      expect(getState()).toBe("READY");
    },
  );

  it(
    "notifies the state transition callback when the idle zero fires",
    { timeout: 30_000 },
    async () => {
      const sodium = requireSodium();
      await loginFlow("idle-zero-password-3", sodium.randombytes_buf(16));

      const transitions: SharedWorkerState[] = [];
      onStateTransition((state) => {
        transitions.push(state);
      });

      await vi.advanceTimersByTimeAsync(IDLE_SELF_ZERO_MS);

      expect(transitions).toEqual(["READY"]);
    },
  );

  it("does not zero or broadcast when no key material is held", async () => {
    await dispatchAndWait({ type: "init", id: 920 });

    const transitions: SharedWorkerState[] = [];
    onStateTransition((state) => {
      transitions.push(state);
    });

    await vi.advanceTimersByTimeAsync(IDLE_SELF_ZERO_MS * 2);

    expect(transitions).toEqual([]);
    expect(getState()).toBe("READY");
  });

  it(
    "zeroes a stalled login flow before key derivation completes",
    { timeout: 30_000 },
    async () => {
      await dispatchAndWait({ type: "init", id: 930 });

      const pwBuf = new TextEncoder().encode("stalled-login-password");
      const salt = requireSodium().randombytes_buf(16);
      await dispatchAndWait({
        type: "argon2id",
        id: 931,
        password: pwBuf.buffer,
        salt: salt.buffer,
      });

      const transitions: SharedWorkerState[] = [];
      onStateTransition((state) => {
        transitions.push(state);
      });

      await vi.advanceTimersByTimeAsync(IDLE_SELF_ZERO_MS);

      // The stretched key was zeroed and the state machine reset, so
      // continuing the abandoned login flow fails.
      expect(transitions).toEqual(["READY"]);
      const resp = await dispatchAndWait({ type: "oprfBlind", id: 932 });
      expect(resp.ok).toBe(false);
      if (!resp.ok) {
        expect(resp.code).toBe("INVALID_STATE");
      }
    },
  );
});
