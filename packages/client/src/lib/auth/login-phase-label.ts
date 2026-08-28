/**
 * Localized label for each key-derivation phase.
 *
 * Login surfaces render KeyDerivation while Argon2id, the OPRF round trip,
 * and proof-of-work run, so the multi-second wait reads as security work
 * rather than a stall. The mapping lives here so every surface that shows
 * that progress names the phases the same way.
 */

import * as m from "$lib/paraglide/messages.js";
import type { LoginPhaseId } from "$lib/components/onboarding/login-phase.js";

export function getLoginPhaseLabel(phase: LoginPhaseId): string {
  switch (phase) {
    case "auth":
      return m.auth_phase_auth();
    case "argon2id":
      return m.auth_phase_argon2id();
    case "oprf":
      return m.auth_phase_oprf();
    case "pow":
      return m.auth_phase_pow();
    case "derive":
      return m.auth_phase_derive();
    case "done":
      return m.auth_phase_done();
    // No derivation is running in these states, so there is nothing to
    // narrate and KeyDerivation renders nothing.
    case "briefing":
    case "idle":
    case "twofa":
    case "twofa-verify":
    case "error":
      return "";
  }
}
