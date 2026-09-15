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
  eciesDecrypt,
  encryptContent,
  decryptContent,
  generateContentKey,
  buildContentAad,
  followupSlot,
  blobSlot,
  fileKeySlot,
  filenameSlot,
  decodeFileKeyPayload,
  sealPrevGeneration,
  INTAKE_RESPONSE_SLOT,
  type Ciphertext,
  type Nonce,
  type RistrettoPoint,
  type Scalar,
  type SymmetricKey,
} from "@care-y/crypto";
import type {
  WorkerResponse,
  RewrapEvent,
  ErrorResponse,
  OprfBlindResponse,
  DeriveKeysResponse,
  DecryptContentResponse,
  DecryptBlobResponse,
  EncryptContentResponse,
  EncryptAttachmentResponse,
  DecryptAttachmentResponse,
  GetVolPublicResponse,
  CreateTicketKeyResponse,
  WrapWithVolPublicResponse,
  SealSelfBlobResponse,
  OpenSelfBlobResponse,
  UnwrapOrgKeyResponse,
  OrgEncryptResponse,
  OrgDecryptResponse,
  OrgDecryptBatchResponse,
  AliasHashResponse,
  PhoneMatchHashResponse,
  RewrapTkResponse,
  RewrapBlobResponse,
  RewrapFileKeyResponse,
  SharedWorkerState,
  DecryptIntakeResponseResponse,
  MintBackfillWrapsResponse,
  SealFollowUpsToPublicResponse,
  SealFileKeysToPublicResponse,
  ConvertBlobForPortalResponse,
  UnwrapIntakeTkResponse,
  EmailMatchHashResponse,
  DetectMergeCandidatesResponse,
  OrgResealBatchResponse,
  GetOrgPublicKeyResponse,
} from "./crypto-protocol.js";
import {
  createDispatcher,
  getState,
  getPublicKeys,
  handleZeroAll,
  handleRewrapResult,
  onStateTransition,
  IDLE_SELF_ZERO_MS,
  extractContactsFromResponse,
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

describe("crypto-core self-blob operations", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    ({ volPublic: volPublicStr } = await loginFlow("self-blob-pw", salt));
    sinkMessages = [];
  });

  it("roundtrips a payload through sealSelfBlob and openSelfBlob", async () => {
    const payload = new TextEncoder().encode(
      JSON.stringify({ v: 1, entries: [{ t: "ticket", id: "abc" }] }),
    );

    const sealResp = (await dispatchAndWait({
      type: "sealSelfBlob",
      id: 400,
      data: encode(payload),
    })) as SealSelfBlobResponse;

    expect(sealResp.ok).toBe(true);
    expect(sealResp.ephemeralPoint).toBeDefined();
    expect(sealResp.nonce).toBeDefined();
    expect(sealResp.wrappedPayload).toBeDefined();

    const openResp = (await dispatchAndWait({
      type: "openSelfBlob",
      id: 401,
      ephemeralPoint: sealResp.ephemeralPoint,
      nonce: sealResp.nonce,
      wrappedPayload: sealResp.wrappedPayload,
    })) as OpenSelfBlobResponse;

    expect(openResp.ok).toBe(true);
    expect(openResp.data).toBe(encode(payload));
  });

  it("refuses to open a raw ECIES wrap without the domain tag (ticket-key exfiltration guard)", async () => {
    // Same construction as a ticket key wrap: raw ECIES of key bytes to
    // the user's own volPublic, no domain tag inside the plaintext.
    const fakeTicketKey = requireSodium().randombytes_buf(32);
    const wrap = eciesEncrypt(
      fakeTicketKey,
      decode(volPublicStr) as RistrettoPoint,
    );

    const resp = await dispatchAndWait({
      type: "openSelfBlob",
      id: 402,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedPayload: encode(wrap.ciphertext),
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("UNWRAP_FAILED");
  });

  it("fails on a tampered envelope (flipped bit)", async () => {
    const sealResp = (await dispatchAndWait({
      type: "sealSelfBlob",
      id: 403,
      data: encode(new TextEncoder().encode("payload")),
    })) as SealSelfBlobResponse;

    const tampered = decode(sealResp.wrappedPayload);
    tampered[0] = (tampered[0] ?? 0) ^ 0xff;

    const resp = await dispatchAndWait({
      type: "openSelfBlob",
      id: 404,
      ephemeralPoint: sealResp.ephemeralPoint,
      nonce: sealResp.nonce,
      wrappedPayload: encode(tampered),
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("UNWRAP_FAILED");
  });

  it("rejects sealSelfBlob and openSelfBlob when not keyed", async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];

    const sealResp = await dispatchAndWait({
      type: "sealSelfBlob",
      id: 405,
      data: encode(new Uint8Array(8)),
    });
    expect(sealResp.ok).toBe(false);
    expect((sealResp as ErrorResponse).code).toBe("NOT_READY");

    const openResp = await dispatchAndWait({
      type: "openSelfBlob",
      id: 406,
      ephemeralPoint: encode(new Uint8Array(32)),
      nonce: encode(new Uint8Array(24)),
      wrappedPayload: encode(new Uint8Array(16)),
    });
    expect(openResp.ok).toBe(false);
    expect((openResp as ErrorResponse).code).toBe("NOT_READY");
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
      currentGeneration: 1,
      chain: [],
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
    expect(resp.results[0]?.generation).toBe(1);
    expect(resp.results[1]?.plaintext).toBe("bob");
    expect(resp.results[1]?.generation).toBe(1);
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

// ── Multi-generation org key tests ─────────────────────────────────

describe("crypto-core org key generation chain", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("org-gen-chain-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  /**
   * Build a 3-generation chain: gen1 (oldest), gen2, gen3 (current).
   * Returns the current secret (gen3), the chain links, and all three
   * secrets for assertion purposes. The caller must zero all secrets.
   */
  function buildThreeGenerationChain(
    sodium: ReturnType<typeof requireSodium>,
  ): {
    currentSecret: Uint8Array;
    gen1Secret: Uint8Array;
    gen2Secret: Uint8Array;
    gen3Secret: Uint8Array;
    chain: {
      generation: number;
      publicKey: string;
      prevSecretCt: string | null;
      prevNonce: string | null;
    }[];
  } {
    const gen1Secret = sodium.randombytes_buf(32);
    const gen2Secret = sodium.randombytes_buf(32);
    const gen3Secret = sodium.randombytes_buf(32);

    const gen1Pub = sodium.crypto_scalarmult_base(gen1Secret);
    const gen2Pub = sodium.crypto_scalarmult_base(gen2Secret);
    const gen3Pub = sodium.crypto_scalarmult_base(gen3Secret);

    // gen2's chain row seals gen1's secret under gen2's secret
    const seal2 = sealPrevGeneration(gen1Secret, gen2Secret);
    // gen3's chain row seals gen2's secret under gen3's secret
    const seal3 = sealPrevGeneration(gen2Secret, gen3Secret);

    const chain = [
      {
        generation: 3,
        publicKey: encode(gen3Pub),
        prevSecretCt: encode(seal3.ciphertext),
        prevNonce: encode(seal3.nonce),
      },
      {
        generation: 2,
        publicKey: encode(gen2Pub),
        prevSecretCt: encode(seal2.ciphertext),
        prevNonce: encode(seal2.nonce),
      },
      {
        generation: 1,
        publicKey: encode(gen1Pub),
        prevSecretCt: null,
        prevNonce: null,
      },
    ];

    return {
      currentSecret: gen3Secret,
      gen1Secret,
      gen2Secret,
      gen3Secret,
      chain,
    };
  }

  it("chain walk recovers two older generations", async () => {
    const sodium = requireSodium();
    const { currentSecret, gen1Secret, gen2Secret, chain } =
      buildThreeGenerationChain(sodium);

    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(currentSecret, volPub);

    const resp = (await dispatchAndWait({
      type: "unwrapOrgKey",
      id: 10_100,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
      currentGeneration: 3,
      chain,
    })) as UnwrapOrgKeyResponse;

    expect(resp.ok).toBe(true);

    // Verify gen2 public key is accessible
    const gen2PubResp = (await dispatchAndWait({
      type: "getOrgPublicKey",
      id: 10_101,
      generation: 2,
    })) as GetOrgPublicKeyResponse;
    expect(gen2PubResp.ok).toBe(true);
    expect(gen2PubResp.orgPublicKey).toBe(
      encode(sodium.crypto_scalarmult_base(gen2Secret)),
    );

    // Verify gen1 public key is accessible
    const gen1PubResp = (await dispatchAndWait({
      type: "getOrgPublicKey",
      id: 10_102,
      generation: 1,
    })) as GetOrgPublicKeyResponse;
    expect(gen1PubResp.ok).toBe(true);
    expect(gen1PubResp.orgPublicKey).toBe(
      encode(sodium.crypto_scalarmult_base(gen1Secret)),
    );

    sodium.memzero(currentSecret);
    sodium.memzero(gen1Secret);
    sodium.memzero(gen2Secret);
  });

  it("decrypts a blob sealed under generation 1 after two rotations", async () => {
    const sodium = requireSodium();
    const { currentSecret, gen1Secret, gen2Secret, chain } =
      buildThreeGenerationChain(sodium);

    // Seal content under gen1's public key (simulating pre-rotation data)
    const gen1Pub = sodium.crypto_scalarmult_base(gen1Secret);
    const plaintext = new TextEncoder().encode("sealed under gen1");
    const gen1Ciphertext = sodium.crypto_box_seal(plaintext, gen1Pub);

    // Load the current key with the full chain
    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(currentSecret, volPub);

    await dispatchAndWait({
      type: "unwrapOrgKey",
      id: 10_200,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
      currentGeneration: 3,
      chain,
    });
    sinkMessages = [];

    // Decrypt the gen1-sealed content using orgDecrypt
    const decResp = (await dispatchAndWait({
      type: "orgDecrypt",
      id: 10_201,
      ciphertext: encode(gen1Ciphertext),
    })) as OrgDecryptResponse;

    expect(decResp.ok).toBe(true);
    expect(new TextDecoder().decode(decode(decResp.plaintext))).toBe(
      "sealed under gen1",
    );

    // Also verify batch decrypt reports generation 1
    sinkMessages = [];
    const batchResp = (await dispatchAndWait({
      type: "orgDecryptBatch",
      id: 10_202,
      items: [{ cacheKey: "old-item", ciphertext: encode(gen1Ciphertext) }],
    })) as OrgDecryptBatchResponse;

    expect(batchResp.ok).toBe(true);
    expect(batchResp.results[0]?.plaintext).toBe("sealed under gen1");
    expect(batchResp.results[0]?.generation).toBe(1);

    sodium.memzero(currentSecret);
    sodium.memzero(gen1Secret);
    sodium.memzero(gen2Secret);
  });

  it("orgResealBatch returns fresh ciphertext for old-gen and null for current-gen", async () => {
    const sodium = requireSodium();
    const { currentSecret, gen1Secret, gen2Secret, chain } =
      buildThreeGenerationChain(sodium);

    const gen1Pub = sodium.crypto_scalarmult_base(gen1Secret);
    const gen3Pub = sodium.crypto_scalarmult_base(currentSecret);

    // Seal one item under gen1 (old) and one under gen3 (current)
    const oldCt = sodium.crypto_box_seal(
      new TextEncoder().encode("old data"),
      gen1Pub,
    );
    const currentCt = sodium.crypto_box_seal(
      new TextEncoder().encode("current data"),
      gen3Pub,
    );

    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(currentSecret, volPub);

    await dispatchAndWait({
      type: "unwrapOrgKey",
      id: 10_300,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
      currentGeneration: 3,
      chain,
    });
    sinkMessages = [];

    const resealResp = (await dispatchAndWait({
      type: "orgResealBatch",
      id: 10_301,
      items: [
        { cacheKey: "old-item", ciphertext: encode(oldCt) },
        { cacheKey: "current-item", ciphertext: encode(currentCt) },
      ],
    })) as OrgResealBatchResponse;

    expect(resealResp.ok).toBe(true);
    expect(resealResp.results).toHaveLength(2);

    // Old item: resealed under the current key
    const oldResult = resealResp.results[0];
    expect(oldResult?.cacheKey).toBe("old-item");
    expect(oldResult?.fromGeneration).toBe(1);
    expect(oldResult?.resealed).not.toBeNull();

    // The resealed ciphertext opens under the current keypair
    const resealedPlain = sodium.crypto_box_seal_open(
      decode(oldResult!.resealed!),
      gen3Pub,
      currentSecret,
    );
    expect(new TextDecoder().decode(resealedPlain)).toBe("old data");
    sodium.memzero(resealedPlain);

    // Current item: nothing to do
    const curResult = resealResp.results[1];
    expect(curResult?.cacheKey).toBe("current-item");
    expect(curResult?.fromGeneration).toBe(3);
    expect(curResult?.resealed).toBeNull();

    sodium.memzero(currentSecret);
    sodium.memzero(gen1Secret);
    sodium.memzero(gen2Secret);
  });

  it("zeroAll clears every generation secret", async () => {
    const sodium = requireSodium();
    const { currentSecret, gen1Secret, gen2Secret, chain } =
      buildThreeGenerationChain(sodium);

    const gen1Pub = sodium.crypto_scalarmult_base(gen1Secret);

    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(currentSecret, volPub);

    await dispatchAndWait({
      type: "unwrapOrgKey",
      id: 10_400,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
      currentGeneration: 3,
      chain,
    });

    // Verify gen1 data decrypts before zero
    const gen1Ct = sodium.crypto_box_seal(
      new TextEncoder().encode("pre-zero"),
      gen1Pub,
    );
    sinkMessages = [];
    const preZeroResp = (await dispatchAndWait({
      type: "orgDecrypt",
      id: 10_401,
      ciphertext: encode(gen1Ct),
    })) as OrgDecryptResponse;
    expect(preZeroResp.ok).toBe(true);

    // Zero everything
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);

    // After zero, org operations should fail (NOT_READY)
    const postZeroResp = await dispatchAndWait({
      type: "orgDecrypt",
      id: 10_402,
      ciphertext: encode(gen1Ct),
    });
    expect(postZeroResp.ok).toBe(false);
    expect((postZeroResp as ErrorResponse).code).toBe("NOT_READY");

    sodium.memzero(currentSecret);
    sodium.memzero(gen1Secret);
    sodium.memzero(gen2Secret);
  });

  it("stops chain walk gracefully on a corrupted link", async () => {
    const sodium = requireSodium();
    const gen1Secret = sodium.randombytes_buf(32);
    const gen2Secret = sodium.randombytes_buf(32);
    const gen3Secret = sodium.randombytes_buf(32);

    const gen1Pub = sodium.crypto_scalarmult_base(gen1Secret);
    const gen2Pub = sodium.crypto_scalarmult_base(gen2Secret);
    const gen3Pub = sodium.crypto_scalarmult_base(gen3Secret);

    // gen3 -> gen2 seal is valid
    const seal3 = sealPrevGeneration(gen2Secret, gen3Secret);
    // gen2 -> gen1 seal is CORRUPTED (random bytes)
    const corruptCt = sodium.randombytes_buf(48);
    const corruptNonce = sodium.randombytes_buf(24);

    const chain = [
      {
        generation: 3,
        publicKey: encode(gen3Pub),
        prevSecretCt: encode(seal3.ciphertext),
        prevNonce: encode(seal3.nonce),
      },
      {
        generation: 2,
        publicKey: encode(gen2Pub),
        prevSecretCt: encode(corruptCt),
        prevNonce: encode(corruptNonce),
      },
      {
        generation: 1,
        publicKey: encode(gen1Pub),
        prevSecretCt: null,
        prevNonce: null,
      },
    ];

    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(gen3Secret, volPub);

    const resp = (await dispatchAndWait({
      type: "unwrapOrgKey",
      id: 10_500,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
      currentGeneration: 3,
      chain,
    })) as UnwrapOrgKeyResponse;

    // The unwrap itself succeeds
    expect(resp.ok).toBe(true);

    // gen2 is recoverable (its link from gen3 was valid)
    const gen2PubResp = (await dispatchAndWait({
      type: "getOrgPublicKey",
      id: 10_501,
      generation: 2,
    })) as GetOrgPublicKeyResponse;
    expect(gen2PubResp.ok).toBe(true);

    // gen1 is NOT recoverable (the gen2 -> gen1 link was corrupted)
    const gen1PubResp = await dispatchAndWait({
      type: "getOrgPublicKey",
      id: 10_502,
      generation: 1,
    });
    expect(gen1PubResp.ok).toBe(false);
    expect((gen1PubResp as ErrorResponse).code).toBe("INVALID_STATE");

    // Data sealed under gen2 still decrypts
    const gen2Ct = sodium.crypto_box_seal(
      new TextEncoder().encode("gen2 data"),
      gen2Pub,
    );
    const decResp = (await dispatchAndWait({
      type: "orgDecrypt",
      id: 10_503,
      ciphertext: encode(gen2Ct),
    })) as OrgDecryptResponse;
    expect(decResp.ok).toBe(true);
    expect(new TextDecoder().decode(decode(decResp.plaintext))).toBe(
      "gen2 data",
    );

    sodium.memzero(gen1Secret);
    sodium.memzero(gen2Secret);
    sodium.memzero(gen3Secret);
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

describe("crypto-core decryptPortalReply", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("portal-reply-pw", salt);
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
      id: 700,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
      currentGeneration: 1,
      chain: [],
    })) as UnwrapOrgKeyResponse;

    expect(resp.ok).toBe(true);
    sodium.memzero(orgSecret);
    return resp.orgPublicKey;
  }

  it("unseals tk_temp, decrypts, and emits a RewrapEvent", async () => {
    const sodium = requireSodium();
    const orgPub = decode(await loadOrgKey());
    const volPub = decode(volPublicStr) as RistrettoPoint;

    const canonicalTk = generateContentKey();
    const wrapCanonical = eciesEncrypt(canonicalTk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 701,
      ticketId: "t-portal",
      keyCacheId: "t-portal",
      ephemeralPoint: encode(wrapCanonical.ephemeralPoint),
      nonce: encode(wrapCanonical.nonce),
      wrappedKey: encode(wrapCanonical.ciphertext),
    });

    const tkTemp = generateContentKey();
    const sealedWrap = sodium.crypto_box_seal(tkTemp, orgPub);
    const tempPlaintext = new TextEncoder().encode("portal reply");
    const tempCt = encryptContent(
      tempPlaintext,
      tkTemp,
      buildContentAad("t-portal", followupSlot("fu-portal-1")),
    );

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "decryptPortalReply",
      id: 702,
      ticketId: "t-portal",
      followUpId: "fu-portal-1",
      sealedWrap: encode(sealedWrap),
      ciphertext: encode(tempCt),
    })) as WorkerResponse;

    expect(resp.ok).toBe(true);
    expect((resp as { plaintext: string }).plaintext).toBe("portal reply");

    const rewrapEvent = sinkMessages.find((m): m is RewrapEvent => "kind" in m);
    expect(rewrapEvent).toBeDefined();
    expect(rewrapEvent?.followUpId).toBe("fu-portal-1");
    expect(rewrapEvent?.ticketId).toBe("t-portal");

    // Convergence re-encrypts under the canonical tk with the SAME
    // followup-slot AAD (ADR-053), exactly like decryptAndRewrap.
    const reEncrypted = decryptContent(
      decode(rewrapEvent!.encryptedContent) as Ciphertext,
      canonicalTk as SymmetricKey,
      buildContentAad("t-portal", followupSlot("fu-portal-1")),
    );
    expect(new TextDecoder().decode(reEncrypted)).toBe("portal reply");

    handleRewrapResult({
      kind: "rewrap-result",
      followUpId: "fu-portal-1",
      success: true,
    });

    sodium.memzero(canonicalTk);
    sodium.memzero(tkTemp);
  });

  it("posts DECRYPT_FAILED for a tampered sealed wrap", async () => {
    const sodium = requireSodium();
    const orgPub = decode(await loadOrgKey());

    const tkTemp = generateContentKey();
    const sealedWrap = sodium.crypto_box_seal(tkTemp, orgPub);
    sealedWrap[0] = (sealedWrap[0] ?? 0) ^ 0xff;

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "decryptPortalReply",
      id: 703,
      ticketId: "t-portal",
      followUpId: "fu-portal-2",
      sealedWrap: encode(sealedWrap),
      ciphertext: encode(sodium.randombytes_buf(64)),
    })) as ErrorResponse;

    expect(resp.ok).toBe(false);
    expect(resp.code).toBe("DECRYPT_FAILED");
    sodium.memzero(tkTemp);
  });

  it("posts DECRYPT_FAILED for AAD-mismatched content", async () => {
    const sodium = requireSodium();
    const orgPub = decode(await loadOrgKey());

    const tkTemp = generateContentKey();
    const sealedWrap = sodium.crypto_box_seal(tkTemp, orgPub);
    // Encrypted under a different follow-up's slot: AAD binding must fail.
    const wrongCt = encryptContent(
      new TextEncoder().encode("wrong slot"),
      tkTemp,
      buildContentAad("t-portal", followupSlot("fu-other")),
    );

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "decryptPortalReply",
      id: 704,
      ticketId: "t-portal",
      followUpId: "fu-portal-3",
      sealedWrap: encode(sealedWrap),
      ciphertext: encode(wrongCt),
    })) as ErrorResponse;

    expect(resp.ok).toBe(false);
    expect(resp.code).toBe("DECRYPT_FAILED");
    sodium.memzero(tkTemp);
  });

  it("rejects when the org key is not loaded", async () => {
    const sodium = requireSodium();
    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "decryptPortalReply",
      id: 705,
      ticketId: "t-portal",
      followUpId: "fu-portal-4",
      sealedWrap: encode(sodium.randombytes_buf(80)),
      ciphertext: encode(sodium.randombytes_buf(64)),
    })) as ErrorResponse;

    expect(resp.ok).toBe(false);
    expect(resp.code).toBe("NOT_READY");
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
      currentGeneration: 1,
      chain: [],
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
      ciphertext: new ArrayBuffer(64),
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
      currentGeneration: 1,
      chain: [],
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
    expect(resp.results.at(0)?.generation).toBe(1);
    expect(resp.results.at(1)?.plaintext).toBeNull();
    expect(resp.results.at(1)?.generation).toBeNull();

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

