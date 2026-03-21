/**
 * Test database infrastructure for server integration tests.
 *
 * Provides schema lifecycle (create/migrate/drop), test data factories,
 * mock HTTP objects (mockReq / mockRes), and assertion helpers.
 *
 * Each test suite calls createTestDb() in beforeAll and cleanup() in afterAll,
 * getting a fully isolated PostgreSQL schema with all tenant migrations applied.
 *
 * Runs inside the Docker container via `docker compose exec app pnpm vitest run`.
 * Requires DATABASE_URL in the environment (provided by docker-compose env_file).
 */

import * as crypto from "node:crypto";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import pg from "pg";
import {
  Kysely,
  PostgresDialect,
  FileMigrationProvider,
  Migrator,
  sql,
} from "kysely";
import type { Insertable, Selectable } from "kysely";
import type {
  PlatformDatabase,
  TenantDatabase,
  UsersTable,
  SessionsTable,
} from "./db/types.js";
import {
  deriveKeys,
  createFieldEncryptor,
  createBlindIndexer,
  createNoopFieldEncryptor,
  type FieldEncryptor,
  type BlindIndexer,
} from "./crypto/field-encryptor.js";
import {
  deriveSessionHmacKey,
  createSessionTokenizer,
  type SessionTokenizer,
} from "./crypto/session-tokenizer.js";

// Override int8 parser (same as db.ts). Must be set before creating the Pool.
pg.types.setTypeParser(pg.types.builtins.INT8, (val: string) =>
  parseInt(val, 10),
);

// ---------------------------------------------------------------------------
// Test crypto helpers
// ---------------------------------------------------------------------------

// Deterministic 32-byte test key (hardcoded, not from env). Safe to commit
// because it is only used in ephemeral test schemas that are dropped after
// each suite. Never used in production.
export const TEST_OPS_KEY = Buffer.from(
  "cafebabecafebabecafebabecafebabecafebabecafebabecafebabecafebabe",
  "hex",
);

const testDerivedKeys = deriveKeys(TEST_OPS_KEY);

/** Real encryptor backed by a deterministic test key. Use for tests that
 *  verify ciphertext is not plaintext. */
export const testFieldEncryptor: FieldEncryptor = createFieldEncryptor(
  testDerivedKeys.fieldEncryptKey,
);

/** Real blind indexer backed by a deterministic test key. Default for
 *  createTestUser because identifier_hash has a UNIQUE constraint. */
export const testBlindIndexer: BlindIndexer = createBlindIndexer(
  testDerivedKeys.blindIndexKey,
);

/** Passthrough encryptor for tests that don't need to verify encryption. */
export const noopEncryptor: FieldEncryptor = createNoopFieldEncryptor();

/** Real session tokenizer backed by a deterministic test key. Use for tests
 *  that verify HMAC token computation. */
export const testSessionTokenizer: SessionTokenizer = createSessionTokenizer(
  deriveSessionHmacKey(TEST_OPS_KEY),
);

/** Stable org ID for test factories. Used as the org-scoping salt in blind
 *  index hashes so that test hashes are deterministic across runs. */
export const TEST_ORG_ID = "00000000-0000-0000-0000-000000000001";

// ---------------------------------------------------------------------------
// Sealed box test helpers
// ---------------------------------------------------------------------------

import sodium from "sodium-native";
import {
  createSealedBoxEncryptor,
  type SealedBoxEncryptor,
} from "./crypto/sealed-box.js";

/** Deterministic test Curve25519 keypair. Safe to commit (test-only).
 *  Same seed always produces the same keypair across runs. */
const testKeypair = (() => {
  const pk = Buffer.alloc(sodium.crypto_box_PUBLICKEYBYTES);
  const sk = Buffer.alloc(sodium.crypto_box_SECRETKEYBYTES);
  sodium.crypto_box_seed_keypair(pk, sk, TEST_OPS_KEY);
  return { publicKey: pk, secretKey: sk };
})();

