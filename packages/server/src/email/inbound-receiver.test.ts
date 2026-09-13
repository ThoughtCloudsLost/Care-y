import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
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
import type {
  FollowupId,
  OrgId,
  OrgSchema,
  OrgSlug,
  TicketId,
} from "@care-y/shared";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { InboundEmailData, InboundEmailResult } from "./inbound-email.js";

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

  it("answers 451 on domain lookup failure instead of permanent 550", async () => {
    // A DB outage during domain resolution is transient: the sender MTA
    // should retry rather than bouncing permanently. Only ReplyTokenError
    // (unknown/revoked token) warrants a permanent 550.
    const brokenPlatformDb = {
      selectFrom: () => {
        throw new Error("simulated DB connection failure");
      },
    } as unknown as typeof testDb.platformDb;

    const failing = createInboundReceiver(
      {
        platformDb: brokenPlatformDb,
        getTenantDb: () => db,
        replyTokenHasher: hasher,
        now,
      },
      { port: 0 },
    );
    const failPort = await failing.listen();

    try {
      const token = "a".repeat(26);
      const probe = await session(failPort);
      await probe.cmd("MAIL FROM:<client@example.org>");
      const rcpt = await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`);
      expect(rcpt).toMatch(/^451 /);
      probe.close();
    } finally {
      await failing.close();
    }
  });

  // --- Channel policy ---

  it("rejects RCPT with 550 when channel_email_enabled is false", async () => {
    // Disable email channel. The test schema has no org_config row until
    // something seeds it, and an UPDATE on an empty singleton is a no-op,
    // so insert the row when missing.
    const existing = await db
      .selectFrom("org_config")
      .select("id")
      .executeTakeFirst();
    if (existing) {
      await db
        .updateTable("org_config")
        .set({ channel_email_enabled: false })
        .execute();
    } else {
      await db
        .insertInto("org_config")
        .values({ channel_email_enabled: false })
        .execute();
    }

    try {
      const { token } = await mintToken(db, fixture.ticketId, hasher);
      const probe = await session();
      const mailReply = await probe.cmd("MAIL FROM:<client@example.org>");
      expect(mailReply).toContain("250");
      const rcptReply = await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`);
      // Disabled orgs get the same 550 as nonexistent mailboxes
      expect(rcptReply).toMatch(/^550 /);
      probe.close();
    } finally {
      // Restore
      await db
        .updateTable("org_config")
        .set({ channel_email_enabled: true })
        .execute();
    }
  });

  it("accepts RCPT when channel_email_enabled is true", async () => {
    const { token } = await mintToken(db, fixture.ticketId, hasher);
    const probe = await session();
    await probe.cmd("MAIL FROM:<client@example.org>");
    const rcptReply = await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`);
    expect(rcptReply).toContain("250");
    probe.close();
  });

  // --- IP rate limiting ---

  describe("IP connection rate limiting", () => {
    it("answers 421 after exceeding per-IP budget within one minute", async () => {
      // Create a receiver with a very tight per-IP limit. The production
      // limit is 10/min, but the outer suite's clock trick (advancing
      // clockOffset by 61s per session) defeats that. A dedicated receiver
      // with its own injectable clock isolates the rate-limit behavior.
      const tick = Date.now();
      const rl = createInboundReceiver(
        {
          platformDb: testDb.platformDb,
          getTenantDb: () => db,
          replyTokenHasher: hasher,
          now: () => tick,
        },
        { port: 0 },
      );
      const rlPort = await rl.listen();

      try {
        // Fill up 10 connections (the budget) within the same second
        for (let i = 0; i < 10; i++) {
          const p = await connectProbe(rlPort);
          openProbes.push(p);
          const g = await p.reply();
          expect(g).toMatch(/^220 /);
          p.close();
        }

        // The 11th connection in the same window should be rejected
        const rejected = await connectProbe(rlPort);
        openProbes.push(rejected);
        const greeting = await rejected.reply();
        // smtp-server surfaces the 421 from onConnect as part of the
        // server's greeting rejection (connection dropped with 421)
        expect(greeting).toMatch(/^421 /);
        rejected.close();
      } finally {
        await rl.close();
      }
    });
  });

  // --- Token ingest rate limiting ---

  describe("token ingest rate limiting", () => {
    it("answers 451 after exceeding per-token ingest budget", async () => {
      let tick = Date.now();
      const ingestSpy = vi.fn<
        (
          db: Kysely<TenantDatabase>,
          t: TicketId,
          d: InboundEmailData,
        ) => Promise<InboundEmailResult>
      >(() =>
        Promise.resolve({
          followUpId: crypto.randomUUID() as FollowupId,
          reopened: false,
        }),
      );

      const rl = createInboundReceiver(
        {
          platformDb: testDb.platformDb,
          getTenantDb: () => db,
          replyTokenHasher: hasher,
          ingest: ingestSpy,
          now: () => tick,
        },
        { port: 0 },
      );
      const rlPort = await rl.listen();

      try {
        const { token } = await mintToken(db, fixture.ticketId, hasher);

        // Send 30 messages (the budget) each with a unique Message-ID.
        // Advance the frozen clock past the IP window (60s) every 9
        // connections to avoid tripping the per-IP limit (10/min) while
        // staying inside the token window (1h).
        for (let i = 0; i < 30; i++) {
          if (i > 0 && i % 9 === 0) {
            tick += 61_000; // reset IP window, still inside token window
          }
          const p = await connectProbe(rlPort);
          openProbes.push(p);
          await p.reply(); // greeting
          await p.cmd("EHLO probe.local");
          await p.cmd("MAIL FROM:<rt-sender@example.test>");
          await p.cmd(`RCPT TO:<reply-${token}@${domain}>`);
          await p.cmd("DATA");
          p.raw(mailMessage(`rl-${i}-${crypto.randomUUID()}@probe.local`));
          await p.reply();
          p.close();
        }

        // Advance past IP window one more time for the 31st connection
        tick += 61_000;
        const p = await connectProbe(rlPort);
        openProbes.push(p);
        await p.reply();
        await p.cmd("EHLO probe.local");
        await p.cmd("MAIL FROM:<rt-sender@example.test>");
        const rcpt = await p.cmd(`RCPT TO:<reply-${token}@${domain}>`);
        expect(rcpt).toMatch(/^451 /);
        // No token or address leaked in the rejection message
        expect(rcpt).not.toContain(token);
        p.close();
      } finally {
        await rl.close();
      }
    }, 60_000);
  });

  // --- Message parsing fallbacks ---

  describe("message parsing fallbacks", () => {
    it("ingests a message without a Message-ID header", async () => {
      const captured: InboundEmailData[] = [];
      const capturingIngest = vi.fn<
        (
          db: Kysely<TenantDatabase>,
          t: TicketId,
          d: InboundEmailData,
        ) => Promise<InboundEmailResult>
      >((_, __, data) => {
        captured.push(data);
        return Promise.resolve({
          followUpId: crypto.randomUUID() as FollowupId,
          reopened: false,
        });
      });

      const rcv = createInboundReceiver(
        {
          platformDb: testDb.platformDb,
          getTenantDb: () => db,
          replyTokenHasher: hasher,
          ingest: capturingIngest,
          now,
        },
        { port: 0 },
      );
      const rcvPort = await rcv.listen();
      try {
        const { token } = await mintToken(db, fixture.ticketId, hasher);
        const probe = await session(rcvPort);
        await probe.cmd("MAIL FROM:<rt-sender@example.test>");
        await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`);
        await probe.cmd("DATA");
        // No Message-ID header at all (covers L324 cond-expr[1]: dedupKey = null)
        const noIdMsg =
          [
            "From: rt-sender@example.test",
            "To: <reply@reply.example.org>",
            "Subject: no-id-test",
            "",
            "body without message-id",
          ].join("\r\n") + "\r\n.\r\n";
        probe.raw(noIdMsg);
        expect(await probe.reply()).toMatch(/^250 /);
        probe.close();

        expect(capturingIngest).toHaveBeenCalledOnce();
        expect(captured[0]?.subject).toBe("no-id-test");
      } finally {
        await rcv.close();
      }
    });

    it("uses from.address when From has no angle-bracket email", async () => {
      const captured: InboundEmailData[] = [];
      const capturingIngest = vi.fn<
        (
          db: Kysely<TenantDatabase>,
          t: TicketId,
          d: InboundEmailData,
        ) => Promise<InboundEmailResult>
      >((_, __, data) => {
        captured.push(data);
        return Promise.resolve({
          followUpId: crypto.randomUUID() as FollowupId,
          reopened: false,
        });
      });

      const rcv = createInboundReceiver(
        {
          platformDb: testDb.platformDb,
          getTenantDb: () => db,
          replyTokenHasher: hasher,
          ingest: capturingIngest,
          now,
        },
        { port: 0 },
      );
      const rcvPort = await rcv.listen();
      try {
        const { token } = await mintToken(db, fixture.ticketId, hasher);
        const probe = await session(rcvPort);
        await probe.cmd("MAIL FROM:<rt-sender@example.test>");
        await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`);
        await probe.cmd("DATA");
        // From with a display-name address (rt-sender@example.test)
        // PostalMime always sets from.address to at least "" so the
        // from.name fallback (L332 binary-expr[1]) is unreachable
        // through PostalMime's parser; this test covers L332 cond-expr
        // true side (from defined) with a typical email From value.
        const fromAddrMsg =
          [
            `Message-ID: <from-addr-${crypto.randomUUID()}@probe.local>`,
            "From: RT Test Sender <rt-sender@example.test>",
            "To: <reply@reply.example.org>",
            "Subject: from-addr-test",
            "",
            "body with from address",
          ].join("\r\n") + "\r\n.\r\n";
        probe.raw(fromAddrMsg);
        expect(await probe.reply()).toMatch(/^250 /);
        probe.close();

        expect(capturingIngest).toHaveBeenCalledOnce();
        // PostalMime returns { address: "rt-sender@example.test", name: "RT Test Sender" }
        // claimedFrom picks from.address via the ?? chain
        expect(captured[0]?.from).toBe("rt-sender@example.test");
      } finally {
        await rcv.close();
      }
    });

    it("uses htmlStrip fallback when text part is absent", async () => {
      const captured: InboundEmailData[] = [];
      const capturingIngest = vi.fn<
        (
          db: Kysely<TenantDatabase>,
          t: TicketId,
          d: InboundEmailData,
        ) => Promise<InboundEmailResult>
      >((_, __, data) => {
        captured.push(data);
        return Promise.resolve({
          followUpId: crypto.randomUUID() as FollowupId,
          reopened: false,
        });
      });

      const rcv = createInboundReceiver(
        {
          platformDb: testDb.platformDb,
          getTenantDb: () => db,
          replyTokenHasher: hasher,
          ingest: capturingIngest,
          now,
        },
        { port: 0 },
      );
      const rcvPort = await rcv.listen();
      try {
        const { token } = await mintToken(db, fixture.ticketId, hasher);
        const probe = await session(rcvPort);
        await probe.cmd("MAIL FROM:<rt-sender@example.test>");
        await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`);
        await probe.cmd("DATA");
        // Multipart HTML-only message with no text/plain part
        // (covers L336 cond-expr[1] and L337 binary-expr[0])
        const boundary = "boundary-html-only-test";
        const htmlOnlyMsg =
          [
            `Message-ID: <html-only-${crypto.randomUUID()}@probe.local>`,
            "From: rt-sender@example.test",
            "To: <reply@reply.example.org>",
            "Subject: html-only-test",
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            "",
            `--${boundary}`,
            "Content-Type: text/html; charset=utf-8",
            "",
            "<p>HTML-only reply content</p>",
            `--${boundary}--`,
          ].join("\r\n") + "\r\n.\r\n";
        probe.raw(htmlOnlyMsg);
        expect(await probe.reply()).toMatch(/^250 /);
        probe.close();

        expect(capturingIngest).toHaveBeenCalledOnce();
        // htmlStrip("<p>HTML-only reply content</p>") yields "HTML-only reply content"
        expect(captured[0]?.text).toContain("HTML-only reply content");
        // Verify HTML tags were stripped
        expect(captured[0]?.text).not.toContain("<p>");
      } finally {
        await rcv.close();
      }
    });

    it("falls back to empty string when html is also absent", async () => {
      const captured: InboundEmailData[] = [];
      const capturingIngest = vi.fn<
        (
          db: Kysely<TenantDatabase>,
          t: TicketId,
          d: InboundEmailData,
        ) => Promise<InboundEmailResult>
      >((_, __, data) => {
        captured.push(data);
        return Promise.resolve({
          followUpId: crypto.randomUUID() as FollowupId,
          reopened: false,
        });
      });

      const rcv = createInboundReceiver(
        {
          platformDb: testDb.platformDb,
          getTenantDb: () => db,
          replyTokenHasher: hasher,
          ingest: capturingIngest,
          now,
        },
        { port: 0 },
      );
      const rcvPort = await rcv.listen();
      try {
        const { token } = await mintToken(db, fixture.ticketId, hasher);
        const probe = await session(rcvPort);
        await probe.cmd("MAIL FROM:<rt-sender@example.test>");
        await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`);
        await probe.cmd("DATA");
        // Minimal message with no body at all
        // (covers L337 binary-expr[1]: parsed.html ?? "" fallback)
        const emptyBodyMsg =
          [
            `Message-ID: <empty-body-${crypto.randomUUID()}@probe.local>`,
            "From: rt-sender@example.test",
            "To: <reply@reply.example.org>",
            "",
          ].join("\r\n") + "\r\n.\r\n";
        probe.raw(emptyBodyMsg);
        expect(await probe.reply()).toMatch(/^250 /);
        probe.close();

        expect(capturingIngest).toHaveBeenCalledOnce();
        // No subject header: covers L340 binary-expr[1] (parsed.subject ?? "")
        expect(captured[0]?.subject).toBe("");
        // No text, no html: text falls back to htmlStrip("") which returns ""
        expect(captured[0]?.text).toBe("");
      } finally {
        await rcv.close();
      }
    });

    it("uses empty string for claimedFrom when From header is missing", async () => {
      const captured: InboundEmailData[] = [];
      const capturingIngest = vi.fn<
        (
          db: Kysely<TenantDatabase>,
          t: TicketId,
          d: InboundEmailData,
        ) => Promise<InboundEmailResult>
      >((_, __, data) => {
        captured.push(data);
        return Promise.resolve({
          followUpId: crypto.randomUUID() as FollowupId,
          reopened: false,
        });
      });

      const rcv = createInboundReceiver(
        {
          platformDb: testDb.platformDb,
          getTenantDb: () => db,
          replyTokenHasher: hasher,
          ingest: capturingIngest,
          now,
        },
        { port: 0 },
      );
      const rcvPort = await rcv.listen();
      try {
        const { token } = await mintToken(db, fixture.ticketId, hasher);
        const probe = await session(rcvPort);
        await probe.cmd("MAIL FROM:<rt-sender@example.test>");
        await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`);
        await probe.cmd("DATA");
        // No From header at all
        // (covers L332 cond-expr[0]: from === undefined ? "")
        const noFromMsg =
          [
            `Message-ID: <no-from-${crypto.randomUUID()}@probe.local>`,
            "To: <reply@reply.example.org>",
            "Subject: no-from-test",
            "",
            "body without from header",
          ].join("\r\n") + "\r\n.\r\n";
        probe.raw(noFromMsg);
        expect(await probe.reply()).toMatch(/^250 /);
        probe.close();

        expect(capturingIngest).toHaveBeenCalledOnce();
        expect(captured[0]?.from).toBe("");
      } finally {
        await rcv.close();
      }
    });
  });

  // --- No PII in error responses ---

  describe("no PII in SMTP rejection messages", () => {
    it("RCPT 550 for unknown token does not leak the address", async () => {
      const fake = "b".repeat(26);
      const probe = await session();
      await probe.cmd("MAIL FROM:<rt-sender@example.test>");
      const rcpt = await probe.cmd(`RCPT TO:<reply-${fake}@${domain}>`);
      expect(rcpt).toMatch(/^550 /);
      // The rejection must not echo the token or any address back
      expect(rcpt).not.toContain(fake);
      expect(rcpt).not.toContain("rt-sender@example.test");
      probe.close();
    });

    it("451 on ingest failure does not leak message content", async () => {
      const syntheticBody = "pii-content-sentinel-x7q9";
      const failing = createInboundReceiver(
        {
          platformDb: testDb.platformDb,
          getTenantDb: () => db,
          replyTokenHasher: hasher,
          now,
          ingest: () => Promise.reject(new Error("simulated")),
        },
        { port: 0 },
      );
      const fp = await failing.listen();

      try {
        const { token } = await mintToken(db, fixture.ticketId, hasher);
        const probe = await session(fp);
        await probe.cmd("MAIL FROM:<rt-sender@example.test>");
        await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`);
        await probe.cmd("DATA");
        probe.raw(
          mailMessage(
            `pii-leak-${crypto.randomUUID()}@probe.local`,
            syntheticBody,
          ),
        );
        const reply = await probe.reply();
        expect(reply).toMatch(/^451 /);
        // The error reply must not contain the message body or sender
        expect(reply).not.toContain(syntheticBody);
        expect(reply).not.toContain("rt-sender@example.test");
        probe.close();
      } finally {
        await failing.close();
      }
    });
  });
});

// The TLS configuration branches (tlsKeyPath/tlsCertPath spread into the
// SMTPServer options) are not covered here: exercising them needs a real
// X.509 cert/key pair, and the Docker test image ships no openssl or cert
// tooling to mint one. The TLS path is exercised by deployment, not unit
// tests.

// ---------------------------------------------------------------------------
// deps.now fallback (L142)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "inbound receiver defaults to Date.now when deps.now is omitted",
  () => {
    let testDb: TestDb;
    let db: Kysely<TenantDatabase>;
    let fixture: TestTicketFixture;

    const hasher = createReplyTokenHasher(
      deriveReplyTokenIndexKey(TEST_OPS_KEY),
    );
    const orgId = crypto.randomUUID() as OrgId;
    const domain = `now-${crypto.randomUUID().slice(0, 8)}.example.org`;

    const openProbes: SmtpProbe[] = [];

    afterEach(() => {
      for (const probe of openProbes) probe.close();
      openProbes.length = 0;
    });

    beforeAll(async () => {
      await getSodium();
      testDb = await createTestDb();
      db = testDb.db;

      await testDb.platformDb
        .insertInto("orgs")
        .values({
          id: orgId,
          slug: `now-rcv-${testDb.schemaName}` as OrgSlug,
          schema_name: testDb.schemaName as OrgSchema,
        })
        .execute();
      await testDb.platformDb
        .insertInto("inbound_email_domains")
        .values({ domain, org_id: orgId })
        .execute();

      fixture = await createTestTicketFixture(db);
    }, 30_000);

    afterAll(async () => {
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

    it("operates normally without an injected clock", async () => {
      // Covers L142 binary-expr[1]: deps.now ?? Date.now
      const rcv = createInboundReceiver(
        {
          platformDb: testDb.platformDb,
          getTenantDb: () => db,
          replyTokenHasher: hasher,
          // No `now` provided, exercises the Date.now fallback
        },
        { port: 0 },
      );
      const rcvPort = await rcv.listen();
      try {
        const { token } = await mintToken(db, fixture.ticketId, hasher);
        const probe = await connectProbe(rcvPort);
        openProbes.push(probe);
        const greeting = await probe.reply();
        expect(greeting).toMatch(/^220 /);
        await probe.cmd("EHLO probe.local");
        await probe.cmd("MAIL FROM:<rt-sender@example.test>");
        const rcpt = await probe.cmd(`RCPT TO:<reply-${token}@${domain}>`);
        // If Date.now fallback works, the rate limiter accepts the first connection
        expect(rcpt).toMatch(/^250 /);
        probe.close();
      } finally {
        await rcv.close();
      }
    });
  },
);
