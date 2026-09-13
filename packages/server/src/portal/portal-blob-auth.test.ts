/**
 * DB integration tests for portal-blob-auth.
 *
 * This module is an auth boundary for portal blob fetches. It resolves
 * a portal channel from either (a) x-portal-channel + x-portal-auth
 * headers (Secure Link path) or (b) a session cookie (Encrypted Account
 * path). Every denial branch is exercised: the module's job is to say
 * "no" to bad credentials uniformly, so null returns get as many cases
 * as successful resolutions.
 *
 * Uses describe.skipIf(!DATABASE_URL) and createTestDb() per the
 * testing-reference.md idioms. Each suite gets an isolated schema.
 */

import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Kysely } from "kysely";
import { getSodium, hashChannelAuth } from "@care-y/crypto";
import type { TenantDatabase } from "../db/types.js";
import type { ClientId } from "@care-y/shared";
import { channelSecretSchema, newClientAccountId } from "@care-y/shared";
import {
  createTestDb,
  createTestClientFixture,
  testBlindIndexer,
  mockReq,
  TEST_ORG_ID,
  type TestDb,
} from "../test-utils.js";
import { deriveFakeSaltKey } from "../auth/salt-defense.js";
import { createChannel, type ChannelRegistration } from "./channel-service.js";
import {
  createAccount,
  login,
  type AccountRegistrationInput,
  type AccountServiceDeps,
} from "./account-service.js";
import {
  parseClientCookies,
  resolvePortalBlobChannel,
  CLIENT_SESSION_COOKIE,
} from "./portal-blob-auth.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_OPS_HEX =
  "cafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe";

function makeChannelReg(
  overrides?: Partial<ChannelRegistration>,
): ChannelRegistration {
  return {
    channelId: channelSecretSchema.parse(
      crypto.randomBytes(24).toString("hex"),
    ),
    authHash: crypto.randomBytes(32),
    clientPublic: crypto.randomBytes(32),
    hasPassphrase: false,
    keyCheck: {
      ephemeralPoint: crypto.randomBytes(32),
      nonce: crypto.randomBytes(24),
      ciphertext: crypto.randomBytes(48),
    },
    ...overrides,
  };
}

function makeAccountReg(
  overrides?: Partial<AccountRegistrationInput>,
): AccountRegistrationInput {
  return {
    accountId: newClientAccountId(),
    username: `ct-user-${crypto.randomUUID().slice(0, 8)}`,
    salt: crypto.randomBytes(16),
    publicKey: crypto.randomBytes(32),
    authHash: crypto.randomBytes(32),
    keyCheck: {
      ephemeralPoint: crypto.randomBytes(32),
      nonce: crypto.randomBytes(24),
      ciphertext: crypto.randomBytes(48),
    },
    ...overrides,
  };
}

async function insertClient(db: Kysely<TenantDatabase>): Promise<ClientId> {
  const fixture = await createTestClientFixture(db);
  return fixture.clientId;
}

// ---------------------------------------------------------------------------
// parseClientCookies (pure, no DB needed)
// ---------------------------------------------------------------------------

describe("parseClientCookies", () => {
  it("returns empty map for null header", () => {
    expect(parseClientCookies(null).size).toBe(0);
  });

  it("returns empty map for undefined header", () => {
    expect(parseClientCookies(undefined).size).toBe(0);
  });

  it("returns empty map for empty string header", () => {
    expect(parseClientCookies("").size).toBe(0);
  });

  it("parses a single cookie pair", () => {
    const result = parseClientCookies("session=abc123");
    expect(result.get("session")).toBe("abc123");
    expect(result.size).toBe(1);
  });

  it("parses multiple cookie pairs", () => {
    const result = parseClientCookies("a=1; b=2; c=3");
    expect(result.get("a")).toBe("1");
    expect(result.get("b")).toBe("2");
    expect(result.get("c")).toBe("3");
    expect(result.size).toBe(3);
  });

  it("skips pairs without an equals sign", () => {
    // Covers L43 if (eqIndex === -1) continue
    const result = parseClientCookies("malformed; a=1; alsobad");
    expect(result.get("a")).toBe("1");
    expect(result.size).toBe(1);
  });

  it("skips pairs where the name is empty after trimming", () => {
    // Covers L47 if (name) false branch
    const result = parseClientCookies("=emptyname; real=val");
    expect(result.has("")).toBe(false);
    expect(result.get("real")).toBe("val");
    expect(result.size).toBe(1);
  });

  it("preserves values containing equals signs", () => {
    // Cookie values can contain '=' (e.g., base64 padding)
    const result = parseClientCookies("token=abc==def");
    expect(result.get("token")).toBe("abc==def");
  });

  it("trims whitespace around names and values", () => {
    const result = parseClientCookies("  name  =  value  ");
    expect(result.get("name")).toBe("value");
  });
});