/** The test org's Curve25519 public key (32 bytes). */
export const TEST_ORG_PUBLIC_KEY: Buffer = testKeypair.publicKey;

/** SealedBoxEncryptor backed by the test org keypair. Use for any test that
 *  creates sessions or users (session-repository, auth service, routes). */
export const testSealedBox: SealedBoxEncryptor =
  createSealedBoxEncryptor(TEST_ORG_PUBLIC_KEY);

/**
 * Seeds the org_config singleton row in a test schema.
 * Inserts the row if it doesn't exist, then sets org_public_key.
 * Call in beforeAll after createTestDb() so that org resolution and
 * session creation work correctly.
 */
export async function seedOrgPublicKey(
  tDb: Kysely<TenantDatabase>,
): Promise<void> {
  const existing = await tDb
    .selectFrom("org_config")
    .select("id")
    .executeTakeFirst();

  if (!existing) {
    await tDb
      .insertInto("org_config")
      .values({ org_public_key: TEST_ORG_PUBLIC_KEY })
      .execute();
  } else {
    await tDb
      .updateTable("org_config")
      .set({ org_public_key: TEST_ORG_PUBLIC_KEY })
      .execute();
  }
}

// ---------------------------------------------------------------------------
// Test DB setup
// ---------------------------------------------------------------------------

/** Thrown when test database setup or teardown fails. */
export class TestSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TestSetupError";
  }
}

export interface TestDb {
  /** Kysely instance scoped to the test schema (tenant tables). */
  readonly db: Kysely<TenantDatabase>;
  /** Kysely instance on the public schema (platform tables). */
  readonly platformDb: Kysely<PlatformDatabase>;
  /** Schema name (for debugging or raw queries). */
  readonly schemaName: string;
  /** Drops the schema and destroys the pool. Call in afterAll. */
  readonly cleanup: () => Promise<void>;
}

/**
 * Creates an isolated test schema with all tenant migrations applied.
 *
 * Each call creates a fresh `test_<random>` schema, runs the full migration
 * set, and returns scoped Kysely instances. The cleanup function drops the
 * schema with CASCADE and closes the connection pool.
 */
export async function createTestDb(): Promise<TestDb> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new TestSetupError(
      "DATABASE_URL is not set. Tests must run inside the Docker container: " +
        "docker compose exec app pnpm vitest run --project server",
    );
  }

  const pool = new pg.Pool({ connectionString, max: 5 });
  const dialect = new PostgresDialect({ pool });
  const platformDb = new Kysely<PlatformDatabase>({ dialect });

  const suffix = crypto.randomUUID().slice(0, 8);
  const schemaName = `test_${suffix}`;

  // Create the test schema.
  await sql`CREATE SCHEMA ${sql.id(schemaName)}`.execute(platformDb);

  // Build a tenant-scoped instance and run migrations against it.
  const db = platformDb.withSchema(
    schemaName,
  ) as unknown as Kysely<TenantDatabase>;

  const tenantDir = path.join(
    import.meta.dirname,
    "db",
    "migrations",
    "tenant",
  );

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: tenantDir,
    }),
    migrationTableSchema: schemaName,
  });

  const { error, results } = await migrator.migrateToLatest();

  if (error) {
    // Roll back: drop the schema so we don't leak partial schemas.
    await sql`DROP SCHEMA ${sql.id(schemaName)} CASCADE`.execute(platformDb);
    await pool.end();
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    throw new TestSetupError(
      `Test schema migration failed (${schemaName}): ${msg}`,
    );
  }

  // Log migration results for debugging (silent in normal runs).
  results?.forEach((r) => {
    if (r.status === "Error") {
      console.error(`[${schemaName}] Migration error: ${r.migrationName}`);
    }
  });

  async function cleanup(): Promise<void> {
    await sql`DROP SCHEMA ${sql.id(schemaName)} CASCADE`.execute(platformDb);
    await platformDb.destroy();
  }

  return { db, platformDb, schemaName, cleanup };
}

