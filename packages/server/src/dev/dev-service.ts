/**
 * Dev-only service for seed data management.
 *
 * Only instantiated when NODE_ENV !== "production". The module is never
 * imported in production builds, so it is tree-shaken entirely.
 */

import { sql, type Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

const SEED_CONTENT_TABLES = [
  "followup_reactions",
  "ticket_read_cursors",
  "ticket_watchers",
  "ticket_dependencies",
  "ticket_key_wraps",
  "followups",
  "attachments",
  "recordings",
  "tickets",
  "client_merge_events",
  "clients",
  "phones",
  "queue_watchers",
  "queue_assignments",
  "queues",
  "kb_votes",
  "kb_attachments",
  "kb_items",
  "kb_categories",
  "note_types",
  "preset_replies",
  "audit_log",
] as const;

export interface DevService {
  resetSeedData(): Promise<{ tablesReset: number }>;
}

export function createDevService(
  tDb: Kysely<TenantDatabase>,
  orgSchema: string,
): DevService {
  return {
    async resetSeedData(): Promise<{ tablesReset: number }> {
      // org_config has FKs to queues (intake_queue_id) and note_types
      // (default_note_type_id). TRUNCATE CASCADE would cascade into
      // org_config and delete the row. Null out the FK columns first.
      // care-y-ignore cascade-fk-check -- FK columns nulled above before CASCADE
      await tDb
        .updateTable("org_config")
        .set({ intake_queue_id: null, default_note_type_id: null })
        .execute();

      // Kysely has no TRUNCATE builder, so raw SQL is required.
      // Use sql.id() for identifier escaping (same pattern as schema-create.ts).
      const tableRefs = SEED_CONTENT_TABLES.map(
        (t) => sql`${sql.id(orgSchema)}.${sql.id(t)}`,
      );
      // care-y-ignore cascade-fk-check -- FK columns nulled above before CASCADE
      await sql`TRUNCATE ${sql.join(tableRefs)} CASCADE`.execute(tDb);
      return { tablesReset: SEED_CONTENT_TABLES.length };
    },
  };
}