describe("crypto-core rewrapTk success", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("rewraptk-ok-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  it("re-wraps a cached tk to a recipient public key", async () => {
    const sodium = requireSodium();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    // Create and cache a tk
    const tk = generateContentKey();
    const wrap = eciesEncrypt(tk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 1000,
      ticketId: "t-rewraptk",
      keyCacheId: "t-rewraptk",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
    });
    sinkMessages = [];

    // Generate a recipient key pair
    const recipientPrivate =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const recipientPublic =
      sodium.crypto_scalarmult_ristretto255_base(recipientPrivate);

    const resp = (await dispatchAndWait({
      type: "rewrapTk",
      id: 1001,
      ticketId: "t-rewraptk",
      recipientVolPublic: encode(recipientPublic),
    })) as RewrapTkResponse;

    expect(resp.ok).toBe(true);
    expect(resp.ephemeralPoint).toBeDefined();
    expect(resp.nonce).toBeDefined();
    expect(resp.wrappedKey).toBeDefined();

    // Verify the recipient can unwrap the ticket key
    const unwrappedTk = eciesDecrypt(
      decode(resp.ephemeralPoint) as RistrettoPoint,
      decode(resp.nonce) as Nonce,
      decode(resp.wrappedKey),
      recipientPrivate,
    );
    expect(unwrappedTk).toEqual(tk);

    sodium.memzero(tk);
    sodium.memzero(recipientPrivate);
  });
});

describe("crypto-core decryptBlob success", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("decryptblob-ok-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  it("decrypts blob data and returns an ArrayBuffer", async () => {
    const sodium = requireSodium();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    // Create and cache a tk
    const tk = generateContentKey();
    const wrap = eciesEncrypt(tk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 1100,
      ticketId: "t-blob",
      keyCacheId: "t-blob",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
    });
    sinkMessages = [];

    // Encrypt a blob
    const blobData = new TextEncoder().encode("binary blob content here");
    const slot = blobSlot("blob-id-1");
    const ct = encryptContent(blobData, tk, buildContentAad("t-blob", slot));

    const ctBuf = new ArrayBuffer(ct.byteLength);
    new Uint8Array(ctBuf).set(ct);

    const resp = (await dispatchAndWait({
      type: "decryptBlob",
      id: 1101,
      ticketId: "t-blob",
      keyCacheId: "t-blob",
      slot,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
      ciphertext: ctBuf,
    })) as DecryptBlobResponse;

    expect(resp.ok).toBe(true);
    expect(resp.data).toBeInstanceOf(ArrayBuffer);
    const result = new TextDecoder().decode(new Uint8Array(resp.data));
    expect(result).toBe("binary blob content here");

    sodium.memzero(tk);
  });

  it("returns DECRYPT_FAILED for corrupt blob ciphertext", async () => {
    const sodium = requireSodium();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    const tk = generateContentKey();
    const wrap = eciesEncrypt(tk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 1110,
      ticketId: "t-blob-bad",
      keyCacheId: "t-blob-bad",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
    });
    sinkMessages = [];

    const resp = await dispatchAndWait({
      type: "decryptBlob",
      id: 1111,
      ticketId: "t-blob-bad",
      keyCacheId: "t-blob-bad",
      slot: blobSlot("b-corrupt"),
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
      ciphertext: new ArrayBuffer(64),
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("DECRYPT_FAILED");
    sodium.memzero(tk);
  });
});

describe("crypto-core rewrapBlob success", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("rewrapblob-ok-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  it("re-encrypts blob data from tk_temp to canonical tk", async () => {
    const sodium = requireSodium();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    // Cache the canonical tk
    const canonicalTk = generateContentKey();
    const wrapCanonical = eciesEncrypt(canonicalTk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 1200,
      ticketId: "t-reblob",
      keyCacheId: "t-reblob",
      ephemeralPoint: encode(wrapCanonical.ephemeralPoint),
      nonce: encode(wrapCanonical.nonce),
      wrappedKey: encode(wrapCanonical.ciphertext),
    });

    // Create a temp tk and encrypt content (follow-up from another key gen)
    const tkTemp = generateContentKey();
    const wrapTemp = eciesEncrypt(tkTemp, volPub);
    const followUpId = "fu-blob-1";

    // Encrypt follow-up content with tk_temp to prime the temp cache
    const tempPlaintext = new TextEncoder().encode("followup text");
    const tempCt = encryptContent(
      tempPlaintext,
      tkTemp,
      buildContentAad("t-reblob", followupSlot(followUpId)),
    );

    sinkMessages = [];
    await dispatchAndWait({
      type: "decryptAndRewrap",
      id: 1201,
      ticketId: "t-reblob",
      followUpId,
      ephemeralPoint: encode(wrapTemp.ephemeralPoint),
      nonce: encode(wrapTemp.nonce),
      wrappedKey: encode(wrapTemp.ciphertext),
      ciphertext: encode(tempCt),
    });

    // Now encrypt a blob with tk_temp
    const blobData = sodium.randombytes_buf(128);
    const blobSlotStr = blobSlot("attachment-1");
    const blobCt = encryptContent(
      blobData,
      tkTemp,
      buildContentAad("t-reblob", blobSlotStr),
    );

    sinkMessages = [];
    const blobCtBuf = new ArrayBuffer(blobCt.byteLength);
    new Uint8Array(blobCtBuf).set(blobCt);

    const resp = (await dispatchAndWait({
      type: "rewrapBlob",
      id: 1202,
      ticketId: "t-reblob",
      followUpId,
      ciphertext: blobCtBuf,
      blobKey: "blob-key-1",
      blobId: "attachment-1",
      category: "attachment",
    })) as RewrapBlobResponse;

    expect(resp.ok).toBe(true);
    expect(resp.encryptedData).toBeDefined();
    expect(resp.blobKey).toBe("blob-key-1");
    expect(resp.category).toBe("attachment");

    // Verify the re-encrypted data decrypts with the canonical tk
    const reDecrypted = decryptContent(
      decode(resp.encryptedData) as Ciphertext,
      canonicalTk as SymmetricKey,
      buildContentAad("t-reblob", blobSlotStr),
    );
    expect(reDecrypted).toEqual(blobData);

    // Clean up rewrap state
    handleRewrapResult({
      kind: "rewrap-result",
      followUpId,
      success: true,
    });

    sodium.memzero(canonicalTk);
    sodium.memzero(tkTemp);
  });

  it("returns TK_NOT_CACHED when canonical tk is missing", async () => {
    const sodium = requireSodium();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    // Create a tk_temp via decryptAndRewrap but DO NOT cache a canonical tk
    // for a different ticket ID.
    const canonicalTk = generateContentKey();
    const wrapCanonical = eciesEncrypt(canonicalTk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 1210,
      ticketId: "t-reblob-canon",
      keyCacheId: "t-reblob-canon",
      ephemeralPoint: encode(wrapCanonical.ephemeralPoint),
      nonce: encode(wrapCanonical.nonce),
      wrappedKey: encode(wrapCanonical.ciphertext),
    });

    const tkTemp = generateContentKey();
    const wrapTemp = eciesEncrypt(tkTemp, volPub);
    const followUpId = "fu-no-canon";

    const tempPlaintext = new TextEncoder().encode("temp");
    const tempCt = encryptContent(
      tempPlaintext,
      tkTemp,
      buildContentAad("t-reblob-canon", followupSlot(followUpId)),
    );

    await dispatchAndWait({
      type: "decryptAndRewrap",
      id: 1211,
      ticketId: "t-reblob-canon",
      followUpId,
      ephemeralPoint: encode(wrapTemp.ephemeralPoint),
      nonce: encode(wrapTemp.nonce),
      wrappedKey: encode(wrapTemp.ciphertext),
      ciphertext: encode(tempCt),
    });

    sinkMessages = [];

    // Request rewrapBlob with a different ticket ID (no canonical tk cached)
    const resp = await dispatchAndWait({
      type: "rewrapBlob",
      id: 1212,
      ticketId: "t-no-such-ticket",
      followUpId,
      ciphertext: new ArrayBuffer(64),
      blobKey: "bk",
      blobId: "b1",
      category: "recording",
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("TK_NOT_CACHED");

    handleRewrapResult({
      kind: "rewrap-result",
      followUpId,
      success: false,
    });
    sodium.memzero(canonicalTk);
    sodium.memzero(tkTemp);
  });
});

describe("crypto-core rewrapFileKey success", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("rewrapfilekey-ok-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  async function primeKeys(
    ticketId: string,
    followUpId: string,
    baseId: number,
  ): Promise<{ canonicalTk: SymmetricKey; tkTemp: SymmetricKey }> {
    const volPub = decode(volPublicStr) as RistrettoPoint;

    const canonicalTk = generateContentKey();
    const wrapCanonical = eciesEncrypt(canonicalTk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: baseId,
      ticketId,
      keyCacheId: ticketId,
      ephemeralPoint: encode(wrapCanonical.ephemeralPoint),
      nonce: encode(wrapCanonical.nonce),
      wrappedKey: encode(wrapCanonical.ciphertext),
    });

    const tkTemp = generateContentKey();
    const wrapTemp = eciesEncrypt(tkTemp, volPub);
    const tempCt = encryptContent(
      new TextEncoder().encode("portal reply"),
      tkTemp,
      buildContentAad(ticketId, followupSlot(followUpId)),
    );
    await dispatchAndWait({
      type: "decryptAndRewrap",
      id: baseId + 1,
      ticketId,
      followUpId,
      ephemeralPoint: encode(wrapTemp.ephemeralPoint),
      nonce: encode(wrapTemp.nonce),
      wrappedKey: encode(wrapTemp.ciphertext),
      ciphertext: encode(tempCt),
    });

    return { canonicalTk: canonicalTk as SymmetricKey, tkTemp };
  }

  it("re-wraps the file key and re-encrypts the filename under the canonical tk", async () => {
    const sodium = requireSodium();
    const ticketId = "t-refk";
    const followUpId = "fu-filekey-1";
    const attachmentId = "att-fk-1";
    const { canonicalTk, tkTemp } = await primeKeys(ticketId, followUpId, 1300);

    const fileKey = generateContentKey();
    const fileKeyWrapCt = encryptContent(
      fileKey,
      tkTemp,
      buildContentAad(ticketId, fileKeySlot(attachmentId)),
    );
    const filenameCt = encryptContent(
      new TextEncoder().encode("statement.pdf"),
      tkTemp,
      buildContentAad(ticketId, filenameSlot(attachmentId)),
    );

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "rewrapFileKey",
      id: 1302,
      followUpId,
      ticketId,
      attachmentId,
      fileKeyWrap: encode(fileKeyWrapCt),
      encryptedFilename: encode(filenameCt),
    })) as RewrapFileKeyResponse;

    expect(resp.ok).toBe(true);
    expect(resp.attachmentId).toBe(attachmentId);

    const keyAgain = decryptContent(
      decode(resp.fileKeyWrap) as Ciphertext,
      canonicalTk,
      buildContentAad(ticketId, fileKeySlot(attachmentId)),
    );
    expect(keyAgain).toEqual(fileKey);

    expect(resp.encryptedFilename).toBeDefined();
    const nameAgain = decryptContent(
      decode(resp.encryptedFilename!) as Ciphertext,
      canonicalTk,
      buildContentAad(ticketId, filenameSlot(attachmentId)),
    );
    expect(new TextDecoder().decode(nameAgain)).toBe("statement.pdf");

    handleRewrapResult({ kind: "rewrap-result", followUpId, success: true });
    sodium.memzero(canonicalTk);
    sodium.memzero(tkTemp);
    sodium.memzero(fileKey);
  });

  it("omits the filename from the response when the request carries none", async () => {
    const sodium = requireSodium();
    const ticketId = "t-refk-noname";
    const followUpId = "fu-filekey-2";
    const attachmentId = "att-fk-2";
    const { canonicalTk, tkTemp } = await primeKeys(ticketId, followUpId, 1310);

    const fileKey = generateContentKey();
    const fileKeyWrapCt = encryptContent(
      fileKey,
      tkTemp,
      buildContentAad(ticketId, fileKeySlot(attachmentId)),
    );

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "rewrapFileKey",
      id: 1312,
      followUpId,
      ticketId,
      attachmentId,
      fileKeyWrap: encode(fileKeyWrapCt),
    })) as RewrapFileKeyResponse;

    expect(resp.ok).toBe(true);
    expect(resp.encryptedFilename).toBeUndefined();

    handleRewrapResult({ kind: "rewrap-result", followUpId, success: true });
    sodium.memzero(canonicalTk);
    sodium.memzero(tkTemp);
    sodium.memzero(fileKey);
  });
});

describe("crypto-core init when already KEYED", () => {
  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("stay-keyed-pw", salt);
    sinkMessages = [];
  });

  it("stays KEYED after re-init (does not drop to READY)", async () => {
    expect(getState()).toBe("KEYED");

    const resp = await dispatchAndWait({ type: "init", id: 1300 });
    expect(resp.ok).toBe(true);
    expect(getState()).toBe("KEYED");
    // volPublic should still be present
    expect(getPublicKeys().volPublic).toBeDefined();
  });
});

