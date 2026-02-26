// Database interface - extended by each phase as tables are added.
// Manual types are the source of truth. Do NOT overwrite with kysely-codegen output.
// If kysely-codegen is run for verification, its output is comparison-only, never committed.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Database {
  // Phase 2 will add: users, sessions
  // Phase 3 will add: encrypted_blobs (or per-table bytea columns)
  // Phase 5 will add: tickets, followups
}
