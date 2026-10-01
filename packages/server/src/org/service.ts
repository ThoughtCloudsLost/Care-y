/**
 * Org lifecycle service.
 *
 * Creates orgs (schema + migrations + default config), finds by slug or id.
 * Operates on the platform `public.orgs` table and provisions per-org
 * PostgreSQL schemas with tenant migrations.
 */

import { getEnv } from "../env.js";
import type { Kysely, Selectable } from "kysely";
import { sql } from "kysely";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import {
  orgSlugSchema,
  orgSlugIdSchema,
  newOrgId,
  orgSchemaFor,
  ErrorCode,
} from "@care-y/shared";
import type { OrgId, OrgSchema, OrgSlug } from "@care-y/shared";
import type {
  PlatformDatabase,
  TenantDatabase,
  OrgsTable,
} from "../db/types.js";
import type { Pool } from "pg";
import { isPgUniqueViolation } from "../db/pg-errors.js";
import { pool as defaultPool } from "../db/db.js";
import { applyTenantGrants } from "../db/grants.js";
import { createTenantMigrator } from "../db/schema-utils.js";
import {
  ValidationError,
  ConflictError,
  InternalError,
  NotFoundError,
  extractErrorMessage,
} from "../errors.js";

// eslint-disable-next-line @typescript-eslint/no-empty-function -- intentional swallow for best-effort cleanup
const swallowCleanupError = (): void => {};

export interface OrgRecord {
  readonly id: OrgId;
  readonly slug: OrgSlug;
  readonly schemaName: OrgSchema;
  readonly isActive: boolean;
}

export interface CreateOrgResult extends OrgRecord {
  readonly setupToken: string;
}

export interface OrgService {
  createOrg(input: { slug: string }): Promise<CreateOrgResult>;
  findBySlug(slug: string): Promise<OrgRecord | null>;
  findById(id: OrgId): Promise<OrgRecord | null>;
  validateSetupToken(orgId: OrgId, rawToken: string): Promise<boolean>;
  consumeSetupToken(orgId: OrgId): Promise<void>;
}

export interface ResetSetupTokenResult extends OrgRecord {
  readonly setupToken: string;
}

/**
 * Operator-only operations, used by the CLIs under src/cli/. Kept off
 * OrgService so the routers and their stubs see an unchanged interface.
 */
export interface OrgOperatorService extends OrgService {
  /**
   * Replaces the setup token of an org nobody has set up yet and returns
   * the org with the new raw token. The previous token stops validating,
   * including one already consumed. Throws
   * ConflictError(ORG_ALREADY_SETUP) when the org has any user, leaving the
   * stored hash untouched; NotFoundError for an unknown slug.
   */
  resetSetupToken(slug: string): Promise<ResetSetupTokenResult>;
  /**
   * True when the org's tenant `users` table has any row. Deactivated users
   * count: a deactivated user still means the org was set up.
   */
  hasActiveUsers(slug: string): Promise<boolean>;
}

/** Raw setup token: fixed in development, 32 random bytes otherwise. */
function generateSetupToken(): string {
  return getEnv().NODE_ENV === "development"
    ? "dev-setup-token"
    : randomBytes(32).toString("base64url");
}

function hashSetupToken(raw: string): Buffer {
  return createHash("sha256").update(raw, "utf8").digest();
}

function toOrgRecord(row: Selectable<OrgsTable>): OrgRecord {
  return {
    id: row.id,
    slug: row.slug,
    schemaName: row.schema_name,
    isActive: row.is_active,
  };
}