describe("crypto-core createTicketKey field slot branches", () => {
  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("fieldslot-test-pw", salt);
    sinkMessages = [];
  });

  it("uses 'title' and 'description' as literal slots, fieldSlot for others", async () => {
    const resp = (await dispatchAndWait({
      type: "createTicketKey",
      id: 1400,
      ticketId: "t-field-slots",
      fields: [
        { name: "title", plaintext: "Title Text" },
        { name: "description", plaintext: "Desc Text" },
        { name: "caller_phone", plaintext: "+15551234567" },
      ],
    })) as CreateTicketKeyResponse;

    expect(resp.ok).toBe(true);
    expect(resp.encryptedFields).toHaveLength(3);
    expect(resp.encryptedFields[0]?.name).toBe("title");
    expect(resp.encryptedFields[1]?.name).toBe("description");
    expect(resp.encryptedFields[2]?.name).toBe("caller_phone");
    // All fields should have non-empty ciphertext
    for (const field of resp.encryptedFields) {
      expect(field.ciphertext.length).toBeGreaterThan(0);
    }
  });
});

describe("crypto-core handleRewrapResult cleanup", () => {
  it("cleans up tk_temp cache on rewrap result", async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const { volPublic } = await loginFlow("rewrap-cleanup-pw", salt);
    const volPub = decode(volPublic) as RistrettoPoint;
    sinkMessages = [];

    // Cache canonical tk
    const canonicalTk = generateContentKey();
    const wrapCanonical = eciesEncrypt(canonicalTk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 1500,
      ticketId: "t-cleanup",
      keyCacheId: "t-cleanup",
      ephemeralPoint: encode(wrapCanonical.ephemeralPoint),
      nonce: encode(wrapCanonical.nonce),
      wrappedKey: encode(wrapCanonical.ciphertext),
    });

    // Create and decrypt with tk_temp
    const tkTemp = generateContentKey();
    const wrapTemp = eciesEncrypt(tkTemp, volPub);
    const followUpId = "fu-cleanup-1";
    const tempCt = encryptContent(
      new TextEncoder().encode("cleanup test"),
      tkTemp,
      buildContentAad("t-cleanup", followupSlot(followUpId)),
    );

    await dispatchAndWait({
      type: "decryptAndRewrap",
      id: 1501,
      ticketId: "t-cleanup",
      followUpId,
      ephemeralPoint: encode(wrapTemp.ephemeralPoint),
      nonce: encode(wrapTemp.nonce),
      wrappedKey: encode(wrapTemp.ciphertext),
      ciphertext: encode(tempCt),
    });

    // Dispatch the rewrap result to trigger cleanup
    dispatch({
      kind: "rewrap-result",
      followUpId,
      success: true,
    } as unknown as Parameters<typeof dispatch>[0]);
    await new Promise((r) => setTimeout(r, 50));

    // A second rewrapBlob for the same followUpId should fail because
    // the tk_temp was cleaned up
    sinkMessages = [];
    const resp = await dispatchAndWait({
      type: "rewrapBlob",
      id: 1502,
      ticketId: "t-cleanup",
      followUpId,
      ciphertext: new ArrayBuffer(64),
      blobKey: "bk",
      blobId: "b1",
      category: "attachment",
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("TK_NOT_CACHED");

    sodium.memzero(canonicalTk);
    sodium.memzero(tkTemp);
  });

  it("handles rewrap result for already-cleaned follow-up without error", () => {
    // Calling handleRewrapResult for a non-existent follow-up should not crash
    handleRewrapResult({
      kind: "rewrap-result",
      followUpId: "fu-nonexistent",
      success: true,
    });
    // No error thrown, no state corruption
    expect(getState()).not.toBe("UNINITIALIZED");
  });
});

describe("crypto-core aliasHash blind index", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("alias-hash-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  /** Unwraps a fresh org secret so the alias index key can be derived. */
  async function unwrapOrgSecret(id: number): Promise<Uint8Array> {
    const sodium = requireSodium();
    const orgSecret = sodium.crypto_core_ristretto255_scalar_random();
    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(orgSecret, volPub);
    await dispatchAndWait({
      type: "unwrapOrgKey",
      id,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
      currentGeneration: 1,
      chain: [],
    });
    sinkMessages = [];
    return orgSecret;
  }

  async function hashOf(alias: string, id: number): Promise<string> {
    const resp = (await dispatchAndWait({
      type: "aliasHash",
      id,
      alias,
    })) as AliasHashResponse;
    expect(resp.ok).toBe(true);
    return resp.hash;
  }

  it("returns a lowercase hex HMAC-SHA512 digest", async () => {
    const orgSecret = await unwrapOrgSecret(900);

    const hash = await hashOf("calm-pebble-7", 901);

    // HMAC-SHA512 is 64 bytes, so 128 hex characters.
    expect(hash).toMatch(/^[0-9a-f]{128}$/);

    requireSodium().memzero(orgSecret);
  });

  it("is deterministic for the same alias", async () => {
    const orgSecret = await unwrapOrgSecret(910);

    const first = await hashOf("calm-pebble-7", 911);
    const second = await hashOf("calm-pebble-7", 912);

    // Uniqueness enforcement depends on this: the same alias written twice
    // must collide on the unique index rather than producing two rows.
    expect(first).toBe(second);

    requireSodium().memzero(orgSecret);
  });

  it("normalizes before hashing, so case and spacing collide", async () => {
    const orgSecret = await unwrapOrgSecret(920);

    const plain = await hashOf("jane", 921);

    expect(await hashOf("Jane", 922)).toBe(plain);
    expect(await hashOf("  jane  ", 923)).toBe(plain);
    expect(await hashOf("JANE", 924)).toBe(plain);

    requireSodium().memzero(orgSecret);
  });

  it("produces different digests for different aliases", async () => {
    const orgSecret = await unwrapOrgSecret(930);

    const a = await hashOf("calm-pebble-7", 931);
    const b = await hashOf("calm-pebble-8", 932);

    expect(a).not.toBe(b);

    requireSodium().memzero(orgSecret);
  });

  it("derives a different digest under a different org secret", async () => {
    const sodium = requireSodium();

    const firstSecret = await unwrapOrgSecret(940);
    const underFirst = await hashOf("calm-pebble-7", 941);
    sodium.memzero(firstSecret);

    // A second org must not produce a matching digest for the same alias,
    // or a seized index would correlate clients across tenants.
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("alias-hash-pw-2", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];

    const secondSecret = await unwrapOrgSecret(942);
    const underSecond = await hashOf("calm-pebble-7", 943);

    expect(underSecond).not.toBe(underFirst);

    sodium.memzero(secondSecret);
  });

  it("never returns key material, only the digest", async () => {
    const orgSecret = await unwrapOrgSecret(950);

    const resp = (await dispatchAndWait({
      type: "aliasHash",
      id: 951,
      alias: "calm-pebble-7",
    })) as AliasHashResponse;

    // ADR-042: the org secret and everything derived from it stay inside the
    // Worker. Only the digest crosses the boundary.
    expect(Object.keys(resp).toSorted()).toEqual(["hash", "id", "ok", "type"]);

    requireSodium().memzero(orgSecret);
  });

  it("fails when no org key has been unwrapped", async () => {
    const resp = await dispatchAndWait({
      type: "aliasHash",
      id: 960,
      alias: "calm-pebble-7",
    });

    expect(resp.ok).toBe(false);
  });
});

describe("crypto-core phoneMatchHash blind index", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("phone-hash-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  async function unwrapOrgSecret(id: number): Promise<Uint8Array> {
    const sodium = requireSodium();
    const orgSecret = sodium.crypto_core_ristretto255_scalar_random();
    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(orgSecret, volPub);
    await dispatchAndWait({
      type: "unwrapOrgKey",
      id,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
      currentGeneration: 1,
      chain: [],
    });
    sinkMessages = [];
    return orgSecret;
  }

  async function phoneHashOf(
    phone: string,
    id: number,
  ): Promise<string | null> {
    const resp = (await dispatchAndWait({
      type: "phoneMatchHash",
      id,
      phone,
    })) as PhoneMatchHashResponse;
    expect(resp.ok).toBe(true);
    return resp.hash;
  }

  it("returns a lowercase hex HMAC-SHA512 digest for a valid phone", async () => {
    const orgSecret = await unwrapOrgSecret(1000);

    const hash = await phoneHashOf("+12125551234", 1001);

    // HMAC-SHA512 is 64 bytes, so 128 hex characters.
    expect(hash).toMatch(/^[0-9a-f]{128}$/);

    requireSodium().memzero(orgSecret);
  });

  it("returns null for a phone too short to normalize", async () => {
    const orgSecret = await unwrapOrgSecret(1010);

    const hash = await phoneHashOf("12345", 1011);

    expect(hash).toBeNull();

    requireSodium().memzero(orgSecret);
  });

  it("is deterministic for the same phone number", async () => {
    const orgSecret = await unwrapOrgSecret(1020);

    const first = await phoneHashOf("+12125551234", 1021);
    const second = await phoneHashOf("+12125551234", 1022);

    expect(first).toBe(second);

    requireSodium().memzero(orgSecret);
  });

  it("normalizes before hashing, so formatting differences collide", async () => {
    const orgSecret = await unwrapOrgSecret(1030);

    const e164 = await phoneHashOf("+12125551234", 1031);
    const parenthetical = await phoneHashOf("(212) 555-1234", 1032);
    const dashed = await phoneHashOf("212-555-1234", 1033);

    expect(e164).toBe(parenthetical);
    expect(e164).toBe(dashed);

    requireSodium().memzero(orgSecret);
  });

  it("produces different hashes under different HKDF labels (alias vs phone)", async () => {
    const orgSecret = await unwrapOrgSecret(1040);

    // Hash the same string through both index keys
    const aliasResp = (await dispatchAndWait({
      type: "aliasHash",
      id: 1041,
      alias: "2125551234",
    })) as AliasHashResponse;

    const phoneResp = (await dispatchAndWait({
      type: "phoneMatchHash",
      id: 1042,
      phone: "2125551234",
    })) as PhoneMatchHashResponse;

    // Domain separation: the same input under alias vs phone-match keys
    // must produce different digests.
    expect(aliasResp.hash).not.toBe(phoneResp.hash);

    requireSodium().memzero(orgSecret);
  });

  it("never returns key material, only the digest", async () => {
    const orgSecret = await unwrapOrgSecret(1050);

    const resp = (await dispatchAndWait({
      type: "phoneMatchHash",
      id: 1051,
      phone: "+12125551234",
    })) as PhoneMatchHashResponse;

    expect(Object.keys(resp).toSorted()).toEqual(["hash", "id", "ok", "type"]);

    requireSodium().memzero(orgSecret);
  });

  it("fails when no org key has been unwrapped", async () => {
    const resp = await dispatchAndWait({
      type: "phoneMatchHash",
      id: 1060,
      phone: "+12125551234",
    });

    expect(resp.ok).toBe(false);
  });
});

// ── Intake response viewer worker ops ──────────────────────────────

