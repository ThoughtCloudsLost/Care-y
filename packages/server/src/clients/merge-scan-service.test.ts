/**
 * Tests for the merge scan service (shared line features).
 *
 * DB integration tests: require Docker (pnpm test:server:db).
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  testSealedBox,
  noopEncryptor,
  type TestDb,
} from "../test-utils.js";
import { createMergeScanService } from "./merge-scan-service.js";
import type { MergeScanService } from "./merge-scan-service.js";
import type { ClientId, PhoneHash, PhoneMatchHash } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("MergeScanService", () => {
  let testDb: TestDb;
  let svc: MergeScanService;

  beforeAll(async () => {
    testDb = await createTestDb();
    svc = createMergeScanService(testDb.db);
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  const HASH_A = "a".repeat(128) as PhoneMatchHash;
  const HASH_B = "b".repeat(128) as PhoneMatchHash;

  /**
   * Inserts a phone -> client chain with an optional phone_match_hash
   * and is_shared_line flag. Returns both IDs.
   */
  async function seedPhoneClient(opts?: {
    phoneMatchHash?: PhoneMatchHash | null;
    isSharedLine?: boolean;
  }): Promise<{ clientId: ClientId; phoneId: string }> {
    const uid = crypto.randomUUID().slice(0, 8);
    // care-y-ignore no-plaintext-db-write -- phone_hash is a blind index, encrypted_number passes through noopEncryptor.encrypt()
    const phone = await testDb.db
      .insertInto("phones")
      .values({
        phone_hash: `ph-${uid}` as PhoneHash,
        encrypted_number: noopEncryptor.encrypt(`+1555000${uid}`),
        locale: "en-US",
        phone_match_hash: opts?.phoneMatchHash ?? null,
        is_shared_line: opts?.isSharedLine ?? false,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    // care-y-ignore no-plaintext-db-write -- encrypted_alias is test ciphertext via testSealedBox; phone_id is a UUID FK
    const client = await testDb.db
      .insertInto("clients")
      .values({
        encrypted_alias: testSealedBox.sealBuffer(Buffer.from(`cl-${uid}`)),
        alias_hash: null,
        phone_id: phone.id,
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    return { clientId: client.id, phoneId: phone.id };
  }

  /** Inserts a phone-less client. */
  async function seedPhonelessClient(): Promise<{ clientId: ClientId }> {
    const uid = crypto.randomUUID().slice(0, 8);
    // care-y-ignore no-plaintext-db-write -- encrypted_alias is test ciphertext via testSealedBox; no PII columns
    const client = await testDb.db
      .insertInto("clients")
      .values({
        encrypted_alias: testSealedBox.sealBuffer(Buffer.from(`cl-np-${uid}`)),
        alias_hash: null,
        phone_id: null,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    return { clientId: client.id };
  }

  // -------------------------------------------------------------------------
  // getPhoneHashes: excludes shared, includes unmarked
  // -------------------------------------------------------------------------

  it("getPhoneHashes excludes phones marked as shared line", async () => {
    const shared = await seedPhoneClient({
      phoneMatchHash: HASH_A,
      isSharedLine: true,
    });
    const normal = await seedPhoneClient({
      phoneMatchHash: HASH_B,
      isSharedLine: false,
    });

    const hashes = await svc.getPhoneHashes();
    const ids = hashes.map((h) => h.clientId);

    expect(ids).not.toContain(shared.clientId);
    expect(ids).toContain(normal.clientId);
  });

  // -------------------------------------------------------------------------
  // getSharedPhoneMatchHashes
  // -------------------------------------------------------------------------

  it("getSharedPhoneMatchHashes returns hashes of shared phones only", async () => {
    const sharedHash = "c".repeat(128) as PhoneMatchHash;
    await seedPhoneClient({ phoneMatchHash: sharedHash, isSharedLine: true });
    await seedPhoneClient({ phoneMatchHash: HASH_B, isSharedLine: false });

    const result = await svc.getSharedPhoneMatchHashes();
    const hashes = result.map((r) => r.phoneMatchHash);

    expect(hashes).toContain(sharedHash);
    expect(hashes).not.toContain(HASH_B);
  });

  it("getSharedPhoneMatchHashes skips shared phones with null phone_match_hash", async () => {
    await seedPhoneClient({ phoneMatchHash: null, isSharedLine: true });

    const result = await svc.getSharedPhoneMatchHashes();
    const nullEntries = result.filter(
      (r) => r.phoneMatchHash === (null as unknown),
    );
    expect(nullEntries).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // setSharedLineByMatchHash
  // -------------------------------------------------------------------------

  it("setSharedLineByMatchHash flags every row with the hash", async () => {
    const hash = "d".repeat(128) as PhoneMatchHash;
    await seedPhoneClient({ phoneMatchHash: hash, isSharedLine: false });
    await seedPhoneClient({ phoneMatchHash: hash, isSharedLine: false });

    const count = await svc.setSharedLineByMatchHash(hash, true);
    expect(count).toBe(2);

    const rows = await testDb.db
      .selectFrom("phones")
      .select("is_shared_line")
      .where("phone_match_hash", "=", hash)
      .execute();
    expect(rows.every((r) => r.is_shared_line)).toBe(true);
  });

  it("setSharedLineByMatchHash returns 0 for unknown hash", async () => {
    const unknown = "f".repeat(128) as PhoneMatchHash;
    const count = await svc.setSharedLineByMatchHash(unknown, true);
    expect(count).toBe(0);
  });

  // -------------------------------------------------------------------------
  // setSharedLineByClientId
  // -------------------------------------------------------------------------

  it("setSharedLineByClientId returns false for client with null phone_id", async () => {
    const { clientId } = await seedPhonelessClient();
    const result = await svc.setSharedLineByClientId(clientId, true);
    expect(result).toBe(false);
  });

  it("setSharedLineByClientId returns true when it flags the phone", async () => {
    const { clientId } = await seedPhoneClient({ isSharedLine: false });
    const result = await svc.setSharedLineByClientId(clientId, true);
    expect(result).toBe(true);
  });

  // -------------------------------------------------------------------------
  // getSharedLineByClientId
  // -------------------------------------------------------------------------

  it("getSharedLineByClientId returns null for phone-less client", async () => {
    const { clientId } = await seedPhonelessClient();
    const result = await svc.getSharedLineByClientId(clientId);
    expect(result).toBe(null);
  });

  it("getSharedLineByClientId tracks the flag", async () => {
    const { clientId } = await seedPhoneClient({ isSharedLine: false });

    expect(await svc.getSharedLineByClientId(clientId)).toBe(false);

    await svc.setSharedLineByClientId(clientId, true);
    expect(await svc.getSharedLineByClientId(clientId)).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Unmarking restores the phone to getPhoneHashes
  // -------------------------------------------------------------------------

  it("unmarking shared restores the phone to getPhoneHashes", async () => {
    const hash = "e".repeat(128) as PhoneMatchHash;
    const { clientId } = await seedPhoneClient({
      phoneMatchHash: hash,
      isSharedLine: true,
    });

    // Shared: excluded from phone hashes
    let hashes = await svc.getPhoneHashes();
    expect(hashes.map((h) => h.clientId)).not.toContain(clientId);

    // Unmark
    await svc.setSharedLineByClientId(clientId, false);

    // Now included again
    hashes = await svc.getPhoneHashes();
    expect(hashes.map((h) => h.clientId)).toContain(clientId);
  });
});
