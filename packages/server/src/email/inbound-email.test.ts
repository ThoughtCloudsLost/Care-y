import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  buildInboundEmailPayload,
  handleInboundEmail,
} from "./inbound-email.js";
import { InboundEmailError } from "../errors.js";
import { EMAIL_RELAY_LIMITS } from "@care-y/shared";
import type { TicketId } from "@care-y/shared";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestTicketFixture,
  makeRistrettoKeypair,
  seedPortalChannel,
  type TestDb,
  type TestTicketFixture,
} from "../test-utils.js";
import {
  eciesDecrypt,
  getSodium,
  toNonce,
  toRistrettoPoint,
} from "@care-y/crypto";

describe("buildInboundEmailPayload", () => {
  const base = {
    subject: "Re: hello",
    text: "body text",
    from: "someone@example.org",
    droppedAttachments: 0,
  };

  it("passes through in-cap fields", () => {
    expect(buildInboundEmailPayload(base)).toEqual(base);
  });

  it("truncates over-cap subject and text instead of rejecting", () => {
    const out = buildInboundEmailPayload({
      ...base,
      subject: "s".repeat(EMAIL_RELAY_LIMITS.subject + 50),
      text: "t".repeat(EMAIL_RELAY_LIMITS.text + 50),
    });
    expect(out.subject).toHaveLength(EMAIL_RELAY_LIMITS.subject);
    expect(out.text).toHaveLength(EMAIL_RELAY_LIMITS.text);
  });

  it("truncates an oversized claimed From", () => {
    const out = buildInboundEmailPayload({ ...base, from: "f".repeat(400) });
    expect(out.from).toHaveLength(320);
  });

  it("stores a single space for an empty body (subject-only mail)", () => {
    const out = buildInboundEmailPayload({ ...base, text: "" });
    expect(out.text).toBe(" ");
  });

  it("accepts an empty subject", () => {
    const out = buildInboundEmailPayload({ ...base, subject: "" });
    expect(out.subject).toBe("");
  });

  it("carries the dropped attachment count", () => {
    const out = buildInboundEmailPayload({ ...base, droppedAttachments: 3 });
    expect(out.droppedAttachments).toBe(3);
  });
});

describe.skipIf(!process.env.DATABASE_URL)("handleInboundEmail", () => {
  let testDb: TestDb;
  let db: Kysely<TenantDatabase>;

  beforeAll(async () => {
    await getSodium();
    testDb = await createTestDb();
    db = testDb.db;
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  const data = {
    subject: "Re: case",
    text: "reply body",
    from: "client@example.org",
    droppedAttachments: 1,
  };

  it("writes an email_inbound follow-up on an open ticket", async () => {
    const fixture: TestTicketFixture = await createTestTicketFixture(db);
    const result = await handleInboundEmail(db, fixture.ticketId, data);

    const row = await db
      .selectFrom("followups")
      .select(["type", "source", "encrypted_content"])
      .where("id", "=", result.followUpId)
      .executeTakeFirstOrThrow();

    expect(row.type).toBe("email_inbound");
    expect(row.source).toBe("client");
    expect(row.encrypted_content.length).toBeGreaterThan(0);
    expect(result.reopened).toBe(false);
  });

  it("reopens a closed ticket and records status_opened", async () => {
    const fixture = await createTestTicketFixture(db);
    await db
      .updateTable("tickets")
      .set({ status: "closed" })
      .where("id", "=", fixture.ticketId)
      .execute();

    const result = await handleInboundEmail(db, fixture.ticketId, data);
    expect(result.reopened).toBe(true);

    const ticket = await db
      .selectFrom("tickets")
      .select("status")
      .where("id", "=", fixture.ticketId)
      .executeTakeFirstOrThrow();
    expect(ticket.status).toBe("open");

    const reopenEvent = await db
      .selectFrom("followups")
      .select("id")
      .where("ticket_id", "=", fixture.ticketId)
      .where("type", "=", "status_opened")
      .executeTakeFirst();
    expect(reopenEvent).toBeDefined();
  });

  it("stores a portal copy the client key can decrypt", async () => {
    const fixture = await createTestTicketFixture(db);
    const { priv, pub } = makeRistrettoKeypair();
    const channelRowId = await seedPortalChannel(db, fixture.clientId, pub);

    const result = await handleInboundEmail(db, fixture.ticketId, data);

    const copy = await db
      .selectFrom("portal_messages")
      .selectAll()
      .where("followup_id", "=", result.followUpId)
      .where("channel_id", "=", channelRowId)
      .executeTakeFirstOrThrow();

    expect(copy.direction).toBe("from_client");

    const plaintext = eciesDecrypt(
      toRistrettoPoint(new Uint8Array(copy.ephemeral_point)),
      toNonce(new Uint8Array(copy.nonce)),
      new Uint8Array(copy.ciphertext),
      priv,
    );
    const payload = JSON.parse(Buffer.from(plaintext).toString("utf-8")) as {
      subject: string;
      text: string;
      from: string;
      droppedAttachments: number;
    };
    expect(payload.subject).toBe(data.subject);
    expect(payload.text).toBe(data.text);
    expect(payload.from).toBe(data.from);
    expect(payload.droppedAttachments).toBe(1);
  });

  it("still writes the follow-up when no active channel exists", async () => {
    const fixture = await createTestTicketFixture(db);
    const result = await handleInboundEmail(db, fixture.ticketId, data);

    const copies = await db
      .selectFrom("portal_messages")
      .select("id")
      .where("followup_id", "=", result.followUpId)
      .execute();
    expect(copies).toHaveLength(0);
  });

  it("throws InboundEmailError for a missing ticket", async () => {
    const missing = crypto.randomUUID() as TicketId;
    await expect(handleInboundEmail(db, missing, data)).rejects.toThrow(
      InboundEmailError,
    );
  });
});