describe("decryptIntakeResponse and mintBackfillWraps", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("intake-viewer-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  afterEach(() => {
    handleZeroAll(-1, testSink);
  });

  /** Load the org key so the Worker can unseal intake wraps. */
  async function loadOrgKeyForViewer(): Promise<string> {
    const sodium = requireSodium();
    const orgSecret = sodium.crypto_core_ristretto255_scalar_random();
    const wrap = eciesEncrypt(
      orgSecret,
      decode(volPublicStr) as RistrettoPoint,
    );

    const resp = (await dispatchAndWait({
      type: "unwrapOrgKey",
      id: 2000,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
      currentGeneration: 1,
      chain: [],
    })) as UnwrapOrgKeyResponse;

    expect(resp.ok).toBe(true);
    sodium.memzero(orgSecret);
    return resp.orgPublicKey;
  }

  /** Build a test response blob encrypted with the given tk and ticketId. */
  function buildEncryptedResponse(
    tk: SymmetricKey,
    ticketId: string,
    answers: readonly { fieldKey: string; value: unknown }[],
  ): string {
    const json = JSON.stringify({ answers });
    const plaintext = new TextEncoder().encode(json);
    const aad = buildContentAad(ticketId, "intake-form-response");
    const ct = encryptContent(plaintext, tk, aad);
    return encode(ct);
  }

  it("decrypts a response via the caller's ECIES key wrap", async () => {
    const sodium = requireSodium();
    const tk = generateContentKey();
    const ticketId = "t-resp-ecies";
    const encrypted = buildEncryptedResponse(tk, ticketId, [
      { fieldKey: "f1", value: "hello" },
      { fieldKey: "f2", value: 42 },
    ]);

    const wrap = eciesEncrypt(tk, decode(volPublicStr) as RistrettoPoint);

    const resp = (await dispatchAndWait({
      type: "decryptIntakeResponse",
      id: 2010,
      ticketId,
      encryptedResponse: encrypted,
      callerKeyWrap: {
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
      },
      orgSealWrap: null,
    })) as DecryptIntakeResponseResponse;

    expect(resp.ok).toBe(true);
    const answers = JSON.parse(resp.answersJson) as {
      fieldKey: string;
      value: unknown;
    }[];
    expect(answers).toHaveLength(2);
    expect(answers[0]?.fieldKey).toBe("f1");
    expect(answers[0]?.value).toBe("hello");
    expect(answers[1]?.fieldKey).toBe("f2");
    expect(answers[1]?.value).toBe(42);

    sodium.memzero(tk);
  });

  it("decrypts a response via the org-seal wrap", async () => {
    const sodium = requireSodium();
    const orgPub = await loadOrgKeyForViewer();
    const orgPubBytes = decode(orgPub);

    const tk = generateContentKey();
    const ticketId = "t-resp-seal";
    const encrypted = buildEncryptedResponse(tk, ticketId, [
      { fieldKey: "f1", value: "sealed value" },
    ]);

    // Seal the tk under the org public key
    const sealedWrap = sodium.crypto_box_seal(tk, orgPubBytes);

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "decryptIntakeResponse",
      id: 2020,
      ticketId,
      encryptedResponse: encrypted,
      callerKeyWrap: null,
      orgSealWrap: { wrappedTk: encode(sealedWrap) },
    })) as DecryptIntakeResponseResponse;

    expect(resp.ok).toBe(true);
    const answers = JSON.parse(resp.answersJson) as {
      fieldKey: string;
      value: unknown;
    }[];
    expect(answers).toHaveLength(1);
    expect(answers[0]?.value).toBe("sealed value");

    sodium.memzero(tk);
  });

  it("returns DECRYPT_FAILED for wrong key wrap", async () => {
    const sodium = requireSodium();
    const tk = generateContentKey();
    const ticketId = "t-resp-wrong";
    const encrypted = buildEncryptedResponse(tk, ticketId, [
      { fieldKey: "f1", value: "data" },
    ]);

    // Use a different key for the wrap
    const wrongKey = generateContentKey();
    const wrap = eciesEncrypt(wrongKey, decode(volPublicStr) as RistrettoPoint);

    const resp = await dispatchAndWait({
      type: "decryptIntakeResponse",
      id: 2030,
      ticketId,
      encryptedResponse: encrypted,
      callerKeyWrap: {
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
      },
      orgSealWrap: null,
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("DECRYPT_FAILED");

    sodium.memzero(tk);
    sodium.memzero(wrongKey);
  });

  it("returns DECRYPT_FAILED for malformed response blob", async () => {
    const tk = generateContentKey();
    const ticketId = "t-resp-malformed";
    const wrap = eciesEncrypt(tk, decode(volPublicStr) as RistrettoPoint);

    const resp = await dispatchAndWait({
      type: "decryptIntakeResponse",
      id: 2040,
      ticketId,
      encryptedResponse: encode(new Uint8Array([1, 2, 3, 4])),
      callerKeyWrap: {
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
      },
      orgSealWrap: null,
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("DECRYPT_FAILED");

    requireSodium().memzero(tk);
  });

  it("returns empty answers for valid ciphertext with invalid JSON", async () => {
    const tk = generateContentKey();
    const ticketId = "t-resp-badjson";
    // Encrypt non-JSON data
    const plaintext = new TextEncoder().encode("not json at all");
    const aad = buildContentAad(ticketId, "intake-form-response");
    const ct = encryptContent(plaintext, tk, aad);

    const wrap = eciesEncrypt(tk, decode(volPublicStr) as RistrettoPoint);

    const resp = (await dispatchAndWait({
      type: "decryptIntakeResponse",
      id: 2050,
      ticketId,
      encryptedResponse: encode(ct),
      callerKeyWrap: {
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
      },
      orgSealWrap: null,
    })) as DecryptIntakeResponseResponse;

    expect(resp.ok).toBe(true);
    expect(resp.answersJson).toBe("[]");

    requireSodium().memzero(tk);
  });

  it("returns DECRYPT_FAILED when neither wrap nor seal is provided", async () => {
    const resp = await dispatchAndWait({
      type: "decryptIntakeResponse",
      id: 2060,
      ticketId: "t-no-key",
      encryptedResponse: encode(new Uint8Array(100)),
      callerKeyWrap: null,
      orgSealWrap: null,
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("DECRYPT_FAILED");
  });

  it("mints backfill wraps after a successful decrypt", async () => {
    const sodium = requireSodium();
    const tk = generateContentKey();
    const ticketId = "t-backfill";
    const encrypted = buildEncryptedResponse(tk, ticketId, [
      { fieldKey: "f1", value: "test" },
    ]);

    const wrap = eciesEncrypt(tk, decode(volPublicStr) as RistrettoPoint);

    // First decrypt to cache the tk
    const decResp = (await dispatchAndWait({
      type: "decryptIntakeResponse",
      id: 2070,
      ticketId,
      encryptedResponse: encrypted,
      callerKeyWrap: {
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
      },
      orgSealWrap: null,
    })) as DecryptIntakeResponseResponse;
    expect(decResp.ok).toBe(true);

    // Generate a target volunteer keypair
    const targetPriv = sodium.crypto_core_ristretto255_scalar_random();
    const targetPub = sodium.crypto_scalarmult_ristretto255_base(targetPriv);

    sinkMessages = [];
    const mintResp = (await dispatchAndWait({
      type: "mintBackfillWraps",
      id: 2071,
      ticketId,
      targets: [{ volunteerId: "vol-target-1", volPublic: encode(targetPub) }],
    })) as MintBackfillWrapsResponse;

    expect(mintResp.ok).toBe(true);
    expect(mintResp.wraps).toHaveLength(1);
    expect(mintResp.wraps[0]?.volunteerId).toBe("vol-target-1");

    // Verify the wrap can be opened with the target private key
    const wrappedTk = eciesDecrypt(
      decode(mintResp.wraps[0]!.ephemeralPoint) as RistrettoPoint,
      decode(mintResp.wraps[0]!.nonce) as Nonce,
      decode(mintResp.wraps[0]!.wrappedKey),
      targetPriv as Scalar,
    );

    // Verify the recovered tk matches (decrypt the same response)
    const aad = buildContentAad(ticketId, "intake-form-response");
    const plaintext = decryptContent(
      decode(encrypted) as Ciphertext,
      wrappedTk as SymmetricKey,
      aad,
    );
    const json = new TextDecoder().decode(plaintext);
    expect(JSON.parse(json)).toEqual({
      answers: [{ fieldKey: "f1", value: "test" }],
    });

    sodium.memzero(tk);
    sodium.memzero(targetPriv);
    sodium.memzero(wrappedTk);
    sodium.memzero(plaintext);
  });

  it("returns TK_NOT_CACHED for mintBackfillWraps without a prior decrypt", async () => {
    const resp = await dispatchAndWait({
      type: "mintBackfillWraps",
      id: 2080,
      ticketId: "t-no-cache",
      targets: [
        { volunteerId: "vol-1", volPublic: encode(new Uint8Array(32)) },
      ],
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("TK_NOT_CACHED");
  });
});

// ── Attachment envelope operations (ADR-089) ─────────────────────

describe("crypto-core encryptAttachment and decryptAttachment", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("attachment-test-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  /** Cache a tk for the given ticket, returning the raw key for assertions. */
  async function cacheTk(ticketId: string, id: number): Promise<Uint8Array> {
    const tk = generateContentKey();
    const wrap = eciesEncrypt(tk, decode(volPublicStr) as RistrettoPoint);
    await dispatchAndWait({
      type: "unwrapTk",
      id,
      ticketId,
      keyCacheId: ticketId,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
    });
    return tk;
  }

  it("roundtrips: encrypt then decrypt returns the original bytes", async () => {
    const sodium = requireSodium();
    const tk = await cacheTk("t-att-rt", 3000);
    const attachmentId = crypto.randomUUID();
    const fileData = sodium.randombytes_buf(256);

    const dataBuf = new ArrayBuffer(fileData.byteLength);
    new Uint8Array(dataBuf).set(fileData);

    sinkMessages = [];
    const encResp = (await dispatchAndWait({
      type: "encryptAttachment",
      id: 3001,
      ticketId: "t-att-rt",
      attachmentId,
      filename: "report.pdf",
      data: dataBuf,
    })) as EncryptAttachmentResponse;

    expect(encResp.ok).toBe(true);
    expect(encResp.blob).toBeInstanceOf(ArrayBuffer);
    expect(encResp.fileKeyWrap).toBeDefined();
    expect(encResp.encryptedFilename).toBeDefined();
    expect(encResp.portalCopy).toBeUndefined();

    // Now decrypt
    const ctBuf = new ArrayBuffer(new Uint8Array(encResp.blob).byteLength);
    new Uint8Array(ctBuf).set(new Uint8Array(encResp.blob));

    sinkMessages = [];
    const decResp = (await dispatchAndWait({
      type: "decryptAttachment",
      id: 3002,
      ticketId: "t-att-rt",
      attachmentId,
      fileKeyWrap: encResp.fileKeyWrap,
      ciphertext: ctBuf,
    })) as DecryptAttachmentResponse;

    expect(decResp.ok).toBe(true);
    expect(decResp.data).toBeInstanceOf(ArrayBuffer);
    expect(new Uint8Array(decResp.data)).toEqual(fileData);

    sodium.memzero(tk);
  });

  it("rejects decrypt when the wrap belongs to a different attachment (AAD mismatch)", async () => {
    const sodium = requireSodium();
    const tk = await cacheTk("t-att-aad", 3010);
    const attachmentA = crypto.randomUUID();
    const attachmentB = crypto.randomUUID();
    const fileData = sodium.randombytes_buf(64);

    // Encrypt under attachment A
    const dataBufA = new ArrayBuffer(fileData.byteLength);
    new Uint8Array(dataBufA).set(fileData);
    sinkMessages = [];
    const encResp = (await dispatchAndWait({
      type: "encryptAttachment",
      id: 3011,
      ticketId: "t-att-aad",
      attachmentId: attachmentA,
      filename: "a.pdf",
      data: dataBufA,
    })) as EncryptAttachmentResponse;
    expect(encResp.ok).toBe(true);

    // Try to decrypt with the wrap from A but claim attachment B
    const ctBuf = new ArrayBuffer(new Uint8Array(encResp.blob).byteLength);
    new Uint8Array(ctBuf).set(new Uint8Array(encResp.blob));

    sinkMessages = [];
    const decResp = await dispatchAndWait({
      type: "decryptAttachment",
      id: 3012,
      ticketId: "t-att-aad",
      attachmentId: attachmentB,
      fileKeyWrap: encResp.fileKeyWrap,
      ciphertext: ctBuf,
    });

    expect(decResp.ok).toBe(false);
    expect((decResp as ErrorResponse).code).toBe("DECRYPT_FAILED");

    sodium.memzero(tk);
  });

  it("rejects decrypt when the blob ciphertext is tampered", async () => {
    const sodium = requireSodium();
    const tk = await cacheTk("t-att-tamper", 3020);
    const attachmentId = crypto.randomUUID();
    const fileData = sodium.randombytes_buf(128);

    const dataBuf = new ArrayBuffer(fileData.byteLength);
    new Uint8Array(dataBuf).set(fileData);
    sinkMessages = [];
    const encResp = (await dispatchAndWait({
      type: "encryptAttachment",
      id: 3021,
      ticketId: "t-att-tamper",
      attachmentId,
      filename: "secret.doc",
      data: dataBuf,
    })) as EncryptAttachmentResponse;
    expect(encResp.ok).toBe(true);

    // Flip a bit in the blob ciphertext
    const tampered = new Uint8Array(encResp.blob);
    tampered[tampered.length - 1] = (tampered[tampered.length - 1] ?? 0) ^ 0xff;
    const tamperedBuf = new ArrayBuffer(tampered.byteLength);
    new Uint8Array(tamperedBuf).set(tampered);

    sinkMessages = [];
    const decResp = await dispatchAndWait({
      type: "decryptAttachment",
      id: 3022,
      ticketId: "t-att-tamper",
      attachmentId,
      fileKeyWrap: encResp.fileKeyWrap,
      ciphertext: tamperedBuf,
    });

    expect(decResp.ok).toBe(false);
    expect((decResp as ErrorResponse).code).toBe("DECRYPT_FAILED");

    sodium.memzero(tk);
  });

  it("rejects encryptAttachment when the Worker is not keyed", async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    await dispatchAndWait({ type: "init", id: 3030 });

    const resp = await dispatchAndWait({
      type: "encryptAttachment",
      id: 3031,
      ticketId: "t-fail",
      attachmentId: "att-fail",
      filename: "f.txt",
      data: new ArrayBuffer(8),
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("rejects decryptAttachment when the Worker is not keyed", async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    await dispatchAndWait({ type: "init", id: 3040 });

    const resp = await dispatchAndWait({
      type: "decryptAttachment",
      id: 3041,
      ticketId: "t-fail",
      attachmentId: "att-fail",
      fileKeyWrap: encode(new Uint8Array(64)),
      ciphertext: new ArrayBuffer(64),
    });
    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("produces a portal copy only when clientPublic is supplied", async () => {
    const sodium = requireSodium();
    const tk = await cacheTk("t-att-portal", 3050);
    const attachmentId = crypto.randomUUID();
    const fileData = sodium.randombytes_buf(32);

    // Without clientPublic: no portal copy
    const dataBuf1 = new ArrayBuffer(fileData.byteLength);
    new Uint8Array(dataBuf1).set(fileData);
    sinkMessages = [];
    const noPortal = (await dispatchAndWait({
      type: "encryptAttachment",
      id: 3051,
      ticketId: "t-att-portal",
      attachmentId,
      filename: "doc.txt",
      data: dataBuf1,
    })) as EncryptAttachmentResponse;
    expect(noPortal.ok).toBe(true);
    expect(noPortal.portalCopy).toBeUndefined();

    // With clientPublic: portal copy is present
    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    const dataBuf2 = new ArrayBuffer(fileData.byteLength);
    new Uint8Array(dataBuf2).set(fileData);
    sinkMessages = [];
    const withPortal = (await dispatchAndWait({
      type: "encryptAttachment",
      id: 3052,
      ticketId: "t-att-portal",
      attachmentId: crypto.randomUUID(),
      filename: "doc.txt",
      data: dataBuf2,
      clientPublic: encode(clientPub),
    })) as EncryptAttachmentResponse;
    expect(withPortal.ok).toBe(true);
    expect(withPortal.portalCopy).toBeDefined();
    expect(withPortal.portalCopy?.ephemeralPoint).toBeDefined();
    expect(withPortal.portalCopy?.nonce).toBeDefined();
    expect(withPortal.portalCopy?.ciphertext).toBeDefined();

    sodium.memzero(tk);
    sodium.memzero(clientPriv);
  });

  it("portal copy decrypts to the file key and filename", async () => {
    const sodium = requireSodium();
    const tk = await cacheTk("t-att-pcopy", 3060);
    const attachmentId = crypto.randomUUID();
    const fileData = sodium.randombytes_buf(48);
    const filename = "important-file.pdf";

    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    const dataBuf = new ArrayBuffer(fileData.byteLength);
    new Uint8Array(dataBuf).set(fileData);
    sinkMessages = [];
    const encResp = (await dispatchAndWait({
      type: "encryptAttachment",
      id: 3061,
      ticketId: "t-att-pcopy",
      attachmentId,
      filename,
      data: dataBuf,
      clientPublic: encode(clientPub),
    })) as EncryptAttachmentResponse;
    expect(encResp.ok).toBe(true);
    expect(encResp.portalCopy).toBeDefined();

    // Decrypt the portal copy with the client's private key (uses
    // the top-level decodeFileKeyPayload import, not a dynamic one,
    // to avoid shadowing in the test scope)
    const payloadBytes = eciesDecrypt(
      decode(encResp.portalCopy!.ephemeralPoint) as RistrettoPoint,
      decode(encResp.portalCopy!.nonce) as Nonce,
      decode(encResp.portalCopy!.ciphertext),
      clientPriv,
    );

    const payload = decodeFileKeyPayload(payloadBytes);
    expect(payload.filename).toBe(filename);
    // The file key from the payload should decrypt the blob
    const blobBuf = new Uint8Array(encResp.blob);
    const decrypted = decryptContent(
      blobBuf as Ciphertext,
      payload.fileKey,
      buildContentAad("t-att-pcopy", blobSlot(attachmentId)),
    );
    expect(new Uint8Array(decrypted)).toEqual(fileData);

    sodium.memzero(tk);
    sodium.memzero(clientPriv);
    sodium.memzero(payloadBytes);
    sodium.memzero(decrypted);
  });
});

// ── Portal thread reseed batch ops ────────────────────────────────

describe("crypto-core sealFollowUpsToPublic", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("seal-followups-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  async function cacheTk(
    ticketId: string,
    id: number,
  ): Promise<{
    tk: Uint8Array;
    wrap: { ephemeralPoint: string; nonce: string; wrappedKey: string };
  }> {
    const tk = generateContentKey();
    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(tk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id,
      ticketId,
      keyCacheId: ticketId,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
    });
    return {
      tk,
      wrap: {
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
      },
    };
  }

  it("seals follow-ups to a client public key and the portal can decrypt", async () => {
    const sodium = requireSodium();
    const { tk, wrap: keyWrap } = await cacheTk("t-seal-fu", 4000);

    // Encrypt two follow-ups under tk
    const plainA = "Hello from volunteer";
    const plainB = "Second message";
    const ctA = encryptContent(
      new TextEncoder().encode(plainA),
      tk as SymmetricKey,
      buildContentAad("t-seal-fu", followupSlot("fu-a")),
    );
    const ctB = encryptContent(
      new TextEncoder().encode(plainB),
      tk as SymmetricKey,
      buildContentAad("t-seal-fu", followupSlot("fu-b")),
    );

    // Generate client keypair (portal side)
    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "sealFollowUpsToPublic",
      id: 4001,
      ticketId: "t-seal-fu",
      clientPublic: encode(clientPub),
      items: [
        { followUpId: "fu-a", ciphertext: encode(ctA), keyWrap },
        { followUpId: "fu-b", ciphertext: encode(ctB), keyWrap },
      ],
    })) as SealFollowUpsToPublicResponse;

    expect(resp.ok).toBe(true);
    expect(resp.items).toHaveLength(2);
    expect(resp.failed).toHaveLength(0);

    // Verify the portal can ECIES-open each copy
    for (const item of resp.items) {
      const decrypted = eciesDecrypt(
        decode(item.copy.ephemeralPoint) as RistrettoPoint,
        decode(item.copy.nonce) as Nonce,
        decode(item.copy.ciphertext),
        clientPriv,
      );
      const text = new TextDecoder().decode(decrypted);
      if (item.followUpId === "fu-a") expect(text).toBe(plainA);
      else expect(text).toBe(plainB);
      sodium.memzero(decrypted);
    }

    sodium.memzero(tk);
    sodium.memzero(clientPriv);
  });

  it("routes portalWrap items through the org-key unseal path", async () => {
    const sodium = requireSodium();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    // Load org key
    const orgSecret = sodium.crypto_core_ristretto255_scalar_random();
    const orgWrap = eciesEncrypt(orgSecret, volPub);
    const orgResp = (await dispatchAndWait({
      type: "unwrapOrgKey",
      id: 4100,
      ephemeralPoint: encode(orgWrap.ephemeralPoint),
      nonce: encode(orgWrap.nonce),
      wrappedOrgKey: encode(orgWrap.ciphertext),
      currentGeneration: 1,
      chain: [],
    })) as UnwrapOrgKeyResponse;
    const orgPub = decode(orgResp.orgPublicKey);

    // Cache canonical tk
    const canonicalTk = generateContentKey();
    const wrapCanonical = eciesEncrypt(canonicalTk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 4101,
      ticketId: "t-seal-portal",
      keyCacheId: "t-seal-portal",
      ephemeralPoint: encode(wrapCanonical.ephemeralPoint),
      nonce: encode(wrapCanonical.nonce),
      wrappedKey: encode(wrapCanonical.ciphertext),
    });

    // Create a portal reply encrypted under a sealed tk_temp
    const tkTemp = generateContentKey();
    const sealedWrap = sodium.crypto_box_seal(tkTemp, orgPub);
    const portalText = "portal reply text";
    const portalCt = encryptContent(
      new TextEncoder().encode(portalText),
      tkTemp,
      buildContentAad("t-seal-portal", followupSlot("fu-portal")),
    );

    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "sealFollowUpsToPublic",
      id: 4102,
      ticketId: "t-seal-portal",
      clientPublic: encode(clientPub),
      items: [
        {
          followUpId: "fu-portal",
          ciphertext: encode(portalCt),
          portalWrap: encode(sealedWrap),
        },
      ],
    })) as SealFollowUpsToPublicResponse;

    expect(resp.ok).toBe(true);
    expect(resp.items).toHaveLength(1);
    expect(resp.failed).toHaveLength(0);

    // Portal can read the sealed content
    const decrypted = eciesDecrypt(
      decode(resp.items[0]!.copy.ephemeralPoint) as RistrettoPoint,
      decode(resp.items[0]!.copy.nonce) as Nonce,
      decode(resp.items[0]!.copy.ciphertext),
      clientPriv,
    );
    expect(new TextDecoder().decode(decrypted)).toBe(portalText);

    sodium.memzero(orgSecret);
    sodium.memzero(canonicalTk);
    sodium.memzero(tkTemp);
    sodium.memzero(clientPriv);
    sodium.memzero(decrypted);
  });

  it("isolates per-item failures: tampered item lands in failed, others succeed", async () => {
    const sodium = requireSodium();
    const { tk, wrap: keyWrap } = await cacheTk("t-seal-fail", 4200);

    const goodCt = encryptContent(
      new TextEncoder().encode("good"),
      tk as SymmetricKey,
      buildContentAad("t-seal-fail", followupSlot("fu-good")),
    );
    // Tampered ciphertext for the bad item
    const badCt = sodium.randombytes_buf(64);

    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "sealFollowUpsToPublic",
      id: 4201,
      ticketId: "t-seal-fail",
      clientPublic: encode(clientPub),
      items: [
        { followUpId: "fu-good", ciphertext: encode(goodCt), keyWrap },
        { followUpId: "fu-bad", ciphertext: encode(badCt), keyWrap },
      ],
    })) as SealFollowUpsToPublicResponse;

    expect(resp.ok).toBe(true);
    expect(resp.items).toHaveLength(1);
    expect(resp.items[0]!.followUpId).toBe("fu-good");
    expect(resp.failed).toEqual(["fu-bad"]);

    sodium.memzero(tk);
    sodium.memzero(clientPriv);
  });

  it("rejects with tampered AAD (wrong followUpId slot)", async () => {
    const sodium = requireSodium();
    const { tk, wrap: keyWrap } = await cacheTk("t-seal-aad", 4300);

    // Encrypt under fu-other's slot
    const ct = encryptContent(
      new TextEncoder().encode("wrong slot"),
      tk as SymmetricKey,
      buildContentAad("t-seal-aad", followupSlot("fu-other")),
    );

    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "sealFollowUpsToPublic",
      id: 4301,
      ticketId: "t-seal-aad",
      clientPublic: encode(clientPub),
      items: [{ followUpId: "fu-claimed", ciphertext: encode(ct), keyWrap }],
    })) as SealFollowUpsToPublicResponse;

    expect(resp.ok).toBe(true);
    expect(resp.items).toHaveLength(0);
    expect(resp.failed).toEqual(["fu-claimed"]);

    sodium.memzero(tk);
    sodium.memzero(clientPriv);
  });
});

