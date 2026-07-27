/**
 * Stub for $lib/auth/login-crypto.
 *
 * Reproduces the real module's exported surface. The loginCrypto
 * function plays callbacks on timers at narratable speed instead
 * of running real Argon2id/OPRF/derive in a Worker.
 */

import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

// -----------------------------------------------------------------------
// Exported types (mirror the real module exactly)
// -----------------------------------------------------------------------

export interface LoginCryptoResult {
  /** Base64-encoded volunteer public key (for display or upload). */
  volPublic: string;
  /** Org public key (base64). Worker retains the secret. Null if org not onboarded. */
  orgPublicKey: string | null;
}

export interface CryptoPhaseCallbacks {
  onArgon2idStart: () => void;
  onArgon2idDone: () => void;
  onOprfStart: () => void;
  onOprfDone: () => void;
  onDeriveStart: () => void;
  onDone: () => void;
}

export interface LoginCryptoCallbacks extends CryptoPhaseCallbacks {
  onPowRequired: (challenge: string, difficulty: number) => Promise<string>;
}

// -----------------------------------------------------------------------
// Demo implementation
// -----------------------------------------------------------------------

async function wait(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Stage listener: the login stage tracker subscribes to know when
 * each phase starts. Module-level so LoginMount can register one.
 */
let stageListener: ((stage: string) => void) | null = null;

export function setLoginCryptoStageListener(
  listener: ((stage: string) => void) | null,
): void {
  stageListener = listener;
}

/**
 * Demo loginCrypto: plays callbacks on timers at narratable speed.
 * Never calls onPowRequired.
 */
export async function loginCrypto(
  _identifier: string,
  _password: string,
  _bridge: CryptoBridge,
  callbacks: LoginCryptoCallbacks,
): Promise<LoginCryptoResult> {
  // Argon2id phase (~1.5s)
  callbacks.onArgon2idStart();
  stageListener?.("argon2id");
  await wait(1500);
  callbacks.onArgon2idDone();

  // OPRF phase (~1.5s)
  callbacks.onOprfStart();
  stageListener?.("oprf");
  await wait(1500);
  callbacks.onOprfDone();

  // Derive phase (~1.2s)
  callbacks.onDeriveStart();
  stageListener?.("derive");
  await wait(1200);

  // Done
  callbacks.onDone();
  stageListener?.("done");

  return {
    volPublic: "demo-vol-public",
    orgPublicKey: "demo-org-public",
  };
}
