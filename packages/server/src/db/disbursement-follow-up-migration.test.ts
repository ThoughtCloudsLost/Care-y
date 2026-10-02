import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as crypto from "node:crypto";
import { Kysely, sql, type Generated } from "kysely";
import pg from "pg";
import { newOrgId, orgSchemaFor, type OrgSchema } from "@care-y/shared";
import {
  createTenantMigrator,
  SafeIntrospectionPostgresDialect,
} from "./schema-utils.js";
import { createTestTicketFixture } from "../test-utils.js";
import type { PlatformDatabase, TenantDatabase } from "./types.js";

/**
 * The two tables as they stand at migration 006. The application's
 * TenantDatabase no longer carries note_types.system_key, so the fixtures
 * that set it are written through this narrowed shape, which lists only the
 * columns the fixtures and assertions touch.
 */
interface PreDisbursementDb {
  note_types: {
    id: Generated<string>;
    encrypted_name: Buffer;
    encrypted_icon: Buffer;
    encrypted_escalation_targets: Buffer;
    system_key: string | null;
  };
  followups: {
    id: Generated<string>;
    ticket_id: string;
    source: string;
    type: string;
    encrypted_content: Buffer;
    note_type_id: string | null;
  };
}

/** Random stand-ins for org-key sealed note type fields (no real content). */
function fakeNoteTypeCiphertext(): {
  encrypted_name: Buffer;
  encrypted_icon: Buffer;
  encrypted_escalation_targets: Buffer;
} {
  return {
    encrypted_name: crypto.randomBytes(48),
    encrypted_icon: crypto.randomBytes(48),
    encrypted_escalation_targets: crypto.randomBytes(48),
  };
}