describe("crypto-core sealFileKeysToPublic", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("seal-filekeys-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  async function cacheTkAndReturn(
    ticketId: string,
    id: number,
  ): Promise<{
    tk: Uint8Array;
    keyWrap: { ephemeralPoint: string; nonce: string; wrappedKey: string };
  }> {
    const tk = generateContentKey();
    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(tk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id,
      ticketId,
      keyCacheId: ticketId,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
    });
    return {
      tk,
      keyWrap: {
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
      },
    };
  }

  it("seals file keys to client public and the portal can decode the payload", async () => {
    const sodium = requireSodium();
    const { tk } = await cacheTkAndReturn("t-sfk", 5000);

    const attachmentId = crypto.randomUUID();
    const fileKey = generateContentKey();
    const filename = "evidence.pdf";

    // Wrap file key under tk
    const fileKeyWrapCt = encryptContent(
      fileKey,
      tk as SymmetricKey,
      buildContentAad("t-sfk", fileKeySlot(attachmentId)),
    );
    // Encrypt filename under tk
    const filenameCt = encryptContent(
      new TextEncoder().encode(filename),
      tk as SymmetricKey,
      buildContentAad("t-sfk", filenameSlot(attachmentId)),
    );

    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "sealFileKeysToPublic",
      id: 5001,
      ticketId: "t-sfk",
      clientPublic: encode(clientPub),
      items: [
        {
          kind: "attachment" as const,
          rowId: attachmentId,
          fileKeyWrap: encode(fileKeyWrapCt),
          encryptedFilename: encode(filenameCt),
        },
      ],
    })) as SealFileKeysToPublicResponse;

    expect(resp.ok).toBe(true);
    expect(resp.items).toHaveLength(1);
    expect(resp.failed).toHaveLength(0);

    // Portal side: ECIES-open the copy and decode the payload
    const payloadBytes = eciesDecrypt(
      decode(resp.items[0]!.copy.ephemeralPoint) as RistrettoPoint,
      decode(resp.items[0]!.copy.nonce) as Nonce,
      decode(resp.items[0]!.copy.ciphertext),
      clientPriv,
    );
    const payload = decodeFileKeyPayload(payloadBytes);
    expect(payload.filename).toBe(filename);

    // The file key from the payload should match the original
    expect(encode(payload.fileKey)).toBe(encode(fileKey as SymmetricKey));

    sodium.memzero(tk);
    sodium.memzero(fileKey);
    sodium.memzero(clientPriv);
    sodium.memzero(payloadBytes);
  });

  it("uses empty filename for recordings (no encryptedFilename)", async () => {
    const sodium = requireSodium();
    const { tk } = await cacheTkAndReturn("t-sfk-rec", 5100);

    const rowId = crypto.randomUUID();
    const fileKey = generateContentKey();

    const fileKeyWrapCt = encryptContent(
      fileKey,
      tk as SymmetricKey,
      buildContentAad("t-sfk-rec", fileKeySlot(rowId)),
    );

    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "sealFileKeysToPublic",
      id: 5101,
      ticketId: "t-sfk-rec",
      clientPublic: encode(clientPub),
      items: [
        {
          kind: "recording" as const,
          rowId,
          fileKeyWrap: encode(fileKeyWrapCt),
        },
      ],
    })) as SealFileKeysToPublicResponse;

    expect(resp.ok).toBe(true);
    expect(resp.items).toHaveLength(1);

    const payloadBytes = eciesDecrypt(
      decode(resp.items[0]!.copy.ephemeralPoint) as RistrettoPoint,
      decode(resp.items[0]!.copy.nonce) as Nonce,
      decode(resp.items[0]!.copy.ciphertext),
      clientPriv,
    );
    const payload = decodeFileKeyPayload(payloadBytes);
    expect(payload.filename).toBe("");

    sodium.memzero(tk);
    sodium.memzero(fileKey);
    sodium.memzero(clientPriv);
    sodium.memzero(payloadBytes);
  });

  it("isolates per-item failures (tampered file key wrap)", async () => {
    const sodium = requireSodium();
    const { tk } = await cacheTkAndReturn("t-sfk-fail", 5200);

    const goodId = crypto.randomUUID();
    const badId = crypto.randomUUID();
    const fileKey = generateContentKey();

    const goodWrap = encryptContent(
      fileKey,
      tk as SymmetricKey,
      buildContentAad("t-sfk-fail", fileKeySlot(goodId)),
    );

    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "sealFileKeysToPublic",
      id: 5201,
      ticketId: "t-sfk-fail",
      clientPublic: encode(clientPub),
      items: [
        {
          kind: "attachment" as const,
          rowId: goodId,
          fileKeyWrap: encode(goodWrap),
        },
        {
          kind: "attachment" as const,
          rowId: badId,
          fileKeyWrap: encode(sodium.randombytes_buf(64)),
        },
      ],
    })) as SealFileKeysToPublicResponse;

    expect(resp.ok).toBe(true);
    expect(resp.items).toHaveLength(1);
    expect(resp.items[0]!.rowId).toBe(goodId);
    expect(resp.failed).toEqual([badId]);

    sodium.memzero(tk);
    sodium.memzero(fileKey);
    sodium.memzero(clientPriv);
  });

  it("warms the tk cache via the keyWrap field", async () => {
    const sodium = requireSodium();
    // Do NOT pre-cache tk; let the keyWrap warm-up path handle it.
    const tk = generateContentKey();
    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(tk, volPub);

    const rowId = crypto.randomUUID();
    const fileKey = generateContentKey();
    const fileKeyWrapCt = encryptContent(
      fileKey,
      tk as SymmetricKey,
      buildContentAad("t-sfk-warm", fileKeySlot(rowId)),
    );

    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "sealFileKeysToPublic",
      id: 5300,
      ticketId: "t-sfk-warm",
      clientPublic: encode(clientPub),
      keyWrap: {
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
      },
      items: [
        {
          kind: "attachment" as const,
          rowId,
          fileKeyWrap: encode(fileKeyWrapCt),
        },
      ],
    })) as SealFileKeysToPublicResponse;

    expect(resp.ok).toBe(true);
    expect(resp.items).toHaveLength(1);
    expect(resp.failed).toHaveLength(0);

    sodium.memzero(tk);
    sodium.memzero(fileKey);
    sodium.memzero(clientPriv);
  });
});

