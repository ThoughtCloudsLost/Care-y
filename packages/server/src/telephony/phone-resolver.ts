/**
 * Resolves which provisioned phone number to use as caller ID for a given
 * purpose (outbound client comms vs automated system messages).
 *
 * Uses org_config.phone_outbound_sid / phone_system_sid to map purpose to
 * a specific Twilio PN SID, then matches against the org's provisioned
 * phone numbers to get the E.164 number. Fallback chain ensures single-
 * number orgs work without any admin configuration.
 */

export type PhonePurpose = "outbound" | "system";

export interface PhoneResolverDeps {
  /** Read org_config phone purpose SIDs from the tenant schema. */
  readonly getOrgConfig: (orgSchema: string) => Promise<{
    phone_outbound_sid: string | null;
    phone_system_sid: string | null;
  }>;
  /** Get provisioned phone numbers from the provider config blob. */
  readonly getProvisionedPhones: (
    orgSchema: string,
  ) => Promise<readonly { number: string; sid: string }[]>;
}

/**
 * Creates a phone resolver bound to its dependencies.
 *
 * Fallback chain:
 *   "system"   -> phone_system_sid -> phone_outbound_sid -> first provisioned
 *   "outbound" -> phone_outbound_sid -> first provisioned
 *
 * Returns null if no provisioned numbers exist at all.
 *
 * Future phases can extend PhonePurpose with additional values
 * (e.g., "notification") and add corresponding org_config columns.
 * The fallback chain ensures existing orgs keep working without
 * reconfiguration when new purposes are added.
 */
export function createPhoneResolver(
  deps: PhoneResolverDeps,
): (orgSchema: string, purpose: PhonePurpose) => Promise<string | null> {
  return async function resolveCallerIdByPurpose(
    orgSchema: string,
    purpose: PhonePurpose,
  ): Promise<string | null> {
    const phones = await deps.getProvisionedPhones(orgSchema);
    if (phones.length === 0) return null;

    const config = await deps.getOrgConfig(orgSchema);

    // Build the SID fallback chain for this purpose
    const sidCandidates: (string | null)[] =
      purpose === "system"
        ? [config.phone_system_sid, config.phone_outbound_sid]
        : [config.phone_outbound_sid];

    // Try each SID in order, match against provisioned numbers
    for (const sid of sidCandidates) {
      if (sid === null) continue;
      const match = phones.find((p) => p.sid === sid);
      if (match) return match.number;
    }

    // Final fallback: first provisioned number (length > 0 guaranteed above)
    const first = phones[0];
    return first ? first.number : null;
  };
}
