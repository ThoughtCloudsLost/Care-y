/**
 * Stub for $lib/auth/login-crypto.
 *
 * Reproduces the real module's exported surface. The loginCrypto
 * function plays callbacks on timers at narratable speed (~4.2s total)
 * while the real key derivation runs concurrently via ensureKeyed().
 * Resolves when BOTH pacing and derivation are done, returning the
 * REAL LoginCryptoResult.
 */

import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import {
  ensureKeyed,
  getEnsureKeyedResult,
  getDerivationRecording,
} from "./crypto-context.svelte.js";
import {
  emitFlowEvent,
  flowNow,
  buildFlowDetail,
  replayRecordedEvents,
  roundFlowDuration,
} from "../lib/flow-events.js";
import type { RecordedFlowEvent } from "../lib/flow-events.js";

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
// Error type
// -----------------------------------------------------------------------

class DemoLoginCryptoError extends Error {
  override readonly name = "DemoLoginCryptoError";
}

// -----------------------------------------------------------------------
// Recorded span replay
// -----------------------------------------------------------------------

/**
 * Phase label prefixes used to match recorded server spans to the
 * paced choreography phase they belong in.
 *
 * auth.getSalt belongs in argon2id (the salt is fetched before hashing).
 * auth.oprfEvaluate belongs in oprf.
 * orgKey, keys, and derive-related calls belong in derive.
 */
type ReplayPhase = "argon2id" | "oprf" | "derive";

const PHASE_MATCHERS: readonly {
  readonly phase: ReplayPhase;
  readonly test: (label: string) => boolean;
}[] = [
  {
    phase: "argon2id",
    test: (l) => l.includes("getSalt") || l.includes("salt"),
  },
  {
    phase: "oprf",
    test: (l) => l.includes("oprf") || l.includes("Oprf") || l.includes("OPRF"),
  },
  {
    phase: "derive",
    test: (l) =>
      l.includes("orgKey") ||
      l.includes("org_key") ||
      l.includes("derive") ||
      l.includes("keys"),
  },
];

interface PhasedRecording {
  readonly argon2id: readonly RecordedFlowEvent[];
  readonly oprf: readonly RecordedFlowEvent[];
  readonly derive: readonly RecordedFlowEvent[];
}

/**
 * Partition recorded events into phases by label. Events that match
 * no phase prefix are placed into "derive" as a fallback so they are
 * not dropped.
 */
