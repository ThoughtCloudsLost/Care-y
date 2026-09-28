import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { newTicketId, orgSchemaNameSchema } from "@care-y/shared";
import type { Kysely } from "kysely";
import type { PlatformDatabase } from "../db/types.js";
import {
  captureTicketChangeNotices,
  createTestDb,
  type TestDb,
} from "../test-utils.js";
import {
  parseTicketChangeNotice,
  publishTicketChange,
} from "./ticket-change-channel.js";

const ORG_SCHEMA = orgSchemaNameSchema.parse(
  "org_0b6f2c1e-4d7a-4c2e-9f1a-3e5d7c9b1a2f",
);

describe("parseTicketChangeNotice", () => {
  it("accepts a well-formed notice", () => {
    const ticketId = newTicketId();
    const notice = parseTicketChangeNotice(
      JSON.stringify({ orgSchema: ORG_SCHEMA, ticketId }),
    );
    expect(notice).toEqual({ orgSchema: ORG_SCHEMA, ticketId });
  });

  it("drops unknown keys", () => {
    const ticketId = newTicketId();
    const notice = parseTicketChangeNotice(
      JSON.stringify({
        orgSchema: ORG_SCHEMA,
        ticketId,
        recipients: ["someone"],
      }),
    );
    expect(notice).toEqual({ orgSchema: ORG_SCHEMA, ticketId });
  });

  it("rejects a schema name outside the org_<uuid> form", () => {
    for (const orgSchema of ["public", "test_abc", "org_x; drop", ""]) {
      expect(
        parseTicketChangeNotice(
          JSON.stringify({ orgSchema, ticketId: newTicketId() }),
        ),
      ).toBeNull();
    }
  });

  it("rejects a ticket id that is not a uuid", () => {
    expect(
      parseTicketChangeNotice(
        JSON.stringify({ orgSchema: ORG_SCHEMA, ticketId: "not-a-uuid" }),
      ),
    ).toBeNull();
  });

  it("rejects a missing field, non-JSON, and an absent payload", () => {
    expect(
      parseTicketChangeNotice(JSON.stringify({ orgSchema: ORG_SCHEMA })),
    ).toBeNull();
    expect(parseTicketChangeNotice("{not json")).toBeNull();
    expect(parseTicketChangeNotice(undefined)).toBeNull();
  });
});

describe("publishTicketChange failure", () => {
  it("never rejects and logs without ids", async () => {
    const failingDb = {
      selectNoFrom: () => {
        throw new Error("connection refused");
      },
    } as unknown as Kysely<PlatformDatabase>;
    const errors = vi.spyOn(console, "error").mockImplementation(() => {
      // silenced
    });
    const ticketId = newTicketId();
    try {
      await expect(
        publishTicketChange(failingDb, ORG_SCHEMA, ticketId),
      ).resolves.toBeUndefined();
      expect(errors).toHaveBeenCalledTimes(1);
      const logged = errors.mock.calls.flat().map(String).join(" ");
      expect(logged).not.toContain(ticketId);
      expect(logged).not.toContain(ORG_SCHEMA);
    } finally {
      errors.mockRestore();
    }
  });
});

describe.skipIf(!process.env.DATABASE_URL)("publishTicketChange (DB)", () => {
  let testDb: TestDb;

  beforeAll(async () => {
    testDb = await createTestDb();
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  it("delivers the notice to a listening session", async () => {
    const capture = await captureTicketChangeNotices();
    const ticketId = newTicketId();
    try {
      await publishTicketChange(testDb.platformDb, ORG_SCHEMA, ticketId);

      await vi.waitFor(() => {
        expect(
          capture.payloads.map((p) => parseTicketChangeNotice(p)),
        ).toContainEqual({ orgSchema: ORG_SCHEMA, ticketId });
      });
      expect(capture.errors).toEqual([]);
    } finally {
      await capture.close();
    }
  });
});
