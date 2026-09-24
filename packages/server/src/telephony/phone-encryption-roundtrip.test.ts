/**
 * Roundtrip tests for phones.encrypted_number.
 *
 * Verifies that all production writers (inbound-call path, inbound-sms
 * path, client-service updatePhone) produce ciphertext that every
 * production reader (contact-resolution resolveClientPhone,
 * utils/sql phoneForViewer) can open.
 *
 * Requires DATABASE_URL (runs inside Docker via pnpm test:server:db).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  seedOrgPublicKey,
  createTestQueue,
  testFieldEncryptor,
  testBlindIndexer,
  testSealedBox,
  noopEncryptor,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";
import { createPhoneRepository } from "./models/phone-repo.js";
import { createClientRepository } from "./models/client-repo.js";
import { resolveClientPhone } from "../clients/contact-resolution.js";
import { phoneForViewer } from "../utils/sql.js";
import { encryptString } from "./crypto-helpers.js";
import type { PhoneHash, QueueId, KeyGeneration } from "@care-y/shared";
import * as crypto from "node:crypto";

describe.skipIf(!process.env.DATABASE_URL)(
  "phones.encrypted_number roundtrip (DB)",
  () => {
    let testDb: TestDb;
    let queueId: QueueId;

    beforeAll(async () => {
      testDb = await createTestDb();
      await seedOrgPublicKey(testDb.db);
      const q = await createTestQueue(testDb.db);
      queueId = q.id;
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    // -----------------------------------------------------------------
    // Writer 1: inbound-call / inbound-sms path shape
    // (encryptString with FieldEncryptor, then findOrCreateByPhoneHash)
    // -----------------------------------------------------------------

    it("inbound-call path: encryptString writes, resolveClientPhone reads", async () => {
      const phoneNumber = "+15551000001";
      const phoneHash = testBlindIndexer.hashPhone(phoneNumber, TEST_ORG_ID);

      // Write: mirrors inbound-call.ts:118
      const encryptedNumber = encryptString(testFieldEncryptor, phoneNumber);

      const phoneRepo = createPhoneRepository(testDb.db);
      const clientRepo = createClientRepository(
        testDb.db,
        phoneRepo,
        testSealedBox,
      );

      const { client } = await clientRepo.findOrCreateByPhoneHash(
        phoneHash as PhoneHash,
        encryptedNumber,
      );

      // Create a ticket so resolveClientPhone can join through it
      const ticket = await testDb.db
        .insertInto("tickets")
        .values({
          client_id: client.id,
          queue_id: queueId,
          encrypted_title: noopEncryptor.encrypt("test"),
          encrypted_description: noopEncryptor.encrypt("test"),
          key_generation: crypto.randomUUID() as KeyGeneration,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      // Read: resolveClientPhone (contact-resolution.ts:22)
      const resolved = await resolveClientPhone(
        ticket.id,
        testDb.db,
        testFieldEncryptor,
      );

      expect(resolved).not.toBeNull();
      try {
        expect(resolved?.toString("utf-8")).toBe(phoneNumber);
      } finally {
        resolved?.fill(0);
      }
    });

    it("inbound-sms path: encryptString writes, phoneForViewer reads", async () => {
      const phoneNumber = "+15551000002";
      const phoneHash = testBlindIndexer.hashPhone(phoneNumber, TEST_ORG_ID);

      // Write: mirrors inbound-sms.ts:107
      const encryptedNumber = encryptString(testFieldEncryptor, phoneNumber);

      const phoneRepo = createPhoneRepository(testDb.db);
      const clientRepo = createClientRepository(
        testDb.db,
        phoneRepo,
        testSealedBox,
      );

      await clientRepo.findOrCreateByPhoneHash(
        phoneHash as PhoneHash,
        encryptedNumber,
      );

      // Read back the raw encrypted_number from the DB
      const row = await testDb.db
        .selectFrom("phones")
        .select("encrypted_number")
        .where("phone_hash", "=", phoneHash as PhoneHash)
        .executeTakeFirstOrThrow();

      // Read: phoneForViewer (utils/sql.ts:84) with unmasked=true
      const displayed = phoneForViewer(
        row.encrypted_number,
        true,
        testFieldEncryptor,
      );

      expect(displayed).not.toBeNull();
      // phoneForViewer formats E.164 for display; strip non-digits to
      // verify the underlying number survives the roundtrip.
      const digits = displayed!.replace(/\D/g, "");
      expect(digits).toContain("555");
      expect(digits).toContain("1000002");
    });

    // -----------------------------------------------------------------
    // Writer 2: client-service updatePhone path shape
    // (encryptor.encrypt directly, same FieldEncryptor)
    // -----------------------------------------------------------------

    it("client-service path: encryptor.encrypt writes, resolveClientPhone reads", async () => {
      const phoneNumber = "+15551000003";
      const phoneHash = testBlindIndexer.hashPhone(phoneNumber, TEST_ORG_ID);

      // Write: mirrors client-service.ts:481
      const encryptedNumber = testFieldEncryptor.encrypt(phoneNumber);

      const phoneRepo = createPhoneRepository(testDb.db);
      const clientRepo = createClientRepository(
        testDb.db,
        phoneRepo,
        testSealedBox,
      );

      const { client } = await clientRepo.findOrCreateByPhoneHash(
        phoneHash as PhoneHash,
        encryptedNumber,
      );

      const ticket = await testDb.db
        .insertInto("tickets")
        .values({
          client_id: client.id,
          queue_id: queueId,
          encrypted_title: noopEncryptor.encrypt("test"),
          encrypted_description: noopEncryptor.encrypt("test"),
          key_generation: crypto.randomUUID() as KeyGeneration,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      // Read: resolveClientPhone
      const resolved = await resolveClientPhone(
        ticket.id,
        testDb.db,
        testFieldEncryptor,
      );

      expect(resolved).not.toBeNull();
      try {
        expect(resolved?.toString("utf-8")).toBe(phoneNumber);
      } finally {
        resolved?.fill(0);
      }
    });

    it("client-service path: encryptor.encrypt writes, phoneForViewer reads", async () => {
      const phoneNumber = "+15551000004";
      const phoneHash = testBlindIndexer.hashPhone(phoneNumber, TEST_ORG_ID);

      // Write: mirrors client-service.ts:481
      const encryptedNumber = testFieldEncryptor.encrypt(phoneNumber);

      const phoneRepo = createPhoneRepository(testDb.db);
      const clientRepo = createClientRepository(
        testDb.db,
        phoneRepo,
        testSealedBox,
      );

      await clientRepo.findOrCreateByPhoneHash(
        phoneHash as PhoneHash,
        encryptedNumber,
      );

      const row = await testDb.db
        .selectFrom("phones")
        .select("encrypted_number")
        .where("phone_hash", "=", phoneHash as PhoneHash)
        .executeTakeFirstOrThrow();

      const displayed = phoneForViewer(
        row.encrypted_number,
        true,
        testFieldEncryptor,
      );

      expect(displayed).not.toBeNull();
      // Strip formatting to compare raw digits
      const digits = displayed!.replace(/\D/g, "");
      expect(digits).toContain("555");
      expect(digits).toContain("1000004");
    });

    // -----------------------------------------------------------------
    // Cross-writer: all writers produce OPS-tier ciphertext that the
    // same FieldEncryptor can decrypt (no sealed-box format present)
    // -----------------------------------------------------------------

    it("all three write paths produce FieldEncryptor-compatible ciphertext", async () => {
      const numbers = ["+15551000005", "+15551000006", "+15551000007"];
      const phoneRepo = createPhoneRepository(testDb.db);
      const clientRepo = createClientRepository(
        testDb.db,
        phoneRepo,
        testSealedBox,
      );

      // Writer 1: encryptString (inbound-call shape)
      const enc1 = encryptString(testFieldEncryptor, numbers[0] as string);
      const hash1 = testBlindIndexer.hashPhone(
        numbers[0] as string,
        TEST_ORG_ID,
      );
      await clientRepo.findOrCreateByPhoneHash(hash1 as PhoneHash, enc1);

      // Writer 2: encryptString (inbound-sms shape, same helper)
      const enc2 = encryptString(testFieldEncryptor, numbers[1] as string);
      const hash2 = testBlindIndexer.hashPhone(
        numbers[1] as string,
        TEST_ORG_ID,
      );
      await clientRepo.findOrCreateByPhoneHash(hash2 as PhoneHash, enc2);

      // Writer 3: encryptor.encrypt (client-service shape)
      const enc3 = testFieldEncryptor.encrypt(numbers[2] as string);
      const hash3 = testBlindIndexer.hashPhone(
        numbers[2] as string,
        TEST_ORG_ID,
      );
      await clientRepo.findOrCreateByPhoneHash(hash3 as PhoneHash, enc3);

      // Read all three back and verify they decrypt
      for (const number of numbers) {
        const hash = testBlindIndexer.hashPhone(number, TEST_ORG_ID);
        const row = await testDb.db
          .selectFrom("phones")
          .select("encrypted_number")
          .where("phone_hash", "=", hash as PhoneHash)
          .executeTakeFirstOrThrow();

        const plainBuf = testFieldEncryptor.decryptToBuffer(
          row.encrypted_number,
        );
        try {
          expect(plainBuf.toString("utf-8")).toBe(number);
        } finally {
          plainBuf.fill(0);
        }
      }
    });
  },
);
