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

  it("stores encrypted token when seal function provided", async () => {
    const mockSeal = (token: string): Buffer => Buffer.from(`sealed:${token}`);

    const { rawToken } = await inviteService.generate({
      invitedBy: adminUserId,
      roleId: RoleId.VOLUNTEER,
      seal: mockSeal,
    });

    const tokenHash = createHash("sha256").update(rawToken, "utf8").digest();
    const row = await tenantDb
      .selectFrom("invite_tokens")
      .select("encrypted_token")
      .where("token_hash", "=", tokenHash)
      .executeTakeFirst();

    expect(row?.encrypted_token).toBeDefined();
    expect(row!.encrypted_token!.toString("utf8")).toBe(`sealed:${rawToken}`);
  });

  it("stores null encrypted_token when seal not provided", async () => {
    const { rawToken } = await inviteService.generate({
      invitedBy: adminUserId,
      roleId: RoleId.VOLUNTEER,
    });

    const tokenHash = createHash("sha256").update(rawToken, "utf8").digest();
    const row = await tenantDb
      .selectFrom("invite_tokens")
      .select("encrypted_token")
      .where("token_hash", "=", tokenHash)
      .executeTakeFirst();

    expect(row?.encrypted_token).toBeNull();
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

  it("returns null for a revoked token", async () => {
    const { rawToken } = await inviteService.generate({
      invitedBy: adminUserId,
      roleId: RoleId.VOLUNTEER,
    });

    const invite = await inviteService.validate(rawToken);
    expect(invite).not.toBeNull();

    await inviteService.revoke(invite!.id);

    const result = await inviteService.validate(rawToken);
    expect(result).toBeNull();
  });

  describe("listPending", () => {
    it("returns pending tokens ordered by created_at desc", async () => {
      const first = await inviteService.generate({
        invitedBy: adminUserId,
        roleId: RoleId.VOLUNTEER,
      });
      const second = await inviteService.generate({
        invitedBy: adminUserId,
        roleId: RoleId.MANAGER,
      });

      const pending = await inviteService.listPending();

      // Most recent first
      const ids = pending.map((p) => p.id);
      const firstInvite = await inviteService.validate(first.rawToken);
      const secondInvite = await inviteService.validate(second.rawToken);
      expect(ids).toContain(firstInvite!.id);
      expect(ids).toContain(secondInvite!.id);
      expect(ids.indexOf(secondInvite!.id)).toBeLessThan(
        ids.indexOf(firstInvite!.id),
      );
    });

    it("excludes consumed tokens", async () => {
      const { rawToken } = await inviteService.generate({
        invitedBy: adminUserId,
        roleId: RoleId.VOLUNTEER,
      });

      const invite = await inviteService.validate(rawToken);
      await inviteService.consume(invite!.id);

      const pending = await inviteService.listPending();
      const ids = pending.map((p) => p.id);
      expect(ids).not.toContain(invite!.id);
    });

    it("excludes revoked tokens", async () => {
      const { rawToken } = await inviteService.generate({
        invitedBy: adminUserId,
        roleId: RoleId.VOLUNTEER,
      });

      const invite = await inviteService.validate(rawToken);
      await inviteService.revoke(invite!.id);

      const pending = await inviteService.listPending();
      const ids = pending.map((p) => p.id);
      expect(ids).not.toContain(invite!.id);
    });

    it("excludes expired tokens", async () => {
      await inviteService.generate({
        invitedBy: adminUserId,
        roleId: RoleId.VOLUNTEER,
        expiresInHours: 0,
      });

      const pending = await inviteService.listPending();
      // All pending tokens should have a future expiry
      for (const inv of pending) {
        expect(inv.expiresAt.getTime()).toBeGreaterThan(Date.now());
      }
    });

    it("returns correct fields including encryptedToken", async () => {
      const mockSeal = (token: string): Buffer =>
        Buffer.from(`sealed:${token}`);

      const { rawToken } = await inviteService.generate({
        invitedBy: adminUserId,
        roleId: RoleId.ADMIN,
        seal: mockSeal,
      });

      const invite = await inviteService.validate(rawToken);
      const pending = await inviteService.listPending();
      const match = pending.find((p) => p.id === invite!.id);

      expect(match).toBeDefined();
      expect(match!.roleId).toBe(RoleId.ADMIN);
      expect(match!.invitedBy).toBe(adminUserId);
      expect(match!.expiresAt).toBeInstanceOf(Date);
      expect(match!.createdAt).toBeInstanceOf(Date);
      expect(match!.encryptedToken).toBeInstanceOf(Buffer);
      expect(match!.encryptedToken!.toString("utf8")).toBe(
        `sealed:${rawToken}`,
      );
    });

    it("returns null encryptedToken for invites without seal", async () => {
      const { rawToken } = await inviteService.generate({
        invitedBy: adminUserId,
        roleId: RoleId.VOLUNTEER,
      });

      const invite = await inviteService.validate(rawToken);
      const pending = await inviteService.listPending();
      const match = pending.find((p) => p.id === invite!.id);

      expect(match).toBeDefined();
      expect(match!.encryptedToken).toBeNull();
    });
  });

  describe("revoke", () => {
    it("sets revoked_at on a pending token", async () => {
      const { rawToken } = await inviteService.generate({
        invitedBy: adminUserId,
        roleId: RoleId.VOLUNTEER,
      });

      const invite = await inviteService.validate(rawToken);
      await inviteService.revoke(invite!.id);

      const row = await tenantDb
        .selectFrom("invite_tokens")
        .select("revoked_at")
        .where("id", "=", invite!.id)
        .executeTakeFirst();

      expect(row?.revoked_at).toBeInstanceOf(Date);
    });

    it("throws NotFoundError for nonexistent token id", async () => {
      const { NotFoundError } = await import("../errors.js");
      await expect(
        inviteService.revoke("00000000-0000-0000-0000-000000000000"),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError for already-consumed token", async () => {
      const { NotFoundError } = await import("../errors.js");
      const { rawToken } = await inviteService.generate({
        invitedBy: adminUserId,
        roleId: RoleId.VOLUNTEER,
      });

      const invite = await inviteService.validate(rawToken);
      await inviteService.consume(invite!.id);

      await expect(inviteService.revoke(invite!.id)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("throws NotFoundError for already-revoked token", async () => {
      const { NotFoundError } = await import("../errors.js");
      const { rawToken } = await inviteService.generate({
        invitedBy: adminUserId,
        roleId: RoleId.VOLUNTEER,
      });

      const invite = await inviteService.validate(rawToken);
      await inviteService.revoke(invite!.id);

      await expect(inviteService.revoke(invite!.id)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("does not set revoked_at on a consumed token", async () => {
      const { rawToken } = await inviteService.generate({
        invitedBy: adminUserId,
        roleId: RoleId.VOLUNTEER,
      });

      const invite = await inviteService.validate(rawToken);
      await inviteService.consume(invite!.id);

      await inviteService.revoke(invite!.id).catch(() => {
        // Expected NotFoundError; we only care about the DB state below
      });

      const row = await tenantDb
        .selectFrom("invite_tokens")
        .select("revoked_at")
        .where("id", "=", invite!.id)
        .executeTakeFirst();

      expect(row?.revoked_at).toBeNull();
    });
  });
});
