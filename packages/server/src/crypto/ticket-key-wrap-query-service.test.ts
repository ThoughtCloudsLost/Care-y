import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  createTestTicketFixture,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import {
  createTicketKeyWrapQueryService,
  type TicketKeyWrapQueryService,
} from "./ticket-key-wrap-query-service.js";
import type { KeyGeneration, TicketId, UserId } from "@care-y/shared";

describe.skipIf(!process.env.DATABASE_URL)("TicketKeyWrapQueryService", () => {
  let testDb: TestDb;
  let service: TicketKeyWrapQueryService;
  let alice: UserId;
  let bob: UserId;
  let aliceTicket: TicketId;
  let bobTicket: TicketId;

  const generation = crypto.randomUUID() as KeyGeneration;

  async function insertWrap(
    volunteerId: UserId,
    ticketId: TicketId,
    marker: number,
  ): Promise<void> {
    await testDb.db
      .insertInto("ticket_key_wraps")
      .values({
        ticket_id: ticketId,
        volunteer_id: volunteerId,
        key_generation: generation,
        ephemeral_point: Buffer.alloc(32, marker),
        nonce: Buffer.alloc(24, marker),
        wrapped_key: Buffer.alloc(48, marker),
        algorithm: "ecies-ristretto255-v1",
      })
      .execute();
  }

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    service = createTicketKeyWrapQueryService(testDb.db);

    alice = (await createTestUser(testDb.db)).id;
    bob = (await createTestUser(testDb.db)).id;
    aliceTicket = (await createTestTicketFixture(testDb.db)).ticketId;
    bobTicket = (await createTestTicketFixture(testDb.db)).ticketId;

    await insertWrap(alice, aliceTicket, 0x11);
    await insertWrap(bob, bobTicket, 0x22);
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  // The reason this service exists rather than a raw query in the route: a
  // missing volunteer_id filter would hand one volunteer another's wrapped
  // ticket keys, which is the whole confidentiality boundary.
  it("returns only the requesting volunteer's wraps", async () => {
    const rows = await service.listForVolunteer(alice);

    expect(rows.map((r) => r.ticketId)).toEqual([aliceTicket]);
  });

  it("returns key material as raw Buffers for the caller to encode", async () => {
    const rows = await service.listForVolunteer(bob);

    expect(rows).toEqual([
      {
        ticketId: bobTicket,
        keyGeneration: generation,
        ephemeralPoint: Buffer.alloc(32, 0x22),
        nonce: Buffer.alloc(24, 0x22),
        wrappedKey: Buffer.alloc(48, 0x22),
      },
    ]);
  });

  it("returns an empty list for a volunteer with no wraps", async () => {
    const stranger = (await createTestUser(testDb.db)).id;

    await expect(service.listForVolunteer(stranger)).resolves.toEqual([]);
  });
});
