/**
 * Password change orchestrator.
 *
 * Atomic flow: all client-side crypto prep happens first (while the old
 * password is still valid on the server), then a single server call
 * verifies the old password, hashes the new one, rotates crypto keys,
 * and kills other sessions. If any step fails, nothing changes.
 *
 * The orchestrator manages two CryptoBridge instances:
 *   - primaryBridge: keeps KEYED state with OLD volPrivate for unwrapping
 *     existing ticket keys and the org key
 *   - tempBridge: short-lived, derives NEW keys from the new password
 *
 * After the server call succeeds, the primary bridge transitions to NEW
 * keys so the session continues without interruption.
 */

import { encode } from "@care-y/crypto";
import { trpc } from "$lib/trpc/index.js";
import { decodeStandardBase64, toArrayBuffer } from "$lib/base64.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";
import {
  evaluateWithPowRetry,
  fetchAndUnwrapOrgKey,
} from "$lib/auth/crypto-helpers.js";

const BATCH_SIZE = 40;

export interface PasswordChangeCallbacks {
  onFetchWraps: () => void;
  onDeriveNewKeys: () => void;
  onUnwrapOrgKey: () => void;
  onRewrapKeys: (done: number, total: number) => void;
  onRederive: () => void;
  onRewrapOrgKey: () => void;
  onRotateKeys: () => void;
  onReloadOrgKey: () => void;
  onDone: () => void;
}

export interface PasswordChangeDeps {
  readonly primaryBridge: CryptoBridge;
  readonly orgKeyManager: OrgKeyManager;
  readonly userId: string;
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly callbacks: PasswordChangeCallbacks;
  readonly onPowRequired: (
    challenge: string,
    difficulty: number,
  ) => Promise<string>;
  readonly createTempBridge: () => CryptoBridge;
}

/**
 * Execute a full password change: crypto prep + atomic server call.
 *
 * All crypto work (key derivation, unwrapping, re-wrapping) happens
 * before any server state changes. The single changePassword mutation
 * atomically verifies the old password, updates the hash, rotates
 * keys, and kills other sessions. If it fails, nothing changed.
 */
export async function changePassword(deps: PasswordChangeDeps): Promise<void> {
  const {
    primaryBridge,
    orgKeyManager,
    userId,
    currentPassword,
    newPassword,
    callbacks,
    onPowRequired,
    createTempBridge,
  } = deps;

  // 1. Fetch all ticket key wraps and org key wrap
  callbacks.onFetchWraps();
  const [ticketWraps, orgKeyData] = await Promise.all([
    trpc.profile.myTicketKeyWraps.query(),
    trpc.keys.getWrappedOrgKey.query(),
  ]);

  // 2. Derive new keys via temporary bridge
  callbacks.onDeriveNewKeys();
  const newSalt = crypto.getRandomValues(new Uint8Array(16));
  let newVolPublic: string;
  let reWrappedOrgKey:
    | { ephemeralPoint: string; nonce: string; wrappedKey: string }
    | undefined;

  const tempBridge = createTempBridge();
  try {
    await tempBridge.waitReady();

    const passwordBuf = new TextEncoder().encode(newPassword);
    await tempBridge.argon2id(
      toArrayBuffer(passwordBuf),
      toArrayBuffer(newSalt),
    );

    const { blindedElement } = await tempBridge.oprfBlind();
    const evaluatedB64 = await evaluateWithPowRetry(
      userId,
      blindedElement,
      onPowRequired,
    );
    const evaluatedBytes = decodeStandardBase64(evaluatedB64);
    const result = await tempBridge.deriveKeys(toArrayBuffer(evaluatedBytes));
    newVolPublic = result.volPublic;

    // 3. Export org secret from Worker, re-wrap with NEW keys via temp bridge
    callbacks.onUnwrapOrgKey();
    if (orgKeyData) {
      const orgSecretBuf = await primaryBridge.exportOrgSecretKey();
      callbacks.onRewrapOrgKey();
      const orgSecretBase64 = encode(new Uint8Array(orgSecretBuf));
      new Uint8Array(orgSecretBuf).fill(0);
      reWrappedOrgKey = await tempBridge.wrapWithVolPublic(orgSecretBase64);
    }
  } finally {
    tempBridge.destroy();
  }

  // 4. Batched preload + rewrap ticket keys (batch size 40 to avoid tkCache overflow)
  const reWrappedKeys: {
    ticketId: string;
    keyGeneration: string;
    ephemeralPoint: string;
    nonce: string;
    wrappedKey: string;
  }[] = [];

  for (let i = 0; i < ticketWraps.length; i += BATCH_SIZE) {
    const batch = ticketWraps.slice(i, i + BATCH_SIZE);

    for (const wrap of batch) {
      await primaryBridge.unwrapTk(
        wrap.ticketId,
        wrap.ephemeralPoint,
        wrap.nonce,
        wrap.wrappedKey,
      );
    }

    for (const wrap of batch) {
      const rewrapped = await primaryBridge.rewrapTk(
        wrap.ticketId,
        newVolPublic,
      );
      reWrappedKeys.push({
        ticketId: wrap.ticketId,
        keyGeneration: wrap.keyGeneration,
        ephemeralPoint: rewrapped.ephemeralPoint,
        nonce: rewrapped.nonce,
        wrappedKey: rewrapped.wrappedKey,
      });
    }

    callbacks.onRewrapKeys(
      Math.min(i + BATCH_SIZE, ticketWraps.length),
      ticketWraps.length,
    );
  }

  if (ticketWraps.length === 0) {
    callbacks.onRewrapKeys(0, 0);
  }

  // 6. Single atomic server call: verify old password + hash new + rotate keys + kill sessions
  callbacks.onRotateKeys();
  await trpc.profile.changePassword.mutate({
    currentPassword,
    newPassword,
    saltNew: encode(newSalt),
    volPublicNew: newVolPublic,
    reWrappedKeys,
    reWrappedOrgKey,
  });

  // 7. Re-derive keys on primary bridge (transitions to NEW volPrivate/volPublic)
  callbacks.onRederive();
  await primaryBridge.zeroAll();

  const passwordBuf2 = new TextEncoder().encode(newPassword);
  await primaryBridge.argon2id(
    toArrayBuffer(passwordBuf2),
    toArrayBuffer(newSalt),
  );

  const { blindedElement: blindedElement2 } = await primaryBridge.oprfBlind();
  const evaluated2B64 = await evaluateWithPowRetry(
    userId,
    blindedElement2,
    onPowRequired,
  );
  const evaluated2Bytes = decodeStandardBase64(evaluated2B64);
  await primaryBridge.deriveKeys(toArrayBuffer(evaluated2Bytes));

  // 8. Re-load org key into OrgKeyManager for continued session
  callbacks.onReloadOrgKey();
  const freshOrgKey = await fetchAndUnwrapOrgKey(primaryBridge);
  if (freshOrgKey !== null) {
    orgKeyManager.load(freshOrgKey);
  }

  callbacks.onDone();
}
