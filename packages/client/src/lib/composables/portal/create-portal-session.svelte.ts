/**
 * Composable: portal session lifecycle backed by the portal Worker (ADR-091).
 *
 * Creates one PortalBridge per page life (via injected factory) and drives
 * channelSessionStart / channelSessionFinish through the existing tRPC
 * evaluate callback and PoW solver, which stay on the main thread. The seed
 * is posted into the worker as a transferred ArrayBuffer on the first
 * attempt and the main-thread copy is zeroed right after posting; failed
 * gate attempts keep the bridge alive and retry via channelSessionRestart
 * from the Worker-held seed, because no other copy exists.
 *
 * Key-check verification, message decryption, reply encryption, and
 * attachment ops go through the bridge. destroySession calls bridge.zeroAll
 * and terminates the worker. No key material crosses the shell context
 * boundary (callbacks only).
 *
 * The composable's public API to pages stays close to what
 * createPortalSessionState exposed before the migration, keeping page churn
 * small.
 */

import type { PortalBridge } from "$lib/workers/portal-bridge.js";
import { PortalWorkerError } from "$lib/workers/portal-bridge-errors.js";
import type { PortalBridgeFactory } from "$lib/portal/context.js";
import { ChannelSessionError } from "$lib/errors.js";
import type {
  EciesTripleWireResponse,
  PortalAttachmentPayloadResponse,
  PortalAttachmentInput,
} from "$lib/workers/portal-protocol.js";
import type { FragmentData } from "./create-portal-fragment.svelte.js";
import { evaluateChannelWithPowRetry } from "$lib/portal/portal-crypto.js";

export type ChannelEvaluateCallback = (
  channelId: string,
  blindedElementB64: string,
  auth?: string,
  pow?: { challenge: string; solution: string },
) => Promise<{ evaluated: string }>;