function parseSlug(raw: string): OrgSlug {
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
  orgId: OrgId,
  schemaName: OrgSchema,
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
  orgId: OrgId,
  slug: OrgSlug,
  schemaName: OrgSchema,
  setupTokenHash: Buffer,
): Promise<Selectable<OrgsTable>> {
  try {
    return await platformDb
      .insertInto("orgs")
      .values({
        id: orgId,
        slug,
        schema_name: schemaName,
        setup_token_hash: setupTokenHash,
      })
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
  orgId: OrgId,
  schemaName: OrgSchema,
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
  pool: Pool,
  schemaName: OrgSchema,
): Promise<void> {
  const migrator = createTenantMigrator(pool, schemaName);

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

/**
 * `pool` backs the tenant migrator, which builds its own schema-scoped
 * Kysely instance over it (see createTenantMigrator). It defaults to the
 * process pool from db.ts; index.ts passes it explicitly. The org:create
 * CLI passes the owner-role pool from createAdminPool().
 *
 * `appRole`, when given, is the runtime database role: createOrg grants it
 * access to the new schema over `pool` right after the tenant migrations
 * (applyTenantGrants). Callers that have env pass DATABASE_APP_ROLE.
 */
export function createOrgService(
  platformDb: Kysely<PlatformDatabase>,
  tenantDbFactory: (schema: OrgSchema) => Kysely<TenantDatabase>,
  pool: Pool = defaultPool,
  appRole?: string,
): OrgOperatorService {
  async function requireOrgBySlug(raw: string): Promise<OrgRecord> {
    const slug = parseSlug(raw);
    const row = await platformDb
      .selectFrom("orgs")
      .selectAll()
      .where("slug", "=", slug)
      .executeTakeFirst();
    if (!row) throw new NotFoundError(`Org "${slug}" not found`);
    return toOrgRecord(row);
  }

  async function tenantHasUsers(schemaName: OrgSchema): Promise<boolean> {
    const row = await tenantDbFactory(schemaName)
      .selectFrom("users")
      .select("id")
      .limit(1)
      .executeTakeFirst();
    return row !== undefined;
  }

  return {
    async createOrg(input: { slug: string }): Promise<CreateOrgResult> {
      const slug = parseSlug(input.slug);
      const orgId = newOrgId();
      const schemaName = orgSchemaFor(orgId);

      const rawToken = generateSetupToken();
      const tokenHash = hashSetupToken(rawToken);

      const row = await insertOrgRow(
        platformDb,
        orgId,
        slug,
        schemaName,
        tokenHash,
      );

      try {
        await createPostgresSchema(platformDb, orgId, schemaName);
        await runTenantMigrations(pool, schemaName);
        if (appRole !== undefined) {
          await applyTenantGrants(pool, schemaName, appRole);
        }
        await insertDefaultOrgConfig(tenantDbFactory(schemaName));
      } catch (err: unknown) {
        await rollbackOrg(platformDb, orgId, schemaName);
        if (err instanceof InternalError) throw err;
        throw new InternalError(
          `Org provisioning failed for "${schemaName}": ${extractErrorMessage(err)}`,
        );
      }

      return { ...toOrgRecord(row), setupToken: rawToken };
    },

    async findBySlug(slug: string): Promise<OrgRecord | null> {
      const row = await platformDb
        .selectFrom("orgs")
        .selectAll()
        .where("slug", "=", orgSlugIdSchema.parse(slug))
        .executeTakeFirst();

      return row ? toOrgRecord(row) : null;
    },

    async findById(id: OrgId): Promise<OrgRecord | null> {
      const row = await platformDb
        .selectFrom("orgs")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst();

      return row ? toOrgRecord(row) : null;
    },

    async validateSetupToken(orgId: OrgId, rawToken: string): Promise<boolean> {
      const row = await platformDb
        .selectFrom("orgs")
        .select("setup_token_hash")
        .where("id", "=", orgId)
        .executeTakeFirst();

      if (!row?.setup_token_hash) return false;

      const candidateHash = hashSetupToken(rawToken);
      return timingSafeEqual(candidateHash, row.setup_token_hash);
    },

    async consumeSetupToken(orgId: OrgId): Promise<void> {
      await platformDb
        .updateTable("orgs")
        .set({ setup_token_hash: null })
        .where("id", "=", orgId)
        .execute();
    },

    async resetSetupToken(slug: string): Promise<ResetSetupTokenResult> {
      const org = await requireOrgBySlug(slug);
      if (await tenantHasUsers(org.schemaName)) {
        throw new ConflictError(ErrorCode.ORG_ALREADY_SETUP);
      }

      const rawToken = generateSetupToken();
      await platformDb
        .updateTable("orgs")
        .set({ setup_token_hash: hashSetupToken(rawToken) })
        .where("id", "=", org.id)
        .execute();

      return { ...org, setupToken: rawToken };
    },

    async hasActiveUsers(slug: string): Promise<boolean> {
      const org = await requireOrgBySlug(slug);
      return tenantHasUsers(org.schemaName);
    },
  };
}