function partitionByPhase(
  events: readonly RecordedFlowEvent[],
): PhasedRecording {
  const argon2id: RecordedFlowEvent[] = [];
  const oprf: RecordedFlowEvent[] = [];
  const derive: RecordedFlowEvent[] = [];

  for (const event of events) {
    let matched = false;
    for (const { phase, test } of PHASE_MATCHERS) {
      if (test(event.label)) {
        switch (phase) {
          case "argon2id":
            argon2id.push(event);
            break;
          case "oprf":
            oprf.push(event);
            break;
          case "derive":
            derive.push(event);
            break;
        }
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Unmatched events go to derive rather than being dropped
      derive.push(event);
    }
  }

  return { argon2id, oprf, derive };
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

/**
 * Whether a PACED login choreography is currently playing. True from
 * loginCrypto entry until it settles (either way). The background
 * ensureKeyed (eager keying after engine boot) never sets this, only
 * a scene submit does. PhoneApp's advance chain reads it to refuse
 * rewinding the login scene mid-choreography, where a remount would
 * leave the old pacing timers driving the stage listener of the new
 * scene.
 */
let pacedInFlight = false;

export function isPacedLoginInFlight(): boolean {
  return pacedInFlight;
}

export function setLoginCryptoStageListener(
  listener: ((stage: string) => void) | null,
): void {
  stageListener = listener;
}

/** Scripted durations for each phase, matching the wait() calls below. */
/**
 * The pace the demo plays each phase at, which is not the same as the
 * time the real derivation takes. Both go in the detail so the seam is
 * honest about which number is which.
 *
 * A switch rather than a keyed record: every phase is covered at compile
 * time and no variable index reaches an object.
 */
function scriptedDurationMs(phase: ReplayPhase): number {
  switch (phase) {
    case "argon2id":
      return 1500;
    case "oprf":
      return 1500;
    case "derive":
      return 1200;
  }
}

/**
 * Report a paced phase to the flow band. The durations are the demo's
 * narratable timings, not the real derivation, which is why every phase
 * event carries the login-pacing seam.
 */
function emitPhase(
  phase: ReplayPhase,
  polarity: "start" | "done",
  startedAt: number | null,
): void {
  const measuredMs = startedAt === null ? null : flowNow() - startedAt;
  emitFlowEvent({
    lane: "crypto",
    direction: "local",
    label: `${phase} ${polarity}`,
    seamKey: "login-pacing",
    durationMs: measuredMs,
    detail: buildFlowDetail({
      input: [
        { name: "phase", value: phase, kind: "identifier" },
        { name: "polarity", value: polarity, kind: "metadata" },
      ],
      result:
        polarity === "done"
          ? [
              {
                name: "scripted duration",
                value: `${String(scriptedDurationMs(phase))}ms`,
                kind: "metadata",
              },
              {
                name: "measured duration",
                value:
                  measuredMs === null
                    ? "n/a"
                    : `${String(roundFlowDuration(measuredMs) ?? 0)}ms`,
                kind: "metadata",
              },
            ]
          : [],
    }),
  });
}

/**
 * Demo loginCrypto: plays callbacks on timers at narratable speed
 * (~4.2s total) while the real derivation runs concurrently.
 * Resolves when BOTH the pacing sequence and the real derivation
 * are complete. Returns the REAL LoginCryptoResult from ensureKeyed.
 *
 * Never calls onPowRequired.
 */
export async function loginCrypto(
  _identifier: string,
  _password: string,
  _bridge: CryptoBridge,
  callbacks: LoginCryptoCallbacks,
): Promise<LoginCryptoResult> {
  pacedInFlight = true;
  try {
    return await runPacedLogin(callbacks);
  } finally {
    pacedInFlight = false;
  }
}

async function runPacedLogin(
  callbacks: LoginCryptoCallbacks,
): Promise<LoginCryptoResult> {
  // Start the real derivation concurrently with the pacing sequence.
  const realDerivation = ensureKeyed();

  // Partition recorded server spans by phase so they can be replayed
  // alongside the paced choreography with their real measured timing.
  const recorded = getDerivationRecording();
  const phased = recorded !== null ? partitionByPhase(recorded) : null;

  // Pacing sequence: fire callbacks at narratable speed
  // Argon2id phase (~1.5s)
  callbacks.onArgon2idStart();
  stageListener?.("argon2id");
  const argon2idStartedAt = flowNow();
  emitPhase("argon2id", "start", null);
  if (phased !== null && phased.argon2id.length > 0) {
    replayRecordedEvents(phased.argon2id, "recorded-derivation");
  }
  await wait(1500);
  callbacks.onArgon2idDone();
  emitPhase("argon2id", "done", argon2idStartedAt);

  // OPRF phase (~1.5s)
  callbacks.onOprfStart();
  stageListener?.("oprf");
  const oprfStartedAt = flowNow();
  emitPhase("oprf", "start", null);
  if (phased !== null && phased.oprf.length > 0) {
    replayRecordedEvents(phased.oprf, "recorded-derivation");
  }
  await wait(1500);
  callbacks.onOprfDone();
  emitPhase("oprf", "done", oprfStartedAt);

  // Derive phase (~1.2s)
  callbacks.onDeriveStart();
  stageListener?.("derive");
  const deriveStartedAt = flowNow();
  emitPhase("derive", "start", null);
  if (phased !== null && phased.derive.length > 0) {
    replayRecordedEvents(phased.derive, "recorded-derivation");
  }
  await wait(1200);

  // Wait for the real derivation to finish (it almost certainly
  // completed before the 4.2s pacing, but if not, we wait).
  await realDerivation;

  // Done
  callbacks.onDone();
  stageListener?.("done");
  emitPhase("derive", "done", deriveStartedAt);

  // Return the REAL result from ensureKeyed
  const result = getEnsureKeyedResult();
  if (result === null) {
    throw new DemoLoginCryptoError(
      "ensureKeyed completed but no result was cached",
    );
  }
  return result;
}
