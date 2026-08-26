/**
 * Composable: portal keypair derivation, key-check verification,
 * passphrase gate, session create/destroy with zeroing.
 */

import { derivePortalKeypair } from "@care-y/crypto";
import {
  verifyKeyCheck,
  createPortalSession,
  decodeEciesTriple,
  type PortalSession,
} from "$lib/portal/portal-crypto.js";
import type { FragmentData } from "./create-portal-fragment.svelte.js";

export interface PortalSessionState {
  readonly session: PortalSession | null;
  readonly keyCheckPassed: boolean;
  readonly passphraseError: boolean;
  readonly passphraseDerivePending: boolean;
  destroySession(): void;
  /** Attempt immediate derive (no passphrase). Returns true on success. */
  tryNoPassphraseDerive(
    fragmentData: FragmentData,
    keyCheckWire: { ephemeralPoint: string; nonce: string; ciphertext: string },
  ): boolean;
  /** Submit passphrase for Argon2id derive. Async (setTimeout for UI). */
  submitPassphrase(
    passphrase: string,
    fragmentData: FragmentData,
    keyCheckWire: { ephemeralPoint: string; nonce: string; ciphertext: string },
  ): void;
}

export function createPortalSessionState(): PortalSessionState {
  let session = $state<PortalSession | null>(null);
  let keyCheckPassed = $state(false);
  let passphraseError = $state(false);
  let passphraseDerivePending = $state(false);

  function destroySession(): void {
    session?.destroy();
    session = null;
  }

  function tryNoPassphraseDerive(
    fragmentData: FragmentData,
    keyCheckWire: {
      ephemeralPoint: string;
      nonce: string;
      ciphertext: string;
    },
  ): boolean {
    try {
      const keypair = derivePortalKeypair(fragmentData.seed);
      const keyCheck = decodeEciesTriple(keyCheckWire);
      if (verifyKeyCheck(keypair, keyCheck)) {
        session = createPortalSession(
          fragmentData.channelId,
          fragmentData.auth,
          keypair,
          fragmentData.seed,
        );
        keyCheckPassed = true;
        return true;
      }
    } catch {
      // Corrupt fragment or derivation failure
    }
    return false;
  }

  function submitPassphrase(
    passphrase: string,
    fragmentData: FragmentData,
    keyCheckWire: {
      ephemeralPoint: string;
      nonce: string;
      ciphertext: string;
    },
  ): void {
    passphraseDerivePending = true;
    passphraseError = false;

    // Run Argon2id asynchronously (setTimeout to let the UI update first)
    setTimeout(() => {
      try {
        const keypair = derivePortalKeypair(fragmentData.seed, passphrase);
        const keyCheck = decodeEciesTriple(keyCheckWire);
        if (verifyKeyCheck(keypair, keyCheck)) {
          session = createPortalSession(
            fragmentData.channelId,
            fragmentData.auth,
            keypair,
            fragmentData.seed,
          );
          keyCheckPassed = true;
          passphraseError = false;
        } else {
          passphraseError = true;
        }
      } catch {
        passphraseError = true;
      } finally {
        passphraseDerivePending = false;
      }
    }, 0);
  }

  return {
    get session(): PortalSession | null {
      return session;
    },
    get keyCheckPassed(): boolean {
      return keyCheckPassed;
    },
    get passphraseError(): boolean {
      return passphraseError;
    },
    get passphraseDerivePending(): boolean {
      return passphraseDerivePending;
    },
    destroySession,
    tryNoPassphraseDerive,
    submitPassphrase,
  };
}
