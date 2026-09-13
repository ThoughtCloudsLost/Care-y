import { describe, it, expect, vi, beforeAll } from "vitest";
import {
  generatePortalSeed,
  deriveChannelId,
  deriveChannelAuth,
  eciesEncrypt,
  encode,
  decode,
  requireSodium,
  oprfBlind,
  oprfFinalize,
  portalOprfInput,
  derivePortalKeypairFromOprf,
  toRistrettoPoint,
} from "@care-y/crypto";
import { getSodium } from "@care-y/crypto";
import {
  parseFragment,
  performChannelOprf,
  decodeEciesTriple,
  type ChannelEvaluateCallback,
} from "./portal-crypto.js";

// Local OPRF simulation (fixed server key) shared with the other portal
// crypto suites. It bypasses the real threshold OPRF service but exercises
// the same blind/evaluate/finalize/derive pipeline as performChannelOprf.
import { localOprfEvaluate as localEvaluate } from "./test-helpers/crypto.js";

/** Stub evaluate callback that uses the local server key. */
function makeStubEvaluate(): ChannelEvaluateCallback {
  return vi.fn(
    (
      _channelId: string,
      blindedB64: string,
      _auth?: string,
    ): Promise<{ evaluated: string }> =>
      Promise.resolve({ evaluated: localEvaluate(blindedB64) }),
  );
}

/** Derive a keypair through the local OPRF simulation (for test assertions). */
function deriveViaLocalOprf(
  seed: Uint8Array,
  passphrase?: string,
): ReturnType<typeof derivePortalKeypairFromOprf> {
  const input = portalOprfInput(seed, passphrase);
  const { blindedElement, blindState } = oprfBlind(input);
  const evaluatedB64 = localEvaluate(encode(blindedElement));
  const evaluatedBytes = decode(evaluatedB64);
  const oprfOutput = oprfFinalize(
    blindState,
    toRistrettoPoint(evaluatedBytes),
    input,
  );
  const kp = derivePortalKeypairFromOprf(oprfOutput);
  requireSodium().memzero(input);
  requireSodium().memzero(oprfOutput);
  return kp;
}

const noopPow = vi.fn().mockResolvedValue("noop");

beforeAll(async () => {
  await getSodium();
});

describe("parseFragment", () => {
  it("parses a valid fragment and returns seed, auth, channelId", () => {
    const seed = generatePortalSeed();
    const encoded = encode(seed);
    const result = parseFragment(`#${encoded}`);
    expect(result).not.toBeNull();
    expect(result!.channelId).toBe(deriveChannelId(seed));
    expect(result!.seed).toEqual(seed);
    expect(result!.auth.length).toBe(32);
  });

  it("returns null for empty hash", () => {
    expect(parseFragment("")).toBeNull();
    expect(parseFragment("#")).toBeNull();
  });

  it("returns null for malformed base64", () => {
    expect(parseFragment("#!!!invalid!!!")).toBeNull();
  });

  it("returns null for truncated seed (< 18 bytes)", () => {
    const shortSeed = new Uint8Array(10);
    crypto.getRandomValues(shortSeed);
    expect(parseFragment(`#${encode(shortSeed)}`)).toBeNull();
  });

  it("roundtrips: compose link client-side idiom, parse back", () => {
    const seed = generatePortalSeed();
    const channelId = deriveChannelId(seed);
    const link = `https://org.care-y.app/portal/${channelId}#${encode(seed)}`;
    const url = new URL(link);
    const result = parseFragment(url.hash);
    expect(result).not.toBeNull();
    expect(result!.channelId).toBe(channelId);
  });
});

describe("decodeEciesTriple", () => {
  it("decodes wire-format base64 strings to binary", () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const nonce = new Uint8Array(24);
    crypto.getRandomValues(nonce);
    const ct = new Uint8Array(50);
    crypto.getRandomValues(ct);

    const decoded = decodeEciesTriple({
      ephemeralPoint: encode(bytes),
      nonce: encode(nonce),
      ciphertext: encode(ct),
    });

    expect(decoded.ephemeralPoint).toEqual(bytes);
    expect(decoded.nonce).toEqual(nonce);
    expect(decoded.ciphertext).toEqual(ct);
  });
});

