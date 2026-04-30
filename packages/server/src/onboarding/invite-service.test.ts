/**
 * Integration tests for the invite token service.
 *
 * Tests the full generate/validate/consume lifecycle against a real
 * PostgreSQL database. Requires DATABASE_URL (Docker container).
 */

import { createHash } from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestUser,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import { RoleId } from "@care-y/shared";
import { createInviteService, type InviteService } from "./invite-service.js";

const HAS_DB = Boolean(process.env.DATABASE_URL);

describe.skipIf(!HAS_DB)("invite-service (DB integration)", () => {
  let testDb: TestDb;
  let tenantDb: Kysely<TenantDatabase>;
  let inviteService: InviteService;
  let adminUserId: string;

  beforeAll(async () => {
    testDb = await createTestDb();
    tenantDb = testDb.db;

    await tenantDb
      .insertInto("org_config")
      .values({ pii_retention_days: null })
      .onConflict((oc) => oc.doNothing())
      .execute();
    await seedOrgPublicKey(tenantDb);

    const adminUser = await createTestUser(tenantDb, {
      overrides: { role_id: RoleId.ADMIN },
    });
    adminUserId = adminUser.id;

    inviteService = createInviteService(tenantDb);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("generates a token and returns raw token + expiry", async () => {
    const result = await inviteService.generate({
      invitedBy: adminUserId,
      roleId: RoleId.VOLUNTEER,
    });

    expect(result.rawToken).toHaveLength(43); // 32 bytes base64url = 43 chars
    expect(result.expiresAt).toBeInstanceOf(Date);
    expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("stores SHA-256 hash, not plaintext token", async () => {
    const { rawToken } = await inviteService.generate({
      invitedBy: adminUserId,
      roleId: RoleId.VOLUNTEER,
    });

    const expectedHash = createHash("sha256").update(rawToken, "utf8").digest();

    const row = await tenantDb
      .selectFrom("invite_tokens")
      .select("token_hash")
      .where("token_hash", "=", expectedHash)
      .executeTakeFirst();

    expect(row).toBeDefined();
  });

  it("validates a valid token", async () => {
    const { rawToken } = await inviteService.generate({
      invitedBy: adminUserId,
      roleId: RoleId.VOLUNTEER,
    });

    const result = await inviteService.validate(rawToken);
    expect(result).not.toBeNull();
    expect(result!.roleId).toBe(RoleId.VOLUNTEER);
    expect(result!.invitedBy).toBe(adminUserId);
  });

  it("returns null for an invalid token", async () => {
    const result = await inviteService.validate("nonexistent-token");
    expect(result).toBeNull();
  });

  it("returns null for a consumed token", async () => {
    const { rawToken } = await inviteService.generate({
      invitedBy: adminUserId,
      roleId: RoleId.VOLUNTEER,
    });

    const invite = await inviteService.validate(rawToken);
    expect(invite).not.toBeNull();

    await inviteService.consume(invite!.id);

    const result = await inviteService.validate(rawToken);
    expect(result).toBeNull();
  });

  it("returns null for an expired token", async () => {
    const { rawToken } = await inviteService.generate({
      invitedBy: adminUserId,
      roleId: RoleId.VOLUNTEER,
      expiresInHours: 0,
    });

    // Token expires immediately (0 hours).
    const result = await inviteService.validate(rawToken);
    expect(result).toBeNull();
  });

  it("sets custom expiry", async () => {
    const { expiresAt } = await inviteService.generate({
      invitedBy: adminUserId,
      roleId: RoleId.VOLUNTEER,
      expiresInHours: 1,
    });

    const oneHourFromNow = Date.now() + 3600_000;
    // Allow 5s tolerance for test execution time.
    expect(expiresAt.getTime()).toBeGreaterThan(oneHourFromNow - 5000);
    expect(expiresAt.getTime()).toBeLessThan(oneHourFromNow + 5000);
  });

  it("stores encrypted email when provided", async () => {
    const fakeEncryptedEmail = Buffer.from("encrypted-email-blob");
    const { rawToken } = await inviteService.generate({
      invitedBy: adminUserId,
      roleId: RoleId.VOLUNTEER,
      encryptedEmail: fakeEncryptedEmail,
    });

    const tokenHash = createHash("sha256").update(rawToken, "utf8").digest();
    const row = await tenantDb
      .selectFrom("invite_tokens")
      .select("encrypted_email")
      .where("token_hash", "=", tokenHash)
      .executeTakeFirst();

    expect(row?.encrypted_email).toBeDefined();
    expect(row!.encrypted_email!.equals(fakeEncryptedEmail)).toBe(true);
  });

  it("stores correct role_id from generate input", async () => {
    const { rawToken } = await inviteService.generate({
      invitedBy: adminUserId,
      roleId: RoleId.MANAGER,
    });

    const result = await inviteService.validate(rawToken);
    expect(result).not.toBeNull();
    expect(result!.roleId).toBe(RoleId.MANAGER);
  });
});
