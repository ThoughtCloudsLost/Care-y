/**
 * Dev-only service for seed data management.
 *
 * Only instantiated when NODE_ENV !== "production". The module is never
 * imported in production builds, so it is tree-shaken entirely.
 */

import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

/**
 * Seed content tables in dependency order (children first, parents last).
 *
 * Uses individual DELETE FROM statements instead of bulk TRUNCATE because
 * bulk truncate walks FK constraints at the metadata level (not row level)
 * and would destroy org_config via its FK to queues.id and note_types.id,
 * even when those FK columns are NULL.
 */
const SEED_TABLES_DELETE_ORDER: readonly (keyof TenantDatabase)[] = [
  // leaf tables (no other seed table references these)
  "voicemail_quarantine",
  "tracked_calls",
  "followup_reactions",
  "ticket_read_cursors",
  "ticket_watchers",
  "ticket_dependencies",
  "ticket_key_wraps",
  "kb_votes",
  "kb_attachments",
  "audit_log",
  // depend on followups
  "attachments",
  "recordings",
  // depend on tickets
  "followups",
  // depend on clients/queues
  "tickets",
  "client_merge_events",
  // depend on phones
  "clients",
  "phone_greetings",
  "phones",
  // depend on queues
  "queue_watchers",
  "queue_assignments",
  "preset_replies",
  // parent tables
  "queues",
  "kb_items",
  "kb_categories",
  "note_types",
];

export interface DevService {
  resetSeedData(): Promise<{ tablesReset: number }>;
}

export function createDevService(tDb: Kysely<TenantDatabase>): DevService {
  return {
    async resetSeedData(): Promise<{ tablesReset: number }> {
      // Null out org_config FK columns that point to seed tables.
      // This prevents DELETE FROM queues/note_types from violating
      // the FK constraints on org_config (which we preserve).
      await tDb
        .updateTable("org_config")
        .set({ intake_queue_id: null, default_note_type_id: null })
        .execute();

      for (const table of SEED_TABLES_DELETE_ORDER) {
        await tDb.deleteFrom(table).execute();
      }

      return { tablesReset: SEED_TABLES_DELETE_ORDER.length };
    },
  };
}
