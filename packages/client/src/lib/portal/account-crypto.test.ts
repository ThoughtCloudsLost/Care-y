import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import type * as CryptoPkg from "@care-y/crypto";

vi.mock("$lib/auth/crypto-helpers.js", async (importOriginal) => ({
  ...(await importOriginal()),
  evaluateWithPowRetry: vi.fn(),
}));

// vi.mock required: deriveAccountKey is the Argon2id stretch (memory-hard,
// seconds per call in the node test environment). Only the stretch is
// stubbed; OPRF, HKDF, ECIES, and hashing run real, matching the
// deriveViaLocalOprf pattern in portal-crypto.test.ts.
vi.mock("@care-y/crypto", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoPkg>()),
  deriveAccountKey: vi.fn(),
}));

import {
  getSodium,
  deriveAccountKey,
  oprfBlind,
  oprfFinalize,
  deriveClientAccountKeys,
  hashChannelAuth,
  encode,
  decode,
  toRistrettoPoint,
  PORTAL_KEY_CHECK,
} from "@care-y/crypto";
import {
  makeRistrettoKeypair,
  localOprfEvaluate,
  decryptTripleB64,
} from "./test-helpers/crypto.js";
import {
  buildAccountRegistration,
  collectDecryptedMessages,
  rewrapMessages,
  type DecryptHandle,
} from "./account-crypto.js";
import { evaluateWithPowRetry } from "$lib/auth/crypto-helpers.js";
import type { LoginCryptoCallbacks } from "$lib/auth/login-crypto.js";

/** Deterministic stand-in for the Argon2id stretch; fresh per call because
 * production zeroes it in a finally block. */
function stretchedBytes(): Uint8Array {
  return new Uint8Array(64).fill(5);
}

/** Reproduce the production derivation from the same stretched input,
 * through the shared local OPRF simulation (fixed server key). */
function deriveExpectedKeys(): ReturnType<typeof deriveClientAccountKeys> {
  const input = stretchedBytes();
  const { blindedElement, blindState } = oprfBlind(input);
  const evaluatedBytes = decode(localOprfEvaluate(encode(blindedElement)));
  const oprfOutput = oprfFinalize(
    blindState,
    toRistrettoPoint(evaluatedBytes),
    input,
  );
  return deriveClientAccountKeys(oprfOutput);
}

function makeCallbacks(): LoginCryptoCallbacks {
  return {
    onArgon2idStart: vi.fn(),
    onArgon2idDone: vi.fn(),
    onOprfStart: vi.fn(),
    onOprfDone: vi.fn(),
    onDeriveStart: vi.fn(),
    onDone: vi.fn(),
    onPowRequired: vi.fn().mockResolvedValue("solution"),
  };
}

beforeAll(async () => {
  await getSodium();
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(deriveAccountKey).mockImplementation(() => stretchedBytes());
  vi.mocked(evaluateWithPowRetry).mockImplementation((_kind, _id, blindedB64) =>
    Promise.resolve(localOprfEvaluate(blindedB64)),
  );
});

describe("buildAccountRegistration", () => {
  it("produces a fresh salt each call", async () => {
    const callbacks = makeCallbacks();
    const r1 = await buildAccountRegistration(
      "user1",
      "pass1",
      null,
      callbacks,
    );
    const r2 = await buildAccountRegistration(
      "user2",
      "pass2",
      null,
      callbacks,
    );

    expect(r1.payload.salt).not.toBe(r2.payload.salt);
  });

  it("keeps accountId when provided", async () => {
    const callbacks = makeCallbacks();
    const result = await buildAccountRegistration(
      "user",
      "pass",
      "my-id",
      callbacks,
    );

    expect(result.payload.accountId).toBe("my-id");
  });

  it("mints a new accountId when null", async () => {
    const callbacks = makeCallbacks();
    const result = await buildAccountRegistration(
      "user",
      "pass",
      null,
      callbacks,
    );

    // Should be a UUID-like string (crypto.randomUUID)
    expect(result.payload.accountId).toBeTruthy();
    expect(result.payload.accountId.length).toBeGreaterThan(0);
  });

  it("sends authHash = hash(authToken), never the raw authToken", async () => {
    const expected = deriveExpectedKeys();
    const callbacks = makeCallbacks();
    const result = await buildAccountRegistration(
      "user",
      "pass",
      null,
      callbacks,
    );

    expect(result.payload.authHash).toBe(
      encode(hashChannelAuth(expected.authToken)),
    );
    expect(result.payload).not.toHaveProperty("authToken");
    expect(result.payload.authHash).not.toBe(encode(expected.authToken));
  });

  it("seals a keyCheck the derived private key can decrypt", async () => {
    const expected = deriveExpectedKeys();
    const callbacks = makeCallbacks();
    const result = await buildAccountRegistration(
      "user",
      "pass",
      null,
      callbacks,
    );

    expect(result.payload.publicKey).toBe(
      encode(expected.keypair.clientPublic),
    );

    expect(
      decryptTripleB64(result.payload.keyCheck, expected.keypair.clientPrivate),
    ).toBe(PORTAL_KEY_CHECK);
  });

  it("returns the derived keypair for re-encryption", async () => {
    const expected = deriveExpectedKeys();
    const callbacks = makeCallbacks();
    const result = await buildAccountRegistration(
      "user",
      "pass",
      null,
      callbacks,
    );

    expect(result.keypair.clientPublic).toEqual(expected.keypair.clientPublic);
    expect(result.keypair.clientPrivate).toEqual(
      expected.keypair.clientPrivate,
    );
  });
});

describe("rewrapMessages", () => {
  it("rewraps each message so the new private key can decrypt it", () => {
    const { publicPoint, privateScalar } = makeRistrettoKeypair();
    const decrypted = [
      { id: "msg-1", text: "Hello" },
      { id: "msg-2", text: "World" },
    ];

    const result = rewrapMessages(decrypted, publicPoint);

    expect(result).toHaveLength(2);
    for (const [i, msg] of decrypted.entries()) {
      const wire = result[i];
      expect(wire?.id).toBe(msg.id);
      expect(decryptTripleB64(wire!.copy, privateScalar)).toBe(msg.text);
    }
  });

  it("returns empty array for empty input", () => {
    const { publicPoint } = makeRistrettoKeypair();
    const result = rewrapMessages([], publicPoint);
    expect(result).toHaveLength(0);
  });
});

describe("collectDecryptedMessages", () => {
  const wire = (
    id: string,
  ): {
    id: string;
    ephemeralPoint: string;
    nonce: string;
    ciphertext: string;
  } => ({ id, ephemeralPoint: "ep", nonce: "nn", ciphertext: "ct" });

  it("splits messages into decrypted texts and skipped IDs", async () => {
    const session: DecryptHandle = {
      decryptMessage: vi
        .fn()
        .mockResolvedValueOnce("text a")
        .mockRejectedValueOnce(new Error("decrypt fail"))
        .mockResolvedValueOnce("text c"),
    };

    const result = await collectDecryptedMessages(
      [wire("a"), wire("b"), wire("c")],
      session,
    );

    expect(result.decrypted).toEqual([
      { id: "a", text: "text a" },
      { id: "c", text: "text c" },
    ]);
    expect(result.skippedIds).toEqual(["b"]);
  });

  it("returns empty sets for an empty thread", async () => {
    const session: DecryptHandle = { decryptMessage: vi.fn() };
    const result = await collectDecryptedMessages([], session);
    expect(result.decrypted).toHaveLength(0);
    expect(result.skippedIds).toHaveLength(0);
    expect(session.decryptMessage).not.toHaveBeenCalled();
  });
});
