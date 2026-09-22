/**
 * Shared logic for persisting the user's preferred locale.
 *
 * Used by the settings page row and the AppShell one-time offer.
 * The locale is sealed client-side with the org public key before
 * being sent to the server, matching the account-creation paths.
 */

import type { OrgKeyManager } from "$lib/crypto/org-key.js";
import { trpc } from "$lib/trpc/index.js";

/**
 * Seals a locale string with the org public key and persists it
 * via the profile.updatePreferredLocale mutation.
 *
 * Throws on encryption or network failure (callers handle errors).
 */
export async function savePreferredLocale(
  orgKeyManager: OrgKeyManager,
  locale: string,
): Promise<void> {
  const encryptedPreferredLocale = await orgKeyManager.encryptText(locale);
  await trpc.profile.updatePreferredLocale.mutate({ encryptedPreferredLocale });
}
