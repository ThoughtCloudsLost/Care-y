// Database interfaces. Do NOT overwrite with kysely-codegen output.
// If kysely-codegen is run for verification, its output is comparison-only and never committed.

// PlatformDatabase: tables in the `public` schema (shared across all orgs).
// TenantDatabase: tables in per-org `org_<uuid>` schemas.
// Both interfaces are append-only. Never rename or remove existing entries.

// Type conventions:
//   Generated<T>           - auto-increment or server-generated column (omitted on insert)
//   ColumnType<S,I,U>      - different select/insert/update types
//   Buffer                 - encrypted bytea column

import type { ColumnType, Generated } from "kysely";

export interface OrgsTable {
  id: Generated<string>;
  slug: string;
  schema_name: string;
  is_active: ColumnType<boolean, boolean | undefined, boolean>;
}

// --- OPRF infrastructure ---

export interface OprfConfigTable {
  id: number;
  server_a_url: string;
  server_b_url: string;
  refresh_epoch: number;
  last_refresh_at: Date | null;
  created_at: Date;
}

export interface OprfAuditLogTable {
  id: Generated<string>;
  user_id: string;
  hashed_ip: string;
  reason: string;
  timestamp: Generated<Date>;
}

export interface PlatformDatabase {
  orgs: OrgsTable;
  oprf_config: OprfConfigTable;
  oprf_audit_log: OprfAuditLogTable;
  // Telephony (telephony_config)
  // Production (deletion_requests)
}

export interface UsersTable {
  id: Generated<string>;
  identifier_hash: string;
  encrypted_identifier: Buffer;
  password_hash: string;
  encrypted_display_name: Buffer;
  encrypted_notification_addr: Buffer | null;
  role_id: string;
  is_active: ColumnType<boolean, boolean | undefined, boolean>;
}

export interface SessionsTable {
  id: Generated<string>;
  token: string;
  user_id: string;
  encrypted_ip_address: Buffer;
  encrypted_user_agent: Buffer;
  expires_at: Date;
  twofa_verified: ColumnType<boolean, boolean | undefined, boolean>;
  webauthn_challenge: string | null;
}

export interface OrgConfigTable {
  id: Generated<string>;
  encrypted_name: Buffer | null;
  encrypted_logo: Buffer | null;
  encrypted_primary_color: Buffer | null;
  encrypted_client_text: Buffer | null;
  client_encrypted_branding: Buffer | null;
  pii_retention_days: number | null;
}

// --- Salt Defense (user_keys stub) ---
// The crypto layer extends this table with vol_public, pq_public, key_version,
// rotated_at via ALTER TABLE migration. Do NOT add those columns here.
export interface UserKeysStubTable {
  user_id: string;
  salt: Buffer;
}

// --- WebAuthn credentials ---
export interface WebauthnCredentialsTable {
  id: Generated<string>;
  user_id: string;
  credential_id: string;
  public_key: string;
  sign_count: ColumnType<number, number | undefined, number>;
  transports: string[] | null;
  device_type: string | null;
  backed_up: ColumnType<boolean, boolean | undefined, boolean>;
  aaguid: string | null;
  ordinal: number;
}

// --- TOTP secrets ---
export interface TotpSecretsTable {
  id: Generated<string>;
  user_id: string;
  encrypted_secret: Buffer;
  verified: ColumnType<boolean, boolean | undefined, boolean>;
}

// --- Email verification codes ---
export interface EmailCodesTable {
  id: Generated<string>;
  user_id: string;
  code_hash: string;
  expires_at: Date;
  attempts: ColumnType<number, number | undefined, number>;
  consumed: ColumnType<boolean, boolean | undefined, boolean>;
}

// --- Backup codes ---
export interface BackupCodesTable {
  id: Generated<string>;
  user_id: string;
  code_hash: string;
  is_used: ColumnType<boolean, boolean | undefined, boolean>;
}

// --- 2FA method registry ---
export interface TwoFactorMethodsTable {
  id: Generated<string>;
  user_id: string;
  method_type: string;
  is_active: ColumnType<boolean, boolean | undefined, boolean>;
}

export interface TenantDatabase {
  users: UsersTable;
  sessions: SessionsTable;
  org_config: OrgConfigTable;
  user_keys: UserKeysStubTable;
  webauthn_credentials: WebauthnCredentialsTable;
  totp_secrets: TotpSecretsTable;
  email_codes: EmailCodesTable;
  backup_codes: BackupCodesTable;
  two_factor_methods: TwoFactorMethodsTable;
  // Cryptography (ticket_key_wraps)
  // Tickets (tickets, followups, audit_log)
  // Shifts (shifts, shift_occurrences)
  // Client portal (portal_channels)
}
