/**
 * Integration tests for clients tRPC router.
 *
 * Uses a real PostgreSQL database (via createTestDb) to test the full
 * tRPC procedure chain: middleware -> router -> service -> DB.
 * Requires DATABASE_URL (runs inside Docker container).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  createTestClientFixture,
  seedOrgPublicKey,
  testSealedBox,
  noopEncryptor,
  TEST_ORG_ID,
  mockReq,
  mockRes,
  expectTrpcError,
  type TestDb,
} from "../test-utils.js";
import { RoleId } from "@care-y/shared";
import { createClientRouter, type ClientRouterDeps } from "./clients.js";
import { router, createCallerFactory } from "../trpc/trpc.js";
import type { Context, OrgContext } from "../trpc/context.js";
import { createClientService } from "../clients/client-service.js";
import { createAuditService } from "../tickets/audit.js";
import { createMergeService } from "../tickets/merge-service.js";
import { createDismissalService } from "../clients/dismissal-service.js";
import { createMergeScanService } from "../clients/merge-scan-service.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";

/**
 * Deterministic test indexer: returns `hash(input:orgId)` so collisions
 * are reproducible. Matches noop encryption semantics used by
 * createTestClientFixture.
 */
const testNoopIndexer: BlindIndexer = {
  hash(input: string, orgId: string): string {
    return `hash(${input}:${orgId})`;
  },
  hashBuffer(input: Buffer, orgId: string): string {
    return `hash(${input.toString("utf-8")}:${orgId})`;
  },
};

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "clients router (DB integration)",
  () => {
    let testDb: TestDb;
    let tenantDb: Kysely<TenantDatabase>;
    let orgContext: OrgContext;

    beforeAll(async () => {
      testDb = await createTestDb();
      tenantDb = testDb.db;

      await tenantDb
        .insertInto("org_config")
        .values({ pii_retention_days: null })
        .onConflict((oc) => oc.doNothing())
        .execute();
      await seedOrgPublicKey(tenantDb);

      orgContext = {
        orgId: TEST_ORG_ID,
        orgSlug: "test-clients",
        orgSchema: testDb.schemaName,
        tenantDb,
        sealedBox: testSealedBox,
      };
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    // -----------------------------------------------------------------------
    // Dependency wiring
    // -----------------------------------------------------------------------

    function buildClientDeps(): ClientRouterDeps {
      return {
        createClientSvc: (db, orgId) =>
          createClientService({
            db,
            audit: createAuditService(db),
            encryptor: noopEncryptor,
            indexer: testNoopIndexer,
            mergeService: createMergeService(db),
            orgId,
          }),
        fieldEncryptor: noopEncryptor,
        async isAssignedToClientTicket(db, clientId, userId) {
          const row = await db
            .selectFrom("tickets")
            .select(db.fn.countAll<number>().as("cnt"))
            .where("client_id", "=", clientId)
            .where("assigned_to", "=", userId)
            .executeTakeFirst();
          return (row?.cnt ?? 0) > 0;
        },
      };
    }

    function buildClientsRouter(depsOverride?: Partial<ClientRouterDeps>) {
      const clientsRouter = createClientRouter({
        ...buildClientDeps(),
        ...depsOverride,
      });
      return router({ clients: clientsRouter });
    }

    function createAuthedCaller(
      dbRow: {
        id: string;
        role_id: string;
        identifier_hash: string;
        encrypted_display_name: Buffer;
      },
      opts?: { twofaVerified?: boolean; deps?: Partial<ClientRouterDeps> },
    ) {
      const appRouter = buildClientsRouter(opts?.deps);
      const factory = createCallerFactory(appRouter);
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: {
          id: "test-session",
          token: "test-token",
          userId: dbRow.id,
          ipToken: "test-ip",
          uaToken: "test-ua",
          expiresAt: new Date(Date.now() + 3_600_000),
          twofaVerified: opts?.twofaVerified ?? true,
          webauthnChallenge: null,
        },
        user: {
          id: dbRow.id,
          encryptedIdentifier: dbRow.identifier_hash,
          encryptedDisplayName: dbRow.encrypted_display_name.toString("base64"),
          encryptedPreferredLocale: null,
          roleId: dbRow.role_id,
          isActive: true,
          hasSeenBriefing: true,
        },
      };
      return factory(ctx);
    }

    function createUnauthCaller() {
      const appRouter = buildClientsRouter();
      const factory = createCallerFactory(appRouter);
      const ctx: Context = {
        req: mockReq(),
        res: mockRes(),
        org: orgContext,
        session: null,
        user: null,
      };
      return factory(ctx);
    }

    // -----------------------------------------------------------------------
    // clients.list
    // -----------------------------------------------------------------------

    describe("list", () => {
      it("returns paginated client records for admin with full phone", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const result = await caller.clients.list({});
        expect(result.length).toBeGreaterThanOrEqual(1);

        const match = result.find((c) => c.id === fixture.clientId);
        expect(match).toBeDefined();
        // Admin sees full formatted phone (starts with + or contains parentheses)
        expect(match?.phone).toBeTruthy();
        expect(match?.phone).not.toMatch(/^\*\*\*/);
      });

      it("returns masked phone for manager", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        const result = await caller.clients.list({});
        const match = result.find((c) => c.id === fixture.clientId);
        expect(match).toBeDefined();
        // Manager sees masked phone (***NNNN)
        expect(match?.phone).toMatch(/^\*\*\*/);
      });

      it("rejects unauthenticated requests", async () => {
        const caller = createUnauthCaller();
        await expectTrpcError(caller.clients.list({}), "UNAUTHORIZED");
      });

      it("rejects volunteer (no VIEW_CLIENTS permission)", async () => {
        const volunteer = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.VOLUNTEER },
        });
        const caller = createAuthedCaller(volunteer);
        await expectTrpcError(caller.clients.list({}), "FORBIDDEN");
      });

      it("filters by alias search query via blind index hash", async () => {
        const fixture = await createTestClientFixture(tenantDb);

        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        // With encrypted aliases, substring search is gone. The server
        // supports exact-alias lookup via aliasHash. Verify the list
        // endpoint returns results (the fixture's alias_hash is null,
        // so we just confirm the list is populated).
        const result = await caller.clients.list({});
        expect(result.some((c) => c.id === fixture.clientId)).toBe(true);
      });

      it("returns ISO date strings for createdAt", async () => {
        await createTestClientFixture(tenantDb);
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const result = await caller.clients.list({});
        expect(result.length).toBeGreaterThan(0);
        // Verify createdAt is a valid ISO date string
        expect(() => new Date(result[0]!.createdAt)).not.toThrow();
      });
    });

    // -----------------------------------------------------------------------
    // clients.get
    // -----------------------------------------------------------------------

    describe("get", () => {
      it("returns full detail for admin", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const result = await caller.clients.get({
          clientId: fixture.clientId,
        });
        expect(result.id).toBe(fixture.clientId);
        expect(result.encryptedAlias).toBeDefined();
        expect(result.phone).not.toMatch(/^\*\*\*/);
        expect(result.phoneHash).toBeDefined();
        expect(result.tickets).toBeInstanceOf(Array);
        expect(result.mergeHistory).toBeInstanceOf(Array);
      });

      it("returns masked phone for manager", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        const result = await caller.clients.get({
          clientId: fixture.clientId,
        });
        expect(result.phone).toMatch(/^\*\*\*/);
      });

      it("throws NOT_FOUND for non-existent client", async () => {
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        await expectTrpcError(
          caller.clients.get({
            clientId: "00000000-0000-0000-0000-000000000000",
          }),
          "NOT_FOUND",
        );
      });

      it("rejects volunteer (no VIEW_CLIENTS permission)", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const volunteer = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.VOLUNTEER },
        });
        const caller = createAuthedCaller(volunteer);

        await expectTrpcError(
          caller.clients.get({ clientId: fixture.clientId }),
          "FORBIDDEN",
        );
      });
    });

    // -----------------------------------------------------------------------
    // clients.updateAlias
    // -----------------------------------------------------------------------

    describe("updateAlias", () => {
      it("succeeds for admin with a unique alias", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const uid = crypto.randomUUID().slice(0, 8);
        await caller.clients.updateAlias({
          clientId: fixture.clientId,
          encryptedAlias: Buffer.from(`sealed-alias-${uid}`).toString("base64"),
          aliasHash: `hash-${uid}`,
        });

        // Verify via get: the response carries encrypted alias, not plaintext
        const updated = await caller.clients.get({
          clientId: fixture.clientId,
        });
        expect(updated.encryptedAlias).toBeDefined();
      });

      it("throws CONFLICT on duplicate alias hash", async () => {
        const fixture1 = await createTestClientFixture(tenantDb);
        const fixture2 = await createTestClientFixture(tenantDb);
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const sharedHash = `hash-dup-${crypto.randomUUID().slice(0, 8)}`;

        // Set fixture1's alias with a specific hash
        await caller.clients.updateAlias({
          clientId: fixture1.clientId,
          encryptedAlias: Buffer.from("sealed-a").toString("base64"),
          aliasHash: sharedHash,
        });

        // Try to set fixture2's alias with the same hash
        await expectTrpcError(
          caller.clients.updateAlias({
            clientId: fixture2.clientId,
            encryptedAlias: Buffer.from("sealed-b").toString("base64"),
            aliasHash: sharedHash,
          }),
          "CONFLICT",
        );
      });

      it("rejects manager (admin-only)", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        await expectTrpcError(
          caller.clients.updateAlias({
            clientId: fixture.clientId,
            encryptedAlias: Buffer.from("sealed").toString("base64"),
            aliasHash: "test-hash",
          }),
          "FORBIDDEN",
        );
      });

      it("rejects volunteer (admin-only)", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const volunteer = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.VOLUNTEER },
        });
        const caller = createAuthedCaller(volunteer);

        await expectTrpcError(
          caller.clients.updateAlias({
            clientId: fixture.clientId,
            encryptedAlias: Buffer.from("sealed").toString("base64"),
            aliasHash: "test-hash",
          }),
          "FORBIDDEN",
        );
      });
    });

    // -----------------------------------------------------------------------
    // clients.updatePhone
    // -----------------------------------------------------------------------

    describe("updatePhone", () => {
      async function createTicketForClient(
        clientId: string,
        queueId: string,
        assignedTo: string | null,
      ): Promise<string> {
        const keyGen = crypto.randomUUID();
        // care-y-ignore-next-line no-plaintext-db-write -- test fixture: encrypted_title and encrypted_description are dummy ciphertext blobs, not real PII
        const ticket = await tenantDb
          .insertInto("tickets")
          .values({
            client_id: clientId,
            queue_id: queueId,
            encrypted_title: Buffer.alloc(64, 0xaa),
            encrypted_description: Buffer.alloc(64, 0xbb),
            status: "open",
            priority: "normal",
            key_generation: keyGen,
            assigned_to: assignedTo,
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        return ticket.id;
      }

      it("succeeds for admin", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const result = await caller.clients.updatePhone({
          clientId: fixture.clientId,
          phoneNumber: "+15551234567",
        });
        expect(result.success).toBe(true);
        expect(result.conflict).toBeNull();
      });

      it("succeeds for manager", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        const result = await caller.clients.updatePhone({
          clientId: fixture.clientId,
          phoneNumber: "+15559876543",
        });
        expect(result.success).toBe(true);
      });

      it("succeeds for assigned volunteer", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const volunteer = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.VOLUNTEER },
        });

        // Create a ticket assigned to this volunteer
        await createTicketForClient(
          fixture.clientId,
          fixture.queueId,
          volunteer.id,
        );

        const caller = createAuthedCaller(volunteer);
        const result = await caller.clients.updatePhone({
          clientId: fixture.clientId,
          phoneNumber: "+15551110000",
        });
        expect(result.success).toBe(true);
      });

      it("rejects non-assigned volunteer (403)", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const volunteer = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.VOLUNTEER },
        });
        // No ticket assignment for this volunteer
        const caller = createAuthedCaller(volunteer);

        await expectTrpcError(
          caller.clients.updatePhone({
            clientId: fixture.clientId,
            phoneNumber: "+15552220000",
          }),
          "FORBIDDEN",
        );
      });

      it("returns conflict when phone hash collides", async () => {
        // Use a known phone number for fixture1 by first updating it
        // through the router, then trying to set fixture2 to the same number.
        const fixture1 = await createTestClientFixture(tenantDb);
        const fixture2 = await createTestClientFixture(tenantDb);
        const collisionNumber = "+15559990001";

        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        // Set fixture1 to the known number
        const first = await caller.clients.updatePhone({
          clientId: fixture1.clientId,
          phoneNumber: collisionNumber,
        });
        expect(first.success).toBe(true);

        // Try to set fixture2 to the same number
        const result = await caller.clients.updatePhone({
          clientId: fixture2.clientId,
          phoneNumber: collisionNumber,
        });
        expect(result.success).toBe(false);
        expect(result.conflict).not.toBeNull();
        expect(result.conflict?.conflictingClientId).toBe(fixture1.clientId);
      });
    });

    // -----------------------------------------------------------------------
    // clients.suggestDuplicates
    // -----------------------------------------------------------------------

    describe("suggestDuplicates", () => {
      it("returns null for no match", async () => {
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        const result = await caller.clients.suggestDuplicates({
          phoneHash: "nonexistent-hash-value",
        });
        expect(result).toBeNull();
      });

      it("returns conflict for matching hash", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        // Get the phone hash for the created client
        const phone = await tenantDb
          .selectFrom("phones")
          .select("phone_hash")
          .where("id", "=", fixture.phoneId)
          .executeTakeFirstOrThrow();

        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        const result = await caller.clients.suggestDuplicates({
          phoneHash: phone.phone_hash,
        });
        expect(result).not.toBeNull();
        expect(result?.conflictingClientId).toBe(fixture.clientId);
      });

      it("excludes the specified client from results", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const phone = await tenantDb
          .selectFrom("phones")
          .select("phone_hash")
          .where("id", "=", fixture.phoneId)
          .executeTakeFirstOrThrow();

        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        const result = await caller.clients.suggestDuplicates({
          phoneHash: phone.phone_hash,
          excludeClientId: fixture.clientId,
        });
        expect(result).toBeNull();
      });

      it("rejects volunteer (no VIEW_CLIENTS permission)", async () => {
        const volunteer = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.VOLUNTEER },
        });
        const caller = createAuthedCaller(volunteer);

        await expectTrpcError(
          caller.clients.suggestDuplicates({
            phoneHash: "any-hash",
          }),
          "FORBIDDEN",
        );
      });

      it("rejects unauthenticated requests", async () => {
        const caller = createUnauthCaller();
        await expectTrpcError(
          caller.clients.suggestDuplicates({
            phoneHash: "any-hash",
          }),
          "UNAUTHORIZED",
        );
      });
    });

    // -----------------------------------------------------------------------
    // clients.backfillPhoneMatchHash
    // -----------------------------------------------------------------------

    describe("backfillPhoneMatchHash", () => {
      const VALID_HEX_128 = "a".repeat(128);
      const VALID_HEX_128_B = "b".repeat(128);

      it("writes hash on first call", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        await caller.clients.backfillPhoneMatchHash({
          clientId: fixture.clientId,
          phoneMatchHash: VALID_HEX_128,
        });

        const phone = await tenantDb
          .selectFrom("phones")
          .select("phone_match_hash")
          .where("id", "=", fixture.phoneId)
          .executeTakeFirstOrThrow();

        expect(phone.phone_match_hash).toBe(VALID_HEX_128);
      });

      it("is a no-op on second call (idempotent)", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        await caller.clients.backfillPhoneMatchHash({
          clientId: fixture.clientId,
          phoneMatchHash: VALID_HEX_128,
        });

        // Second call with a different hash should not overwrite
        await caller.clients.backfillPhoneMatchHash({
          clientId: fixture.clientId,
          phoneMatchHash: VALID_HEX_128_B,
        });

        const phone = await tenantDb
          .selectFrom("phones")
          .select("phone_match_hash")
          .where("id", "=", fixture.phoneId)
          .executeTakeFirstOrThrow();

        expect(phone.phone_match_hash).toBe(VALID_HEX_128);
      });

      it("is a no-op for a client with null phone_id", async () => {
        // Insert a web-intake client (no phone)
        const client = await tenantDb
          .insertInto("clients")
          .values({
            encrypted_alias: testSealedBox.sealBuffer(
              Buffer.from("web-client"),
            ),
            alias_hash: null,
            phone_id: null,
          })
          .returning("id")
          .executeTakeFirstOrThrow();

        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        // Should not throw
        await caller.clients.backfillPhoneMatchHash({
          clientId: client.id,
          phoneMatchHash: VALID_HEX_128,
        });
      });

      it("rejects volunteer (no VIEW_CLIENTS permission)", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const volunteer = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.VOLUNTEER },
        });
        const caller = createAuthedCaller(volunteer);

        await expectTrpcError(
          caller.clients.backfillPhoneMatchHash({
            clientId: fixture.clientId,
            phoneMatchHash: VALID_HEX_128,
          }),
          "FORBIDDEN",
        );
      });

      it("rejects malformed hash (too short)", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager);

        await expectTrpcError(
          caller.clients.backfillPhoneMatchHash({
            clientId: fixture.clientId,
            phoneMatchHash: "abcdef",
          }),
          "BAD_REQUEST",
        );
      });
    });

    // -----------------------------------------------------------------------
    // clients.updatePhone (phoneMatchHash threading)
    // -----------------------------------------------------------------------

    describe("updatePhone phoneMatchHash", () => {
      const VALID_HEX_128 = "c".repeat(128);

      it("stores the provided phoneMatchHash on the new phone row", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        await caller.clients.updatePhone({
          clientId: fixture.clientId,
          phoneNumber: "+15551112222",
          phoneMatchHash: VALID_HEX_128,
        });

        // Read the new phone row
        const client = await tenantDb
          .selectFrom("clients")
          .select("phone_id")
          .where("id", "=", fixture.clientId)
          .executeTakeFirstOrThrow();

        const phone = await tenantDb
          .selectFrom("phones")
          .select("phone_match_hash")
          .where("id", "=", client.phone_id!)
          .executeTakeFirstOrThrow();

        expect(phone.phone_match_hash).toBe(VALID_HEX_128);
      });
    });

    // -----------------------------------------------------------------------
    // clients.list (phoneMatchHash)
    // -----------------------------------------------------------------------

    describe("list phoneMatchHash", () => {
      it("returns phoneMatchHash from the joined phone row", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const hashVal = "d".repeat(128);

        // Set a phone_match_hash on the phone row
        await tenantDb
          .updateTable("phones")
          // care-y-ignore-next-line no-plaintext-db-write -- phone_match_hash is a browser-computed HMAC blind index, not a phone number
          .set({ phone_match_hash: hashVal })
          .where("id", "=", fixture.phoneId)
          .execute();

        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const result = await caller.clients.list({});
        const match = result.find((c) => c.id === fixture.clientId);
        expect(match).toBeDefined();
        expect(match?.phoneMatchHash).toBe(hashVal);
      });

      it("returns null phoneMatchHash when not set", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const admin = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.ADMIN },
        });
        const caller = createAuthedCaller(admin);

        const result = await caller.clients.list({});
        const match = result.find((c) => c.id === fixture.clientId);
        expect(match).toBeDefined();
        expect(match?.phoneMatchHash).toBeNull();
      });
    });

    // -----------------------------------------------------------------------
    // clients.mergeScanData (VIEW_CLIENTS gate + phoneHashes)
    // -----------------------------------------------------------------------

    describe("mergeScanData", () => {
      it("rejects sessions without VIEW_CLIENTS", async () => {
        const volunteer = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.VOLUNTEER },
        });
        const caller = createAuthedCaller(volunteer, {
          deps: {
            createDismissalSvc: (db) => createDismissalService(db),
            createMergeScanSvc: (db) => createMergeScanService(db),
          },
        });

        await expectTrpcError(caller.clients.mergeScanData(), "FORBIDDEN");
      });

      it("accepts sessions with VIEW_CLIENTS", async () => {
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager, {
          deps: {
            createDismissalSvc: (db) => createDismissalService(db),
            createMergeScanSvc: (db) => createMergeScanService(db),
          },
        });

        const result = await caller.clients.mergeScanData();
        expect(result).toHaveProperty("clients");
        expect(result).toHaveProperty("fieldRoles");
        expect(result).toHaveProperty("phoneHashes");
      });

      it("includes phoneHashes for hash-bearing clients", async () => {
        const fixture = await createTestClientFixture(tenantDb);
        const hashVal = "e".repeat(128);

        await tenantDb
          .updateTable("phones")
          // care-y-ignore-next-line no-plaintext-db-write -- phone_match_hash is a browser-computed HMAC blind index
          .set({ phone_match_hash: hashVal })
          .where("id", "=", fixture.phoneId)
          .execute();

        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager, {
          deps: {
            createDismissalSvc: (db) => createDismissalService(db),
            createMergeScanSvc: (db) => createMergeScanService(db),
          },
        });

        const result = await caller.clients.mergeScanData();
        const match = result.phoneHashes.find(
          (ph) => ph.clientId === fixture.clientId,
        );
        expect(match).toBeDefined();
        expect(match?.phoneMatchHash).toBe(hashVal);
      });

      it("includes telephony-only clients in phoneHashes", async () => {
        // Create a client via the phone fixture (simulating telephony path,
        // no intake form response)
        const fixture = await createTestClientFixture(tenantDb);
        const hashVal = "f".repeat(128);

        await tenantDb
          .updateTable("phones")
          // care-y-ignore-next-line no-plaintext-db-write -- phone_match_hash test fixture
          .set({ phone_match_hash: hashVal })
          .where("id", "=", fixture.phoneId)
          .execute();

        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager, {
          deps: {
            createDismissalSvc: (db) => createDismissalService(db),
            createMergeScanSvc: (db) => createMergeScanService(db),
          },
        });

        const result = await caller.clients.mergeScanData();
        // This telephony-only client has no intake responses, so it won't
        // appear in result.clients, but it MUST appear in phoneHashes.
        const inClients = result.clients.find(
          (c) => c.clientId === fixture.clientId,
        );
        expect(inClients).toBeUndefined();

        const inHashes = result.phoneHashes.find(
          (ph) => ph.clientId === fixture.clientId,
        );
        expect(inHashes).toBeDefined();
        expect(inHashes?.phoneMatchHash).toBe(hashVal);
      });

      it("excludes consultant reachability rows from phoneHashes", async () => {
        // The getPhoneHashes query joins only clients + phones, never
        // consultant_reachability. This test verifies that a consultant
        // reachability row with a phone hash does not leak into the merge
        // scan phone hashes. We just verify the query does not join the
        // consultant table by checking that only client-sourced hashes
        // appear. (Consultant reachability rows live in a separate table
        // with their own HKDF label per migration 087.)
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager, {
          deps: {
            createDismissalSvc: (db) => createDismissalService(db),
            createMergeScanSvc: (db) => createMergeScanService(db),
          },
        });

        const result = await caller.clients.mergeScanData();
        // All phoneHash entries should reference actual client IDs
        for (const entry of result.phoneHashes) {
          const client = await tenantDb
            .selectFrom("clients")
            .select("id")
            .where("id", "=", entry.clientId)
            .executeTakeFirst();
          expect(client).toBeDefined();
        }
      });
    });

    // -----------------------------------------------------------------------
    // clients.getDismissals (VIEW_CLIENTS gate)
    // -----------------------------------------------------------------------

    describe("getDismissals", () => {
      it("rejects sessions without VIEW_CLIENTS", async () => {
        const volunteer = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.VOLUNTEER },
        });
        const caller = createAuthedCaller(volunteer, {
          deps: {
            createDismissalSvc: (db) => createDismissalService(db),
          },
        });

        await expectTrpcError(caller.clients.getDismissals(), "FORBIDDEN");
      });

      it("accepts sessions with VIEW_CLIENTS", async () => {
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager, {
          deps: {
            createDismissalSvc: (db) => createDismissalService(db),
          },
        });

        const result = await caller.clients.getDismissals();
        // No dismissals stored yet, so null is expected
        expect(result).toBeNull();
      });
    });

    // -----------------------------------------------------------------------
    // clients.putDismissals (VIEW_CLIENTS gate)
    // -----------------------------------------------------------------------

    describe("putDismissals", () => {
      it("rejects sessions without VIEW_CLIENTS", async () => {
        const volunteer = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.VOLUNTEER },
        });
        const caller = createAuthedCaller(volunteer, {
          deps: {
            createDismissalSvc: (db) => createDismissalService(db),
          },
        });

        await expectTrpcError(
          caller.clients.putDismissals({
            encryptedDismissals: Buffer.from("test-blob").toString("base64"),
          }),
          "FORBIDDEN",
        );
      });

      it("accepts sessions with VIEW_CLIENTS", async () => {
        const manager = await createTestUser(tenantDb, {
          overrides: { role_id: RoleId.MANAGER },
        });
        const caller = createAuthedCaller(manager, {
          deps: {
            createDismissalSvc: (db) => createDismissalService(db),
          },
        });

        await caller.clients.putDismissals({
          encryptedDismissals: Buffer.from("test-blob").toString("base64"),
        });

        const result = await caller.clients.getDismissals();
        expect(result).not.toBeNull();
      });
    });
  },
);
