/**
 * Login effect specs.
 *
 * Mark-only topics with PRESENCE specs:
 * - language: the language picker control on the login form stage.
 * - credentials: the sign-in form's username and password fields.
 * - twofa: the 2FA method picker list (picker stage).
 * - twofa-passkey: the passkey method row on the picker.
 *
 * Method screen specs (the advance chain opens each method screen
 * before the pulse fires, so the method's own UI is on screen):
 * - twofa-totp: TOTP code entry input.
 * - twofa-email: email send-code button (shared selector with sms/push).
 * - twofa-sms: SMS send-code button (shared selector with email/push).
 * - twofa-push: push send button (shared selector with email/sms).
 * - twofa-backup: backup code entry with its unique back button.
 *
 * Allowlisted pulse gaps (see pulse-allowlist.ts):
 * - key-derivation: deriving screen requires completeLogin, walk
 *   visits sub only.
 */

import type { EffectMap } from "./types.js";

export const EFFECTS: EffectMap = new Map([
  [
    "language",
    {
      description: "Language picker control is visible on the login form",
      visible: [
        // LanguagePicker.svelte:19 - wrapper div with scoped class
        ".language-picker",
      ],
    },
  ],
  [
    "credentials",
    {
      description: "Username and password fields are visible on the login form",
      visible: [
        // login/+page.svelte:367 - Konsta ListInput with autocomplete
        'input[autocomplete="username"]',
        // PasswordInput.svelte:48 - native input with autocomplete
        'input[autocomplete="current-password"]',
      ],
    },
  ],
  [
    "twofa",
    {
      description: "2FA method picker stage is visible",
      visible: [
        // login/+page.svelte:311 - back-to-login button unique to
        // the twofa-verify phase; class is stable (scoped in the
        // login page's <style> block at line 400)
        "button.back-link",
      ],
    },
  ],
  [
    "twofa-passkey",
    {
      description: "Passkey method row is visible on the 2FA picker",
      visible: [
        // TwoFactorChallenge.svelte:463 - per-method data-testid on the
        // picker's ListItem loop; webauthn is the passkey method key
        '[data-testid="twofa-method-webauthn"]',
      ],
    },
  ],

  // ── Method screen specs ──
  //
  // The advance chain (PhoneApp.svelte:960-968) clicks the picker item
  // for the method, opening that method's screen. loginStage transitions
  // to "twofa-method" (login-stage.svelte.ts:22). The pulse then fires
  // and finds the method's own controls. Each spec asserts an element
  // unique to the open method screen, distinguishing it from the picker
  // (whose ListItems with data-testid="twofa-method-*" are removed when
  // a method is active).

  [
    "twofa-totp",
    {
      description: "TOTP code entry input is visible on the method screen",
      visible: [
        // TwoFactorChallenge.svelte:497 - ListInput with
        // autocomplete="one-time-code" inside the TOTP form.
        // Only rendered when activeMethod === "totp" (line 481).
        'input[autocomplete="one-time-code"]',
      ],
    },
  ],
  [
    "twofa-email",
    {
      description: "Email send-code button is visible on the method screen",
      visible: [
        // TwoFactorChallenge.svelte:538-550 - SoftButton (full) renders
        // button.soft-btn.soft-btn--full when activeMethod === "email"
        // and resendCooldown <= 0 (line 536). selectMethod resets
        // resendCooldown to 0 (line 443), so the send button is the
        // initial state. Structurally identical to sms/push initial
        // states; the walk's convergence pins loginStage, so a shared
        // selector is acceptable.
        ".soft-btn--full",
      ],
    },
  ],
  [
    "twofa-sms",
    {
      description: "SMS send-code button is visible on the method screen",
      visible: [
        // TwoFactorChallenge.svelte:593-606 - SoftButton (full) renders
        // button.soft-btn.soft-btn--full when activeMethod === "sms"
        // and resendCooldown <= 0 (line 592). Same structure as the
        // email initial state; shared selector acceptable since
        // loginStage pins the method.
        ".soft-btn--full",
      ],
    },
  ],
  [
    "twofa-push",
    {
      description: "Push send button is visible on the method screen",
      visible: [
        // TwoFactorChallenge.svelte:654-668 - SoftButton (full) renders
        // button.soft-btn.soft-btn--full when activeMethod === "push"
        // and pushChallengeId === null (line 653). Same structure as
        // email/sms initial states; shared selector acceptable since
        // loginStage pins the method.
        ".soft-btn--full",
      ],
    },
  ],
  [
    "twofa-backup",
    {
      description:
        "Backup code entry with back button is visible on the method screen",
      visible: [
        // TwoFactorChallenge.svelte:702-716 - button.backup-code-link
        // is the back/cancel control unique to the backup code entry
        // screen. Only rendered when activeMethod === "backup" (line 670).
        ".backup-code-link",
      ],
    },
  ],
]);