export interface PortalSessionState {
  readonly session: PortalSessionHandle | null;
  readonly keyCheckPassed: boolean;
  readonly passphraseError: boolean;
  readonly connectionError: boolean;
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

/**
 * Handle exposed by a successfully established channel session.
 *
 * The page uses this to drive decrypt/encrypt through the bridge and to
 * zero key material on exit. No private key or seed is accessible from
 * the main thread; only the channelId, auth (for tRPC calls), and the
 * clientPublic (for optimistic self-copy rendering) cross back.
 */
export interface PortalSessionHandle {
  readonly channelId: string;
  readonly auth: Uint8Array;
  /** Base64url client public key (returned from the worker, read-only). */
  readonly clientPublic: string;
  /** Zero the worker's key material and terminate it. */
  destroy(): void;
  /** Decrypt a single portal message via the bridge. */
  decryptMessage(
    ephemeralPoint: string,
    nonce: string,
    ciphertext: string,
  ): Promise<string>;
  /** Verify a key-check triple via the bridge. */
  verifyKeyCheck(
    ephemeralPoint: string,
    nonce: string,
    ciphertext: string,
  ): Promise<boolean>;
  /** Encrypt a reply with optional attachments via the bridge. */
  encryptReply(
    text: string,
    orgPublicKey: string,
    ticketId: string,
    followUpId: string,
    keyGeneration: string,
    attachments?: readonly PortalAttachmentInput[],
  ): Promise<{
    encryptedContent: string;
    wrappedTkTemp: string;
    selfCopy: EciesTripleWireResponse;
    attachments: readonly PortalAttachmentPayloadResponse[];
  }>;
  /** Decrypt an attachment key from the client's self-copy ECIES wrap. */
  decryptAttachmentKey(
    ephemeralPoint: string,
    nonce: string,
    ciphertext: string,
  ): Promise<{ fileKey: string; filename: string }>;
  /** Decrypt an attachment blob with a file key. */
  decryptAttachmentBlob(
    ciphertext: ArrayBuffer,
    fileKey: string,
    ticketId: string,
    attachmentId: string,
  ): Promise<ArrayBuffer>;
  /**
   * Start a passphrase-derive round from the Worker-held seed.
   * Returns channelId, auth, and blindedElement for the evaluate hop.
   * Does not disturb the active session's key material.
   */
  channelPassphraseDerive(
    passphrase: string,
  ): Promise<{ channelId: string; auth: string; blindedElement: string }>;
  /**
   * Finalize the passphrase-derive OPRF round. Returns only the new
   * client public key (base64url).
   */
  channelPassphraseFinish(evaluated: string): Promise<{ clientPublic: string }>;
}

export function createPortalSessionState(
  createBridge: PortalBridgeFactory,
): PortalSessionState {
  let session = $state<PortalSessionHandle | null>(null);
  let keyCheckPassed = $state(false);
  let passphraseError = $state(false);
  let connectionError = $state(false);
  let passphraseDerivePending = $state(false);

  // One bridge per page life, kept across failed gate attempts. After the
  // first channelSessionStart the Worker owns the seed and the main-thread
  // copy is zeroed, so a passphrase retry MUST reuse this bridge through
  // channelSessionRestart; a fresh bridge would only ever see zeroed bytes.
  let bridge: PortalBridge | null = null;

  function destroySession(): void {
    session?.destroy();
    session = null;
    // The gate's bridge holds the seed even when no session was
    // established (failed attempts). Quick exit and page teardown must
    // zero it too. destroy() is idempotent, so the double call through
    // the handle above is safe.
    bridge?.destroy();
    bridge = null;
  }

  /**
   * Common channel derive flow: post seed to bridge (first attempt) or
   * restart from the Worker-held seed (retries), evaluate via tRPC,
   * finalize in the worker, verify the key check. Returns the session
   * handle on success, or null on failure. Failures keep the bridge
   * alive so the Worker-held seed survives for the next attempt.
   */
  async function deriveChannelSession(
    fragmentData: FragmentData,
    keyCheckWire: { ephemeralPoint: string; nonce: string; ciphertext: string },
    evaluate: ChannelEvaluateCallback,
    onPowRequired: (challenge: string, difficulty: number) => Promise<string>,
    passphrase?: string,
  ): Promise<PortalSessionHandle | null> {
    try {
      let activeBridge: PortalBridge;
      let startResult: {
        channelId: string;
        auth: string;
        blindedElement: string;
      };

      if (bridge === null) {
        // First attempt: copy the seed into an ArrayBuffer for transfer
        // (neutered after the call), then zero the fragment's copy. From
        // here the Worker owns the seed.
        const fresh = createBridge();
        try {
          await fresh.waitReady();

          const seedBuf = new ArrayBuffer(fragmentData.seed.byteLength);
          new Uint8Array(seedBuf).set(fragmentData.seed);
          const { requireSodium } = await import("@care-y/crypto");
          const sodium = requireSodium();

          startResult = await fresh.channelSessionStart(seedBuf, passphrase);
          sodium.memzero(fragmentData.seed);
        } catch (err: unknown) {
          // The Worker may not hold the seed yet; drop this bridge so the
          // next attempt reposts from the still-intact fragment copy.
          fresh.destroy();
          throw err;
        }
        bridge = fresh;
        activeBridge = fresh;
      } else {
        // Retry: the Worker still holds the seed; re-derive with the new
        // passphrase without the seed ever returning to the main thread.
        activeBridge = bridge;
        startResult = await activeBridge.channelSessionRestart(passphrase);
      }

      // Evaluate via tRPC (main thread)
      const evaluated = await evaluateChannelWithPowRetry(
        startResult.channelId,
        startResult.blindedElement,
        startResult.auth,
        evaluate,
        onPowRequired,
      );

      // Finalize in the worker
      const finishResult = await activeBridge.channelSessionFinish(evaluated);

      // Verify the key check
      const passed = await activeBridge.verifyKeyCheck(
        keyCheckWire.ephemeralPoint,
        keyCheckWire.nonce,
        keyCheckWire.ciphertext,
      );

      if (!passed) {
        // Wrong passphrase: keep the bridge so the next submit retries
        // from the Worker-held seed.
        return null;
      }

      // Build the session handle
      const handle: PortalSessionHandle = {
        channelId: startResult.channelId,
        auth: fragmentData.auth,
        clientPublic: finishResult.clientPublic,
        destroy(): void {
          activeBridge.destroy();
        },
        decryptMessage: async (ep, n, ct) =>
          activeBridge.decryptMessage(ep, n, ct),
        verifyKeyCheck: async (ep, n, ct) =>
          activeBridge.verifyKeyCheck(ep, n, ct),
        encryptReply: async (text, orgPub, tid, fid, kg, atts) =>
          activeBridge.encryptReply(text, orgPub, tid, fid, kg, atts),
        decryptAttachmentKey: async (ep, n, ct) =>
          activeBridge.decryptAttachmentKey(ep, n, ct),
        decryptAttachmentBlob: async (ct, fk, tid, aid) =>
          activeBridge.decryptAttachmentBlob(ct, fk, tid, aid),
        channelPassphraseDerive: async (newPassphrase) =>
          activeBridge.channelPassphraseDerive(newPassphrase),
        channelPassphraseFinish: async (evaluatedElement) =>
          activeBridge.channelPassphraseFinish(evaluatedElement),
      };

      return handle;
    } catch (err: unknown) {
      // Worker-originated errors (decrypt/finalize failures) indicate
      // wrong passphrase; return null so the caller shows the passphrase
      // error state. Non-worker errors (network outage, tRPC transport)
      // are rethrown as ChannelSessionError so the caller can distinguish
      // connectivity problems from authentication failures.
      if (err instanceof PortalWorkerError) {
        return null;
      }
      throw new ChannelSessionError(
        err instanceof Error ? err.message : String(err),
      );
    }
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
    const handle = await deriveChannelSession(
      fragmentData,
      keyCheckWire,
      evaluate,
      onPowRequired,
    );
    if (handle !== null) {
      session = handle;
      keyCheckPassed = true;
      return true;
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
    connectionError = false;

    try {
      const handle = await deriveChannelSession(
        fragmentData,
        keyCheckWire,
        evaluate,
        onPowRequired,
        passphrase,
      );
      if (handle !== null) {
        session = handle;
        keyCheckPassed = true;
        passphraseError = false;
      } else {
        passphraseError = true;
      }
    } catch (err: unknown) {
      if (err instanceof ChannelSessionError) {
        connectionError = true;
      } else {
        passphraseError = true;
      }
    } finally {
      passphraseDerivePending = false;
    }
  }

  return {
    get session(): PortalSessionHandle | null {
      return session;
    },
    get keyCheckPassed(): boolean {
      return keyCheckPassed;
    },
    get passphraseError(): boolean {
      return passphraseError;
    },
    get connectionError(): boolean {
      return connectionError;
    },
    get passphraseDerivePending(): boolean {
      return passphraseDerivePending;
    },
    destroySession,
    tryNoPassphraseDerive,
    submitPassphrase,
  };
}
