import { describe, it, expect, vi, beforeAll } from "vitest";
import {
  getSodium,
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
  PORTAL_KEY_CHECK,
  toRistrettoPoint,
  type RistrettoPoint,
} from "@care-y/crypto";
import { createPortalSessionState } from "./create-portal-session.svelte.js";
import type { ChannelEvaluateCallback } from "$lib/portal/portal-crypto.js";
import type { FragmentData } from "./create-portal-fragment.svelte.js";

/** Fixed test "server key" for local OPRF evaluation. */
const TEST_SERVER_KEY = new Uint8Array(32).fill(0xaa);

function localEvaluate(blindedB64: string): string {
  const sodium = requireSodium();
  const blinded = decode(blindedB64);
  const evaluated = sodium.crypto_scalarmult_ristretto255(
    TEST_SERVER_KEY,
    blinded,
  );
  return encode(evaluated);
}

/** Derive a keypair through local OPRF simulation (for test assertions). */
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

const noopPow = vi.fn().mockResolvedValue("noop");

function buildKeyCheckWire(clientPublic: RistrettoPoint): {
  ephemeralPoint: string;
  nonce: string;
  ciphertext: string;
} {
  const kc = eciesEncrypt(
    new TextEncoder().encode(PORTAL_KEY_CHECK),
    clientPublic,
  );
  return {
    ephemeralPoint: encode(kc.ephemeralPoint),
    nonce: encode(kc.nonce),
    ciphertext: encode(kc.ciphertext),
  };
}

function buildFragmentData(seed: Uint8Array): FragmentData {
  return {
    seed,
    auth: deriveChannelAuth(seed),
    channelId: deriveChannelId(seed),
  };
}

beforeAll(async () => {
  await getSodium();
});

describe("createPortalSessionState", () => {
  describe("tryNoPassphraseDerive", () => {
    it("succeeds with correct seed and keyCheck via OPRF round", async () => {
      const state = createPortalSessionState();
      const seed = generatePortalSeed();
      const keypair = deriveViaLocalOprf(seed);
      const fragData = buildFragmentData(seed);
      const keyCheckWire = buildKeyCheckWire(keypair.clientPublic);

      const result = await state.tryNoPassphraseDerive(
        fragData,
        keyCheckWire,
        makeStubEvaluate(),
        noopPow,
      );

      expect(result).toBe(true);
      expect(state.keyCheckPassed).toBe(true);
      expect(state.session).not.toBeNull();
      expect(state.session!.channelId).toBe(fragData.channelId);
    });

    it("returns false for wrong keyCheck", async () => {
      const state = createPortalSessionState();
      const seed = generatePortalSeed();
      const otherSeed = generatePortalSeed();
      const otherKeypair = deriveViaLocalOprf(otherSeed);
      const fragData = buildFragmentData(seed);
      const keyCheckWire = buildKeyCheckWire(otherKeypair.clientPublic);

      const result = await state.tryNoPassphraseDerive(
        fragData,
        keyCheckWire,
        makeStubEvaluate(),
        noopPow,
      );

      expect(result).toBe(false);
      expect(state.keyCheckPassed).toBe(false);
      expect(state.session).toBeNull();
    });
  });

  describe("submitPassphrase", () => {
    it("succeeds with correct passphrase via OPRF round", async () => {
      const state = createPortalSessionState();
      const seed = generatePortalSeed();
      const passphrase = "test passphrase words here five";
      const keypair = deriveViaLocalOprf(seed, passphrase);
      const fragData = buildFragmentData(seed);
      const keyCheckWire = buildKeyCheckWire(keypair.clientPublic);

      await state.submitPassphrase(
        passphrase,
        fragData,
        keyCheckWire,
        makeStubEvaluate(),
        noopPow,
      );

      expect(state.keyCheckPassed).toBe(true);
      expect(state.session).not.toBeNull();
      expect(state.passphraseError).toBe(false);
      expect(state.passphraseDerivePending).toBe(false);
    }, 60_000);

    it("sets passphraseError for wrong passphrase", async () => {
      const state = createPortalSessionState();
      const seed = generatePortalSeed();
      const keypair = deriveViaLocalOprf(
        seed,
        "correct pass phrase words five",
      );
      const fragData = buildFragmentData(seed);
      const keyCheckWire = buildKeyCheckWire(keypair.clientPublic);

      await state.submitPassphrase(
        "wrong pass phrase words five",
        fragData,
        keyCheckWire,
        makeStubEvaluate(),
        noopPow,
      );

      expect(state.keyCheckPassed).toBe(false);
      expect(state.session).toBeNull();
      expect(state.passphraseError).toBe(true);
      expect(state.passphraseDerivePending).toBe(false);
    }, 120_000);
  });

  describe("destroySession", () => {
    it("zeroes session and sets to null", async () => {
      const state = createPortalSessionState();
      const seed = generatePortalSeed();
      const keypair = deriveViaLocalOprf(seed);
      const fragData = buildFragmentData(seed);
      const keyCheckWire = buildKeyCheckWire(keypair.clientPublic);

      await state.tryNoPassphraseDerive(
        fragData,
        keyCheckWire,
        makeStubEvaluate(),
        noopPow,
      );
      expect(state.session).not.toBeNull();

      state.destroySession();

      expect(state.session).toBeNull();
    });
  });
});
