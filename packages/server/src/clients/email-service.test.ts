import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestQueue,
  createTestTicketFixture,
  noopEncryptor,
  testBlindIndexer,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";
import { createAuditService, type AuditService } from "../tickets/audit.js";
import { createEmailService, type EmailService } from "./email-service.js";
import { NotFoundError } from "../errors.js";
import * as crypto from "node:crypto";
import type { ClientId, UserId, EmailMatchHash, QueueId } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("EmailService (DB)", () => {
  let testDb: TestDb;
  let emailSvc: EmailService;
  let auditSvc: AuditService;
  let queueId: QueueId;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);

    auditSvc = createAuditService(testDb.db);
    emailSvc = createEmailService({
      db: testDb.db,
      audit: auditSvc,
      encryptor: noopEncryptor,
      indexer: testBlindIndexer,
      orgId: TEST_ORG_ID,
    });

    const q = await createTestQueue(testDb.db);
    queueId = q.id;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  async function createClient(): Promise<ClientId> {
    const fix = await createTestTicketFixture(testDb.db, { queueId });
    return fix.clientId;
  }

  function uniqueEmail(): string {
    return `test-${crypto.randomUUID().slice(0, 8)}@example.com`;
  }

  const actorId = crypto.randomUUID() as UserId;

  // -----------------------------------------------------------------------
  // updateEmail
  // -----------------------------------------------------------------------

  describe("updateEmail", () => {
    it("inserts an email row and sets the client FK", async () => {
      const clientId = await createClient();
      const address = uniqueEmail();

      const result = await emailSvc.updateEmail(
        clientId,
        address,
        actorId,
        null,
      );

      expect(result.success).toBe(true);
      expect(result.conflict).toBeNull();

      // Verify client points to a new email row
      const client = await testDb.db
        .selectFrom("clients")
        .select("email_id")
        .where("id", "=", clientId)
        .executeTakeFirstOrThrow();

      expect(client.email_id).not.toBeNull();

      // Verify email row exists with encrypted data
      const email = await testDb.db
        .selectFrom("emails")
        .select(["encrypted_address", "email_hash"])
        .where("id", "=", client.email_id!)
        .executeTakeFirstOrThrow();

      expect(Buffer.isBuffer(email.encrypted_address)).toBe(true);
      expect(email.email_hash.length).toBeGreaterThan(0);
    });

    it("returns conflict when another client has the same email", async () => {
      const client1 = await createClient();
      const client2 = await createClient();
      const sharedEmail = uniqueEmail();

      const first = await emailSvc.updateEmail(
        client1,
        sharedEmail,
        actorId,
        null,
      );
      expect(first.success).toBe(true);

      const second = await emailSvc.updateEmail(
        client2,
        sharedEmail,
        actorId,
        null,
      );

      expect(second.success).toBe(false);
      expect(second.conflict).not.toBeNull();
      expect(second.conflict!.conflictingClientId).toBe(client1);
      // Conflict returns encrypted alias, never the email address
      expect(
        Buffer.isBuffer(second.conflict!.conflictingClientEncryptedAlias),
      ).toBe(true);
    });

    it("conflict response never contains the decrypted email address", async () => {
      const client1 = await createClient();
      const client2 = await createClient();
      const sharedEmail = uniqueEmail();

      await emailSvc.updateEmail(client1, sharedEmail, actorId, null);
      const result = await emailSvc.updateEmail(
        client2,
        sharedEmail,
        actorId,
        null,
      );

      // Stringify the entire conflict payload and verify the email is absent
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain(sharedEmail);
    });

    it("deactivates the old email row on re-update", async () => {
      const clientId = await createClient();
      const firstEmail = uniqueEmail();
      const secondEmail = uniqueEmail();

      await emailSvc.updateEmail(clientId, firstEmail, actorId, null);

      const clientBefore = await testDb.db
        .selectFrom("clients")
        .select("email_id")
        .where("id", "=", clientId)
        .executeTakeFirstOrThrow();

      const oldEmailId = clientBefore.email_id!;

      await emailSvc.updateEmail(clientId, secondEmail, actorId, null);

      // Old email row is deleted (not soft-deleted)
      const oldEmail = await testDb.db
        .selectFrom("emails")
        .select("id")
        .where("id", "=", oldEmailId)
        .executeTakeFirst();

      expect(oldEmail).toBeUndefined();

      // Client now points to the new email
      const clientAfter = await testDb.db
        .selectFrom("clients")
        .select("email_id")
        .where("id", "=", clientId)
        .executeTakeFirstOrThrow();

      expect(clientAfter.email_id).not.toBe(oldEmailId);
      expect(clientAfter.email_id).not.toBeNull();
    });

    it("stores emailMatchHash when provided", async () => {
      const clientId = await createClient();
      const address = uniqueEmail();
      const matchHash = "a".repeat(128) as EmailMatchHash;

      await emailSvc.updateEmail(clientId, address, actorId, matchHash);

      const client = await testDb.db
        .selectFrom("clients")
        .select("email_id")
        .where("id", "=", clientId)
        .executeTakeFirstOrThrow();

      const email = await testDb.db
        .selectFrom("emails")
        .select("email_match_hash")
        .where("id", "=", client.email_id!)
        .executeTakeFirstOrThrow();

      expect(email.email_match_hash).toBe(matchHash);
    });

    it("stores null emailMatchHash when not provided", async () => {
      const clientId = await createClient();
      const address = uniqueEmail();

      await emailSvc.updateEmail(clientId, address, actorId, null);

      const client = await testDb.db
        .selectFrom("clients")
        .select("email_id")
        .where("id", "=", clientId)
        .executeTakeFirstOrThrow();

      const email = await testDb.db
        .selectFrom("emails")
        .select("email_match_hash")
        .where("id", "=", client.email_id!)
        .executeTakeFirstOrThrow();

      expect(email.email_match_hash).toBeNull();
    });

    it("throws NotFoundError for non-existent client", async () => {
      await expect(
        emailSvc.updateEmail(
          crypto.randomUUID() as ClientId,
          uniqueEmail(),
          actorId,
          null,
        ),
      ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("logs audit event on email change", async () => {
      const clientId = await createClient();
      const auditActorId = crypto.randomUUID() as UserId;
      const address = uniqueEmail();

      await emailSvc.updateEmail(clientId, address, auditActorId, null);

      const audit = await testDb.db
        .selectFrom("audit_log")
        .selectAll()
        .where("event_type", "=", "client_email_changed")
        .where("actor_id", "=", auditActorId)
        .executeTakeFirst();

      expect(audit).toBeDefined();
      expect((audit!.metadata as { clientId: string }).clientId).toBe(clientId);
      // Audit metadata never contains the email address
      expect(JSON.stringify(audit!.metadata)).not.toContain("@");
    });
  });

  // -----------------------------------------------------------------------
  // getClientEmail
  // -----------------------------------------------------------------------

  describe("getClientEmail", () => {
    it("round-trips through encrypt/decrypt", async () => {
      const clientId = await createClient();
      const address = uniqueEmail();

      await emailSvc.updateEmail(clientId, address, actorId, null);

      const result = await emailSvc.getClientEmail(clientId);
      expect(result).toBe(address);
    });

    it("returns null for client with no email", async () => {
      const clientId = await createClient();

      const result = await emailSvc.getClientEmail(clientId);
      expect(result).toBeNull();
    });

    it("returns null for merged client", async () => {
      const client1 = await createClient();
      const client2 = await createClient();
      const address = uniqueEmail();

      await emailSvc.updateEmail(client2, address, actorId, null);

      // Merge client2 into client1
      const { createMergeService } =
        await import("../tickets/merge-service.js");
      const mergeSvc = createMergeService(testDb.db);
      await mergeSvc.merge({
        primaryClientId: client1,
        secondaryClientId: client2,
        encryptedSnapshot: Buffer.from("snap"),
      });

      const result = await emailSvc.getClientEmail(client2);
      expect(result).toBeNull();
    });
  });
});
