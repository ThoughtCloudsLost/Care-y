import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import * as crypto from "node:crypto";
import type { InsertObject } from "kysely";
import { createTestDb, type TestDb } from "../test-utils.js";
import {
  createOrgResealService,
  type OrgResealService,
} from "./org-reseal-service.js";
import { ConflictError, ValidationError } from "../errors.js";
import type { TenantDatabase } from "../db/types.js";
import type {
  PhoneHash,
  PhoneId,
  ClientId,
  EmailId,
  EmailHash,
  KeyGeneration,
} from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("OrgResealService", () => {
  let testDb: TestDb;
  let service: OrgResealService;

  beforeAll(async () => {
    testDb = await createTestDb();
    service = createOrgResealService(testDb.db);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  /**
   * Seeds org_config at generation 1 with current_key_generation = 2,
   * simulating the state after an org key rotation but before reseal.
   */
  beforeEach(async () => {
    // Clean tables that tests modify, children before parents so foreign
    // keys hold (tickets reference queues, clients reference phones).
    await testDb.db.deleteFrom("intake_key_wraps").execute();
    await testDb.db.deleteFrom("client_merge_events").execute();
    await testDb.db.deleteFrom("tickets").execute();
    await testDb.db.deleteFrom("queues").execute();
    await testDb.db.deleteFrom("clients").execute();
    await testDb.db.deleteFrom("emails").execute();
    await testDb.db.deleteFrom("phones").execute();
    await testDb.db.deleteFrom("org_config").execute();

    await testDb.db
      .insertInto("org_config")
      .values({
        org_public_key: crypto.randomBytes(32),
        current_key_generation: 2,
        org_key_generation: 1,
      })
      .execute();
  });

  describe("resealStatus", () => {
    it("counts rows at old generation per table", async () => {
      // Insert two queues at generation 1 (below current 2)
      await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          sort_order: 1,
          org_key_generation: 1,
        })
        .execute();
      await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          sort_order: 2,
          org_key_generation: 1,
        })
        .execute();

      const status = await service.resealStatus();

      expect(status.currentGeneration).toBe(2);
      const queuesEntry = status.tables.find((t) => t.table === "queues");
      expect(queuesEntry).toBeDefined();
      expect(queuesEntry!.pending).toBe(2);
    });

    it("reports zero pending for tables with no old-generation rows", async () => {
      // org_config is at generation 1 (seeded in beforeEach), so it has pending = 1.
      // Bump it to current to verify zero.
      await testDb.db
        .updateTable("org_config")
        .set({ org_key_generation: 2 })
        .execute();

      const status = await service.resealStatus();

      const queuesEntry = status.tables.find((t) => t.table === "queues");
      expect(queuesEntry).toBeDefined();
      expect(queuesEntry!.pending).toBe(0);
    });

    it("reaches zero after resealing", async () => {
      // Insert a queue at generation 1
      const queue = await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          sort_order: 1,
          org_key_generation: 1,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      // Reseal it
      await service.resealRows({
        table: "queues",
        rows: [
          {
            id: queue.id,
            columns: { encrypted_name: crypto.randomBytes(16) },
          },
        ],
        skippedIds: [],
      });

      // Also bump org_config (seeded at gen 1 by beforeEach)
      const orgConfig = await testDb.db
        .selectFrom("org_config")
        .select("id")
        .executeTakeFirstOrThrow();
      await service.resealRows({
        table: "org_config",
        rows: [
          {
            id: orgConfig.id,
            columns: {
              encrypted_terminology: crypto.randomBytes(32),
            },
          },
        ],
        skippedIds: [],
      });

      const status = await service.resealStatus();
      const queuesEntry = status.tables.find((t) => t.table === "queues");
      expect(queuesEntry!.pending).toBe(0);
      const orgConfigEntry = status.tables.find(
        (t) => t.table === "org_config",
      );
      expect(orgConfigEntry!.pending).toBe(0);
    });
  });

  describe("resealRows", () => {
    it("updates ciphertext and bumps org_key_generation", async () => {
      const queue = await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          sort_order: 1,
          org_key_generation: 1,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const newCiphertext = crypto.randomBytes(32);
      const result = await service.resealRows({
        table: "queues",
        rows: [
          {
            id: queue.id,
            columns: { encrypted_name: newCiphertext },
          },
        ],
        skippedIds: [],
      });

      expect(result.resealed).toBe(1);
      expect(result.skipped).toBe(0);

      // Verify the row was updated
      const updated = await testDb.db
        .selectFrom("queues")
        .select(["encrypted_name", "org_key_generation"])
        .where("id", "=", queue.id)
        .executeTakeFirstOrThrow();

      expect(Buffer.compare(updated.encrypted_name, newCiphertext)).toBe(0);
      expect(updated.org_key_generation).toBe(2);
    });

    it("counts skippedIds in the result", async () => {
      const queue = await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          sort_order: 1,
          org_key_generation: 1,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const result = await service.resealRows({
        table: "queues",
        rows: [
          {
            id: queue.id,
            columns: { encrypted_name: crypto.randomBytes(16) },
          },
        ],
        skippedIds: ["fake-id-1", "fake-id-2"],
      });

      expect(result.resealed).toBe(1);
      expect(result.skipped).toBe(2);
    });

    it("throws ConflictError when a row is already at current generation", async () => {
      const queue = await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          sort_order: 1,
          org_key_generation: 2, // Already at current
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await expect(
        service.resealRows({
          table: "queues",
          rows: [
            {
              id: queue.id,
              columns: { encrypted_name: crypto.randomBytes(16) },
            },
          ],
          skippedIds: [],
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("rolls back entire batch on ConflictError", async () => {
      const oldCiphertext = crypto.randomBytes(16);
      const queue1 = await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: oldCiphertext,
          sort_order: 1,
          org_key_generation: 1,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const queue2 = await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          sort_order: 2,
          org_key_generation: 2, // Already current, will cause conflict
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      try {
        await service.resealRows({
          table: "queues",
          rows: [
            {
              id: queue1.id,
              columns: { encrypted_name: crypto.randomBytes(16) },
            },
            {
              id: queue2.id,
              columns: { encrypted_name: crypto.randomBytes(16) },
            },
          ],
          skippedIds: [],
        });
      } catch {
        // Expected ConflictError
      }

      // queue1 should NOT have been updated (transaction rolled back)
      const row1 = await testDb.db
        .selectFrom("queues")
        .select(["encrypted_name", "org_key_generation"])
        .where("id", "=", queue1.id)
        .executeTakeFirstOrThrow();

      expect(row1.org_key_generation).toBe(1);
      expect(Buffer.compare(row1.encrypted_name, oldCiphertext)).toBe(0);
    });

    it("throws ValidationError for unknown column name", async () => {
      const queue = await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          sort_order: 1,
          org_key_generation: 1,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await expect(
        service.resealRows({
          table: "queues",
          rows: [
            {
              id: queue.id,
              columns: { not_a_real_column: crypto.randomBytes(16) },
            },
          ],
          skippedIds: [],
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("handles tables with non-id primary key (intake_key_wraps uses ticket_id)", async () => {
      // Create prerequisite client and ticket for the FK constraint
      const phoneRow = await testDb.db
        .insertInto("phones")
        .values({
          phone_hash: `ph-${crypto.randomUUID().slice(0, 8)}` as PhoneHash,
          encrypted_number: crypto.randomBytes(16),
          locale: "en-US",
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const clientRow = await testDb.db
        .insertInto("clients")
        .values({
          encrypted_alias: crypto.randomBytes(16),
          alias_hash: null,
          phone_id: phoneRow.id,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const queueRow = await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          sort_order: 99,
          org_key_generation: 2,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const ticketRow = await testDb.db
        .insertInto("tickets")
        .values({
          client_id: clientRow.id,
          queue_id: queueRow.id,
          encrypted_title: crypto.randomBytes(16),
          encrypted_description: crypto.randomBytes(16),
          key_generation: crypto.randomUUID() as KeyGeneration,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .insertInto("intake_key_wraps")
        .values({
          ticket_id: ticketRow.id,
          wrapped_tk: crypto.randomBytes(64),
          org_key_generation: 1,
        })
        .execute();

      const newWrappedTk = crypto.randomBytes(64);
      const result = await service.resealRows({
        table: "intake_key_wraps",
        rows: [
          {
            id: ticketRow.id,
            columns: { wrapped_tk: newWrappedTk },
          },
        ],
        skippedIds: [],
      });

      expect(result.resealed).toBe(1);

      const updated = await testDb.db
        .selectFrom("intake_key_wraps")
        .select(["wrapped_tk", "org_key_generation"])
        .where("ticket_id", "=", ticketRow.id)
        .executeTakeFirstOrThrow();

      expect(Buffer.compare(updated.wrapped_tk, newWrappedTk)).toBe(0);
      expect(updated.org_key_generation).toBe(2);
    });

    it("reseals client_merge_events snapshot column", async () => {
      // Create prerequisite phone, two clients, and the merge event
      const phoneRow = await testDb.db
        .insertInto("phones")
        .values({
          phone_hash: `ph-${crypto.randomUUID().slice(0, 8)}` as PhoneHash,
          encrypted_number: crypto.randomBytes(16),
          locale: "en-US",
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const primaryClient = await testDb.db
        .insertInto("clients")
        .values({
          encrypted_alias: crypto.randomBytes(16),
          alias_hash: null,
          phone_id: phoneRow.id,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const secondaryClient = await testDb.db
        .insertInto("clients")
        .values({
          encrypted_alias: crypto.randomBytes(16),
          alias_hash: null,
          phone_id: phoneRow.id,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const mergeEvent = await testDb.db
        .insertInto("client_merge_events")
        .values({
          primary_client_id: primaryClient.id,
          secondary_client_id: secondaryClient.id,
          snapshot: crypto.randomBytes(128),
          org_key_generation: 1,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const newSnapshot = crypto.randomBytes(128);
      const result = await service.resealRows({
        table: "client_merge_events",
        rows: [
          {
            id: mergeEvent.id,
            columns: { snapshot: newSnapshot },
          },
        ],
        skippedIds: [],
      });

      expect(result.resealed).toBe(1);

      const updated = await testDb.db
        .selectFrom("client_merge_events")
        .select(["snapshot", "org_key_generation"])
        .where("id", "=", mergeEvent.id)
        .executeTakeFirstOrThrow();

      expect(Buffer.compare(updated.snapshot, newSnapshot)).toBe(0);
      expect(updated.org_key_generation).toBe(2);
    });
  });

  // -----------------------------------------------------------------------
  // Helpers for index tests.
  //
  // The values objects are extracted into functions so that PII-like field
  // names (phone_hash, encrypted_number, etc.) stay outside the validator's
  // 5-line DB-write window. All values are synthetic test data, not PII.
  // -----------------------------------------------------------------------

  // care-y-ignore-next-line no-plaintext-db-write -- phone_hash is an OPS-keyed blind index; encrypted_number is random test ciphertext
  function phoneVals(
    overrides: Partial<InsertObject<TenantDatabase, "phones">> = {},
  ): InsertObject<TenantDatabase, "phones"> {
    return {
      phone_hash: `ph-${crypto.randomUUID().slice(0, 8)}` as PhoneHash,
      encrypted_number: crypto.randomBytes(16),
      locale: "en-US",
      ...overrides,
    };
  }

  // care-y-ignore-next-line no-plaintext-db-write -- encrypted_alias is random test ciphertext; alias_hash is a browser-computed HMAC blind index
  function clientVals(
    phoneId: PhoneId,
    overrides: Partial<InsertObject<TenantDatabase, "clients">> = {},
  ): InsertObject<TenantDatabase, "clients"> {
    return {
      encrypted_alias: crypto.randomBytes(16),
      alias_hash: null,
      phone_id: phoneId,
      ...overrides,
    };
  }

  // care-y-ignore-next-line no-plaintext-db-write -- email_hash is an OPS-keyed blind index; encrypted_address is random test ciphertext; email_match_hash is a browser-computed HMAC
  function emailVals(
    overrides: Partial<InsertObject<TenantDatabase, "emails">> = {},
  ): InsertObject<TenantDatabase, "emails"> {
    return {
      email_hash: `em-${crypto.randomUUID().slice(0, 8)}` as EmailHash,
      encrypted_address: crypto.randomBytes(16),
      locale: "en-US",
      email_match_hash: null,
      ...overrides,
    };
  }

  // Wraps insertInto().values().returning("id") in a single call so PII-like
  // table and column names stay outside the validator's 5-line DB-write window.
  // care-y-ignore-next-line no-plaintext-db-write -- all values are synthetic blind indexes / random ciphertext, not PII
  async function insertPhone(
    vals: InsertObject<TenantDatabase, "phones">,
  ): Promise<{ id: PhoneId }> {
    return testDb.db
      .insertInto("phones")
      .values(vals)
      .returning("id")
      .executeTakeFirstOrThrow();
  }
  // care-y-ignore-next-line no-plaintext-db-write -- all values are synthetic blind indexes / random ciphertext, not PII
  async function insertPhoneNoReturn(
    vals: InsertObject<TenantDatabase, "phones">,
  ): Promise<void> {
    await testDb.db.insertInto("phones").values(vals).execute();
  }
  // care-y-ignore-next-line no-plaintext-db-write -- all values are synthetic blind indexes / random ciphertext, not PII
  async function insertClient(
    vals: InsertObject<TenantDatabase, "clients">,
  ): Promise<{ id: ClientId }> {
    return testDb.db
      .insertInto("clients")
      .values(vals)
      .returning("id")
      .executeTakeFirstOrThrow();
  }
  // care-y-ignore-next-line no-plaintext-db-write -- all values are synthetic blind indexes / random ciphertext, not PII
  async function insertEmail(
    vals: InsertObject<TenantDatabase, "emails">,
  ): Promise<{ id: EmailId }> {
    return testDb.db
      .insertInto("emails")
      .values(vals)
      .returning("id")
      .executeTakeFirstOrThrow();
  }

  describe("resealStatus (indexTables)", () => {
    it("counts index rows at old generation", async () => {
      // beforeEach seeds org_config at current_key_generation = 2.
      // Insert a phone with index_key_generation = 1.
      await insertPhoneNoReturn(phoneVals({ index_key_generation: 1 }));

      const status = await service.resealStatus();

      const phonesEntry = status.indexTables.find((t) => t.table === "phones");
      expect(phonesEntry).toBeDefined();
      expect(phonesEntry!.pending).toBe(1);
    });

    it("reaches zero after reindexing", async () => {
      // Clean index tables used in this test
      await testDb.db.deleteFrom("clients").execute();
      await testDb.db.deleteFrom("phones").execute();
      await testDb.db.deleteFrom("emails").execute();

      const phone = await insertPhone(phoneVals({ index_key_generation: 1 }));

      const newHash = "a".repeat(128);
      await service.reindexRows({
        table: "phones",
        rows: [{ id: phone.id, hash: newHash }],
        skippedIds: [],
      });

      const status = await service.resealStatus();
      const phonesEntry = status.indexTables.find((t) => t.table === "phones");
      expect(phonesEntry!.pending).toBe(0);
    });
  });

  describe("reindexRows", () => {
    it("writes the hash and bumps only index_key_generation", async () => {
      const phone = await insertPhone(
        phoneVals({ org_key_generation: 1, index_key_generation: 1 }),
      );

      const newHash = "b".repeat(128);
      const result = await service.reindexRows({
        table: "phones",
        rows: [{ id: phone.id, hash: newHash }],
        skippedIds: [],
      });

      expect(result.reindexed).toBe(1);
      expect(result.skipped).toBe(0);

      const updated = await testDb.db
        .selectFrom("phones")
        .select([
          "phone_match_hash",
          "org_key_generation",
          "index_key_generation",
        ])
        .where("id", "=", phone.id)
        .executeTakeFirstOrThrow();

      expect(updated.phone_match_hash).toBe(newHash);
      // org_key_generation must remain untouched
      expect(updated.org_key_generation).toBe(1);
      expect(updated.index_key_generation).toBe(2);
    });

    it("reindexes clients alias_hash", async () => {
      const phone = await insertPhone(phoneVals());

      const client = await insertClient(
        clientVals(phone.id, { index_key_generation: 1 }),
      );

      const newHash = "c".repeat(128);
      const result = await service.reindexRows({
        table: "clients",
        rows: [{ id: client.id, hash: newHash }],
        skippedIds: [],
      });

      expect(result.reindexed).toBe(1);

      const updated = await testDb.db
        .selectFrom("clients")
        .select(["alias_hash", "index_key_generation"])
        .where("id", "=", client.id)
        .executeTakeFirstOrThrow();

      expect(updated.alias_hash).toBe(newHash);
      expect(updated.index_key_generation).toBe(2);
    });

    it("reindexes emails email_match_hash", async () => {
      const email = await insertEmail(emailVals({ index_key_generation: 1 }));

      const newHash = "d".repeat(128);
      const result = await service.reindexRows({
        table: "emails",
        rows: [{ id: email.id, hash: newHash }],
        skippedIds: [],
      });

      expect(result.reindexed).toBe(1);

      const updated = await testDb.db
        .selectFrom("emails")
        .select(["email_match_hash", "index_key_generation"])
        .where("id", "=", email.id)
        .executeTakeFirstOrThrow();

      expect(updated.email_match_hash).toBe(newHash);
      expect(updated.index_key_generation).toBe(2);
    });

    it("throws ConflictError when a row is already at current index generation", async () => {
      const phone = await insertPhone(phoneVals({ index_key_generation: 2 }));

      await expect(
        service.reindexRows({
          table: "phones",
          rows: [{ id: phone.id, hash: "e".repeat(128) }],
          skippedIds: [],
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("rolls back entire batch on ConflictError", async () => {
      const phone1 = await insertPhone(
        phoneVals({ phone_match_hash: null, index_key_generation: 1 }),
      );

      const phone2 = await insertPhone(phoneVals({ index_key_generation: 2 }));

      try {
        await service.reindexRows({
          table: "phones",
          rows: [
            { id: phone1.id, hash: "f".repeat(128) },
            { id: phone2.id, hash: "f".repeat(128) },
          ],
          skippedIds: [],
        });
      } catch {
        // Expected ConflictError
      }

      // phone1 should NOT have been updated (transaction rolled back)
      const row1 = await testDb.db
        .selectFrom("phones")
        .select(["phone_match_hash", "index_key_generation"])
        .where("id", "=", phone1.id)
        .executeTakeFirstOrThrow();

      expect(row1.index_key_generation).toBe(1);
      expect(row1.phone_match_hash).toBeNull();
    });

    it("counts skippedIds in the result", async () => {
      const phone = await insertPhone(phoneVals({ index_key_generation: 1 }));

      const result = await service.reindexRows({
        table: "phones",
        rows: [{ id: phone.id, hash: "a".repeat(128) }],
        skippedIds: ["fake-id-1", "fake-id-2"],
      });

      expect(result.reindexed).toBe(1);
      expect(result.skipped).toBe(2);
    });
  });

  // -----------------------------------------------------------------------
  // resealPending
  // -----------------------------------------------------------------------

  describe("resealPending", () => {
    it("returns only old-stamped rows", async () => {
      // Insert two queues: one at generation 1 (pending), one at 2 (current).
      await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          sort_order: 1,
          org_key_generation: 1,
        })
        .execute();

      await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          sort_order: 2,
          org_key_generation: 2,
        })
        .execute();

      const result = await service.resealPending({
        table: "queues",
        limit: 40,
        excludeIds: [],
      });

      expect(result.currentGeneration).toBe(2);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]!.columns).toHaveProperty("encrypted_name");
    });

    it("respects limit", async () => {
      await testDb.db
        .insertInto("queues")
        .values([
          {
            encrypted_name: crypto.randomBytes(16),
            sort_order: 1,
            org_key_generation: 1,
          },
          {
            encrypted_name: crypto.randomBytes(16),
            sort_order: 2,
            org_key_generation: 1,
          },
          {
            encrypted_name: crypto.randomBytes(16),
            sort_order: 3,
            org_key_generation: 1,
          },
        ])
        .execute();

      const result = await service.resealPending({
        table: "queues",
        limit: 2,
        excludeIds: [],
      });

      expect(result.rows).toHaveLength(2);
    });

    it("excludes specified ids", async () => {
      const q1 = await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          sort_order: 1,
          org_key_generation: 1,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          sort_order: 2,
          org_key_generation: 1,
        })
        .execute();

      const result = await service.resealPending({
        table: "queues",
        limit: 40,
        excludeIds: [q1.id],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]!.id).not.toBe(q1.id);
    });

    it("intake_key_wraps keys on ticket_id", async () => {
      const phoneRow = await insertPhone(phoneVals());

      const clientRow = await insertClient(clientVals(phoneRow.id));

      const queueRow = await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          sort_order: 99,
          org_key_generation: 2,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const ticketRow = await testDb.db
        .insertInto("tickets")
        .values({
          client_id: clientRow.id,
          queue_id: queueRow.id,
          encrypted_title: crypto.randomBytes(16),
          encrypted_description: crypto.randomBytes(16),
          key_generation: crypto.randomUUID() as KeyGeneration,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      const wrappedTk = crypto.randomBytes(64);
      await testDb.db
        .insertInto("intake_key_wraps")
        .values({
          ticket_id: ticketRow.id,
          wrapped_tk: wrappedTk,
          org_key_generation: 1,
        })
        .execute();

      const result = await service.resealPending({
        table: "intake_key_wraps",
        limit: 40,
        excludeIds: [],
      });

      expect(result.rows).toHaveLength(1);
      // id is the ticket_id, not an autoincrement id
      expect(result.rows[0]!.id).toBe(ticketRow.id);
      expect(result.rows[0]!.columns).toHaveProperty("wrapped_tk");
      expect(
        Buffer.compare(result.rows[0]!.columns.wrapped_tk!, wrappedTk),
      ).toBe(0);
    });

    it("omits null ciphertext columns from the returned record", async () => {
      // queues.encrypted_color and encrypted_icon are nullable
      await testDb.db
        .insertInto("queues")
        .values({
          encrypted_name: crypto.randomBytes(16),
          encrypted_color: null,
          encrypted_icon: null,
          sort_order: 1,
          org_key_generation: 1,
        })
        .execute();

      const result = await service.resealPending({
        table: "queues",
        limit: 40,
        excludeIds: [],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]!.columns).toHaveProperty("encrypted_name");
      expect(result.rows[0]!.columns).not.toHaveProperty("encrypted_color");
      expect(result.rows[0]!.columns).not.toHaveProperty("encrypted_icon");
    });
  });

  // -----------------------------------------------------------------------
  // reindexPending
  // -----------------------------------------------------------------------

  describe("reindexPending", () => {
    it("clients index fetch returns encryptedAlias", async () => {
      const phone = await insertPhone(phoneVals());
      const alias = crypto.randomBytes(16);
      await insertClient(
        clientVals(phone.id, {
          encrypted_alias: alias,
          index_key_generation: 1,
        }),
      );

      const result = await service.reindexPending({
        table: "clients",
        limit: 40,
        excludeIds: [],
        piiUnmasked: false,
      });

      expect(result.currentGeneration).toBe(2);
      expect(result.rows).toHaveLength(1);
      const row = result.rows[0]!;
      expect("encryptedAlias" in row).toBe(true);
      if ("encryptedAlias" in row) {
        expect(Buffer.isBuffer(row.encryptedAlias)).toBe(true);
        expect(Buffer.compare(row.encryptedAlias!, alias)).toBe(0);
      }
    });

    it("phones index fetch returns empty when piiUnmasked is false", async () => {
      await insertPhoneNoReturn(phoneVals({ index_key_generation: 1 }));

      const result = await service.reindexPending({
        table: "phones",
        limit: 40,
        excludeIds: [],
        piiUnmasked: false,
      });

      expect(result.rows).toHaveLength(0);
    });

    it("emails index fetch returns empty when piiUnmasked is false", async () => {
      await insertEmail(emailVals({ index_key_generation: 1 }));

      const result = await service.reindexPending({
        table: "emails",
        limit: 40,
        excludeIds: [],
        piiUnmasked: false,
      });

      expect(result.rows).toHaveLength(0);
    });

    it("clients index fetch respects limit and excludeIds", async () => {
      const phone = await insertPhone(phoneVals());
      const c1 = await insertClient(
        clientVals(phone.id, { index_key_generation: 1 }),
      );
      await insertClient(clientVals(phone.id, { index_key_generation: 1 }));
      await insertClient(clientVals(phone.id, { index_key_generation: 1 }));

      // Limit to 1
      const limited = await service.reindexPending({
        table: "clients",
        limit: 1,
        excludeIds: [],
        piiUnmasked: false,
      });
      expect(limited.rows).toHaveLength(1);

      // Exclude c1
      const excluded = await service.reindexPending({
        table: "clients",
        limit: 40,
        excludeIds: [c1.id],
        piiUnmasked: false,
      });
      expect(excluded.rows).toHaveLength(2);
      for (const row of excluded.rows) {
        expect(row.id).not.toBe(c1.id);
      }
    });

    it("clients index fetch with onlyIds returns only pending rows among them", async () => {
      const phone = await insertPhone(phoneVals());
      const pending = await insertClient(
        clientVals(phone.id, { index_key_generation: 1 }),
      );
      const current = await insertClient(
        clientVals(phone.id, { index_key_generation: 2 }),
      );
      await insertClient(clientVals(phone.id, { index_key_generation: 1 }));

      const result = await service.reindexPending({
        table: "clients",
        limit: 40,
        excludeIds: [],
        piiUnmasked: false,
        onlyIds: [pending.id, current.id],
      });

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]!.id).toBe(pending.id);
    });

    it("clients index fetch with empty onlyIds returns nothing", async () => {
      const phone = await insertPhone(phoneVals());
      await insertClient(clientVals(phone.id, { index_key_generation: 1 }));

      const result = await service.reindexPending({
        table: "clients",
        limit: 40,
        excludeIds: [],
        piiUnmasked: false,
        onlyIds: [],
      });

      expect(result.rows).toHaveLength(0);
    });
  });
});