// ---------------------------------------------------------------------------
// Test data factories
// ---------------------------------------------------------------------------

export interface CreateTestUserOptions {
  overrides?: Partial<Insertable<UsersTable>>;
  encryptor?: FieldEncryptor;
  indexer?: BlindIndexer;
  orgId?: string;
}

type SessionOverrides = Partial<Insertable<SessionsTable>> & {
  user_id: string;
};

// Fake password hash for test rows. Format matches createScryptHasher output
// (scrypt:<32-hex-salt>:<128-hex-key>) but the key is not a real derivation.
// Tests that need actual password verification should hash via createScryptHasher.
const DEFAULT_PASSWORD_HASH =
  "scrypt:" + "aa".repeat(16) + ":" + "bb".repeat(64);

/**
 * Inserts a user row with sensible defaults. Override any column via
 * options.overrides. Returns the full row from RETURNING *.
 *
 * Uses noopEncryptor by default for encrypted columns (most tests don't
 * need real encryption). Uses the real testBlindIndexer by default because
 * identifier_hash has a UNIQUE constraint and needs deterministic,
 * collision-resistant values.
 */
export async function createTestUser(
  db: Kysely<TenantDatabase>,
  options?: CreateTestUserOptions,
): Promise<Selectable<UsersTable>> {
  const encryptor = options?.encryptor ?? noopEncryptor;
  const indexer = options?.indexer ?? testBlindIndexer;
  const orgId = options?.orgId ?? TEST_ORG_ID;
  const uid = crypto.randomUUID().slice(0, 8);
  const identifier = `test-${uid}`;

  const defaults: Insertable<UsersTable> = {
    identifier_hash: indexer.hash(identifier, orgId),
    encrypted_identifier: encryptor.encrypt(identifier),
    password_hash: DEFAULT_PASSWORD_HASH,
    encrypted_display_name: encryptor.encrypt(`Test User ${uid}`),
    encrypted_notification_addr: null,
    role_id: RoleId.VOLUNTEER,
  };

  return db
    .insertInto("users")
    .values({ ...defaults, ...options?.overrides })
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Inserts a session row. Requires user_id (no default, since sessions must
 * belong to a user). All other columns have sensible defaults.
 * Returns the full row from RETURNING *.
 *
 * Default IP ("127.0.0.1") and UA ("test-agent") are encrypted via the
 * provided encryptor and tokenized via the test session tokenizer. Override
 * ip_token/ua_token in overrides if using non-default IP/UA values.
 */
export async function createTestSession(
  db: Kysely<TenantDatabase>,
  overrides: SessionOverrides,
  encryptor?: FieldEncryptor,
): Promise<Selectable<SessionsTable>> {
  const enc = encryptor ?? noopEncryptor;
  const uid = crypto.randomUUID();
  return db
    .insertInto("sessions")
    .values({
      token: uid,
      encrypted_ip_address: enc.encrypt("127.0.0.1"),
      encrypted_user_agent: enc.encrypt("test-agent"),
      ip_token: testSessionTokenizer.tokenize("127.0.0.1"),
      ua_token: testSessionTokenizer.tokenize("test-agent"),
      expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      ...overrides,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

// ---------------------------------------------------------------------------
// Ticket test fixtures
// ---------------------------------------------------------------------------

/**
 * Inserts a queue row with a random name. Queue names are plaintext
 * by design (05-tickets.md: "queue names aren't sensitive").
 */
export async function createTestQueue(
  db: Kysely<TenantDatabase>,
  overrides?: { name?: string; escalateDays?: number },
): Promise<{ id: string; name: string }> {
  const uid = crypto.randomUUID().slice(0, 8);
  const row = await db
    .insertInto("queues")
    .values({
      // care-y-ignore-next-line ast-pii-in-db-write -- queue names are plaintext by design (05-tickets.md section 5.1)
      name: overrides?.name ?? `Q-${uid}`,
      ...(overrides?.escalateDays !== undefined
        ? { escalate_days: overrides.escalateDays }
        : {}),
    })
    .returning(["id", "name"])
    .executeTakeFirstOrThrow();
  return row;
}

export interface TestTicketFixture {
  readonly phoneId: string;
  readonly clientId: string;
  readonly queueId: string;
  readonly ticketId: string;
  readonly userId: string | null;
}

export interface CreateTestTicketFixtureOptions {
  /** If provided, reuse this queue instead of creating a new one. */
  queueId?: string;
  /** If true, creates a user via createTestUser and returns its ID. Default false. */
  createUser?: boolean;
}

/**
 * Inserts the full phone -> client -> (queue) -> ticket chain needed
 * by most ticket-system integration tests. Centralizes the dummy-data
 * inserts so individual test files don't each reinvent the chain.
 *
 * Encrypted fields use opaque Buffers (not real ciphertext). This is
 * correct for DB integration tests that verify service logic, not
 * crypto correctness.
 */
export async function createTestTicketFixture(
  db: Kysely<TenantDatabase>,
  options?: CreateTestTicketFixtureOptions,
): Promise<TestTicketFixture> {
  const uid = crypto.randomUUID().slice(0, 8);

  // Construct encrypted values before the DB calls. phone_hash is a
  // one-way blind index, encrypted_number goes through the encryptor,
  // and phone_id is a UUID FK (none are plaintext PII).
  const phoneRow = {
    phone_hash: `ph-${uid}`,
    encrypted_number: noopEncryptor.encrypt(`+1555000${uid}`),
    locale: "en-US",
  };

  // care-y-ignore-next-line no-plaintext-db-write -- phone_hash is a blind index, encrypted_number passes through noopEncryptor.encrypt() above
  const phone = await db
    .insertInto("phones")
    .values(phoneRow)
    .returning("id")
    .executeTakeFirstOrThrow();

  // care-y-ignore-next-line no-plaintext-db-write -- phone_id is a UUID FK (not PII); alias is a random test identifier
  const client = await db
    .insertInto("clients")
    .values({ alias: `cl-${uid}`, phone_id: phone.id })
    .returning("id")
    .executeTakeFirstOrThrow();

  let queueId: string;
  if (options?.queueId) {
    queueId = options.queueId;
  } else {
    const q = await createTestQueue(db);
    queueId = q.id;
  }

  const ticket = await db
    .insertInto("tickets")
    .values({
      client_id: client.id,
      queue_id: queueId,
      encrypted_title: noopEncryptor.encrypt("test-title"),
      encrypted_description: noopEncryptor.encrypt("test-desc"),
      key_generation: crypto.randomUUID(),
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  let userId: string | null = null;
  if (options?.createUser) {
    const user = await createTestUser(db);
    userId = user.id;
  }

  return {
    phoneId: phone.id,
    clientId: client.id,
    queueId,
    ticketId: ticket.id,
    userId,
  };
}

export interface TestClientFixture {
  readonly phoneId: string;
  readonly clientId: string;
  readonly queueId: string;
  readonly userId: string;
}

/**
 * Inserts phone -> client -> queue -> user (no ticket). For tests that
 * need a client entity without an associated ticket.
 */
export async function createTestClientFixture(
  db: Kysely<TenantDatabase>,
  options?: { queueId?: string },
): Promise<TestClientFixture> {
  const uid = crypto.randomUUID().slice(0, 8);

  const phoneRow = {
    phone_hash: `ph-${uid}`,
    encrypted_number: noopEncryptor.encrypt(`+1555000${uid}`),
    locale: "en-US",
  };

  // care-y-ignore-next-line no-plaintext-db-write -- phone_hash is a blind index, encrypted_number passes through noopEncryptor.encrypt() above
  const phone = await db
    .insertInto("phones")
    .values(phoneRow)
    .returning("id")
    .executeTakeFirstOrThrow();

  // care-y-ignore-next-line no-plaintext-db-write -- phone_id is a UUID FK (not PII); alias is a random test identifier
  const client = await db
    .insertInto("clients")
    .values({ alias: `cl-${uid}`, phone_id: phone.id })
    .returning("id")
    .executeTakeFirstOrThrow();

  let queueId: string;
  if (options?.queueId) {
    queueId = options.queueId;
  } else {
    const q = await createTestQueue(db);
    queueId = q.id;
  }

  const user = await createTestUser(db);

  return {
    phoneId: phone.id,
    clientId: client.id,
    queueId,
    userId: user.id,
  };
}

// ---------------------------------------------------------------------------
// Mock HTTP objects
// ---------------------------------------------------------------------------

export interface MockReqOptions {
  headers?: Record<string, string | undefined>;
  remoteAddress?: string;
}

/**
 * Creates a minimal IncomingMessage stub for testing code that reads
 * `req.headers`, `req.socket.remoteAddress`, etc.
 *
 * Defaults: remoteAddress "127.0.0.1", user-agent "test-agent".
 * Override any header via `options.headers`.
 */
export function mockReq(options?: MockReqOptions): IncomingMessage {
  const socket = new Socket();
  Object.defineProperty(socket, "remoteAddress", {
    value: options?.remoteAddress ?? "127.0.0.1",
    writable: true,
  });

  const req = Object.create(IncomingMessage.prototype) as IncomingMessage;
  Object.defineProperty(req, "socket", { value: socket, writable: false });
  Object.defineProperty(req, "headers", {
    value: { "user-agent": "test-agent", ...options?.headers },
    writable: true,
  });
  return req;
}

export interface MockResWithCookies extends ServerResponse {
  getCapturedCookies(): string[];
}

/**
 * Creates a minimal ServerResponse stub that captures Set-Cookie headers.
 * Callers that don't need cookie inspection can ignore getCapturedCookies().
 */
export function mockRes(): MockResWithCookies {
  const cookies: string[] = [];
  const res = Object.create(ServerResponse.prototype) as ServerResponse;

  res.setHeader = ((name: string, value: string | string[]): ServerResponse => {
    if (name.toLowerCase() === "set-cookie") {
      if (Array.isArray(value)) cookies.push(...value);
      else cookies.push(value);
    }
    return res;
  }) as ServerResponse["setHeader"];

  return Object.assign(res, {
    getCapturedCookies(): string[] {
      return cookies;
    },
  }) as MockResWithCookies;
}

// ---------------------------------------------------------------------------
// tRPC assertion helpers
// ---------------------------------------------------------------------------

import { expect } from "vitest";
import { TRPCError } from "@trpc/server";
import type { EmailSender, EmailMessage } from "./email/email-sender.js";
import { generateTotpCode, base32Decode } from "./auth/totp.js";
import type { TwoFactorService } from "./auth/two-factor-service.js";
import { TwoFactorMethod, RoleId } from "@care-y/shared";

/**
 * Asserts that a promise rejects with a TRPCError having the expected code.
 * Optionally checks the message too. Returns the caught error for further
 * inspection.
 */
export async function expectTrpcError(
  promise: Promise<unknown>,
  expectedCode: TRPCError["code"],
  messageMatch?: string | RegExp,
): Promise<TRPCError> {
  // rejects.toBeInstanceOf asserts: (1) promise rejects, (2) error is TRPCError
  await expect(promise).rejects.toBeInstanceOf(TRPCError);

  // Re-await the already-rejected promise to extract the error value.
  // Safe because we just proved it rejects with TRPCError above.
  let err: TRPCError | undefined;
  try {
    await promise;
  } catch (caught: unknown) {
    err = caught as TRPCError;
  }

  // Narrowing: err is guaranteed defined because rejects.toBeInstanceOf passed
  const trpcErr = err as TRPCError;
  expect(trpcErr.code).toBe(expectedCode);
  if (messageMatch !== undefined) {
    if (typeof messageMatch === "string") {
      expect(trpcErr.message).toContain(messageMatch);
    } else {
      expect(trpcErr.message).toMatch(messageMatch);
    }
  }
  return trpcErr;
}

// ---------------------------------------------------------------------------
// Mock email sender
// ---------------------------------------------------------------------------

export interface MockEmailSender extends EmailSender {
  /** Captured send() calls for assertion. */
  readonly calls: ReadonlyArray<{ to: string; subject: string; text: string }>;
}

/**
 * Creates a mock EmailSender that records every send() call.
 * Tests that need to inspect emails read `.calls`; tests that don't just
 * ignore it.
 */
export function createMockEmailSender(): MockEmailSender {
  const calls: { to: string; subject: string; text: string }[] = [];
  return {
    get calls() {
      return calls;
    },
    async send(message: EmailMessage): Promise<void> {
      calls.push({
        to: message.to,
        subject: message.subject,
        text: message.text,
      });
    },
  };
}

// ---------------------------------------------------------------------------
// 2FA test helpers
// ---------------------------------------------------------------------------

/**
 * Inserts a row into two_factor_methods directly (bypasses service logic).
 * Useful for setting up preconditions where a method is already registered.
 */
export async function registerMethodDirectly(
  db: Kysely<TenantDatabase>,
  userId: string,
  methodType: string,
): Promise<void> {
  await db
    .insertInto("two_factor_methods")
    .values({ user_id: userId, method_type: methodType })
    .execute();
}

/**
 * Inserts a WebAuthn credential row directly and registers the WebAuthn
 * method. Useful for tests that need a credential present without going
 * through the full WebAuthn registration flow.
 */
export async function insertWebauthnCredential(
  db: Kysely<TenantDatabase>,
  userId: string,
  credentialId: string,
  signCount = 0,
  ordinal = 1,
): Promise<void> {
  await db
    .insertInto("webauthn_credentials")
    .values({
      user_id: userId,
      credential_id: credentialId,
      public_key: "fake-pk",
      sign_count: signCount,
      transports: ["internal"],
      device_type: "platform",
      backed_up: false,
      aaguid: "00000000-0000-0000-0000-000000000000",
      ordinal,
    })
    .execute();

  await registerMethodDirectly(db, userId, TwoFactorMethod.WEBAUTHN);
}

/**
 * Enrolls TOTP for a user through the full setup+verify flow.
 * Returns the decoded secret bytes so the caller can generate further
 * valid codes via `generateTotpCode(secret, timestamp)`.
 */
export async function enrollTotp(
  twoFactor: TwoFactorService,
  userId: string,
): Promise<Buffer> {
  const setup = await twoFactor.setupTotp(userId);
  const secret = base32Decode(setup.secret);
  const validCode = generateTotpCode(secret, Date.now());
  await twoFactor.verifyTotpEnrollment(userId, validCode);
  return secret;
}

/**
 * Extracts a 6-digit verification code from email text.
 * Throws if no code is found (test should fail, not silently skip).
 */
export function extractEmailCode(text: string): string {
  const match = /(\d{6})/.exec(text);
  if (!match) {
    throw new TestSetupError("No 6-digit code found in email text");
  }
  return match[1] as string;
}

// ---------------------------------------------------------------------------
// Docker OPRF container detection
// ---------------------------------------------------------------------------

/** True when the Docker OPRF sidecar sockets are present (inside test container). */
export const DOCKER_OPRF_AVAILABLE =
  existsSync("/run/oprf/oprf-a.sock") && existsSync("/run/oprf/oprf-b.sock");

export const DOCKER_SOCKET_A = "/run/oprf/oprf-a.sock";
export const DOCKER_SOCKET_B = "/run/oprf/oprf-b.sock";

// ---------------------------------------------------------------------------
// Mock OPRF dependencies (for tests that build createAppRouter but don't
// exercise the OPRF route)
// ---------------------------------------------------------------------------

import type { OprfRouterDeps } from "./routes/oprf.js";
import type { ProviderFactory } from "./telephony/factory.js";
import type {
  TelephonyProvider,
  MaskedTelephonyConfig,
} from "./telephony/provider.js";
import { NotFoundError } from "./errors.js";

/**
 * Creates a stub ProviderFactory that signals "telephony not configured."
 * getProvider throws NotFoundError (the same error the real factory throws
 * for unconfigured orgs), so callers like createScopedTwoFactorServices
 * handle it gracefully and set SMS to unavailable.
 */
export function createMockProviderFactory(): ProviderFactory {
  return {
    async getProvider() {
      throw new NotFoundError("Telephony not configured (mock)");
    },
    invalidate() {
      // no-op: cache invalidation not needed in tests
    },
    invalidateAll() {
      // no-op: cache invalidation not needed in tests
    },
  };
}

// ---------------------------------------------------------------------------
// Mock telephony provider
// ---------------------------------------------------------------------------

export interface MockTelephonyProvider extends TelephonyProvider {
  /** Captured sendSms() calls for assertion. */
  readonly smsCalls: ReadonlyArray<{
    to: string;
    body: string;
    callerId: string;
  }>;
}

/**
 * Creates a mock TelephonyProvider that records sendSms calls.
 * maskConfig returns a single phone number (+15551234567) by default.
 * All other methods throw TestSetupError to catch unexpected usage.
 */
export function createMockTelephonyProvider(): MockTelephonyProvider {
  const smsCalls: { to: string; body: string; callerId: string }[] = [];

  const maskedConfig: MaskedTelephonyConfig = {
    provider: "twilio",
    mode: "byot",
    maskedAccountId: "AC****1234",
    maskedAuthToken: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    phoneNumbers: [{ number: "+15551234567" }],
  };

  return {
    get smsCalls() {
      return smsCalls;
    },
    providerId: "twilio",
    async sendSms(to, body, callerId) {
      smsCalls.push({ to, body, callerId });
      return { messageId: `SM${String(Date.now())}` };
    },
    maskConfig() {
      return maskedConfig;
    },
    async initiateOutboundCall() {
      throw new TestSetupError(
        "Mock provider: initiateOutboundCall called unexpectedly",
      );
    },
    async initiateWebRtcCall() {
      throw new TestSetupError(
        "Mock provider: initiateWebRtcCall called unexpectedly",
      );
    },
    validateWebhook() {
      throw new TestSetupError(
        "Mock provider: validateWebhook called unexpectedly",
      );
    },
    parseIncomingCall() {
      throw new TestSetupError(
        "Mock provider: parseIncomingCall called unexpectedly",
      );
    },
    parseIncomingSms() {
      throw new TestSetupError(
        "Mock provider: parseIncomingSms called unexpectedly",
      );
    },
    generateVoiceResponse() {
      throw new TestSetupError(
        "Mock provider: generateVoiceResponse called unexpectedly",
      );
    },
    async getRecording() {
      throw new TestSetupError(
        "Mock provider: getRecording called unexpectedly",
      );
    },
    async deleteRecording() {
      throw new TestSetupError(
        "Mock provider: deleteRecording called unexpectedly",
      );
    },
    async deleteCallLog() {
      throw new TestSetupError(
        "Mock provider: deleteCallLog called unexpectedly",
      );
    },
    async deleteMessageLog() {
      throw new TestSetupError(
        "Mock provider: deleteMessageLog called unexpectedly",
      );
    },
  };
}

/**
 * Creates stub OPRF deps that satisfy the type but throw on actual use.
 * Only suitable for tests that don't call the oprf.evaluate endpoint.
 */
export function createMockOprfDeps(): OprfRouterDeps {
  return {
    oprfService: {
      async evaluate() {
        throw new TestSetupError("Mock OPRF service called unexpectedly");
      },
    },
  };
}
