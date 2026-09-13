/**
 * Email-expected caution state for the compose bar.
 *
 * Surfaces a dismissable caution when the latest client-sourced follow-up
 * is an inbound email, warning that the client may expect an email reply
 * and might not see an SMS or portal message.
 *
 * Dismissal is session-scoped (module-level Set, survives component
 * remount, resets on full page reload) following the same pattern as
 * create-exposure-hint.svelte.ts.
 */

import { isEmailInbound } from "$lib/tickets/follow-up-utils.js";

// Module-level: survives component unmount/remount within the SPA session.
// Resets on full page reload (new session), which is the intended behavior.
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- not reactive, used as mutable dedup tracker
const dismissedTickets = new Set<string>();

/**
 * Given an unfiltered ascending follow-up list, returns true when the
 * newest client-sourced follow-up is an inbound email.
 */
export function latestClientFollowUpIsEmail(
  followUps: readonly { source: string; type: string }[],
): boolean {
  // Walk backwards (newest first) to find the latest client-sourced entry.
  for (let i = followUps.length - 1; i >= 0; i--) {
    const fu = followUps.at(i);
    if (fu?.source === "client") {
      return isEmailInbound(fu);
    }
  }
  return false;
}

/** Mark the email-expected caution as dismissed for a given ticket. */
export function dismissEmailExpected(ticketId: string): void {
  dismissedTickets.add(ticketId);
}

/** Whether the email-expected caution has been dismissed for a ticket. */
export function isEmailExpectedDismissed(ticketId: string): boolean {
  return dismissedTickets.has(ticketId);
}

/** @internal Test-only: clear the session-level dismissal set between test cases. */
export function _resetEmailExpectedDismissals(): void {
  dismissedTickets.clear();
}
