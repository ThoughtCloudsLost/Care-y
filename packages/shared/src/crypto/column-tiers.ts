/**
 * Encrypted column-to-tier manifest.
 *
 * Maps every encrypted client-data column to its encryption tier so the
 * tier is declared once and read by both sides. The org-key
 * reseal engine (RED_TIER_TABLES) derives its table list from this
 * manifest rather than maintaining a separate enumeration.
 *
 * Tier definitions:
 * - "org": sealed-box encrypted with the org public key. Only clients
 *   holding the org private key can decrypt. Subject to org-key reseal
 *   after rotation.
 * - "ops": encrypted with OPS_SECRETS_KEY via FieldEncryptor
 *   (XSalsa20-Poly1305). The server can decrypt for operational use
 *   (telephony relay, contact resolution). Not subject to org-key reseal.
 */

export type EncryptionTier = "org" | "ops";

export interface ColumnTierEntry {
  /** Column name as it appears in the database table. */
  readonly column: string;
  /** Encryption tier governing this column. */
  readonly tier: EncryptionTier;
  /** ADR(s) that decided or confirmed this column's tier assignment. */
  readonly adrs: readonly string[];
}

/**
 * Per-table manifest of encrypted columns and their tiers.
 *
 * Tables with only org-tier columns appear in the org-key reseal set.
 * Tables with only ops-tier columns do not. Tables with a mix of both
 * would need special handling (none exist today).
 */
export const COLUMN_TIER_MANIFEST: Readonly<
  Record<string, readonly ColumnTierEntry[]>
> = {
  /** phones.encrypted_number: OPS tier. All writers (inbound-call,
   *  inbound-sms, client-service updatePhone) use FieldEncryptor.
   *  Readers (contact-resolution, phoneForViewer) use
   *  fieldEncryptor.decryptToBuffer. ADR-005 (OPS_SECRETS_KEY),
   *  ADR-069 (client phone storage), ADR-096 (tier convergence). */
  phones: [
    {
      column: "encrypted_number",
      tier: "ops",
      adrs: ["ADR-005", "ADR-069", "ADR-096"],
    },
  ],

  /** emails.encrypted_address: OPS tier. Same rationale as phones. */
  emails: [
    {
      column: "encrypted_address",
      tier: "ops",
      adrs: ["ADR-005", "ADR-069", "ADR-096"],
    },
  ],

  /** clients.encrypted_alias: org tier. Alias is person-identifying
   *  and must not be server-readable. */
  clients: [{ column: "encrypted_alias", tier: "org", adrs: ["ADR-052"] }],

  /** users: org tier for volunteer identity columns. */
  users: [
    { column: "encrypted_identifier", tier: "org", adrs: ["ADR-052"] },
    { column: "encrypted_display_name", tier: "org", adrs: ["ADR-052"] },
  ],

  /** sessions: org tier for IP and user-agent metadata. */
  sessions: [
    { column: "encrypted_ip_address", tier: "org", adrs: ["ADR-052"] },
    { column: "encrypted_user_agent", tier: "org", adrs: ["ADR-052"] },
  ],

  /** consultants: org tier for volunteer phone/display name. */
  consultants: [
    { column: "encrypted_display_name", tier: "org", adrs: ["ADR-052"] },
    {
      column: "ops_encrypted_phone",
      tier: "ops",
      adrs: ["ADR-005", "ADR-065"],
    },
  ],

  /** queues: org tier for queue metadata. */
  queues: [
    { column: "encrypted_name", tier: "org", adrs: ["ADR-052"] },
    { column: "encrypted_color", tier: "org", adrs: ["ADR-052"] },
    { column: "encrypted_icon", tier: "org", adrs: ["ADR-052"] },
  ],

  /** note_types: org tier. */
  note_types: [
    { column: "encrypted_name", tier: "org", adrs: ["ADR-052"] },
    { column: "encrypted_icon", tier: "org", adrs: ["ADR-052"] },
    { column: "encrypted_description", tier: "org", adrs: ["ADR-052"] },
  ],

  /** kb_categories: org tier. */
  kb_categories: [
    { column: "encrypted_name", tier: "org", adrs: ["ADR-052"] },
    { column: "encrypted_description", tier: "org", adrs: ["ADR-052"] },
  ],

  /** kb_items: org tier. */
  kb_items: [
    { column: "encrypted_title", tier: "org", adrs: ["ADR-052"] },
    { column: "encrypted_body", tier: "org", adrs: ["ADR-052"] },
    { column: "encrypted_excerpt", tier: "org", adrs: ["ADR-052"] },
  ],

  /** preset_replies: org tier. */
  preset_replies: [
    { column: "encrypted_title", tier: "org", adrs: ["ADR-052"] },
    { column: "encrypted_body", tier: "org", adrs: ["ADR-052"] },
  ],

  /** voicemail_quarantine: org tier (columns and blob). */
  voicemail_quarantine: [
    { column: "encrypted_caller_number", tier: "org", adrs: ["ADR-052"] },
    { column: "encrypted_called_number", tier: "org", adrs: ["ADR-052"] },
  ],

  /** intake_key_wraps: org tier (ticket key wraps). */
  intake_key_wraps: [{ column: "wrapped_tk", tier: "org", adrs: ["ADR-041"] }],

  /** portal_reply_key_wraps: org tier (portal reply key wraps). */
  portal_reply_key_wraps: [
    { column: "wrapped_tk", tier: "org", adrs: ["ADR-041"] },
  ],

  /** phone_blocklist: org tier. */
  phone_blocklist: [
    { column: "encrypted_number", tier: "org", adrs: ["ADR-052"] },
  ],

  /** invite_tokens: org tier. */
  invite_tokens: [
    { column: "encrypted_token", tier: "org", adrs: ["ADR-052"] },
  ],

  /** saved_filters: org tier. Filter name and state are org-key-sealed
   *  so volunteers can share filters without server-readable content.
   *  ADR-064 (org-key tier for non-PII org configuration data). */
  saved_filters: [
    { column: "encrypted_name", tier: "org", adrs: ["ADR-064"] },
    { column: "encrypted_state", tier: "org", adrs: ["ADR-064"] },
  ],
} as const;

/**
 * Returns the set of table names whose encrypted columns are exclusively
 * org-tier. These are the tables that require org-key reseal after
 * rotation. Tables with any OPS-tier columns (phones, emails) or mixed
 * tiers (consultants) are excluded from the reseal set.
 *
 * This function is the canonical source for reseal-eligible tables.
 * RED_TIER_TABLES and TRAILING_TIER_TABLES in the client reseal engine
 * should be validated against this set.
 */
export function getOrgTierTables(): readonly string[] {
  return Object.entries(COLUMN_TIER_MANIFEST)
    .filter(([, entries]) => entries.every((e) => e.tier === "org"))
    .map(([table]) => table);
}
