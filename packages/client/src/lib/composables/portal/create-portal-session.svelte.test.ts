import { describe, it, expect, beforeAll } from "vitest";
import {
  getSodium,
  generatePortalSeed,
  derivePortalKeypair,
  deriveChannelId,
  deriveChannelAuth,
  eciesEncrypt,
  encode,
  PORTAL_KEY_CHECK,
  type RistrettoPoint,
} from "@care-y/crypto";
import { createPortalSessionState } from "./create-portal-session.svelte.js";
import type { FragmentData } from "./create-portal-fragment.svelte.js";

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
    it("succeeds with correct seed and keyCheck", () => {
      const state = createPortalSessionState();
      const seed = generatePortalSeed();
      const keypair = derivePortalKeypair(seed);
      const fragData = buildFragmentData(seed);
      const keyCheckWire = buildKeyCheckWire(keypair.clientPublic);

      const result = state.tryNoPassphraseDerive(fragData, keyCheckWire);

      expect(result).toBe(true);
      expect(state.keyCheckPassed).toBe(true);
      expect(state.session).not.toBeNull();
      expect(state.session!.channelId).toBe(fragData.channelId);
    });

    it("returns false for wrong keyCheck", () => {
      const state = createPortalSessionState();
      const seed = generatePortalSeed();
      const otherSeed = generatePortalSeed();
      const otherKeypair = derivePortalKeypair(otherSeed);
      const fragData = buildFragmentData(seed);
      // Key check encrypted to a different keypair
      const keyCheckWire = buildKeyCheckWire(otherKeypair.clientPublic);

      const result = state.tryNoPassphraseDerive(fragData, keyCheckWire);

      expect(result).toBe(false);
      expect(state.keyCheckPassed).toBe(false);
      expect(state.session).toBeNull();
    });
  });

  describe("submitPassphrase", () => {
    it("succeeds with correct passphrase", async () => {
      const state = createPortalSessionState();
      const seed = generatePortalSeed();
      const passphrase = "test-passphrase";
      const keypair = derivePortalKeypair(seed, passphrase);
      const fragData = buildFragmentData(seed);
      const keyCheckWire = buildKeyCheckWire(keypair.clientPublic);

      state.submitPassphrase(passphrase, fragData, keyCheckWire);

      // setTimeout(fn, 0) runs async; wait for it
      await new Promise<void>((resolve) => setTimeout(resolve, 50));

      expect(state.keyCheckPassed).toBe(true);
      expect(state.session).not.toBeNull();
      expect(state.passphraseError).toBe(false);
      expect(state.passphraseDerivePending).toBe(false);
    });

    it("sets passphraseError for wrong passphrase", async () => {
      const state = createPortalSessionState();
      const seed = generatePortalSeed();
      const keypair = derivePortalKeypair(seed, "correct-pass");
      const fragData = buildFragmentData(seed);
      const keyCheckWire = buildKeyCheckWire(keypair.clientPublic);

      state.submitPassphrase("wrong-pass", fragData, keyCheckWire);

      await new Promise<void>((resolve) => setTimeout(resolve, 50));

      expect(state.keyCheckPassed).toBe(false);
      expect(state.session).toBeNull();
      expect(state.passphraseError).toBe(true);
      expect(state.passphraseDerivePending).toBe(false);
    });
  });

  describe("destroySession", () => {
    it("zeroes session and sets to null", () => {
      const state = createPortalSessionState();
      const seed = generatePortalSeed();
      const keypair = derivePortalKeypair(seed);
      const fragData = buildFragmentData(seed);
      const keyCheckWire = buildKeyCheckWire(keypair.clientPublic);

      state.tryNoPassphraseDerive(fragData, keyCheckWire);
      expect(state.session).not.toBeNull();

      state.destroySession();

      expect(state.session).toBeNull();
    });
  });
});
