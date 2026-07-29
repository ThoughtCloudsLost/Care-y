/**
 * Settings enrollment auto-fill driver.
 *
 * Plays the "authenticator device" and "email inbox" roles for the demo
 * so visitors can complete TOTP and email/SMS 2FA enrollment flows on
 * the settings page without owning a real authenticator or inbox. The
 * server-side verification is real; only the code source is scripted.
 *
 * Pure helpers (extractCodeFromBody, computeTotpCode) are exported
 * separately for unit testing. The DOM-wiring entry point is
 * activateSettingsDriver / deactivateSettingsDriver.
 */

import type { OutboxEntry } from "./engine/outbox.js";
import { maskPasswordControls } from "./password-mask.js";

// Import the REAL server TOTP helpers via relative path. The demo
// Vite aliases resolve node:crypto to the browser shim, so these
// work in the phone iframe context.
import {
  base32Decode,
  generateTotpCode,
} from "../../../server/src/auth/totp.js";

// -----------------------------------------------------------------------
// Pure helpers (exported for tests)
// -----------------------------------------------------------------------

/**
 * Extract a 6-digit numeric code from an email or SMS body.
 * Returns null if no code is found.
 */
export function extractCodeFromBody(body: string): string | null {
  const match = /\b(\d{6})\b/.exec(body);
  return match?.[1] ?? null;
}

/**
 * Compute the current TOTP code from a base32-encoded secret string.
 * Wraps the server's generateTotpCode with base32 decoding and
 * the current timestamp.
 */
export function computeTotpCode(base32Secret: string): string {
  const secretBuf = base32Decode(base32Secret);
  return generateTotpCode(secretBuf, Date.now());
}

// -----------------------------------------------------------------------
// DOM interaction helpers (private)
// -----------------------------------------------------------------------

const AUTOFILL_DELAY_MS = 1500;

/**
 * Dispatch a synthetic input event that Svelte's bind:value picks up.
 * Mirrors the pattern in LoginMount.svelte.
 */
function fillInput(input: HTMLInputElement, value: string): void {
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * True when the element occupies on-screen space. Closed Konsta sheets
 * stay MOUNTED (offsetParent is non-null; they are translated off the
 * viewport), so document-order queries reach the wrong sheet's input
 * unless filtered by geometry.
 */
function isOnScreen(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  const view = el.ownerDocument.defaultView;
  if (view === null) return false;
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.top < view.innerHeight
  );
}

/**
 * Resolve the on-screen code input inside `scope`. TOTP and email/SMS
 * sheets all use autocomplete="one-time-code" for the verification
 * input, and every sheet stays mounted, so the geometry filter is what
 * selects the sheet the visitor is actually looking at.
 */
function findCodeInput(scope: Document | Element): HTMLInputElement | null {
  const inputs = scope.querySelectorAll<HTMLInputElement>(
    'input[autocomplete="one-time-code"]',
  );
  for (const input of inputs) {
    if (isOnScreen(input)) return input;
  }
  return null;
}

// -----------------------------------------------------------------------
// TOTP auto-fill
// -----------------------------------------------------------------------

/**
 * Scan the DOM for the TOTP enroll sheet's secret display. When found,
 * compute the current code and fill the input after a readable delay.
 * Returns true if a fill was dispatched, false if the sheet was not
 * in the right state.
 */
function tryTotpFill(root: Document): boolean {
  const secretEl = root.querySelector<HTMLElement>(
    '[data-testid="totp-secret"]',
  );
  if (secretEl === null || !isOnScreen(secretEl)) return false;

  const base32Text = secretEl.textContent.trim();
  if (base32Text.length === 0) return false;

  // Scope to the TOTP sheet's own dialog so the fill never lands in
  // another mounted sheet's code input.
  const scope = secretEl.closest('[role="dialog"]') ?? root;
  const codeInput = findCodeInput(scope);
  if (codeInput === null) return false;

  // Already filled (avoid re-dispatching on observer re-fire)
  if (codeInput.value.length === 6) return false;

  const code = computeTotpCode(base32Text);
  setTimeout(() => {
    // Re-check: the sheet may have been dismissed during the delay
    const stillVisible = root.querySelector('[data-testid="totp-secret"]');
    const input = findCodeInput(scope);
    if (
      stillVisible !== null &&
      isOnScreen(stillVisible) &&
      input !== null &&
      input.value.length < 6
    ) {
      fillInput(input, code);
    }
  }, AUTOFILL_DELAY_MS);

  return true;
}

// -----------------------------------------------------------------------
// Email / SMS outbox auto-fill
// -----------------------------------------------------------------------

/**
 * Handle an outbox entry: if a one-time-code input is visible, extract
 * the 6-digit code and fill it after a readable delay. Works for both
 * email and sms entry types.
 */
function handleOutboxEntry(root: Document, entry: OutboxEntry): void {
  const body = entry.body ?? "";
  const code = extractCodeFromBody(body);
  if (code === null) return;

  setTimeout(() => {
    const input = findCodeInput(root);
    if (input !== null && input.value.length < 6) {
      fillInput(input, code);
    }
  }, AUTOFILL_DELAY_MS);
}

// -----------------------------------------------------------------------
// Lifecycle: activate / deactivate
// -----------------------------------------------------------------------

interface DriverHandle {
  disconnect(): void;
}

let activeHandle: DriverHandle | null = null;

/**
 * Activate the settings enrollment driver. Observes the DOM for TOTP
 * secret elements and subscribes to the engine outbox for email/SMS
 * codes. Call deactivateSettingsDriver() to clean up.
 *
 * @param root       The document to observe (phone iframe document)
 * @param onOutbox   Outbox subscription function from the engine
 */
export function activateSettingsDriver(
  root: Document,
  onOutbox: (cb: (entry: OutboxEntry) => void) => () => void,
): void {
  // Idempotent: disconnect any previous handle
  if (activeHandle !== null) {
    activeHandle.disconnect();
    activeHandle = null;
  }

  // TOTP: watch for the secret element to appear. Reset the filled
  // flag when the secret element disappears so re-opening the sheet
  // within the same settings session triggers a fresh fill.
  let totpFilled = false;

  function scan(): void {
    // The password and username sheets carry type="password" controls;
    // Chrome offers to save them after a change (provisional save fires
    // while typing, so value clearing cannot suppress it). Mask any new
    // ones the same way the login form is masked.
    maskPasswordControls(root);

    // Closed sheets stay mounted, so presence alone cannot gate the
    // reset; the geometry check tracks whether the sheet is truly open.
    const secretEl = root.querySelector('[data-testid="totp-secret"]');
    const secretVisible = secretEl !== null && isOnScreen(secretEl);
    if (!secretVisible) {
      totpFilled = false;
      return;
    }
    if (!totpFilled) {
      totpFilled = tryTotpFill(root);
    }
  }

  const observer = new MutationObserver(scan);
  observer.observe(root.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style"],
  });

  // Initial scan in case the sheet is already open
  scan();

  // Outbox: subscribe for email/SMS codes
  const unsubOutbox = onOutbox((entry: OutboxEntry) => {
    handleOutboxEntry(root, entry);
  });

  activeHandle = {
    disconnect(): void {
      observer.disconnect();
      unsubOutbox();
    },
  };
}

/**
 * Deactivate the settings enrollment driver. Safe to call when
 * no driver is active (no-op).
 */
export function deactivateSettingsDriver(): void {
  if (activeHandle !== null) {
    activeHandle.disconnect();
    activeHandle = null;
  }
}
