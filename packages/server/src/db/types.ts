// Database interface. Tables added here as migrations run.
// Manual types are the source of truth. Do NOT overwrite with kysely-codegen output.
// If kysely-codegen is run for verification, its output is comparison-only, never committed.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Database {
  // users, sessions (auth)
  // encrypted_blobs or per-table bytea columns (crypto)
  // tickets, followups (case management)
}