// ---------------------------------------------------------------------------
// performChannelOprf (ADR-091)
// ---------------------------------------------------------------------------

describe("performChannelOprf", () => {
  it("returns a deterministic keypair for a fixed evaluator", async () => {
    const seed = generatePortalSeed();
    const channelId = deriveChannelId(seed);
    const evaluate = makeStubEvaluate();

    const kp = await performChannelOprf(seed, channelId, {
      evaluate,
      onPowRequired: noopPow,
    });

    expect(kp.clientPrivate.length).toBe(32);
    expect(kp.clientPublic.length).toBe(32);

    // The keypair should match what deriveViaLocalOprf produces
    const expected = deriveViaLocalOprf(seed);
    expect(kp.clientPrivate).toEqual(expected.clientPrivate);
    expect(kp.clientPublic).toEqual(expected.clientPublic);
  });

  it("passes channelId and auth to the evaluate callback", async () => {
    const seed = generatePortalSeed();
    const channelId = deriveChannelId(seed);
    const auth = deriveChannelAuth(seed);
    const evaluate = makeStubEvaluate();

    await performChannelOprf(seed, channelId, {
      auth: encode(auth),
      evaluate,
      onPowRequired: noopPow,
    });

    expect(evaluate).toHaveBeenCalledTimes(1);
    const call = vi.mocked(evaluate).mock.calls[0];
    expect(call?.[0]).toBe(channelId);
    expect(call?.[2]).toBe(encode(auth));
  });

  it("produces different keypairs for different seeds", async () => {
    const seed1 = generatePortalSeed();
    const seed2 = generatePortalSeed();
    const evaluate = makeStubEvaluate();

    const kp1 = await performChannelOprf(seed1, deriveChannelId(seed1), {
      evaluate,
      onPowRequired: noopPow,
    });
    const kp2 = await performChannelOprf(seed2, deriveChannelId(seed2), {
      evaluate,
      onPowRequired: noopPow,
    });

    expect(kp1.clientPrivate).not.toEqual(kp2.clientPrivate);
  });

  it("roundtrips through ECIES", async () => {
    const seed = generatePortalSeed();
    const kp = await performChannelOprf(seed, deriveChannelId(seed), {
      evaluate: makeStubEvaluate(),
      onPowRequired: noopPow,
    });

    const plaintext = new TextEncoder().encode("oprf channel message");
    const encrypted = eciesEncrypt(plaintext, kp.clientPublic);
    const { eciesDecrypt } = await import("@care-y/crypto");
    const decrypted = eciesDecrypt(
      encrypted.ephemeralPoint,
      encrypted.nonce,
      encrypted.ciphertext,
      kp.clientPrivate,
    );
    expect(decrypted).toEqual(plaintext);
  });

  it("calls onPowRequired when evaluate throws POW_REQUIRED", async () => {
    const seed = generatePortalSeed();
    const channelId = deriveChannelId(seed);

    const powError = {
      data: { code: "POW_REQUIRED", challenge: "ch-test", difficulty: 8 },
    };
    const evaluate = vi
      .fn<ChannelEvaluateCallback>()
      .mockRejectedValueOnce(powError)
      .mockImplementation((_cid, blindedB64) =>
        Promise.resolve({ evaluated: localEvaluate(blindedB64) }),
      );
    const onPow = vi.fn().mockResolvedValue("solved");

    const kp = await performChannelOprf(seed, channelId, {
      evaluate,
      onPowRequired: onPow,
    });

    expect(onPow).toHaveBeenCalledWith("ch-test", 8);
    expect(evaluate).toHaveBeenCalledTimes(2);
    expect(kp.clientPrivate.length).toBe(32);
  });

  it("rethrows non-PoW errors", async () => {
    const seed = generatePortalSeed();
    const evaluate = vi
      .fn<ChannelEvaluateCallback>()
      .mockRejectedValue(new Error("network failure"));

    await expect(
      performChannelOprf(seed, deriveChannelId(seed), {
        evaluate,
        onPowRequired: noopPow,
      }),
    ).rejects.toThrow("network failure");
  });
});
