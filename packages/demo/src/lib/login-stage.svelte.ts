/**
 * Login stage tracking for the demo.
 *
 * Transitions are driven by real code paths, not guesses:
 *   - auth.login resolve -> "twofa-picker"
 *   - 2FA method opened  -> "twofa-method"
 *   - login-crypto onArgon2idStart -> "deriving"
 *   - post goto("/") -> null (feature switches to tickets)
 *
 * The PhoneApp reads `loginStage` and publishes it in bridge state.
 */

import type { LoginStage } from "./bridge.js";

// Reactive stage value, managed exclusively by this module
let stage: LoginStage | null = $state<LoginStage | null>("form");

export function getLoginStage(): LoginStage | null {
  return stage;
}

export function setLoginStage(s: LoginStage | null): void {
  stage = s;
}

export function resetLoginStage(): void {
  stage = "form";
}
