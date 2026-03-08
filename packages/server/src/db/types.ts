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
  created_at: Generated<Date>;
}

export interface PlatformDatabase {
  orgs: OrgsTable;
  // Telephony (telephony_config)
  // Production (deletion_requests)
}

export interface UsersTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  display_name: string;
  role_id: string;
  is_active: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: Generated<Date>;
  updated_at: ColumnType<Date, Date | undefined, Date>;
}

export interface SessionsTable {
  id: Generated<string>;
  token: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  expires_at: Date;
  created_at: Generated<Date>;
}

export interface OrgConfigTable {
  id: Generated<string>;
  encrypted_name: Buffer | null;
  encrypted_logo: Buffer | null;
  encrypted_primary_color: Buffer | null;
  encrypted_client_text: Buffer | null;
  client_encrypted_branding: Buffer | null;
  pii_retention_days: number | null;
  updated_at: ColumnType<Date, Date | undefined, Date>;
}

export interface TenantDatabase {
  users: UsersTable;
  sessions: SessionsTable;
  org_config: OrgConfigTable;
  // Cryptography (user_keys, ticket_key_wraps)
  // Tickets (tickets, followups, audit_log)
  // Shifts (shifts, shift_occurrences)
  // Client portal (portal_channels)
}
