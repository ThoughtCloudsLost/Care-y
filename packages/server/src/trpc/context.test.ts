/**
 * Integration tests for the tRPC context factory.
 *
 * Covers: extractOrgSlug (dev header, prod subdomain, edge cases),
 * resolveOrg (active/inactive/missing org), validateSessionFromRequest
 * (no cookie, valid session, expired session), createContextFactory
 * end-to-end wiring, and createScopedAuthService.
 *
 * Uses a real PostgreSQL database via createTestDb.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  testFieldEncryptor,
  testBlindIndexer,
  testSessionTokenizer,
  testSealedBox,
  testUnseal,
  TEST_ORG_PUBLIC_KEY,
  mockReq,
  mockRes,
  type TestDb,
} from "../test-utils.js";
import { createScryptHasher } from "../auth/password.js";
import { createOrgService, type OrgService } from "../org/service.js";
import { createAuthService } from "../auth/service.js";
import { createDbSessionRepository } from "../auth/session-repository.js";
import { SESSION_COOKIE_NAME } from "../auth/service.js";
import {
  createContextFactory,
  createScopedAuthService,
  createTenantSessions,
  type ContextDeps,
} from "./context.js";
import { _resetEnvCache } from "../env.js";

const HAS_DB = Boolean(process.env.DATABASE_URL);

function makeTenantDbFactory(
  platformDb: Kysely<PlatformDatabase>,
): (schema: string) => Kysely<TenantDatabase> {
  return (schema: string) =>
    platformDb.withSchema(schema) as unknown as Kysely<TenantDatabase>;
}

describe.skipIf(!HAS_DB)("context factory (DB integration)", () => {
  let testDb: TestDb;
  let tenantDb: Kysely<TenantDatabase>;
  let orgService: OrgService;
  let orgSlug: string;
  let orgId: string;
  let orgSchemaName: string;
  const hasher = createScryptHasher();
  const createdOrgIds: string[] = [];
  const createdSchemas: string[] = [];

  function makeDeps(): ContextDeps {
    return {
      orgService,
      hasher,
      encryptor: testFieldEncryptor,
      indexer: testBlindIndexer,
      tokenizer: testSessionTokenizer,
    };
  }

  beforeAll(async () => {
    testDb = await createTestDb();
    tenantDb = testDb.db;
    orgService = createOrgService(
      testDb.platformDb,
      makeTenantDbFactory(testDb.platformDb),
    );

    const suffix = randomUUID().slice(0, 8);
    orgSlug = `ctx-test-${suffix}`;
    const org = await orgService.createOrg({ slug: orgSlug });
    orgId = org.id;
    orgSchemaName = org.schemaName;
    createdOrgIds.push(org.id);
    createdSchemas.push(org.schemaName);

    // Seed org_public_key into the real org schema so resolveOrg succeeds.
    // createOrg inserts a default org_config row; we update it with the test key.
    const orgTenantDb = makeTenantDbFactory(testDb.platformDb)(orgSchemaName);
    await orgTenantDb
      .updateTable("org_config")
      .set({ org_public_key: TEST_ORG_PUBLIC_KEY })
      .execute();

    // Set NODE_ENV so extractOrgSlug uses the dev header path.
    process.env.NODE_ENV = "development";
    _resetEnvCache();
  });

  afterAll(async () => {
    for (const schema of createdSchemas) {
      await sql`DROP SCHEMA IF EXISTS ${sql.id(schema)} CASCADE`.execute(
        testDb.platformDb,
      );
    }
    for (const id of createdOrgIds) {
      await testDb.platformDb.deleteFrom("orgs").where("id", "=", id).execute();
    }
    await testDb.cleanup();
  });

  // --- extractOrgSlug (tested indirectly through createContextFactory) ---

  describe("org resolution via slug extraction", () => {
    it("resolves org from X-Org-Slug header in development mode", async () => {
      const factory = createContextFactory(makeDeps());
      const req = mockReq({ headers: { "x-org-slug": orgSlug } });
      const res = mockRes();
      const ctx = await factory({ req, res, info: undefined as never });

      expect(ctx.org).not.toBeNull();
      expect(ctx.org?.orgSlug).toBe(orgSlug);
      expect(ctx.org?.orgId).toBe(orgId);
    });

    it("resolves org from subdomain in Host header", async () => {
      // Temporarily switch to production so X-Org-Slug is ignored
      // and subdomain parsing kicks in.
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      _resetEnvCache();

      try {
        const factory = createContextFactory(makeDeps());
        const req = mockReq({ headers: { host: `${orgSlug}.care-y.app` } });
        const res = mockRes();
        const ctx = await factory({ req, res, info: undefined as never });

        expect(ctx.org).not.toBeNull();
        expect(ctx.org?.orgSlug).toBe(orgSlug);
      } finally {
        process.env.NODE_ENV = prevEnv;
        _resetEnvCache();
      }
    });

    it("returns null org when Host has no subdomain (bare domain)", async () => {
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      _resetEnvCache();

      try {
        const factory = createContextFactory(makeDeps());
        const req = mockReq({ headers: { host: "care-y.app" } });
        const res = mockRes();
        const ctx = await factory({ req, res, info: undefined as never });

        expect(ctx.org).toBeNull();
      } finally {
        process.env.NODE_ENV = prevEnv;
        _resetEnvCache();
      }
    });

    it("strips port from Host header before subdomain extraction", async () => {
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      _resetEnvCache();

      try {
        const factory = createContextFactory(makeDeps());
        const req = mockReq({
          headers: { host: `${orgSlug}.care-y.app:3000` },
        });
        const res = mockRes();
        const ctx = await factory({ req, res, info: undefined as never });

        expect(ctx.org).not.toBeNull();
        expect(ctx.org?.orgSlug).toBe(orgSlug);
      } finally {
        process.env.NODE_ENV = prevEnv;
        _resetEnvCache();
      }
    });

    it("returns null org when no Host header is present", async () => {
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      _resetEnvCache();

      try {
        const factory = createContextFactory(makeDeps());
        const req = mockReq();
        const res = mockRes();
        const ctx = await factory({ req, res, info: undefined as never });

        expect(ctx.org).toBeNull();
      } finally {
        process.env.NODE_ENV = prevEnv;
        _resetEnvCache();
      }
    });

    it("returns null org when X-Org-Slug is empty in dev mode", async () => {
      const factory = createContextFactory(makeDeps());
      const req = mockReq({ headers: { "x-org-slug": "" } });
      const res = mockRes();
      const ctx = await factory({ req, res, info: undefined as never });

      expect(ctx.org).toBeNull();
    });

    it("returns null org when slug does not match any org", async () => {
      const factory = createContextFactory(makeDeps());
      const req = mockReq({
        headers: { "x-org-slug": "nonexistent-org-slug" },
      });
      const res = mockRes();
      const ctx = await factory({ req, res, info: undefined as never });

      expect(ctx.org).toBeNull();
    });

    it("returns null org when org exists but is inactive", async () => {
      // Create an org then deactivate it.
      const slug = `inactive-${randomUUID().slice(0, 8)}`;
      const org = await orgService.createOrg({ slug });
      createdOrgIds.push(org.id);
      createdSchemas.push(org.schemaName);

      await testDb.platformDb
        .updateTable("orgs")
        .set({ is_active: false })
        .where("id", "=", org.id)
        .execute();

      const factory = createContextFactory(makeDeps());
      const req = mockReq({ headers: { "x-org-slug": slug } });
      const res = mockRes();
      const ctx = await factory({ req, res, info: undefined as never });

      expect(ctx.org).toBeNull();
    });

    it("returns null org when org is active but has no keypair", async () => {
      // Create an active org but do NOT seed org_public_key.
      // resolveOrg should return null because the keypair check fails.
      const slug = `no-key-${randomUUID().slice(0, 8)}`;
      const org = await orgService.createOrg({ slug });
      createdOrgIds.push(org.id);
      createdSchemas.push(org.schemaName);

      // Verify the org is active (default) and org_public_key is null.
      const orgRow = await testDb.platformDb
        .selectFrom("orgs")
        .selectAll()
        .where("id", "=", org.id)
        .executeTakeFirstOrThrow();
      expect(orgRow.is_active).toBe(true);

      const orgTenantDb = makeTenantDbFactory(testDb.platformDb)(
        org.schemaName,
      );
      const configRow = await orgTenantDb
        .selectFrom("org_config")
        .select("org_public_key")
        .executeTakeFirstOrThrow();
      expect(configRow.org_public_key).toBeNull();

      // Context should resolve org as null despite it being active.
      const factory = createContextFactory(makeDeps());
      const req = mockReq({ headers: { "x-org-slug": slug } });
      const res = mockRes();
      const ctx = await factory({ req, res, info: undefined as never });

      expect(ctx.org).toBeNull();
    });
  });

  // --- Session validation within context factory ---

  describe("session validation", () => {
    it("attaches session and user when valid session cookie is present", async () => {
      // Insert user + session into the real org schema (not the test schema),
      // because createContextFactory resolves the org and queries its schema.
      const orgTenantDb = makeTenantDbFactory(testDb.platformDb)(orgSchemaName);
      const sessions = createDbSessionRepository(
        orgTenantDb,
        testSessionTokenizer,
        testSealedBox,
      );
      const authService = createAuthService(
        orgTenantDb,
        hasher,
        sessions,
        testFieldEncryptor,
        testSealedBox,
        testBlindIndexer,
        testSessionTokenizer,
        orgId,
      );

      const suffix = randomUUID().slice(0, 8);
      const user = await authService.register({
        identifier: `ctx-session-${suffix}`,
        password: "test-password-long-enough",
        displayName: "Context Session User",
        roleId: "volunteer",
      });

      const loginResult = await authService.login({
        identifier: `ctx-session-${suffix}`,
        password: "test-password-long-enough",
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
      });

      const factory = createContextFactory(makeDeps());
      const cookie = `${SESSION_COOKIE_NAME}=${loginResult.session.token}`;
      const req = mockReq({
        headers: { "x-org-slug": orgSlug, cookie },
      });
      const res = mockRes();
      const ctx = await factory({ req, res, info: undefined as never });

      expect(ctx.org).not.toBeNull();
      expect(ctx.session).not.toBeNull();
      expect(ctx.session?.token).toBe(loginResult.session.token);
      expect(ctx.user).not.toBeNull();
      expect(ctx.user?.id).toBe(user.id);
    });

    it("returns null session when no cookie is present", async () => {
      const factory = createContextFactory(makeDeps());
      const req = mockReq({ headers: { "x-org-slug": orgSlug } });
      const res = mockRes();
      const ctx = await factory({ req, res, info: undefined as never });

      expect(ctx.org).not.toBeNull();
      expect(ctx.session).toBeNull();
      expect(ctx.user).toBeNull();
    });

    it("returns null session when cookie token is invalid", async () => {
      const factory = createContextFactory(makeDeps());
      const cookie = `${SESSION_COOKIE_NAME}=bogus-token-that-does-not-exist`;
      const req = mockReq({ headers: { "x-org-slug": orgSlug, cookie } });
      const res = mockRes();
      const ctx = await factory({ req, res, info: undefined as never });

      expect(ctx.org).not.toBeNull();
      expect(ctx.session).toBeNull();
      expect(ctx.user).toBeNull();
    });

    it("skips session validation entirely when org is not resolved", async () => {
      const factory = createContextFactory(makeDeps());
      const cookie = `${SESSION_COOKIE_NAME}=some-token`;
      const req = mockReq({
        headers: { "x-org-slug": "nonexistent-slug", cookie },
      });
      const res = mockRes();
      const ctx = await factory({ req, res, info: undefined as never });

      expect(ctx.org).toBeNull();
      expect(ctx.session).toBeNull();
      expect(ctx.user).toBeNull();
    });
  });

  // --- createScopedAuthService ---

  describe("createScopedAuthService", () => {
    it("returns a functional AuthService scoped to the org tenant DB", async () => {
      const orgCtx = {
        orgId,
        orgSlug,
        orgSchema: orgSchemaName,
        tenantDb,
        sealedBox: testSealedBox,
      };

      const sessions = createTenantSessions(orgCtx, testSessionTokenizer);
      const authService = createScopedAuthService(orgCtx, sessions, {
        hasher,
        encryptor: testFieldEncryptor,
        indexer: testBlindIndexer,
        tokenizer: testSessionTokenizer,
      });

      const suffix = randomUUID().slice(0, 8);
      const user = await authService.register({
        identifier: `scoped-svc-${suffix}`,
        password: "scoped-password-long-enough",
        displayName: "Scoped User",
        roleId: "volunteer",
      });

      expect(testUnseal(user.encryptedIdentifier)).toBe(`scoped-svc-${suffix}`);
      expect(user.encryptedDisplayName).toBeDefined();
    });
  });
});
