import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { sql, type Kysely } from "kysely";
import { RoleId } from "@care-y/shared";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  testFieldEncryptor,
  testBlindIndexer,
  testSessionTokenizer,
  testSealedBox,
  seedOrgPublicKey,
  mockReq,
  mockRes,
  expectTrpcError,
  createMockEmailSender,
  createMockOprfDeps,
  createMockProviderFactory,
  type TestDb,
} from "../test-utils.js";
import { createScryptHasher } from "../auth/password.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { createDbSessionRepository } from "../auth/session-repository.js";
import { createOrgService } from "../org/service.js";
import { createAppRouter } from "./router.js";
import { createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import type { SessionData } from "../auth/session-repository.js";

function makeTenantDbFactory(
  platformDb: Kysely<PlatformDatabase>,
): (schema: string) => Kysely<TenantDatabase> {
  return (schema: string) =>
    platformDb.withSchema(schema) as unknown as Kysely<TenantDatabase>;
}

describe.skipIf(!process.env.DATABASE_URL)(
  "profile routes (DB integration)",
  () => {
    let testDb: TestDb;
    let tenantDb: Kysely<TenantDatabase>;
    let orgContext: OrgContext;
    const createdOrgIds: string[] = [];
    const createdSchemas: string[] = [];

    const hasher = createScryptHasher();
    const loginLimiter = createInMemoryRateLimiter({
      windowMs: 60_000,
      maxRequests: 100,
    });
    const saltLimiter = createInMemoryRateLimiter({
      windowMs: 60_000,
      maxRequests: 100,
    });
    const fakeSaltKey = Buffer.alloc(32, 0);

    beforeAll(async () => {
      testDb = await createTestDb();
      tenantDb = testDb.db;

      const orgService = createOrgService(
        testDb.platformDb,
        makeTenantDbFactory(testDb.platformDb),
      );
      const suffix = randomUUID().slice(0, 8);
      const org = await orgService.createOrg({
        slug: `test-profile-${suffix}`,
      });
      createdOrgIds.push(org.id);
      createdSchemas.push(org.schemaName);

      await tenantDb
        .insertInto("org_config")
        .values({
          encrypted_name: null,
          encrypted_logo: null,
          encrypted_primary_color: null,
          encrypted_client_text: null,
          client_encrypted_branding: null,
          pii_retention_days: null,
        })
        .execute();
      await seedOrgPublicKey(tenantDb);

      orgContext = {
        orgId: org.id,
        orgSlug: org.slug,
        orgSchema: testDb.schemaName,
        tenantDb,
        sealedBox: testSealedBox,
      };
    });

    afterAll(async () => {
      for (const schema of createdSchemas) {
        await sql`DROP SCHEMA IF EXISTS ${sql.id(schema)} CASCADE`.execute(
          testDb.platformDb,
        );
      }
      for (const id of createdOrgIds) {
        await testDb.platformDb
          .deleteFrom("orgs")
          .where("id", "=", id)
          .execute();
      }
      await testDb.cleanup();
    });

    function buildRouter() {
      const orgService = createOrgService(
        testDb.platformDb,
        makeTenantDbFactory(testDb.platformDb),
      );
      return createAppRouter({
        authDeps: {
          hasher,
          loginLimiter,
          saltLimiter,
          fakeSaltKey,
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          tokenizer: testSessionTokenizer,
          isSecureCookie: false,
          emailSender: createMockEmailSender(),
          providerFactory: createMockProviderFactory(),
          resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
        },
        profileDeps: {
          hasher,
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          tokenizer: testSessionTokenizer,
        },
        twoFactorDeps: {
          emailSender: createMockEmailSender(),
          encryptor: testFieldEncryptor,
          indexer: testBlindIndexer,
          tokenizer: testSessionTokenizer,
          providerFactory: createMockProviderFactory(),
          resolveCallerId: vi.fn().mockResolvedValue("+15551234567"),
          pushSender: null,
          pushHmacKey: null,
        },
        oprfDeps: createMockOprfDeps(),
        orgService,
        providerFactory: createMockProviderFactory(),
      });
    }

    function buildCaller(ctx: Context) {
      return createCallerFactory(buildRouter())(ctx);
    }

    async function createSession(userId: string): Promise<SessionData> {
      const repo = createDbSessionRepository(
        tenantDb,
        testSessionTokenizer,
        testSealedBox,
      );
      return repo.create({
        token: randomUUID(),
        userId,
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
        expiresAt: new Date(Date.now() + 3_600_000),
      });
    }

    function authedCtx(
      userId: string,
      session: SessionData,
      roleId: string = RoleId.VOLUNTEER,
      twofaVerified = false,
    ): Context {
      return {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: twofaVerified ? { ...session, twofaVerified: true } : session,
        user: {
          id: userId,
          identifier: "test-user",
          encryptedDisplayName: "",
          roleId,
          isActive: true,
        },
      };
    }

    describe("updateDisplayName", () => {
      it("updates the display name for the calling user", async () => {
        const user = await createTestUser(tenantDb);
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        const newCiphertext =
          Buffer.from("new-encrypted-name").toString("base64");
        const result = await caller.profile.updateDisplayName({
          encryptedDisplayName: newCiphertext,
        });

        expect(result.success).toBe(true);

        const row = await tenantDb
          .selectFrom("users")
          .select("encrypted_display_name")
          .where("id", "=", user.id)
          .executeTakeFirstOrThrow();

        expect(row.encrypted_display_name.toString("base64")).toBe(
          newCiphertext,
        );
      });

      it("rejects unauthenticated calls", async () => {
        const caller = buildCaller({
          req: mockReq(),
          res: mockRes(),
          org: null,
          session: null,
          user: null,
        });

        await expectTrpcError(
          caller.profile.updateDisplayName({
            encryptedDisplayName: "dGVzdA==",
          }),
          "UNAUTHORIZED",
        );
      });

      it("rejects update for inactive user", async () => {
        const user = await createTestUser(tenantDb, {
          overrides: { is_active: false },
        });
        const session = await createSession(user.id);
        const caller = buildCaller(authedCtx(user.id, session));

        await expectTrpcError(
          caller.profile.updateDisplayName({
            encryptedDisplayName: "dGVzdA==",
          }),
          "NOT_FOUND",
        );
      });
    });

    describe("adminUpdateDisplayName", () => {
      it("allows admin to update another user's display name", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const target = await createTestUser(tenantDb);
        const session = await createSession(admin.id);
        const caller = buildCaller(
          authedCtx(admin.id, session, RoleId.ADMIN, true),
        );

        const newCiphertext = Buffer.from("admin-set-name").toString("base64");
        const result = await caller.profile.adminUpdateDisplayName({
          userId: target.id,
          encryptedDisplayName: newCiphertext,
        });

        expect(result.success).toBe(true);

        const row = await tenantDb
          .selectFrom("users")
          .select("encrypted_display_name")
          .where("id", "=", target.id)
          .executeTakeFirstOrThrow();

        expect(row.encrypted_display_name.toString("base64")).toBe(
          newCiphertext,
        );
      });

      it("rejects non-admin caller", async () => {
        const vol = await createTestUser(tenantDb);
        const target = await createTestUser(tenantDb);
        const session = await createSession(vol.id);
        const caller = buildCaller(
          authedCtx(vol.id, session, RoleId.VOLUNTEER, true),
        );

        await expectTrpcError(
          caller.profile.adminUpdateDisplayName({
            userId: target.id,
            encryptedDisplayName: "dGVzdA==",
          }),
          "FORBIDDEN",
        );
      });

      it("rejects update for nonexistent user", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const session = await createSession(admin.id);
        const caller = buildCaller(
          authedCtx(admin.id, session, RoleId.ADMIN, true),
        );

        await expectTrpcError(
          caller.profile.adminUpdateDisplayName({
            userId: randomUUID(),
            encryptedDisplayName: "dGVzdA==",
          }),
          "NOT_FOUND",
        );
      });
    });
  },
);