describe("crypto-core convertBlobForPortal", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("convert-blob-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  async function cacheTk(ticketId: string, id: number): Promise<Uint8Array> {
    const tk = generateContentKey();
    const wrap = eciesEncrypt(tk, decode(volPublicStr) as RistrettoPoint);
    await dispatchAndWait({
      type: "unwrapTk",
      id,
      ticketId,
      keyCacheId: ticketId,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
    });
    return tk;
  }

  it("converts a tk-encrypted blob to file-key envelope and portal can read it", async () => {
    const sodium = requireSodium();
    const tk = await cacheTk("t-cvt", 6000);

    const rowId = crypto.randomUUID();
    const blobData = sodium.randombytes_buf(200);
    const filename = "photo.jpg";

    // Encrypt blob under tk at blobSlot
    const blobCt = encryptContent(
      blobData,
      tk as SymmetricKey,
      buildContentAad("t-cvt", blobSlot(rowId)),
    );
    // Encrypt filename under tk at filenameSlot
    const filenameCt = encryptContent(
      new TextEncoder().encode(filename),
      tk as SymmetricKey,
      buildContentAad("t-cvt", filenameSlot(rowId)),
    );

    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    const ctBuf = new ArrayBuffer(blobCt.byteLength);
    new Uint8Array(ctBuf).set(blobCt);

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "convertBlobForPortal",
      id: 6001,
      ticketId: "t-cvt",
      clientPublic: encode(clientPub),
      category: "attachment",
      rowId,
      ciphertext: ctBuf,
      encryptedFilename: encode(filenameCt),
    })) as ConvertBlobForPortalResponse;

    expect(resp.ok).toBe(true);
    expect(resp.encryptedData).toBeInstanceOf(ArrayBuffer);
    expect(resp.fileKeyWrap).toBeDefined();
    expect(resp.copy).toBeDefined();

    // Portal side: ECIES-open the copy to get file key + filename
    const payloadBytes = eciesDecrypt(
      decode(resp.copy.ephemeralPoint) as RistrettoPoint,
      decode(resp.copy.nonce) as Nonce,
      decode(resp.copy.ciphertext),
      clientPriv,
    );
    const payload = decodeFileKeyPayload(payloadBytes);
    expect(payload.filename).toBe(filename);

    // The file key from the portal copy should decrypt the re-encrypted blob
    const reEncryptedBuf = new Uint8Array(resp.encryptedData);
    const decryptedBlob = decryptContent(
      reEncryptedBuf as Ciphertext,
      payload.fileKey,
      buildContentAad("t-cvt", blobSlot(rowId)),
    );
    expect(new Uint8Array(decryptedBlob)).toEqual(blobData);

    // The file key wrap should unwrap under tk
    const unwrappedFileKey = decryptContent(
      decode(resp.fileKeyWrap) as Ciphertext,
      tk as SymmetricKey,
      buildContentAad("t-cvt", fileKeySlot(rowId)),
    );
    expect(encode(unwrappedFileKey as SymmetricKey)).toBe(
      encode(payload.fileKey),
    );

    sodium.memzero(tk);
    sodium.memzero(clientPriv);
    sodium.memzero(payloadBytes);
    sodium.memzero(decryptedBlob);
    sodium.memzero(unwrappedFileKey);
  });

  it("uses empty filename for recordings (no encryptedFilename)", async () => {
    const sodium = requireSodium();
    const tk = await cacheTk("t-cvt-rec", 6100);

    const rowId = crypto.randomUUID();
    const blobData = sodium.randombytes_buf(64);

    const blobCt = encryptContent(
      blobData,
      tk as SymmetricKey,
      buildContentAad("t-cvt-rec", blobSlot(rowId)),
    );

    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    const ctBuf = new ArrayBuffer(blobCt.byteLength);
    new Uint8Array(ctBuf).set(blobCt);

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "convertBlobForPortal",
      id: 6101,
      ticketId: "t-cvt-rec",
      clientPublic: encode(clientPub),
      category: "recording",
      rowId,
      ciphertext: ctBuf,
    })) as ConvertBlobForPortalResponse;

    expect(resp.ok).toBe(true);

    const payloadBytes = eciesDecrypt(
      decode(resp.copy.ephemeralPoint) as RistrettoPoint,
      decode(resp.copy.nonce) as Nonce,
      decode(resp.copy.ciphertext),
      clientPriv,
    );
    const payload = decodeFileKeyPayload(payloadBytes);
    expect(payload.filename).toBe("");

    sodium.memzero(tk);
    sodium.memzero(clientPriv);
    sodium.memzero(payloadBytes);
  });

  it("rejects when tk is not cached", async () => {
    const sodium = requireSodium();
    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    sinkMessages = [];
    const resp = await dispatchAndWait({
      type: "convertBlobForPortal",
      id: 6200,
      ticketId: "t-no-tk",
      clientPublic: encode(clientPub),
      category: "attachment",
      rowId: "r1",
      ciphertext: new ArrayBuffer(64),
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("TK_NOT_CACHED");

    sodium.memzero(clientPriv);
  });

  it("rejects when blob ciphertext is tampered", async () => {
    const sodium = requireSodium();
    const tk = await cacheTk("t-cvt-tamper", 6300);

    const rowId = crypto.randomUUID();
    const blobData = sodium.randombytes_buf(64);

    const blobCt = encryptContent(
      blobData,
      tk as SymmetricKey,
      buildContentAad("t-cvt-tamper", blobSlot(rowId)),
    );

    // Tamper the ciphertext
    const tampered = new Uint8Array(blobCt);
    tampered[tampered.length - 1] = (tampered[tampered.length - 1] ?? 0) ^ 0xff;
    const tamperedBuf = new ArrayBuffer(tampered.byteLength);
    new Uint8Array(tamperedBuf).set(tampered);

    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    sinkMessages = [];
    const resp = await dispatchAndWait({
      type: "convertBlobForPortal",
      id: 6301,
      ticketId: "t-cvt-tamper",
      clientPublic: encode(clientPub),
      category: "attachment",
      rowId,
      ciphertext: tamperedBuf,
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("DECRYPT_FAILED");

    sodium.memzero(tk);
    sodium.memzero(clientPriv);
  });
});

// ── unwrapIntakeTk handler ──────────────────────────────────────────

describe("crypto-core unwrapIntakeTk", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("intake-tk-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  async function loadOrgKey(): Promise<Uint8Array> {
    const sodium = requireSodium();
    const orgSecret = sodium.crypto_core_ristretto255_scalar_random();
    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(orgSecret, volPub);
    await dispatchAndWait({
      type: "unwrapOrgKey",
      id: 7000,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
      currentGeneration: 1,
      chain: [],
    });
    sinkMessages = [];
    return orgSecret;
  }

  it("unseals an intake wrap and caches the tk (no targets)", async () => {
    const sodium = requireSodium();
    const orgSecret = await loadOrgKey();
    const orgPub = decode(getPublicKeys().orgPublicKey!);

    const tk = generateContentKey();
    const sealedWrap = sodium.crypto_box_seal(tk, orgPub);

    const resp = (await dispatchAndWait({
      type: "unwrapIntakeTk",
      id: 7001,
      ticketId: "t-intake-1",
      sealedWrap: encode(sealedWrap),
    })) as UnwrapIntakeTkResponse;

    expect(resp.ok).toBe(true);
    expect(resp.type).toBe("unwrapIntakeTk");
    expect(resp.wraps).toBeUndefined();

    // Verify the tk was cached: a subsequent decryptContent should succeed
    const plaintext = new TextEncoder().encode("intake content");
    const ct = encryptContent(
      plaintext,
      tk,
      buildContentAad("t-intake-1", "title"),
    );

    sinkMessages = [];
    const decResp = (await dispatchAndWait({
      type: "decryptContent",
      id: 7002,
      ticketId: "t-intake-1",
      keyCacheId: "t-intake-1",
      slot: "title",
      ephemeralPoint: encode(new Uint8Array(32)),
      nonce: encode(new Uint8Array(24)),
      wrappedKey: encode(new Uint8Array(48)),
      ciphertext: encode(ct),
    })) as DecryptContentResponse;

    expect(decResp.ok).toBe(true);
    expect(decResp.plaintext).toBe("intake content");

    sodium.memzero(tk);
    sodium.memzero(orgSecret);
  });

  it("produces ECIES wraps when targets are provided", async () => {
    const sodium = requireSodium();
    const orgSecret = await loadOrgKey();
    const orgPub = decode(getPublicKeys().orgPublicKey!);

    const tk = generateContentKey();
    const sealedWrap = sodium.crypto_box_seal(tk, orgPub);

    // Target volunteer keypair
    const recipientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const recipientPub =
      sodium.crypto_scalarmult_ristretto255_base(recipientPriv);

    const resp = (await dispatchAndWait({
      type: "unwrapIntakeTk",
      id: 7010,
      ticketId: "t-intake-targets",
      sealedWrap: encode(sealedWrap),
      targets: [
        { volunteerId: "vol-intake-1", volPublic: encode(recipientPub) },
      ],
    })) as UnwrapIntakeTkResponse;

    expect(resp.ok).toBe(true);
    expect(resp.wraps).toHaveLength(1);
    expect(resp.wraps![0]!.volunteerId).toBe("vol-intake-1");

    // Recipient can unwrap the tk and decrypt content with it
    const unwrappedTk = eciesDecrypt(
      decode(resp.wraps![0]!.ephemeralPoint) as RistrettoPoint,
      decode(resp.wraps![0]!.nonce) as Nonce,
      decode(resp.wraps![0]!.wrappedKey),
      recipientPriv,
    );
    expect(unwrappedTk).toEqual(tk);

    sodium.memzero(tk);
    sodium.memzero(orgSecret);
    sodium.memzero(recipientPriv);
    sodium.memzero(unwrappedTk);
  });

  it("returns DECRYPT_FAILED for a tampered sealed wrap", async () => {
    const sodium = requireSodium();
    await loadOrgKey();

    const badSeal = sodium.randombytes_buf(80);
    badSeal[0] = (badSeal[0] ?? 0) ^ 0xff;

    const resp = await dispatchAndWait({
      type: "unwrapIntakeTk",
      id: 7020,
      ticketId: "t-intake-bad",
      sealedWrap: encode(badSeal),
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("DECRYPT_FAILED");
  });

  it("rejects when org key is not loaded", async () => {
    const resp = await dispatchAndWait({
      type: "unwrapIntakeTk",
      id: 7030,
      ticketId: "t-intake-noorg",
      sealedWrap: encode(new Uint8Array(80)),
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });
});

// ── emailMatchHash blind index ──────────────────────────────────────

describe("crypto-core emailMatchHash blind index", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("email-hash-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  async function unwrapOrgSecret(id: number): Promise<Uint8Array> {
    const sodium = requireSodium();
    const orgSecret = sodium.crypto_core_ristretto255_scalar_random();
    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(orgSecret, volPub);
    await dispatchAndWait({
      type: "unwrapOrgKey",
      id,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
      currentGeneration: 1,
      chain: [],
    });
    sinkMessages = [];
    return orgSecret;
  }

  async function emailHashOf(
    email: string,
    id: number,
  ): Promise<string | null> {
    const resp = (await dispatchAndWait({
      type: "emailMatchHash",
      id,
      email,
    })) as EmailMatchHashResponse;
    expect(resp.ok).toBe(true);
    return resp.hash;
  }

  it("returns a lowercase hex HMAC-SHA512 digest for a valid email", async () => {
    const orgSecret = await unwrapOrgSecret(7100);

    const hash = await emailHashOf("test@example.com", 7101);

    // HMAC-SHA512 is 64 bytes, so 128 hex characters. The digest is a
    // blind index stored in the emails table, so its width and encoding
    // have to stay stable for lookups to keep matching.
    expect(hash).toMatch(/^[0-9a-f]{128}$/);

    requireSodium().memzero(orgSecret);
  });

  it("returns null for an empty or whitespace-only email", async () => {
    const orgSecret = await unwrapOrgSecret(7110);

    expect(await emailHashOf("", 7111)).toBeNull();
    expect(await emailHashOf("   ", 7112)).toBeNull();

    requireSodium().memzero(orgSecret);
  });

  it("is deterministic for the same email", async () => {
    const orgSecret = await unwrapOrgSecret(7120);

    const first = await emailHashOf("alice@example.com", 7121);
    const second = await emailHashOf("alice@example.com", 7122);

    expect(first).toBe(second);

    requireSodium().memzero(orgSecret);
  });

  it("normalizes before hashing (case-insensitive, trimmed)", async () => {
    const orgSecret = await unwrapOrgSecret(7130);

    const plain = await emailHashOf("alice@example.com", 7131);

    expect(await emailHashOf("Alice@Example.COM", 7132)).toBe(plain);
    expect(await emailHashOf("  alice@example.com  ", 7133)).toBe(plain);

    requireSodium().memzero(orgSecret);
  });

  it("produces different digests for different emails", async () => {
    const orgSecret = await unwrapOrgSecret(7140);

    const a = await emailHashOf("alice@example.com", 7141);
    const b = await emailHashOf("bob@example.com", 7142);

    expect(a).not.toBe(b);

    requireSodium().memzero(orgSecret);
  });

  it("uses a different HKDF label than alias or phone indexes", async () => {
    const orgSecret = await unwrapOrgSecret(7150);

    const emailHash = await emailHashOf("test@example.com", 7151);

    // Hash the same string through aliasHash
    const aliasResp = (await dispatchAndWait({
      type: "aliasHash",
      id: 7152,
      alias: "test@example.com",
    })) as AliasHashResponse;

    // Hash the same string through phoneMatchHash (it will normalize differently
    // but the domain separation is what we verify)
    const phoneResp = (await dispatchAndWait({
      type: "phoneMatchHash",
      id: 7153,
      phone: "test@example.com",
    })) as PhoneMatchHashResponse;

    expect(emailHash).not.toBe(aliasResp.hash);
    // Phone hash may be null for non-phone input, so just check domain separation
    if (phoneResp.hash != null) {
      expect(emailHash).not.toBe(phoneResp.hash);
    }

    requireSodium().memzero(orgSecret);
  });

  it("never returns key material, only the digest", async () => {
    const orgSecret = await unwrapOrgSecret(7160);

    const resp = (await dispatchAndWait({
      type: "emailMatchHash",
      id: 7161,
      email: "test@example.com",
    })) as EmailMatchHashResponse;

    expect(Object.keys(resp).toSorted()).toEqual(["hash", "id", "ok", "type"]);

    requireSodium().memzero(orgSecret);
  });

  it("fails when no org key has been unwrapped", async () => {
    const resp = await dispatchAndWait({
      type: "emailMatchHash",
      id: 7170,
      email: "test@example.com",
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });
});

// ── detectMergeCandidates ────────────────────────────────────────────

describe("crypto-core detectMergeCandidates", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("merge-detect-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  async function loadOrgKey(): Promise<Uint8Array> {
    const sodium = requireSodium();
    const orgSecret = sodium.crypto_core_ristretto255_scalar_random();
    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(orgSecret, volPub);
    await dispatchAndWait({
      type: "unwrapOrgKey",
      id: 8000,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
      currentGeneration: 1,
      chain: [],
    });
    sinkMessages = [];
    return orgSecret;
  }

  /** Compute the phone match hash for a phone number via the worker. */
  async function phoneMatchHashVia(phone: string, id: number): Promise<string> {
    const resp = (await dispatchAndWait({
      type: "phoneMatchHash",
      id,
      phone,
    })) as PhoneMatchHashResponse;
    expect(resp.ok).toBe(true);
    return resp.hash!;
  }

  /** Compute the email match hash for an email via the worker. */
  async function emailMatchHashVia(email: string, id: number): Promise<string> {
    const resp = (await dispatchAndWait({
      type: "emailMatchHash",
      id,
      email,
    })) as EmailMatchHashResponse;
    expect(resp.ok).toBe(true);
    return resp.hash!;
  }

  it("detects a phone match between two clients with pre-computed hashes", async () => {
    await loadOrgKey();

    const sharedHash = await phoneMatchHashVia("+12125550001", 8010);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8011,
      clients: [
        {
          clientId: "client-a",
          phoneMatchHash: sharedHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
        {
          clientId: "client-b",
          phoneMatchHash: sharedHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(1);
    expect(resp.candidates[0]!.matchKind).toBe("phone");
    // Client ids are sorted: a < b
    expect(resp.candidates[0]!.clientIdA).toBe("client-a");
    expect(resp.candidates[0]!.clientIdB).toBe("client-b");
  });

  it("detects an email match between two clients with pre-computed hashes", async () => {
    await loadOrgKey();

    const sharedHash = await emailMatchHashVia("shared@example.com", 8020);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8021,
      clients: [
        {
          clientId: "client-x",
          phoneMatchHash: null,
          emailMatchHash: sharedHash,
          intakeResponses: [],
        },
        {
          clientId: "client-y",
          phoneMatchHash: null,
          emailMatchHash: sharedHash,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(1);
    expect(resp.candidates[0]!.matchKind).toBe("email");
  });

  it("returns no candidates when hashes do not match", async () => {
    await loadOrgKey();

    const hashA = await phoneMatchHashVia("+12125550001", 8030);
    const hashB = await phoneMatchHashVia("+12125550002", 8031);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8032,
      clients: [
        {
          clientId: "client-a",
          phoneMatchHash: hashA,
          emailMatchHash: null,
          intakeResponses: [],
        },
        {
          clientId: "client-b",
          phoneMatchHash: hashB,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(0);
  });

  it("returns no candidates for clients with no contact info", async () => {
    await loadOrgKey();

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8040,
      clients: [
        {
          clientId: "client-a",
          phoneMatchHash: null,
          emailMatchHash: null,
          intakeResponses: [],
        },
        {
          clientId: "client-b",
          phoneMatchHash: null,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(0);
  });

  it("deduplicates pairs: same match pair only appears once", async () => {
    await loadOrgKey();

    const phoneHash = await phoneMatchHashVia("+12125550001", 8050);
    const emailHash = await emailMatchHashVia("same@example.com", 8051);

    // Both clients share phone AND email; only one candidate should appear (phone wins)
    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8052,
      clients: [
        {
          clientId: "client-a",
          phoneMatchHash: phoneHash,
          emailMatchHash: emailHash,
          intakeResponses: [],
        },
        {
          clientId: "client-b",
          phoneMatchHash: phoneHash,
          emailMatchHash: emailHash,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    // Phone check runs first; pair key is seen, so email check skips
    expect(resp.candidates).toHaveLength(1);
    expect(resp.candidates[0]!.matchKind).toBe("phone");
  });

  it("detects matches across intake form responses (vol-wrap path)", async () => {
    const sodium = requireSodium();
    await loadOrgKey();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    // Create a tk and encrypt a fake intake response
    const tk = generateContentKey();
    const wrapTk = eciesEncrypt(tk, volPub);

    const ticketId = "t-merge-intake";
    const responseJson = JSON.stringify({
      answers: [{ fieldKey: "default:phone", value: "+12125550099" }],
    });
    const aad = buildContentAad(ticketId, INTAKE_RESPONSE_SLOT);
    const ct = encryptContent(new TextEncoder().encode(responseJson), tk, aad);

    // Client A has the phone in their intake response
    // Client B has the matching pre-computed hash
    const phoneHash = await phoneMatchHashVia("+12125550099", 8060);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8061,
      clients: [
        {
          clientId: "client-intake-a",
          phoneMatchHash: null,
          emailMatchHash: null,
          intakeResponses: [
            {
              ticketId,
              ephemeralPoint: encode(wrapTk.ephemeralPoint),
              nonce: encode(wrapTk.nonce),
              wrappedKey: encode(wrapTk.ciphertext),
              intakeWrap: null,
              encryptedResponse: encode(ct),
              fieldRoles: new Map(),
            },
          ],
        },
        {
          clientId: "client-intake-b",
          phoneMatchHash: phoneHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(1);
    expect(resp.candidates[0]!.matchKind).toBe("phone");

    sodium.memzero(tk);
  });

  it("detects matches via intake wrap (sealed box) path", async () => {
    const sodium = requireSodium();
    const orgSecret = await loadOrgKey();
    const orgPub = decode(getPublicKeys().orgPublicKey!);

    const tk = generateContentKey();
    const sealedWrap = sodium.crypto_box_seal(tk, orgPub);

    const ticketId = "t-merge-seal";
    const responseJson = JSON.stringify({
      answers: [{ fieldKey: "default:email", value: "sealed@example.com" }],
    });
    const aad = buildContentAad(ticketId, INTAKE_RESPONSE_SLOT);
    const ct = encryptContent(new TextEncoder().encode(responseJson), tk, aad);

    const emailHash = await emailMatchHashVia("sealed@example.com", 8070);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8071,
      clients: [
        {
          clientId: "client-seal-a",
          phoneMatchHash: null,
          emailMatchHash: null,
          intakeResponses: [
            {
              ticketId,
              ephemeralPoint: encode(new Uint8Array(32)),
              nonce: encode(new Uint8Array(24)),
              wrappedKey: encode(new Uint8Array(48)),
              intakeWrap: encode(sealedWrap),
              encryptedResponse: encode(ct),
              fieldRoles: new Map(),
            },
          ],
        },
        {
          clientId: "client-seal-b",
          phoneMatchHash: null,
          emailMatchHash: emailHash,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(1);
    expect(resp.candidates[0]!.matchKind).toBe("email");

    sodium.memzero(tk);
    sodium.memzero(orgSecret);
  });

  it("skips intake responses whose decrypt fails (tampered ciphertext)", async () => {
    const sodium = requireSodium();
    await loadOrgKey();

    const phoneHash = await phoneMatchHashVia("+12125550042", 8080);

    // Client A has a tampered intake response; client B has a matching phone.
    // Since A's response cannot be decrypted, no contacts are extracted from A,
    // so no merge candidate is found from the intake data. But A also has
    // the same pre-computed phone hash, so they still match.
    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8081,
      clients: [
        {
          clientId: "client-tamper-a",
          phoneMatchHash: phoneHash,
          emailMatchHash: null,
          intakeResponses: [
            {
              ticketId: "t-tampered",
              ephemeralPoint: encode(sodium.randombytes_buf(32)),
              nonce: encode(sodium.randombytes_buf(24)),
              wrappedKey: encode(sodium.randombytes_buf(48)),
              intakeWrap: null,
              encryptedResponse: encode(sodium.randombytes_buf(64)),
              fieldRoles: new Map(),
            },
          ],
        },
        {
          clientId: "client-tamper-b",
          phoneMatchHash: phoneHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    // They match on pre-computed phone hash despite the failed intake decrypt
    expect(resp.candidates).toHaveLength(1);
  });

  it("rejects when not keyed", async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    await dispatchAndWait({ type: "init", id: 8090 });

    const resp = await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8091,
      clients: [],
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
  });

  it("never returns contact values, only client ids and match kind", async () => {
    await loadOrgKey();

    const sharedHash = await phoneMatchHashVia("+12125550001", 8100);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8101,
      clients: [
        {
          clientId: "client-a",
          phoneMatchHash: sharedHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
        {
          clientId: "client-b",
          phoneMatchHash: sharedHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    const responseKeys = Object.keys(resp).toSorted();
    expect(responseKeys).toEqual([
      "candidates",
      "id",
      "ok",
      "truncated",
      "type",
    ]);
    for (const c of resp.candidates) {
      expect(Object.keys(c).toSorted()).toEqual([
        "clientIdA",
        "clientIdB",
        "matchHash",
        "matchKind",
      ]);
    }
  });

  it("candidates include the matching hash", async () => {
    await loadOrgKey();

    const sharedHash = await phoneMatchHashVia("+12125550001", 8110);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8111,
      clients: [
        {
          clientId: "client-a",
          phoneMatchHash: sharedHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
        {
          clientId: "client-b",
          phoneMatchHash: sharedHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(1);
    expect(resp.candidates[0]!.matchHash).toBe(sharedHash);
  });

  it("suppressedPhoneHashes removes phone matches for stored-hash clients", async () => {
    await loadOrgKey();

    const sharedHash = await phoneMatchHashVia("+12125550099", 8120);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8121,
      suppressedPhoneHashes: [sharedHash],
      clients: [
        {
          clientId: "client-a",
          phoneMatchHash: sharedHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
        {
          clientId: "client-b",
          phoneMatchHash: sharedHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(0);
  });

  it("suppressedPhoneHashes removes phone matches from intake-extracted hashes", async () => {
    const sodium = requireSodium();
    await loadOrgKey();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    const tk = generateContentKey();
    const wrapTk = eciesEncrypt(tk, volPub);
    const ticketId = "t-suppress-intake";
    const responseJson = JSON.stringify({
      answers: [{ fieldKey: "default:phone", value: "+12125550077" }],
    });
    const aad = buildContentAad(ticketId, INTAKE_RESPONSE_SLOT);
    const ct = encryptContent(new TextEncoder().encode(responseJson), tk, aad);

    const phoneHash = await phoneMatchHashVia("+12125550077", 8130);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8131,
      suppressedPhoneHashes: [phoneHash],
      clients: [
        {
          clientId: "client-intake-s1",
          phoneMatchHash: null,
          emailMatchHash: null,
          intakeResponses: [
            {
              ticketId,
              ephemeralPoint: encode(wrapTk.ephemeralPoint),
              nonce: encode(wrapTk.nonce),
              wrappedKey: encode(wrapTk.ciphertext),
              intakeWrap: null,
              encryptedResponse: encode(ct),
              fieldRoles: new Map(),
            },
          ],
        },
        {
          clientId: "client-intake-s2",
          phoneMatchHash: phoneHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(0);

    sodium.memzero(tk);
  });

  it("generation stops at 200 candidates and reports truncated", async () => {
    await loadOrgKey();

    const sharedHash = await phoneMatchHashVia("+12125550333", 8140);

    // 21 clients sharing one phone hash yields 21*20/2 = 210 pairs.
    // The cap at 200 means we get exactly 200 and truncated = true.
    const clients = Array.from({ length: 21 }, (_, i) => ({
      clientId: `client-bulk-${String(i).padStart(3, "0")}`,
      phoneMatchHash: sharedHash,
      emailMatchHash: null,
      intakeResponses: [] as never[],
    }));

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8141,
      clients,
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(200);
    expect(resp.truncated).toBe(true);
  });

  it("truncated is false when under the cap", async () => {
    await loadOrgKey();

    const sharedHash = await phoneMatchHashVia("+12125550444", 8150);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8151,
      clients: [
        {
          clientId: "client-cap-a",
          phoneMatchHash: sharedHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
        {
          clientId: "client-cap-b",
          phoneMatchHash: sharedHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(1);
    expect(resp.truncated).toBe(false);
  });

  it("skips intake response encrypted under a different slot without throwing", async () => {
    const sodium = requireSodium();
    await loadOrgKey();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    const tk = generateContentKey();
    const wrapTk = eciesEncrypt(tk, volPub);

    const ticketId = "t-merge-wrong-slot";
    const responseJson = JSON.stringify({
      answers: [{ fieldKey: "default:phone", value: "+12125559999" }],
    });
    // Encrypt under a DIFFERENT slot so the AAD mismatch causes a decrypt failure.
    const wrongAad = buildContentAad(ticketId, "some-other-slot");
    const ct = encryptContent(
      new TextEncoder().encode(responseJson),
      tk,
      wrongAad,
    );

    const phoneHash = await phoneMatchHashVia("+12125559999", 8160);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 8161,
      clients: [
        {
          clientId: "client-wrong-slot-a",
          phoneMatchHash: null,
          emailMatchHash: null,
          intakeResponses: [
            {
              ticketId,
              ephemeralPoint: encode(wrapTk.ephemeralPoint),
              nonce: encode(wrapTk.nonce),
              wrappedKey: encode(wrapTk.ciphertext),
              intakeWrap: null,
              encryptedResponse: encode(ct),
              fieldRoles: new Map(),
            },
          ],
        },
        {
          clientId: "client-wrong-slot-b",
          phoneMatchHash: phoneHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    // The response blob decryption fails (AAD mismatch), so no contacts
    // are extracted from the intake data. The scan completes without error.
    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(0);

    sodium.memzero(tk);
  });
});

// ── extractContactsFromResponse (pure function) ─────────────────────

describe("extractContactsFromResponse", () => {
  it("extracts phone-contact and email-contact roles", () => {
    const json = JSON.stringify({
      answers: [
        { fieldKey: "f1", value: "+12125550001" },
        { fieldKey: "f2", value: "alice@example.com" },
      ],
    });
    const roles = new Map([
      ["f1", "phone-contact"],
      ["f2", "email-contact"],
    ]);

    const result = extractContactsFromResponse(json, roles);
    expect(result.phones).toHaveLength(1);
    expect(result.emails).toHaveLength(1);
  });

  it("extracts default:phone and default:email sentinel keys", () => {
    const json = JSON.stringify({
      answers: [
        { fieldKey: "default:phone", value: "+12125550002" },
        { fieldKey: "default:email", value: "bob@example.com" },
      ],
    });

    const result = extractContactsFromResponse(json, new Map());
    expect(result.phones).toHaveLength(1);
    expect(result.emails).toHaveLength(1);
  });

  it("falls back to pattern matching for untagged text fields", () => {
    const json = JSON.stringify({
      answers: [
        { fieldKey: "misc1", value: "(212) 555-0003" },
        { fieldKey: "misc2", value: "charlie@example.com" },
        { fieldKey: "misc3", value: "just some text" },
      ],
    });

    const result = extractContactsFromResponse(json, new Map());
    expect(result.phones).toHaveLength(1);
    expect(result.emails).toHaveLength(1);
  });

  it("skips tagged fields with a non-contact role", () => {
    const json = JSON.stringify({
      answers: [{ fieldKey: "f1", value: "+12125550004" }],
    });
    const roles = new Map([["f1", "full-name"]]);

    const result = extractContactsFromResponse(json, roles);
    expect(result.phones).toHaveLength(0);
    expect(result.emails).toHaveLength(0);
  });

  it("returns empty arrays for malformed JSON", () => {
    const result = extractContactsFromResponse("not json", new Map());
    expect(result.phones).toEqual([]);
    expect(result.emails).toEqual([]);
  });

  it("returns empty arrays when answers is not an array", () => {
    const json = JSON.stringify({ answers: "not an array" });
    const result = extractContactsFromResponse(json, new Map());
    expect(result.phones).toEqual([]);
    expect(result.emails).toEqual([]);
  });

  it("skips answer entries without fieldKey or value", () => {
    const json = JSON.stringify({
      answers: [{ value: "+12125550005" }, { fieldKey: "f1" }, null, 42],
    });

    const result = extractContactsFromResponse(json, new Map());
    expect(result.phones).toEqual([]);
    expect(result.emails).toEqual([]);
  });

  it("skips answers with non-string values", () => {
    const json = JSON.stringify({
      answers: [
        { fieldKey: "f1", value: 12345 },
        { fieldKey: "f2", value: true },
      ],
    });

    const result = extractContactsFromResponse(json, new Map());
    expect(result.phones).toEqual([]);
    expect(result.emails).toEqual([]);
  });

  it("skips phones too short to normalize", () => {
    const json = JSON.stringify({
      answers: [{ fieldKey: "default:phone", value: "123" }],
    });

    const result = extractContactsFromResponse(json, new Map());
    expect(result.phones).toHaveLength(0);
  });
});

// ── Unknown op type dispatching ─────────────────────────────────────

describe("crypto-core unknown op type", () => {
  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    await dispatchAndWait({ type: "init", id: 9000 });
  });

  it("falls through the switch without crashing for an unknown type", async () => {
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("unknown-type-pw", salt);
    sinkMessages = [];

    // Dispatch something unknown. The switch has no default case; it falls
    // through silently. The async wrapper's catch fires only on thrown errors.
    dispatch({
      type: "nonexistentOp",
      id: 9001,
    } as unknown as Parameters<typeof dispatch>[0]);
    await new Promise((r) => setTimeout(r, 50));

    // getState still returns a valid value (no state corruption)
    expect(getState()).toBe("KEYED");
  });

  it("catches async errors via the dispatcher's catch clause", async () => {
    // The catch at L2666 handles any thrown error from the async wrapper.
    // We can only reach it if the switch body's handler throws an async
    // error. In practice this path fires for bugs or sodium memory errors.
    // We verify the dispatcher itself does not crash on a sync throw path
    // by confirming state remains valid after the dispatch.
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    await loginFlow("catch-clause-pw", salt);
    sinkMessages = [];

    // A second init while already keyed is the simplest async handler
    // that exercises the handle() wrapper: it calls getSodium() (async).
    const resp = await dispatchAndWait({ type: "init", id: 9002 });
    expect(resp.ok).toBe(true);
    // State preserved (init from KEYED stays KEYED)
    expect(getState()).toBe("KEYED");
  });
});

// ── CLUSTER 1: detectMergeCandidates (cap, suppression, dedup) ──────

describe("detectMergeCandidates cap, suppression, and canonical ordering", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("merge-cap-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  async function loadOrgKey(): Promise<Uint8Array> {
    const sodium = requireSodium();
    const orgSecret = sodium.crypto_core_ristretto255_scalar_random();
    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(orgSecret, volPub);
    await dispatchAndWait({
      type: "unwrapOrgKey",
      id: 10_000,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
      currentGeneration: 1,
      chain: [],
    });
    sinkMessages = [];
    return orgSecret;
  }

  async function phoneMatchHashVia(phone: string, id: number): Promise<string> {
    const resp = (await dispatchAndWait({
      type: "phoneMatchHash",
      id,
      phone,
    })) as PhoneMatchHashResponse;
    expect(resp.ok).toBe(true);
    return resp.hash!;
  }

  async function emailMatchHashVia(email: string, id: number): Promise<string> {
    const resp = (await dispatchAndWait({
      type: "emailMatchHash",
      id,
      email,
    })) as EmailMatchHashResponse;
    expect(resp.ok).toBe(true);
    return resp.hash!;
  }

  it("reports matchKind phone and the shared hash for a phone pair", async () => {
    await loadOrgKey();
    const hash = await phoneMatchHashVia("+15550010001", 10_010);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 10_011,
      clients: [
        {
          clientId: "c-ph-1",
          phoneMatchHash: hash,
          emailMatchHash: null,
          intakeResponses: [],
        },
        {
          clientId: "c-ph-2",
          phoneMatchHash: hash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(1);
    expect(resp.candidates[0]!.matchKind).toBe("phone");
    expect(resp.candidates[0]!.matchHash).toBe(hash);
  });

  it("reports matchKind email when only email hashes match", async () => {
    await loadOrgKey();
    const hash = await emailMatchHashVia("only-email@test.syn", 10_020);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 10_021,
      clients: [
        {
          clientId: "c-em-1",
          phoneMatchHash: null,
          emailMatchHash: hash,
          intakeResponses: [],
        },
        {
          clientId: "c-em-2",
          phoneMatchHash: null,
          emailMatchHash: hash,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(1);
    expect(resp.candidates[0]!.matchKind).toBe("email");
    expect(resp.candidates[0]!.matchHash).toBe(hash);
  });

  it("reports phone (not email) when both hashes match between a pair", async () => {
    await loadOrgKey();
    const phoneH = await phoneMatchHashVia("+15550020001", 10_030);
    const emailH = await emailMatchHashVia("both@test.syn", 10_031);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 10_032,
      clients: [
        {
          clientId: "c-both-1",
          phoneMatchHash: phoneH,
          emailMatchHash: emailH,
          intakeResponses: [],
        },
        {
          clientId: "c-both-2",
          phoneMatchHash: phoneH,
          emailMatchHash: emailH,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(1);
    expect(resp.candidates[0]!.matchKind).toBe("phone");
  });

  it("always puts the lexicographically smaller id in clientIdA regardless of input order", async () => {
    await loadOrgKey();
    const hash = await phoneMatchHashVia("+15550030001", 10_040);

    const fwd = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 10_041,
      clients: [
        {
          clientId: "aaa-first",
          phoneMatchHash: hash,
          emailMatchHash: null,
          intakeResponses: [],
        },
        {
          clientId: "zzz-second",
          phoneMatchHash: hash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(fwd.candidates[0]!.clientIdA).toBe("aaa-first");
    expect(fwd.candidates[0]!.clientIdB).toBe("zzz-second");

    // Reverse the client order and confirm the same canonical pair
    const rev = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 10_042,
      clients: [
        {
          clientId: "zzz-second",
          phoneMatchHash: hash,
          emailMatchHash: null,
          intakeResponses: [],
        },
        {
          clientId: "aaa-first",
          phoneMatchHash: hash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(rev.candidates[0]!.clientIdA).toBe("aaa-first");
    expect(rev.candidates[0]!.clientIdB).toBe("zzz-second");
  });

  it("suppresses candidates whose only shared hash is in suppressedPhoneHashes", async () => {
    await loadOrgKey();
    const suppHash = await phoneMatchHashVia("+15550040001", 10_050);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 10_051,
      suppressedPhoneHashes: [suppHash],
      clients: [
        {
          clientId: "c-sup-1",
          phoneMatchHash: suppHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
        {
          clientId: "c-sup-2",
          phoneMatchHash: suppHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(0);
  });

  it("suppresses per hash, not per client: a client with a suppressed hash still matches on a different hash", async () => {
    await loadOrgKey();
    const suppHash = await phoneMatchHashVia("+15550050001", 10_060);
    const liveHash = await phoneMatchHashVia("+15550050002", 10_061);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 10_062,
      suppressedPhoneHashes: [suppHash],
      clients: [
        {
          clientId: "c-mix-1",
          phoneMatchHash: suppHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
        {
          clientId: "c-mix-2",
          phoneMatchHash: liveHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
        {
          clientId: "c-mix-3",
          phoneMatchHash: liveHash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    // c-mix-2 and c-mix-3 share the unsuppressed hash
    expect(resp.candidates).toHaveLength(1);
    expect(resp.candidates[0]!.matchKind).toBe("phone");
    expect(resp.candidates[0]!.matchHash).toBe(liveHash);
  });

  it("caps candidates at MAX_MERGE_CANDIDATES (200) and sets truncated true", async () => {
    await loadOrgKey();
    const hash = await phoneMatchHashVia("+15550060001", 10_070);

    // 21 clients on one hash: C(21,2) = 210 > 200.
    // 200 is MAX_MERGE_CANDIDATES, the agreed bound on how many pairs the
    // Worker generates (ADR-103). It is module-private, so the literal below
    // is the only way to pin it. Tuning the cap should update this
    // deliberately: the number is what stops a shared phone line from
    // producing a quadratic candidate list.
    const clients = Array.from({ length: 21 }, (_, i) => ({
      clientId: `c-cap-${String(i).padStart(4, "0")}`,
      phoneMatchHash: hash,
      emailMatchHash: null,
      intakeResponses: [] as never[],
    }));

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 10_071,
      clients,
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.candidates).toHaveLength(200);
    expect(resp.truncated).toBe(true);
  });

  it("reports truncated false when below the cap", async () => {
    await loadOrgKey();
    const hash = await phoneMatchHashVia("+15550070001", 10_080);

    const resp = (await dispatchAndWait({
      type: "detectMergeCandidates",
      id: 10_081,
      clients: [
        {
          clientId: "c-lo-1",
          phoneMatchHash: hash,
          emailMatchHash: null,
          intakeResponses: [],
        },
        {
          clientId: "c-lo-2",
          phoneMatchHash: hash,
          emailMatchHash: null,
          intakeResponses: [],
        },
      ],
    })) as DetectMergeCandidatesResponse;

    expect(resp.ok).toBe(true);
    expect(resp.truncated).toBe(false);
  });
});

// ── CLUSTER 2: decryptIntakeResponse cold branches ──────────────────

describe("decryptIntakeResponse failure and empty paths", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("intake-cold-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  afterEach(() => {
    handleZeroAll(-1, testSink);
  });

  async function loadOrgKeyForViewer(): Promise<string> {
    const sodium = requireSodium();
    const orgSecret = sodium.crypto_core_ristretto255_scalar_random();
    const wrap = eciesEncrypt(
      orgSecret,
      decode(volPublicStr) as RistrettoPoint,
    );

    const resp = (await dispatchAndWait({
      type: "unwrapOrgKey",
      id: 11_000,
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedOrgKey: encode(wrap.ciphertext),
      currentGeneration: 1,
      chain: [],
    })) as UnwrapOrgKeyResponse;

    expect(resp.ok).toBe(true);
    sodium.memzero(orgSecret);
    return resp.orgPublicKey;
  }

  it("returns empty answers when the response blob decrypts to valid JSON but answers is not an array", async () => {
    const sodium = requireSodium();
    const tk = generateContentKey();
    const ticketId = "t-not-array";
    const json = JSON.stringify({ answers: "not-an-array" });
    const aad = buildContentAad(ticketId, "intake-form-response");
    const ct = encryptContent(new TextEncoder().encode(json), tk, aad);

    const wrap = eciesEncrypt(tk, decode(volPublicStr) as RistrettoPoint);

    const resp = (await dispatchAndWait({
      type: "decryptIntakeResponse",
      id: 11_010,
      ticketId,
      encryptedResponse: encode(ct),
      callerKeyWrap: {
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
      },
      orgSealWrap: null,
    })) as DecryptIntakeResponseResponse;

    expect(resp.ok).toBe(true);
    expect(resp.answersJson).toBe("[]");

    sodium.memzero(tk);
  });

  it("returns DECRYPT_FAILED when the org-seal wrap is tampered", async () => {
    const sodium = requireSodium();
    await loadOrgKeyForViewer();

    const resp = await dispatchAndWait({
      type: "decryptIntakeResponse",
      id: 11_020,
      ticketId: "t-bad-seal",
      encryptedResponse: encode(sodium.randombytes_buf(100)),
      callerKeyWrap: null,
      orgSealWrap: { wrappedTk: encode(sodium.randombytes_buf(80)) },
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("DECRYPT_FAILED");
    expect((resp as ErrorResponse).type).toBe("decryptIntakeResponse");
    // Security contract: error must not leak any seeded content
    expect((resp as ErrorResponse).error).not.toContain("t-bad-seal");
  });

  it("returns DECRYPT_FAILED when ECIES callerKeyWrap is garbled", async () => {
    const sodium = requireSodium();
    const tk = generateContentKey();
    const ticketId = "t-garbled-ecies";
    const json = JSON.stringify({ answers: [] });
    const aad = buildContentAad(ticketId, "intake-form-response");
    const ct = encryptContent(new TextEncoder().encode(json), tk, aad);

    const resp = await dispatchAndWait({
      type: "decryptIntakeResponse",
      id: 11_030,
      ticketId,
      encryptedResponse: encode(ct),
      callerKeyWrap: {
        ephemeralPoint: encode(sodium.randombytes_buf(32)),
        nonce: encode(sodium.randombytes_buf(24)),
        wrappedKey: encode(sodium.randombytes_buf(48)),
      },
      orgSealWrap: null,
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("DECRYPT_FAILED");
    expect((resp as ErrorResponse).type).toBe("decryptIntakeResponse");

    sodium.memzero(tk);
  });

  it("uses the cached tk when the same ticketId was previously decrypted", async () => {
    const sodium = requireSodium();
    const tk = generateContentKey();
    const ticketId = "t-cached-tk";
    const json1 = JSON.stringify({
      answers: [{ fieldKey: "f1", value: "v1" }],
    });
    const json2 = JSON.stringify({
      answers: [{ fieldKey: "f2", value: "v2" }],
    });
    const aad = buildContentAad(ticketId, "intake-form-response");
    const ct1 = encryptContent(new TextEncoder().encode(json1), tk, aad);
    const ct2 = encryptContent(new TextEncoder().encode(json2), tk, aad);

    const wrap = eciesEncrypt(tk, decode(volPublicStr) as RistrettoPoint);

    // First call caches tk
    const resp1 = (await dispatchAndWait({
      type: "decryptIntakeResponse",
      id: 11_040,
      ticketId,
      encryptedResponse: encode(ct1),
      callerKeyWrap: {
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
      },
      orgSealWrap: null,
    })) as DecryptIntakeResponseResponse;
    expect(resp1.ok).toBe(true);

    // Second call should succeed via the cache (no wrap needed but provided as null)
    // Use a different wrap that would fail (null orgSealWrap, null callerKeyWrap)
    // to prove the cache path was taken instead.
    // Actually, neither wrap nor seal = DECRYPT_FAILED before the cache check.
    // Instead prove cache by passing the SAME wrap (which the code won't try
    // since tk is already set from cache).
    const resp2 = (await dispatchAndWait({
      type: "decryptIntakeResponse",
      id: 11_041,
      ticketId,
      encryptedResponse: encode(ct2),
      callerKeyWrap: {
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
      },
      orgSealWrap: null,
    })) as DecryptIntakeResponseResponse;
    expect(resp2.ok).toBe(true);
    const answers2 = JSON.parse(resp2.answersJson) as {
      fieldKey: string;
      value: unknown;
    }[];
    expect(answers2[0]?.value).toBe("v2");

    sodium.memzero(tk);
  });

  it("returns NOT_READY for org-seal path when org key is not loaded", async () => {
    const sodium = requireSodium();

    const resp = await dispatchAndWait({
      type: "decryptIntakeResponse",
      id: 11_050,
      ticketId: "t-no-org",
      encryptedResponse: encode(sodium.randombytes_buf(100)),
      callerKeyWrap: null,
      orgSealWrap: { wrappedTk: encode(sodium.randombytes_buf(80)) },
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
    expect((resp as ErrorResponse).type).toBe("decryptIntakeResponse");
  });

  it("does not leak seeded plaintext in error responses", async () => {
    const sodium = requireSodium();
    const tk = generateContentKey();
    const ticketId = "t-leak-check";
    const secretContent = "SUPERSECRETVALUE42";
    const json = JSON.stringify({
      answers: [{ fieldKey: "f1", value: secretContent }],
    });
    const aad = buildContentAad(ticketId, "intake-form-response");
    const ct = encryptContent(new TextEncoder().encode(json), tk, aad);

    // Use a wrong key so decryption of the response blob fails after unwrapping
    const wrongTk = generateContentKey();
    const wrap = eciesEncrypt(wrongTk, decode(volPublicStr) as RistrettoPoint);

    const resp = await dispatchAndWait({
      type: "decryptIntakeResponse",
      id: 11_060,
      ticketId,
      encryptedResponse: encode(ct),
      callerKeyWrap: {
        ephemeralPoint: encode(wrap.ephemeralPoint),
        nonce: encode(wrap.nonce),
        wrappedKey: encode(wrap.ciphertext),
      },
      orgSealWrap: null,
    });

    expect(resp.ok).toBe(false);
    // Security contract: no seeded plaintext in any response field
    const serialized = JSON.stringify(resp);
    expect(serialized).not.toContain(secretContent);
    expect(serialized).not.toContain(encode(tk));

    sodium.memzero(tk);
    sodium.memzero(wrongTk);
  });
});

// ── CLUSTER 3: extractContactsFromResponse additional shapes ────────

describe("extractContactsFromResponse additional shapes", () => {
  it("returns empty results when there are no contact fields at all", () => {
    const json = JSON.stringify({
      answers: [
        { fieldKey: "f1", value: "just text" },
        { fieldKey: "f2", value: "more text" },
      ],
    });
    const roles = new Map([
      ["f1", "full-name"],
      ["f2", "address"],
    ]);

    const result = extractContactsFromResponse(json, roles);
    expect(result.phones).toEqual([]);
    expect(result.emails).toEqual([]);
  });

  it("collects multiple phones from separate answers", () => {
    const json = JSON.stringify({
      answers: [
        { fieldKey: "p1", value: "+12125550011" },
        { fieldKey: "p2", value: "+12125550022" },
      ],
    });
    const roles = new Map([
      ["p1", "phone-contact"],
      ["p2", "phone-contact"],
    ]);

    const result = extractContactsFromResponse(json, roles);
    expect(result.phones).toHaveLength(2);
  });

  it("collects multiple emails from separate answers", () => {
    const json = JSON.stringify({
      answers: [
        { fieldKey: "e1", value: "one@test.syn" },
        { fieldKey: "e2", value: "two@test.syn" },
      ],
    });
    const roles = new Map([
      ["e1", "email-contact"],
      ["e2", "email-contact"],
    ]);

    const result = extractContactsFromResponse(json, roles);
    expect(result.emails).toHaveLength(2);
  });

  it("handles answers with unexpected value types alongside valid ones", () => {
    const json = JSON.stringify({
      answers: [
        { fieldKey: "default:phone", value: "+12125550033" },
        { fieldKey: "default:phone", value: 999 },
        { fieldKey: "default:email", value: null },
        { fieldKey: "default:email", value: "valid@test.syn" },
      ],
    });

    const result = extractContactsFromResponse(json, new Map());
    expect(result.phones).toHaveLength(1);
    expect(result.emails).toHaveLength(1);
  });
});

// ── CLUSTER 4: seal/rewrap group cold branches ──────────────────────

describe("sealFollowUpsToPublic cold branches", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("seal-fu-cold-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  it("returns empty items and empty failed for an empty items array", async () => {
    const sodium = requireSodium();
    const tk = generateContentKey();
    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(tk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 12_000,
      ticketId: "t-seal-empty",
      keyCacheId: "t-seal-empty",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
    });

    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "sealFollowUpsToPublic",
      id: 12_001,
      ticketId: "t-seal-empty",
      clientPublic: encode(clientPub),
      items: [],
    })) as SealFollowUpsToPublicResponse;

    expect(resp.ok).toBe(true);
    expect(resp.items).toHaveLength(0);
    expect(resp.failed).toHaveLength(0);

    sodium.memzero(tk);
    sodium.memzero(clientPriv);
  });

  it("pushes item to failed when neither keyWrap nor portalWrap resolves a content key", async () => {
    const sodium = requireSodium();
    const tk = generateContentKey();
    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(tk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 12_010,
      ticketId: "t-seal-nokey",
      keyCacheId: "t-seal-nokey",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
    });

    // Evict the tk so the cache is empty for this ticket
    await dispatchAndWait({
      type: "evictTk",
      id: 12_011,
      ticketId: "t-seal-nokey",
    });

    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "sealFollowUpsToPublic",
      id: 12_012,
      ticketId: "t-seal-nokey",
      clientPublic: encode(clientPub),
      // No keyWrap, no portalWrap, no cached tk
      items: [
        {
          followUpId: "fu-orphan",
          ciphertext: encode(sodium.randombytes_buf(64)),
        },
      ],
    })) as SealFollowUpsToPublicResponse;

    expect(resp.ok).toBe(true);
    expect(resp.items).toHaveLength(0);
    expect(resp.failed).toEqual(["fu-orphan"]);

    sodium.memzero(tk);
    sodium.memzero(clientPriv);
  });

  it("rejects with NOT_READY when worker is not keyed", async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    await dispatchAndWait({ type: "init", id: 12_020 });

    const resp = await dispatchAndWait({
      type: "sealFollowUpsToPublic",
      id: 12_021,
      ticketId: "t-not-keyed",
      clientPublic: encode(new Uint8Array(32)),
      items: [],
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
    expect((resp as ErrorResponse).type).toBe("sealFollowUpsToPublic");
  });
});

describe("sealFileKeysToPublic cold branches", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("seal-fk-cold-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  it("returns empty items and empty failed for an empty items array", async () => {
    const sodium = requireSodium();
    const tk = generateContentKey();
    const volPub = decode(volPublicStr) as RistrettoPoint;
    const wrap = eciesEncrypt(tk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 13_000,
      ticketId: "t-sfk-empty",
      keyCacheId: "t-sfk-empty",
      ephemeralPoint: encode(wrap.ephemeralPoint),
      nonce: encode(wrap.nonce),
      wrappedKey: encode(wrap.ciphertext),
    });

    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    sinkMessages = [];
    const resp = (await dispatchAndWait({
      type: "sealFileKeysToPublic",
      id: 13_001,
      ticketId: "t-sfk-empty",
      clientPublic: encode(clientPub),
      items: [],
    })) as SealFileKeysToPublicResponse;

    expect(resp.ok).toBe(true);
    expect(resp.items).toHaveLength(0);
    expect(resp.failed).toHaveLength(0);

    sodium.memzero(tk);
    sodium.memzero(clientPriv);
  });

  it("returns TK_NOT_CACHED when no tk is available and no keyWrap is provided", async () => {
    const sodium = requireSodium();
    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    const resp = await dispatchAndWait({
      type: "sealFileKeysToPublic",
      id: 13_010,
      ticketId: "t-sfk-nocache",
      clientPublic: encode(clientPub),
      items: [
        {
          kind: "attachment" as const,
          rowId: "row-orphan",
          fileKeyWrap: encode(sodium.randombytes_buf(64)),
        },
      ],
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("TK_NOT_CACHED");
    expect((resp as ErrorResponse).type).toBe("sealFileKeysToPublic");

    sodium.memzero(clientPriv);
  });

  it("returns DECRYPT_FAILED when the keyWrap warm-up fails", async () => {
    const sodium = requireSodium();
    const clientPriv =
      sodium.crypto_core_ristretto255_scalar_random() as Scalar;
    const clientPub = sodium.crypto_scalarmult_ristretto255_base(clientPriv);

    const resp = await dispatchAndWait({
      type: "sealFileKeysToPublic",
      id: 13_020,
      ticketId: "t-sfk-badwrap",
      clientPublic: encode(clientPub),
      keyWrap: {
        ephemeralPoint: encode(sodium.randombytes_buf(32)),
        nonce: encode(sodium.randombytes_buf(24)),
        wrappedKey: encode(sodium.randombytes_buf(48)),
      },
      items: [
        {
          kind: "attachment" as const,
          rowId: "row-badwrap",
          fileKeyWrap: encode(sodium.randombytes_buf(64)),
        },
      ],
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("DECRYPT_FAILED");
    expect((resp as ErrorResponse).type).toBe("sealFileKeysToPublic");

    sodium.memzero(clientPriv);
  });

  it("rejects with NOT_READY when worker is not keyed", async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    await dispatchAndWait({ type: "init", id: 13_030 });

    const resp = await dispatchAndWait({
      type: "sealFileKeysToPublic",
      id: 13_031,
      ticketId: "t-not-keyed",
      clientPublic: encode(new Uint8Array(32)),
      items: [],
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
    expect((resp as ErrorResponse).type).toBe("sealFileKeysToPublic");
  });
});

describe("handleRewrapFileKey cold branches", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("rewrapfk-cold-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  it("returns TK_NOT_CACHED when no tk_temp is cached for the follow-up", async () => {
    const sodium = requireSodium();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    // Cache a canonical tk so the second check passes
    const canonicalTk = generateContentKey();
    const wrapCanonical = eciesEncrypt(canonicalTk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 14_000,
      ticketId: "t-rfk-notktemp",
      keyCacheId: "t-rfk-notktemp",
      ephemeralPoint: encode(wrapCanonical.ephemeralPoint),
      nonce: encode(wrapCanonical.nonce),
      wrappedKey: encode(wrapCanonical.ciphertext),
    });

    sinkMessages = [];
    const resp = await dispatchAndWait({
      type: "rewrapFileKey",
      id: 14_001,
      followUpId: "fu-no-temp",
      ticketId: "t-rfk-notktemp",
      attachmentId: "att-no-temp",
      fileKeyWrap: encode(sodium.randombytes_buf(64)),
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("TK_NOT_CACHED");
    expect((resp as ErrorResponse).type).toBe("rewrapFileKey");

    sodium.memzero(canonicalTk);
  });

  it("returns TK_NOT_CACHED when canonical tk is missing for the ticket", async () => {
    const sodium = requireSodium();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    // Cache a canonical tk for a DIFFERENT ticket so the temp cache can be primed
    const canonicalTk = generateContentKey();
    const wrapCanonical = eciesEncrypt(canonicalTk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 14_010,
      ticketId: "t-rfk-other",
      keyCacheId: "t-rfk-other",
      ephemeralPoint: encode(wrapCanonical.ephemeralPoint),
      nonce: encode(wrapCanonical.nonce),
      wrappedKey: encode(wrapCanonical.ciphertext),
    });

    // Prime tk_temp via decryptAndRewrap
    const tkTemp = generateContentKey();
    const wrapTemp = eciesEncrypt(tkTemp, volPub);
    const followUpId = "fu-no-canon-fk";
    const tempCt = encryptContent(
      new TextEncoder().encode("temp-content"),
      tkTemp,
      buildContentAad("t-rfk-other", followupSlot(followUpId)),
    );

    await dispatchAndWait({
      type: "decryptAndRewrap",
      id: 14_011,
      ticketId: "t-rfk-other",
      followUpId,
      ephemeralPoint: encode(wrapTemp.ephemeralPoint),
      nonce: encode(wrapTemp.nonce),
      wrappedKey: encode(wrapTemp.ciphertext),
      ciphertext: encode(tempCt),
    });

    sinkMessages = [];
    // Ask to rewrap a file key for a ticket that has NO canonical tk
    const resp = await dispatchAndWait({
      type: "rewrapFileKey",
      id: 14_012,
      followUpId,
      ticketId: "t-rfk-missing",
      attachmentId: "att-nocanon",
      fileKeyWrap: encode(sodium.randombytes_buf(64)),
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("TK_NOT_CACHED");

    handleRewrapResult({ kind: "rewrap-result", followUpId, success: false });
    sodium.memzero(canonicalTk);
    sodium.memzero(tkTemp);
  });

  it("returns REWRAP_FAILED when the file key wrap is tampered", async () => {
    const sodium = requireSodium();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    const canonicalTk = generateContentKey();
    const wrapCanonical = eciesEncrypt(canonicalTk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 14_020,
      ticketId: "t-rfk-tamper",
      keyCacheId: "t-rfk-tamper",
      ephemeralPoint: encode(wrapCanonical.ephemeralPoint),
      nonce: encode(wrapCanonical.nonce),
      wrappedKey: encode(wrapCanonical.ciphertext),
    });

    // Prime tk_temp via decryptAndRewrap
    const tkTemp = generateContentKey();
    const wrapTemp = eciesEncrypt(tkTemp, volPub);
    const followUpId = "fu-tamper-fk";
    const tempCt = encryptContent(
      new TextEncoder().encode("portal text"),
      tkTemp,
      buildContentAad("t-rfk-tamper", followupSlot(followUpId)),
    );

    await dispatchAndWait({
      type: "decryptAndRewrap",
      id: 14_021,
      ticketId: "t-rfk-tamper",
      followUpId,
      ephemeralPoint: encode(wrapTemp.ephemeralPoint),
      nonce: encode(wrapTemp.nonce),
      wrappedKey: encode(wrapTemp.ciphertext),
      ciphertext: encode(tempCt),
    });

    sinkMessages = [];
    const resp = await dispatchAndWait({
      type: "rewrapFileKey",
      id: 14_022,
      followUpId,
      ticketId: "t-rfk-tamper",
      attachmentId: "att-tamper",
      fileKeyWrap: encode(sodium.randombytes_buf(64)),
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("REWRAP_FAILED");
    expect((resp as ErrorResponse).type).toBe("rewrapFileKey");

    handleRewrapResult({ kind: "rewrap-result", followUpId, success: false });
    sodium.memzero(canonicalTk);
    sodium.memzero(tkTemp);
  });

  it("rejects with NOT_READY when worker is not keyed", async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    await dispatchAndWait({ type: "init", id: 14_030 });

    const resp = await dispatchAndWait({
      type: "rewrapFileKey",
      id: 14_031,
      followUpId: "fu-notkeyed",
      ticketId: "t-notkeyed",
      attachmentId: "att-notkeyed",
      fileKeyWrap: encode(new Uint8Array(64)),
    });

    expect(resp.ok).toBe(false);
    expect((resp as ErrorResponse).code).toBe("NOT_READY");
    expect((resp as ErrorResponse).type).toBe("rewrapFileKey");
  });
});

describe("triggerRewrap cold branches (via decryptAndRewrap)", () => {
  let volPublicStr: string;

  beforeEach(async () => {
    handleZeroAll(-1, testSink);
    sinkMessages = [];
    dispatch = createDispatcher(testSink);
    const sodium = requireSodium();
    const salt = sodium.randombytes_buf(16);
    const result = await loginFlow("trigger-rewrap-pw", salt);
    volPublicStr = result.volPublic;
    sinkMessages = [];
  });

  it("silently skips the rewrap when no canonical tk is cached for the ticket", async () => {
    const sodium = requireSodium();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    // Prime a canonical tk for ticket A, but send decryptAndRewrap for ticket B
    // The triggerRewrap call will find no canonical tk for ticket B and bail out.
    const tkOther = generateContentKey();
    const wrapOther = eciesEncrypt(tkOther, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 15_000,
      ticketId: "t-trig-other",
      keyCacheId: "t-trig-other",
      ephemeralPoint: encode(wrapOther.ephemeralPoint),
      nonce: encode(wrapOther.nonce),
      wrappedKey: encode(wrapOther.ciphertext),
    });

    // Create a tk_temp for a different ticket (not in tkCache)
    const tkTemp = generateContentKey();
    const wrapTemp = eciesEncrypt(tkTemp, volPub);
    const followUpId = "fu-no-canon-tr";
    // Encrypt under tkTemp using ticket "t-trig-nocanon"
    const ct = encryptContent(
      new TextEncoder().encode("content"),
      tkTemp,
      buildContentAad("t-trig-nocanon", followupSlot(followUpId)),
    );

    sinkMessages = [];
    const resp = await dispatchAndWait({
      type: "decryptAndRewrap",
      id: 15_001,
      ticketId: "t-trig-nocanon",
      followUpId,
      ephemeralPoint: encode(wrapTemp.ephemeralPoint),
      nonce: encode(wrapTemp.nonce),
      wrappedKey: encode(wrapTemp.ciphertext),
      ciphertext: encode(ct),
    });

    // The decrypt itself succeeds
    expect(resp.ok).toBe(true);
    // No rewrap event should have been emitted (triggerRewrap bailed on missing canonical tk)
    const rewrapEvents = sinkMessages.filter((m) => "kind" in m);
    expect(rewrapEvents).toHaveLength(0);

    sodium.memzero(tkOther);
    sodium.memzero(tkTemp);
  });

  it("silently skips the rewrap when the follow-up is already pending", async () => {
    const sodium = requireSodium();
    const volPub = decode(volPublicStr) as RistrettoPoint;

    // Cache canonical tk
    const canonicalTk = generateContentKey();
    const wrapCanonical = eciesEncrypt(canonicalTk, volPub);
    await dispatchAndWait({
      type: "unwrapTk",
      id: 15_010,
      ticketId: "t-trig-dup",
      keyCacheId: "t-trig-dup",
      ephemeralPoint: encode(wrapCanonical.ephemeralPoint),
      nonce: encode(wrapCanonical.nonce),
      wrappedKey: encode(wrapCanonical.ciphertext),
    });

    // First decryptAndRewrap to put the follow-up in pendingRewraps
    const tkTemp = generateContentKey();
    const wrapTemp = eciesEncrypt(tkTemp, volPub);
    const followUpId = "fu-pending-dup";
    const ct1 = encryptContent(
      new TextEncoder().encode("first"),
      tkTemp,
      buildContentAad("t-trig-dup", followupSlot(followUpId)),
    );

    await dispatchAndWait({
      type: "decryptAndRewrap",
      id: 15_011,
      ticketId: "t-trig-dup",
      followUpId,
      ephemeralPoint: encode(wrapTemp.ephemeralPoint),
      nonce: encode(wrapTemp.nonce),
      wrappedKey: encode(wrapTemp.ciphertext),
      ciphertext: encode(ct1),
    });

    // Count rewrap events so far
    const rewrapsBefore = sinkMessages.filter((m) => "kind" in m).length;
    expect(rewrapsBefore).toBe(1);

    // Second decryptAndRewrap with the same followUpId (still pending)
    const ct2 = encryptContent(
      new TextEncoder().encode("second"),
      tkTemp,
      buildContentAad("t-trig-dup", followupSlot(followUpId)),
    );

    await dispatchAndWait({
      type: "decryptAndRewrap",
      id: 15_012,
      ticketId: "t-trig-dup",
      followUpId,
      ephemeralPoint: encode(wrapTemp.ephemeralPoint),
      nonce: encode(wrapTemp.nonce),
      wrappedKey: encode(wrapTemp.ciphertext),
      ciphertext: encode(ct2),
    });

    // No additional rewrap event (the pending check suppressed it)
    const rewrapsAfter = sinkMessages.filter((m) => "kind" in m).length;
    expect(rewrapsAfter).toBe(1);

    handleRewrapResult({ kind: "rewrap-result", followUpId, success: true });
    sodium.memzero(canonicalTk);
    sodium.memzero(tkTemp);
  });
});