// ---------------------------------------------------------------------------
// resolvePortalBlobChannel (DB integration)
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)("resolvePortalBlobChannel", () => {
  let testDb: TestDb;
  let db: Kysely<TenantDatabase>;
  let accountDeps: AccountServiceDeps;

  beforeAll(async () => {
    await getSodium();
    testDb = await createTestDb();
    db = testDb.db;

    const fakeSaltKey = await deriveFakeSaltKey(TEST_OPS_HEX);
    accountDeps = {
      indexer: testBlindIndexer,
      fakeSaltKey,
      orgUuid: TEST_ORG_ID,
    };
  }, 30_000);

  afterAll(async () => {
    await testDb.cleanup();
  });

  // ---------------------------------------------------------------------
  // Header-based auth (Secure Link path)
  // ---------------------------------------------------------------------

  describe("header-based channel auth", () => {
    it("resolves a channel when both headers carry valid credentials", async () => {
      const clientId = await insertClient(db);
      const rawAuth = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuth));
      const reg = makeChannelReg({ authHash });
      await createChannel(db, clientId, reg);

      const req = mockReq({
        headers: {
          "x-portal-channel": reg.channelId,
          "x-portal-auth": rawAuth.toString("base64"),
        },
      });

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).not.toBeNull();
      expect(result!.channel_id).toBe(reg.channelId);
      expect(result!.client_id).toBe(clientId);
    });

    it("returns null when x-portal-channel is missing", async () => {
      // Covers L86 rawChannel undefined (binary-expr short-circuit)
      const req = mockReq({
        headers: {
          "x-portal-auth": crypto.randomBytes(32).toString("base64"),
        },
      });

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).toBeNull();
    });

    it("returns null when x-portal-auth is missing", async () => {
      // Covers L88 rawAuth undefined (binary-expr short-circuit)
      const validChannel = channelSecretSchema.parse(
        crypto.randomBytes(24).toString("hex"),
      );
      const req = mockReq({
        headers: {
          "x-portal-channel": validChannel,
        },
      });

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).toBeNull();
    });

    it("returns null when x-portal-channel is empty string", async () => {
      // Covers L87 rawChannel !== "" false branch
      const req = mockReq({
        headers: {
          "x-portal-channel": "",
          "x-portal-auth": crypto.randomBytes(32).toString("base64"),
        },
      });

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).toBeNull();
    });

    it("returns null when x-portal-auth is empty string", async () => {
      // Covers L89 rawAuth !== "" false branch
      const validChannel = channelSecretSchema.parse(
        crypto.randomBytes(24).toString("hex"),
      );
      const req = mockReq({
        headers: {
          "x-portal-channel": validChannel,
          "x-portal-auth": "",
        },
      });

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).toBeNull();
    });

    it("returns null when channel secret fails schema validation", async () => {
      // Covers L92 if (!parsed.success) return null
      const req = mockReq({
        headers: {
          "x-portal-channel": "NOT-HEX-VALUE!!!",
          "x-portal-auth": crypto.randomBytes(32).toString("base64"),
        },
      });

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).toBeNull();
    });

    it("returns null when channel exists but auth token is wrong", async () => {
      const clientId = await insertClient(db);
      const rawAuth = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuth));
      const reg = makeChannelReg({ authHash });
      await createChannel(db, clientId, reg);

      const wrongAuth = crypto.randomBytes(32);
      const req = mockReq({
        headers: {
          "x-portal-channel": reg.channelId,
          "x-portal-auth": wrongAuth.toString("base64"),
        },
      });

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).toBeNull();
    });

    it("returns null when channel_id is unknown", async () => {
      const unknownChannelId = channelSecretSchema.parse(
        crypto.randomBytes(24).toString("hex"),
      );
      const req = mockReq({
        headers: {
          "x-portal-channel": unknownChannelId,
          "x-portal-auth": crypto.randomBytes(32).toString("base64"),
        },
      });

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------
  // headerValue coverage (exercised via array-typed headers)
  // ---------------------------------------------------------------------

  describe("headerValue via array-typed headers", () => {
    it("uses the first element when a header is an array", async () => {
      // Covers L62 if (Array.isArray(raw)) return raw[0]
      // IncomingMessage.headers can carry string[] for repeated headers.
      // mockReq sets headers as Record<string, string>, so we patch
      // the headers object after construction to inject an array.
      const clientId = await insertClient(db);
      const rawAuth = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuth));
      const reg = makeChannelReg({ authHash });
      await createChannel(db, clientId, reg);

      const req = mockReq();
      // Overwrite with array values to exercise the headerValue array branch.
      // The type cast is necessary because mockReq types headers as string,
      // but the real IncomingMessage type allows string[].
      (req.headers as Record<string, string | string[]>)["x-portal-channel"] = [
        reg.channelId,
        "decoy-value",
      ];
      (req.headers as Record<string, string | string[]>)["x-portal-auth"] = [
        rawAuth.toString("base64"),
        "decoy-auth",
      ];

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).not.toBeNull();
      expect(result!.channel_id).toBe(reg.channelId);
    });
  });

  // ---------------------------------------------------------------------
  // Cookie-based auth (Encrypted Account path)
  // ---------------------------------------------------------------------

  describe("cookie-based session auth", () => {
    it("resolves a channel from a valid session cookie", async () => {
      // Covers L100-106 happy path (session cookie present, session valid,
      // session.channel not null)
      const clientId = await insertClient(db);
      const rawAuthToken = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuthToken));
      const acctReg = makeAccountReg({ authHash });

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, accountDeps, clientId, acctReg);
      });

      const loginResult = await login(db, acctReg.accountId, rawAuthToken);
      expect(loginResult).not.toBeNull();

      const req = mockReq({
        headers: {
          cookie: `${CLIENT_SESSION_COOKIE}=${loginResult!.sessionToken}`,
        },
      });

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).not.toBeNull();
      expect(result!.client_id).toBe(clientId);
      expect(result!.kind).toBe("account");
    });

    it("returns null when no cookie header is present", async () => {
      // Covers L103 sessionToken === undefined
      // No x-portal-channel/auth headers either, so falls through to cookie
      const req = mockReq();

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).toBeNull();
    });

    it("returns null when cookie header is present but session cookie is missing", async () => {
      // Covers L103 sessionToken === undefined (cookie exists but wrong name)
      const req = mockReq({
        headers: {
          cookie: "other_cookie=somevalue",
        },
      });

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).toBeNull();
    });

    it("returns null when session cookie value is empty", async () => {
      // Covers L103 sessionToken === ""
      const req = mockReq({
        headers: {
          cookie: `${CLIENT_SESSION_COOKIE}=`,
        },
      });

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).toBeNull();
    });

    it("returns null when session token does not match any session", async () => {
      // Covers L105-106 resolveAccountSession returns null (no matching row)
      const bogusToken = crypto.randomBytes(32).toString("base64url");
      const req = mockReq({
        headers: {
          cookie: `${CLIENT_SESSION_COOKIE}=${bogusToken}`,
        },
      });

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).toBeNull();
    });

    it("returns null when session has expired", async () => {
      // Covers L105-106 resolveAccountSession returns null (expired)
      const clientId = await insertClient(db);
      const rawAuthToken = crypto.randomBytes(32);
      const authHash = Buffer.from(hashChannelAuth(rawAuthToken));
      const acctReg = makeAccountReg({ authHash });

      await db.transaction().execute(async (trx) => {
        await createAccount(trx, accountDeps, clientId, acctReg);
      });

      const loginResult = await login(db, acctReg.accountId, rawAuthToken);
      expect(loginResult).not.toBeNull();

      // Expire the session by setting expires_at in the past
      const tokenBuf = Buffer.from(loginResult!.sessionToken, "base64url");
      const tokenHash = Buffer.from(hashChannelAuth(tokenBuf));
      await db
        .updateTable("client_account_sessions")
        .set({ expires_at: new Date(Date.now() - 60_000) })
        .where("token_hash", "=", tokenHash)
        .execute();

      const req = mockReq({
        headers: {
          cookie: `${CLIENT_SESSION_COOKIE}=${loginResult!.sessionToken}`,
        },
      });

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------
  // Precedence: header auth takes priority over cookie auth
  // ---------------------------------------------------------------------

  describe("auth precedence", () => {
    it("prefers header auth over cookie auth when both are present", async () => {
      // Create a client with both a Secure Link channel and an account.
      // The Secure Link header credentials should be used.
      const clientId = await insertClient(db);

      // Set up Secure Link channel
      const rawChannelAuth = crypto.randomBytes(32);
      const channelAuthHash = Buffer.from(hashChannelAuth(rawChannelAuth));
      const channelReg = makeChannelReg({ authHash: channelAuthHash });
      await createChannel(db, clientId, channelReg);

      const req = mockReq({
        headers: {
          "x-portal-channel": channelReg.channelId,
          "x-portal-auth": rawChannelAuth.toString("base64"),
          cookie: `${CLIENT_SESSION_COOKIE}=ct-bogus-token`,
        },
      });

      const result = await resolvePortalBlobChannel(db, req);
      expect(result).not.toBeNull();
      // The result should be the Secure Link channel, not an account channel
      expect(result!.channel_id).toBe(channelReg.channelId);
    });
  });
});