// The migrator runs on its own instance over this pool, as provisioning
// does, so the down-then-up transition is the one a v0.1.3 tenant takes.
describe.skipIf(!process.env.DATABASE_URL)(
  "007 disbursement follow-up type migration",
  () => {
    let pool: pg.Pool;
    let platformDb: Kysely<PlatformDatabase>;
    let schema: OrgSchema;
    let preDb: Kysely<PreDisbursementDb>;
    let tenantDb: Kysely<TenantDatabase>;

    let systemTypeId: string;
    let ordinaryTypeId: string;
    const systemTypedNoteIds: string[] = [];
    let ordinaryTypedNoteId: string;
    let untypedNoteId: string;

    /** True when note_types has a system_key column in the test schema. */
    async function hasSystemKeyColumn(): Promise<boolean> {
      const result = await sql<{ exists: boolean }>`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = ${schema}
            AND table_name = 'note_types'
            AND column_name = 'system_key'
        ) AS exists
      `.execute(platformDb);
      return result.rows[0]?.exists ?? false;
    }

    /** Definition of the system_key unique index, or undefined if absent. */
    async function systemKeyIndexDef(): Promise<string | undefined> {
      const result = await sql<{ indexdef: string }>`
        SELECT indexdef FROM pg_indexes
        WHERE schemaname = ${schema}
          AND tablename = 'note_types'
          AND indexname = 'note_types_system_key_key'
      `.execute(platformDb);
      return result.rows[0]?.indexdef;
    }

    async function followupRow(
      id: string,
    ): Promise<{ type: string; note_type_id: string | null }> {
      return preDb
        .selectFrom("followups")
        .select(["type", "note_type_id"])
        .where("id", "=", id)
        .executeTakeFirstOrThrow();
    }

    beforeAll(async () => {
      pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        max: 4,
      });
      platformDb = new Kysely<PlatformDatabase>({
        dialect: new SafeIntrospectionPostgresDialect({ pool }, "public"),
      });
      schema = orgSchemaFor(newOrgId());
      await platformDb.schema.createSchema(schema).execute();

      // Neither scoped instance is destroyed: destroying one would end the
      // shared pool, which platformDb.destroy() releases in afterAll.
      preDb = new Kysely<PreDisbursementDb>({
        dialect: new SafeIntrospectionPostgresDialect({ pool }, schema),
      }).withSchema(schema);
      tenantDb = new Kysely<TenantDatabase>({
        dialect: new SafeIntrospectionPostgresDialect({ pool }, schema),
      }).withSchema(schema);

      const migrator = createTenantMigrator(pool, schema);
      const up = await migrator.migrateToLatest();
      expect(up.error).toBeUndefined();
      const down = await migrator.migrateTo("006_note_type_system_key");
      expect(down.error).toBeUndefined();
    }, 120_000);

    afterAll(async () => {
      await platformDb.schema.dropSchema(schema).ifExists().cascade().execute();
      await platformDb.destroy();
    });

    it("rolling back to 006 restores system_key", async () => {
      expect(await hasSystemKeyColumn()).toBe(true);
      expect(await systemKeyIndexDef()).toContain("UNIQUE");
    });

    it("up retypes the system-typed notes and leaves every other note alone", async () => {
      // care-y-ignore-next-line no-plaintext-db-write -- sealed fields are random test bytes; system_key is the product's own type key, not PII
      const systemType = await preDb
        .insertInto("note_types")
        .values({ ...fakeNoteTypeCiphertext(), system_key: "disbursement" })
        .returning("id")
        .executeTakeFirstOrThrow();
      systemTypeId = systemType.id;

      // care-y-ignore-next-line no-plaintext-db-write -- sealed fields are random test bytes, not PII
      const ordinaryType = await preDb
        .insertInto("note_types")
        .values({ ...fakeNoteTypeCiphertext(), system_key: null })
        .returning("id")
        .executeTakeFirstOrThrow();
      ordinaryTypeId = ordinaryType.id;

      const { ticketId } = await createTestTicketFixture(tenantDb);

      async function insertNote(noteTypeId: string | null): Promise<string> {
        // care-y-ignore-next-line no-plaintext-db-write -- encrypted_content is random test bytes; the other fields are opaque ids and enum values
        const row = await preDb
          .insertInto("followups")
          .values({
            ticket_id: ticketId,
            source: "volunteer",
            type: "internal_note",
            encrypted_content: crypto.randomBytes(64),
            note_type_id: noteTypeId,
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        return row.id;
      }

      systemTypedNoteIds.push(await insertNote(systemTypeId));
      systemTypedNoteIds.push(await insertNote(systemTypeId));
      ordinaryTypedNoteId = await insertNote(ordinaryTypeId);
      untypedNoteId = await insertNote(null);

      const up = await createTenantMigrator(pool, schema).migrateToLatest();
      expect(up.error).toBeUndefined();
      expect(up.results).toContainEqual(
        expect.objectContaining({
          migrationName: "007_disbursement_follow_up_type",
          status: "Success",
        }),
      );

      for (const id of systemTypedNoteIds) {
        expect(await followupRow(id)).toEqual({
          type: "disbursement",
          note_type_id: null,
        });
      }
      expect(await followupRow(ordinaryTypedNoteId)).toEqual({
        type: "internal_note",
        note_type_id: ordinaryTypeId,
      });
      expect(await followupRow(untypedNoteId)).toEqual({
        type: "internal_note",
        note_type_id: null,
      });
    });

    it("up deletes the system type row, keeps the ordinary one and drops system_key", async () => {
      const remaining = await preDb
        .selectFrom("note_types")
        .select("id")
        .where("id", "in", [systemTypeId, ordinaryTypeId])
        .execute();
      expect(remaining.map((r) => r.id)).toEqual([ordinaryTypeId]);

      expect(await hasSystemKeyColumn()).toBe(false);
      expect(await systemKeyIndexDef()).toBeUndefined();
    });

    it("down recreates the column and index but leaves the retyped notes as disbursement", async () => {
      const down = await createTenantMigrator(pool, schema).migrateTo(
        "006_note_type_system_key",
      );
      expect(down.error).toBeUndefined();

      expect(await hasSystemKeyColumn()).toBe(true);
      expect(await systemKeyIndexDef()).toContain("UNIQUE");

      for (const id of systemTypedNoteIds) {
        expect(await followupRow(id)).toEqual({
          type: "disbursement",
          note_type_id: null,
        });
      }
    });
  },
);
