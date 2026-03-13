/**
 * Org lifecycle service.
 *
 * Creates orgs (schema + migrations + default config), finds by slug or id.
 * Operates on the platform `public.orgs` table and provisions per-org
 * PostgreSQL schemas with tenant migrations.
 */

import type { Kysely, Selectable } from "kysely";
import { sql } from "kysely";
import { randomUUID } from "node:crypto";
import { orgSlugSchema } from "@care-y/shared";
import type {
  PlatformDatabase,
  TenantDatabase,
  OrgsTable,
} from "../db/types.js";
import { isPgUniqueViolation } from "../db/pg-errors.js";
import { createTenantMigrator } from "../db/schema-utils.js";
import {
  ValidationError,
  ConflictError,
  InternalError,
  extractErrorMessage,
} from "../errors.js";

// eslint-disable-next-line @typescript-eslint/no-empty-function -- intentional swallow for best-effort cleanup
const swallowCleanupError = (): void => {};

export interface OrgRecord {
  readonly id: string;
  readonly slug: string;
  readonly schemaName: string;
  readonly isActive: boolean;
}

export interface OrgService {
  createOrg(input: { slug: string }): Promise<OrgRecord>;
  findBySlug(slug: string): Promise<OrgRecord | null>;
  findById(id: string): Promise<OrgRecord | null>;
}

function toOrgRecord(row: Selectable<OrgsTable>): OrgRecord {
  return {
    id: row.id,
    slug: row.slug,
    schemaName: row.schema_name,
    isActive: row.is_active,
  };
}

function parseSlug(raw: string): string {
  const parsed = orgSlugSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid slug",
    );
  }
  return parsed.data;
}

/** Best-effort cleanup: drop schema (if created) and delete the orgs row. */
async function rollbackOrg(
  platformDb: Kysely<PlatformDatabase>,
  orgId: string,
  schemaName: string,
): Promise<void> {
  await sql`DROP SCHEMA IF EXISTS ${sql.id(schemaName)} CASCADE`
    .execute(platformDb)
    .catch(swallowCleanupError);
  await platformDb
    .deleteFrom("orgs")
    .where("id", "=", orgId)
    .execute()
    .catch(swallowCleanupError);
}

async function insertOrgRow(
  platformDb: Kysely<PlatformDatabase>,
  orgId: string,
  slug: string,
  schemaName: string,
): Promise<Selectable<OrgsTable>> {
  try {
    return await platformDb
      .insertInto("orgs")
      .values({ id: orgId, slug, schema_name: schemaName })
      .returningAll()
      .executeTakeFirstOrThrow();
  } catch (err: unknown) {
    if (isPgUniqueViolation(err)) {
      throw new ConflictError(`Org slug "${slug}" is already taken`);
    }
    throw err;
  }
}

async function createPostgresSchema(
  platformDb: Kysely<PlatformDatabase>,
  orgId: string,
  schemaName: string,
): Promise<void> {
  try {
    await platformDb.schema.createSchema(schemaName).execute();
  } catch (err: unknown) {
    await platformDb
      .deleteFrom("orgs")
      .where("id", "=", orgId)
      .execute()
      .catch(swallowCleanupError);
    throw new InternalError(
      `Failed to create schema "${schemaName}": ${extractErrorMessage(err)}`,
    );
  }
}

async function runTenantMigrations(
  tenantDb: Kysely<TenantDatabase>,
  schemaName: string,
): Promise<void> {
  const migrator = createTenantMigrator(tenantDb, schemaName);

  const { error: migrationError } = await migrator.migrateToLatest();
  // v8 ignore: Kysely Migrator returns { error } instead of throwing when a
  // migration's up() function fails. Testing these branches requires mocking
  // createTenantMigrator at the module level (ESM bindings prevent vi.spyOn),
  // which adds fragility for defensive code that guards against Kysely's error
  // reporting contract. The broader "migration fails -> rollback" path is
  // integration-tested via the fault injection suite.
  /* v8 ignore start */
  if (migrationError !== undefined) {
    if (migrationError instanceof Error) {
      throw migrationError;
    }
    throw new InternalError("Tenant migration returned an unknown error");
  }
  /* v8 ignore stop */
}

async function insertDefaultOrgConfig(
  tenantDb: Kysely<TenantDatabase>,
): Promise<void> {
  await tenantDb
    .insertInto("org_config")
    .values({ pii_retention_days: null })
    .execute();
}

export function createOrgService(
  platformDb: Kysely<PlatformDatabase>,
  tenantDbFactory: (schema: string) => Kysely<TenantDatabase>,
): OrgService {
  return {
    async createOrg(input: { slug: string }): Promise<OrgRecord> {
      const slug = parseSlug(input.slug);
      const orgId = randomUUID();
      const schemaName = `org_${orgId}`;

      const row = await insertOrgRow(platformDb, orgId, slug, schemaName);

      try {
        await createPostgresSchema(platformDb, orgId, schemaName);
        await runTenantMigrations(tenantDbFactory(schemaName), schemaName);
        await insertDefaultOrgConfig(tenantDbFactory(schemaName));
      } catch (err: unknown) {
        await rollbackOrg(platformDb, orgId, schemaName);
        if (err instanceof InternalError) throw err;
        throw new InternalError(
          `Org provisioning failed for "${schemaName}": ${extractErrorMessage(err)}`,
        );
      }

      return toOrgRecord(row);
    },

    async findBySlug(slug: string): Promise<OrgRecord | null> {
      const row = await platformDb
        .selectFrom("orgs")
        .selectAll()
        .where("slug", "=", slug)
        .executeTakeFirst();

      return row ? toOrgRecord(row) : null;
    },

    async findById(id: string): Promise<OrgRecord | null> {
      const row = await platformDb
        .selectFrom("orgs")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst();

      return row ? toOrgRecord(row) : null;
    },
  };
}
