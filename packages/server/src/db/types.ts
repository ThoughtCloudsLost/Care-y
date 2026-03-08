// Database interfaces. Do NOT overwrite with kysely-codegen output.
// If kysely-codegen is run for verification, its output is comparison-only and never committed.

// PlatformDatabase: tables in the `public` schema (shared across all orgs).
// TenantDatabase: tables in per-org `org_<uuid>` schemas.
// Both interfaces are append-only. Never rename or remove existing entries.

// Type conventions:
//   Generated<T>           - auto-increment or server-generated column (omitted on insert)
//   ColumnType<S,I,U>      - different select/insert/update types
//   Buffer                 - encrypted bytea column

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PlatformDatabase {
  // Authentication (orgs)
  // Telephony (telephony_config)
  // Production (deletion_requests)
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TenantDatabase {
  // Authentication (users, sessions, org_config)
  // Cryptography (user_keys, ticket_key_wraps)
  // Tickets (tickets, followups, audit_log)
  // Shifts (shifts, shift_occurrences)
  // Client portal (portal_channels)
}
