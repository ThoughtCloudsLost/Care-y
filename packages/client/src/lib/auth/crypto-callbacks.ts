/**
 * Factory functions for RegisterCryptoCallbacks and LoginCryptoCallbacks.
 *
 * Each auth flow (login, bootstrap, invite) builds the same callback
 * shape with minor variations for phase updates and announcements.
 * These factories eliminate the per-consumer noop boilerplate.
 */

import { announceToLiveRegion } from "$lib/utils/announce.js";
import { solveProofOfWork } from "$lib/auth/pow-solver.js";
import type { RegisterCryptoCallbacks } from "$lib/auth/register-crypto.js";
import type { LoginCryptoCallbacks } from "$lib/auth/login-crypto.js";
import type { LoginPhaseId } from "$lib/components/onboarding/login-phase.js";

export type PhaseUpdater = (phase: LoginPhaseId) => void;

interface PhaseMessages {
  argon2id?: string;
  derive?: string;
  pow?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function -- protocol-required no-op for unused callbacks
const noop = (): void => {};

function announce(msg: string | undefined): void {
  if (msg !== undefined) announceToLiveRegion("polite", msg);
}

export function buildRegisterCallbacks(
  setPhase: PhaseUpdater,
  messages: PhaseMessages = {},
): RegisterCryptoCallbacks {
  return {
    onArgon2idStart: () => {
      setPhase("argon2id");
      announce(messages.argon2id);
    },
    onArgon2idDone: noop,
    onOprfStart: () => {
      setPhase("oprf");
    },
    onOprfDone: noop,
    onDeriveStart: () => {
      setPhase("derive");
      announce(messages.derive);
    },
    onDone: noop,
    onUploadStart: noop,
  };
}

export function buildLoginCallbacks(
  setPhase: PhaseUpdater,
  messages: PhaseMessages = {},
): LoginCryptoCallbacks {
  return {
    onArgon2idStart: () => {
      setPhase("argon2id");
      announce(messages.argon2id);
    },
    onArgon2idDone: noop,
    onOprfStart: () => {
      setPhase("oprf");
    },
    onOprfDone: noop,
    onDeriveStart: () => {
      setPhase("derive");
      announce(messages.derive);
    },
    onDone: noop,
    onPowRequired: async (challenge, difficulty) => {
      setPhase("pow");
      announce(messages.pow);
      return solveProofOfWork(challenge, difficulty);
    },
  };
}
