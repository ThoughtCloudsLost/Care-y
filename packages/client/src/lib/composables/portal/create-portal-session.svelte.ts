/**
 * Composable: portal keypair derivation through the channel OPRF
 * round (ADR-091), key-check verification, passphrase gate,
 * session create/destroy with zeroing.
 */

import { encode } from "@care-y/crypto";
import {
  performChannelOprf,
  verifyKeyCheck,
  createPortalSession,
  decodeEciesTriple,
  type ChannelEvaluateCallback,
  type PortalSession,
} from "$lib/portal/portal-crypto.js";
import type { FragmentData } from "./create-portal-fragment.svelte.js";

export interface PortalSessionState {
  readonly session: PortalSession | null;
  readonly keyCheckPassed: boolean;
  readonly passphraseError: boolean;
  readonly passphraseDerivePending: boolean;
  destroySession(): void;
  /** Attempt derive with no passphrase. Returns true on success. */
  tryNoPassphraseDerive(
    fragmentData: FragmentData,
    keyCheckWire: { ephemeralPoint: string; nonce: string; ciphertext: string },
    evaluate: ChannelEvaluateCallback,
    onPowRequired: (challenge: string, difficulty: number) => Promise<string>,
  ): Promise<boolean>;
  /** Submit passphrase for Argon2id + OPRF derive. */
  submitPassphrase(
    passphrase: string,
    fragmentData: FragmentData,
    keyCheckWire: { ephemeralPoint: string; nonce: string; ciphertext: string },
    evaluate: ChannelEvaluateCallback,
    onPowRequired: (challenge: string, difficulty: number) => Promise<string>,
  ): Promise<void>;
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

  async function tryNoPassphraseDerive(
    fragmentData: FragmentData,
    keyCheckWire: {
      ephemeralPoint: string;
      nonce: string;
      ciphertext: string;
    },
    evaluate: ChannelEvaluateCallback,
    onPowRequired: (challenge: string, difficulty: number) => Promise<string>,
  ): Promise<boolean> {
    try {
      const keypair = await performChannelOprf(
        fragmentData.seed,
        fragmentData.channelId,
        {
          auth: encode(fragmentData.auth),
          evaluate,
          onPowRequired,
        },
      );
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
      // Corrupt fragment, OPRF failure, or derivation failure
    }
    return false;
  }

  async function submitPassphrase(
    passphrase: string,
    fragmentData: FragmentData,
    keyCheckWire: {
      ephemeralPoint: string;
      nonce: string;
      ciphertext: string;
    },
    evaluate: ChannelEvaluateCallback,
    onPowRequired: (challenge: string, difficulty: number) => Promise<string>,
  ): Promise<void> {
    passphraseDerivePending = true;
    passphraseError = false;

    try {
      const keypair = await performChannelOprf(
        fragmentData.seed,
        fragmentData.channelId,
        {
          passphrase,
          auth: encode(fragmentData.auth),
          evaluate,
          onPowRequired,
        },
      );
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
