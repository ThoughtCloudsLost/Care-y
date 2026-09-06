import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import * as net from "node:net";
import { sql } from "kysely";
import {
  createInboundReceiver,
  MAX_MESSAGE_BYTES,
  parseReplyAddress,
} from "./inbound-receiver.js";
import { mintToken, revokeTokensForTicket } from "./reply-token-service.js";
import {
  createReplyTokenHasher,
  deriveReplyTokenIndexKey,
} from "../crypto/field-encryptor.js";
import {
  createTestDb,
  createTestTicketFixture,
  TEST_OPS_KEY,
  type TestDb,
  type TestTicketFixture,
} from "../test-utils.js";
import { getSodium } from "@care-y/crypto";
import type { OrgId, OrgSchema, OrgSlug, TicketId } from "@care-y/shared";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

describe("parseReplyAddress", () => {
  const token = "a".repeat(26);

  it("parses a well-formed reply address", () => {
    const out = parseReplyAddress(`reply-${token}@reply.example.org`);
    expect(out).toEqual({ token, domain: "reply.example.org" });
  });

  it("lowercases a case-folded local part and domain", () => {
    const out = parseReplyAddress(
      `REPLY-${token.toUpperCase()}@Reply.Example.ORG`,
    );
    expect(out).toEqual({ token, domain: "reply.example.org" });
  });

  it("rejects a wrong-length token", () => {
    expect(parseReplyAddress("reply-abc@reply.example.org")).toBeNull();
    expect(parseReplyAddress(`reply-${token}x@reply.example.org`)).toBeNull();
  });

  it("rejects characters outside the base32 alphabet", () => {
    const bad = `reply-${"1".repeat(26)}@reply.example.org`;
    expect(parseReplyAddress(bad)).toBeNull();
  });

  it("rejects a non-reply local part", () => {
    expect(parseReplyAddress(`info@reply.example.org`)).toBeNull();
    expect(parseReplyAddress(`xreply-${token}@reply.example.org`)).toBeNull();
  });

  it("rejects addresses without a domain or local part", () => {
    expect(parseReplyAddress(`reply-${token}@`)).toBeNull();
    expect(parseReplyAddress(`@reply.example.org`)).toBeNull();
    expect(parseReplyAddress("not-an-address")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Loopback SMTP integration
// ---------------------------------------------------------------------------

/** Minimal SMTP probe: sends raw lines, reads complete replies. Local to
 *  this file because its shape is coupled to these stage assertions. */
interface SmtpProbe {
  cmd(line: string): Promise<string>;
  raw(text: string): void;
  reply(): Promise<string>;
  close(): void;
}

function connectProbe(port: number): Promise<SmtpProbe> {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    let buf = "";
    const waiters: ((s: string) => void)[] = [];
    const pending: string[] = [];

    socket.on("data", (d: Buffer) => {
      buf += d.toString("utf-8");
      const lines = buf.split("\r\n").filter((l) => l.length > 0);
      const last = lines[lines.length - 1];
      // A reply is complete when its last line is "NNN <text>" (a
      // multiline reply's earlier lines use "NNN-").
      if (last !== undefined && /^\d{3} /.test(last)) {
        const complete = buf;
        buf = "";
        const w = waiters.shift();
        if (w) {
          w(complete);
        } else {
          pending.push(complete);
        }
      }
    });
    socket.once("error", reject);

    const probe: SmtpProbe = {
      reply(): Promise<string> {
        const p = pending.shift();
        if (p !== undefined) return Promise.resolve(p);
        return new Promise((res) => waiters.push(res));
      },
      cmd(line: string): Promise<string> {
        socket.write(`${line}\r\n`);
        return probe.reply();
      },
      raw(text: string): void {
        socket.write(text);
      },
      close(): void {
        socket.destroy();
      },
    };

    socket.once("connect", () => {
      resolve(probe);
    });
  });
}

function mailMessage(messageId: string, body = "reply body"): string {
  return (
    [
      `Message-ID: <${messageId}>`,
      "From: Client <client@example.org>",
      "To: <reply@reply.example.org>",
      "Subject: Re: case",
      "",
      body,
    ].join("\r\n") + "\r\n.\r\n"
  );
}

describe.skipIf(!process.env.DATABASE_URL)("inbound SMTP receiver", () => {
  let testDb: TestDb;
  let db: Kysely<TenantDatabase>;
  let fixture: TestTicketFixture;
  let port: number;
  let closeReceiver: () => Promise<void>;

  const hasher = createReplyTokenHasher(deriveReplyTokenIndexKey(TEST_OPS_KEY));
  const orgId = crypto.randomUUID() as OrgId;
  const domain = `reply-${crypto.randomUUID().slice(0, 8)}.example.org`;

  // The receiver caps connections per IP per minute and every probe here
  // is 127.0.0.1. Each new session advances the injected clock past the
  // window so the cap never interferes with unrelated tests.
  let clockOffset = 0;
  const now = (): number => Date.now() + clockOffset;

  // A failed assertion skips the test's own probe.close(), and a lingering
  // connection makes server.close() hang the afterAll hook. Track every
  // probe and force-close them between tests.
  const openProbes: SmtpProbe[] = [];

  afterEach(() => {
    for (const probe of openProbes) probe.close();
    openProbes.length = 0;
  });

  async function session(atPort = port): Promise<SmtpProbe> {
    clockOffset += 61_000;
    const probe = await connectProbe(atPort);
    openProbes.push(probe);
    const greeting = await probe.reply();
    expect(greeting).toMatch(/^220 /);
    const ehlo = await probe.cmd("EHLO probe.local");
    expect(ehlo).toContain("250");
    return probe;
  }

  beforeAll(async () => {
    await getSodium();
    testDb = await createTestDb();
    db = testDb.db;

    await testDb.platformDb
      .insertInto("orgs")
      .values({
        id: orgId,
        slug: `inbound-rcv-${testDb.schemaName}` as OrgSlug,
        schema_name: testDb.schemaName as OrgSchema,
      })
      .execute();
    await testDb.platformDb
      .insertInto("inbound_email_domains")
      .values({ domain, org_id: orgId })
      .execute();

    fixture = await createTestTicketFixture(db);

    const receiver = createInboundReceiver(
      {
        platformDb: testDb.platformDb,
        getTenantDb: () => db,
        replyTokenHasher: hasher,
        now,
      },
      { port: 0 },
    );
    port = await receiver.listen();
    closeReceiver = () => receiver.close();
  }, 30_000);

  afterAll(async () => {
    await closeReceiver();
    await testDb.platformDb
      .deleteFrom("inbound_email_domains")
      .where("domain", "=", domain)
      .execute();
    await testDb.platformDb
      .deleteFrom("orgs")
      .where("id", "=", orgId)
      .execute();
    await testDb.cleanup();
  }, 30_000);

  async function countEmailFollowUps(ticketId: TicketId): Promise<number> {
    const rows = await db
      .selectFrom("followups")
      .select(sql<number>`count(*)`.as("n"))
      .where("ticket_id", "=", ticketId)
      .where("type", "=", "email_inbound")
      .execute();
    return rows[0]?.n ?? 0;
  }

  it("accepts a valid token and answers 250 at every stage", async () => {
    const { token } = await mintToken(db, fixture.ticketId, hasher);
    const probe = await session();

    expect(await probe.cmd("MAIL FROM:<client@example.org>")).toMatch(/^250 /);
    expect(await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`)).toMatch(
      /^250 /,
    );
    expect(await probe.cmd("DATA")).toMatch(/^354 /);

    probe.raw(mailMessage(`accept-${crypto.randomUUID()}@probe.local`));
    expect(await probe.reply()).toMatch(/^250 /);
    probe.close();

    const row = await db
      .selectFrom("followups")
      .select(["type", "source", "encrypted_content"])
      .where("ticket_id", "=", fixture.ticketId)
      .where("type", "=", "email_inbound")
      .orderBy("created_at", "desc")
      .executeTakeFirstOrThrow();
    expect(row.source).toBe("client");
    expect(row.encrypted_content.length).toBeGreaterThan(0);
  });

  it("answers 250 for a duplicate Message-ID without a second ingest", async () => {
    const { token } = await mintToken(db, fixture.ticketId, hasher);
    const messageId = `dup-${crypto.randomUUID()}@probe.local`;

    for (let i = 0; i < 2; i++) {
      const probe = await session();
      await probe.cmd("MAIL FROM:<client@example.org>");
      await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`);
      await probe.cmd("DATA");
      probe.raw(mailMessage(messageId));
      expect(await probe.reply()).toMatch(/^250 /);
      probe.close();
    }

    // Exactly one ingest from this pair. Earlier tests may have written
    // their own follow-ups, so count before/after is not usable here;
    // dedupe is proven by the totals not increasing on the second send.
    const afterFirstPair = await countEmailFollowUps(fixture.ticketId);
    const probe = await session();
    await probe.cmd("MAIL FROM:<client@example.org>");
    await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`);
    await probe.cmd("DATA");
    probe.raw(mailMessage(messageId));
    expect(await probe.reply()).toMatch(/^250 /);
    probe.close();

    expect(await countEmailFollowUps(fixture.ticketId)).toBe(afterFirstPair);
  });

  it("refuses an unknown token at RCPT and DATA stays unreachable", async () => {
    const fake = "a".repeat(26);
    const probe = await session();
    await probe.cmd("MAIL FROM:<scanner@example.net>");
    expect(await probe.cmd(`RCPT TO:<reply-${fake}@${domain}>`)).toMatch(
      /^550 /,
    );
    expect(await probe.cmd("DATA")).toMatch(/^5\d\d /);
    probe.close();
  });

  it("refuses a revoked token with 550", async () => {
    const { token } = await mintToken(db, fixture.ticketId, hasher);
    await revokeTokensForTicket(db, fixture.ticketId);

    const probe = await session();
    await probe.cmd("MAIL FROM:<client@example.org>");
    expect(await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`)).toMatch(
      /^550 /,
    );
    probe.close();
  });

  it("refuses an unknown domain with 550", async () => {
    const { token } = await mintToken(db, fixture.ticketId, hasher);
    const probe = await session();
    await probe.cmd("MAIL FROM:<client@example.org>");
    expect(
      await probe.cmd(`RCPT TO:<reply-${token}@unknown.example.net>`),
    ).toMatch(/^550 /);
    probe.close();
  });

  it("refuses a malformed local part with 550", async () => {
    const probe = await session();
    await probe.cmd("MAIL FROM:<client@example.org>");
    expect(await probe.cmd(`RCPT TO:<info@${domain}>`)).toMatch(/^550 /);
    probe.close();
  });

  it("refuses a second recipient with 550", async () => {
    const { token } = await mintToken(db, fixture.ticketId, hasher);
    const probe = await session();
    await probe.cmd("MAIL FROM:<client@example.org>");
    expect(await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`)).toMatch(
      /^250 /,
    );
    expect(await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`)).toMatch(
      /^550 /,
    );
    probe.close();
  });

  it("answers 552 for an oversized message and stores nothing", async () => {
    const { token } = await mintToken(db, fixture.ticketId, hasher);
    const before = await countEmailFollowUps(fixture.ticketId);

    const probe = await session();
    await probe.cmd("MAIL FROM:<client@example.org>");
    await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`);
    await probe.cmd("DATA");
    probe.raw(
      mailMessage(
        `big-${crypto.randomUUID()}@probe.local`,
        "x".repeat(MAX_MESSAGE_BYTES + 8192),
      ),
    );
    expect(await probe.reply()).toMatch(/^552 /);
    probe.close();

    expect(await countEmailFollowUps(fixture.ticketId)).toBe(before);
  }, 30_000);

  it("answers 451 when the ingest handler fails", async () => {
    const failing = createInboundReceiver(
      {
        platformDb: testDb.platformDb,
        getTenantDb: () => db,
        replyTokenHasher: hasher,
        now,
        ingest: () => Promise.reject(new Error("simulated ingest failure")),
      },
      { port: 0 },
    );
    const failPort = await failing.listen();

    try {
      const { token } = await mintToken(db, fixture.ticketId, hasher);
      const probe = await session(failPort);
      await probe.cmd("MAIL FROM:<client@example.org>");
      await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`);
      await probe.cmd("DATA");
      probe.raw(mailMessage(`fail-${crypto.randomUUID()}@probe.local`));
      expect(await probe.reply()).toMatch(/^451 /);
      probe.close();
    } finally {
      await failing.close();
    }
  });
});
