import * as crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestDb,
  createTestUser,
  seedOrgPublicKey,
  createTestTicketFixture,
  type TestDb,
} from "../test-utils.js";
import {
  createTicketAccessChecker,
  type TicketAccessChecker,
} from "./access.js";
import { ForbiddenError } from "../errors.js";

describe.skipIf(!process.env.DATABASE_URL)("TicketAccessChecker (DB)", () => {
  let testDb: TestDb;
  let access: TicketAccessChecker;
  let userId: string;

  beforeAll(async () => {
    testDb = await createTestDb();
    await seedOrgPublicKey(testDb.db);
    access = createTicketAccessChecker(testDb.db);

    const user = await createTestUser(testDb.db);
    userId = user.id;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  async function insertQueueAndTicket(): Promise<string> {
    const fix = await createTestTicketFixture(testDb.db);
    return fix.ticketId;
  }

  it("canAccess returns true for existing ticket", async () => {
    const ticketId = await insertQueueAndTicket();
    expect(await access.canAccess(userId, ticketId)).toBe(true);
  });

  it("canAccess returns false for non-existent ticket", async () => {
    expect(await access.canAccess(userId, crypto.randomUUID())).toBe(false);
  });

  it("assertAccess succeeds for existing ticket", async () => {
    const ticketId = await insertQueueAndTicket();
    await expect(
      access.assertAccess(userId, ticketId),
    ).resolves.toBeUndefined();
  });

  it("assertAccess throws ForbiddenError for non-existent ticket", async () => {
    await expect(
      access.assertAccess(userId, crypto.randomUUID()),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("error message is generic (no ticket ID or user ID)", async () => {
    try {
      await access.assertAccess(userId, crypto.randomUUID());
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ForbiddenError);
      const msg = (err as ForbiddenError).message;
      expect(msg).not.toContain(userId);
      expect(msg).toBe("Access denied to this ticket");
    }
  });
});
