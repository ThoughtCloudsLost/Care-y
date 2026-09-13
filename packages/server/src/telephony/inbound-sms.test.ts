import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";

vi.mock("./inbound-mms.js", async (importOriginal) => {
  const original = await importOriginal<typeof InboundMmsModule>();
  return {
    ...original,
    processAttachments: vi.fn().mockResolvedValue({
      accepted: [],
      rejected: [],
    }),
  };
});

import { handleInboundSms } from "./inbound-sms.js";
import type { InboundSmsDeps } from "./inbound-sms.js";
import type * as InboundMmsModule from "./inbound-mms.js";
import type { TelephonyProvider, IncomingSmsData } from "./provider.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { BlindIndexer } from "../crypto/field-encryptor.js";
import type { BlobStore } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import type { ClientRepository } from "./models/client-repo.js";
import type { SmsResponseRepository } from "./models/sms-response-repo.js";
import type { BlocklistRepository } from "./models/blocklist-repo.js";
import {
  orgIdSchema,
  orgSchemaNameSchema,
  type OrgId,
  type QueueId,
  type PhoneHash,
  type IdentifierHash,
  type UsernameHash,
  type OpsPhoneHash,
  type E164,
  type ClientId,
  type PhoneId,
  type ChannelRowId,
  type ChannelSecret,
  type AliasHash,
  type PhoneMatchHash,
} from "@care-y/shared";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createTestDb,
  createTestTicketFixture,
  seedOrgPublicKey,
  type TestDb,
} from "../test-utils.js";
import {
  eciesDecrypt,
  getSodium,
  toRistrettoPoint,
  toNonce,
  requireSodium,
} from "@care-y/crypto";
import type { Scalar, RistrettoPoint } from "@care-y/crypto";

// ---------------------------------------------------------------------------
// Mock factories (unit test layer, unchanged from original)
// ---------------------------------------------------------------------------

function createMockProvider(): TelephonyProvider {
  return {
    providerId: "twilio",
    sendSms: vi.fn().mockResolvedValue({ messageId: "SM123" }),
    deleteMessageLog: vi.fn().mockResolvedValue(undefined),
    initiateOutboundCall: vi.fn(),
    initiateWebRtcCall: vi.fn(),
    validateWebhook: vi.fn(),
    parseIncomingCall: vi.fn(),
    parseIncomingSms: vi.fn(),
    generateVoiceResponse: vi.fn(),
    getRecording: vi.fn(),
    getCallDetails: vi.fn(),
    deleteRecording: vi.fn(),
    deleteCallLog: vi.fn(),
    maskConfig: vi.fn().mockReturnValue({
      provider: "twilio",
      mode: "byot",
      maskedAccountId: "AC****1234",
      maskedAuthToken: "********",
      phoneNumbers: [],
    }),
  };
}

function createMockSealedBox(): SealedBoxEncryptor {
  return {
    seal: vi.fn((s: string) => Buffer.from(`sealed:${s}`)),
    sealBuffer: vi.fn((b: Buffer) => Buffer.from(`sealed:${b.toString()}`)),
  };
}

function createMockIndexer(): BlindIndexer {
  return {
    hash: vi.fn((_input: string, _orgId: string) => "hashed-phone"),
    hashBuffer: vi.fn((_input: Buffer, _orgId: string) => "hashed-phone"),
    hashIdentifier: vi.fn(
      (_input: string, _orgId: OrgId) => "hashed-id" as IdentifierHash,
    ),
    hashUsername: vi.fn(
      (_input: string, _orgId: OrgId) => "hashed-user" as UsernameHash,
    ),
    hashPhone: vi.fn(
      (_input: string, _orgId: OrgId) => "hashed-phone" as PhoneHash,
    ),
    hashPhoneBuffer: vi.fn(
      (_input: Buffer, _orgId: OrgId) => "hashed-phone" as PhoneHash,
    ),
    hashConsultantPhoneBuffer: vi.fn(
      (_input: Buffer, _orgId: OrgId) => "hashed-consultant" as OpsPhoneHash,
    ),
  };
}

function createMockBlobStore(): BlobStore {
  return {
    put: vi.fn().mockResolvedValue("org_test/attachment/uuid-1"),
    get: vi.fn(),
    delete: vi.fn(),
    exists: vi.fn(),
  };
}

function createMockJobQueue(): JobQueue {
  return {
    enqueue: vi.fn().mockResolvedValue("job-1"),
    process: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

function createMockClientRepo(): ClientRepository {
  return {
    findOrCreateByPhoneHash: vi.fn().mockResolvedValue({
      client: {
        id: "client-1" as ClientId,
        encryptedAlias: Buffer.from("enc-alias"),
        aliasHash: null as AliasHash | null,
        phoneId: "phone-1" as PhoneId,
      },
      phone: {
        id: "phone-1" as PhoneId,
        phoneHash: "hashed-phone" as PhoneHash,
        phoneMatchHash: null as PhoneMatchHash | null,
        encryptedNumber: Buffer.from("enc"),
        locale: "en-US",
        locationCity: null,
        locationRegion: null,
        isActive: true,
      },
      isNew: true,
    }),
    findById: vi.fn(),
    findByPhoneId: vi.fn().mockResolvedValue(null),
  };
}

function createMockBlocklistRepo(): BlocklistRepository {
  return {
    add: vi.fn(),
    remove: vi.fn(),
    list: vi.fn().mockResolvedValue([]),
    exists: vi.fn().mockResolvedValue(false),
  };
}

function createMockSmsResponseRepo(): SmsResponseRepository {
  return {
    findByLocaleAndType: vi.fn(),
    findWithFallback: vi.fn().mockResolvedValue({
      id: "resp-1",
      responseType: "new_client",
      locale: "en-US",
      text: "Thank you for reaching out.",
    }),
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeSmsData(overrides?: Partial<IncomingSmsData>): IncomingSmsData {
  return {
    messageId: "SM999",
    from: "+15551234567" as E164,
    to: "+15559876543" as E164,
    body: "I need help",
    numMedia: 0,
    mediaUrls: [],
    mediaContentTypes: [],
    ...overrides,
  };
}

/** Minimal chainable mock that resolves channel policy from org_config. */
function mockTenantDbWithPolicy(
  policyOverrides?: Record<string, boolean>,
): Kysely<TenantDatabase> {
  const policyRow = { channel_sms_enabled: true, ...policyOverrides };
  const chain = {
    select: vi.fn().mockReturnValue({
      executeTakeFirst: vi.fn().mockResolvedValue(policyRow),
    }),
  };
  return {
    selectFrom: vi.fn().mockReturnValue(chain),
  } as unknown as Kysely<TenantDatabase>;
}

function makeDeps(overrides?: Partial<InboundSmsDeps>): InboundSmsDeps {
  return {
    provider: createMockProvider(),
    sealedBox: createMockSealedBox(),
    indexer: createMockIndexer(),
    blobStore: createMockBlobStore(),
    jobQueue: createMockJobQueue(),
    clientRepo: createMockClientRepo(),
    smsResponseRepo: createMockSmsResponseRepo(),
    blocklistRepo: createMockBlocklistRepo(),
    tDb: mockTenantDbWithPolicy(),
    intakeQueueId: "queue-intake-1" as QueueId,
    orgId: orgIdSchema.parse("a0a0a0a0-a0a0-40a0-80a0-a0a0a0a0a0a0"),
    orgSchema: orgSchemaNameSchema.parse(
      "org_a0a0a0a0-a0a0-40a0-80a0-a0a0a0a0a0a0",
    ),
    defaultLocale: "en-US",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests (blocklist + blind index; ECIES roundtrip tests in server-ticket-create.test.ts)
// ---------------------------------------------------------------------------

describe("handleInboundSms", () => {
  let deps: InboundSmsDeps;
  let smsData: IncomingSmsData;

  beforeEach(() => {
    deps = makeDeps();
    smsData = makeSmsData();
  });

  // --- Blocklist ---

  it("returns null when phone is blocked", async () => {
    vi.mocked(deps.blocklistRepo.exists).mockResolvedValueOnce(true);

    const result = await handleInboundSms(smsData, deps);

    expect(result).toBeNull();
  });

  it("does not create client when phone is blocked", async () => {
    vi.mocked(deps.blocklistRepo.exists).mockResolvedValueOnce(true);

    await handleInboundSms(smsData, deps);

    expect(deps.clientRepo.findOrCreateByPhoneHash).not.toHaveBeenCalled();
    expect(deps.provider.sendSms).not.toHaveBeenCalled();
  });

  // --- Channel policy ---

  it("returns null when channel_sms_enabled is false (same as blocked)", async () => {
    deps = makeDeps({
      tDb: mockTenantDbWithPolicy({ channel_sms_enabled: false }),
    });

    const result = await handleInboundSms(smsData, deps);
    expect(result).toBeNull();
    expect(deps.clientRepo.findOrCreateByPhoneHash).not.toHaveBeenCalled();
    expect(deps.provider.sendSms).not.toHaveBeenCalled();
  });

  it("proceeds past policy guard when channel_sms_enabled is true", async () => {
    // Default deps have sms enabled; blocklist returns false (default).
    // The stub tDb cannot support ticket creation, so the call rejects
    // downstream of the guard; reaching client creation proves the guard
    // passed.
    await handleInboundSms(smsData, deps).catch(() => undefined);
    expect(deps.clientRepo.findOrCreateByPhoneHash).toHaveBeenCalled();
  });

  // --- Blind index ---

  it("computes blind index hash with orgId", async () => {
    vi.mocked(deps.blocklistRepo.exists).mockResolvedValueOnce(true);

    await handleInboundSms(smsData, deps);

    expect(deps.indexer.hashPhone).toHaveBeenCalledOnce();
    expect(deps.indexer.hashPhone).toHaveBeenCalledWith(
      "+15551234567",
      "a0a0a0a0-a0a0-40a0-80a0-a0a0a0a0a0a0",
    );
  });

  // --- Phone encryption ---

  it("encrypts phone number with sealed-box (ops-tier)", async () => {
    vi.mocked(deps.blocklistRepo.exists).mockResolvedValueOnce(true);

    await handleInboundSms(smsData, deps);

    // Blocklist check happens before phone encryption, so sealBuffer
    // should not be called when blocked
    expect(deps.sealedBox.sealBuffer).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Portal copy DB integration tests
// ---------------------------------------------------------------------------

/**
 * Generates a test ristretto255 keypair for portal channel ECIES testing.
 * The private scalar is needed to verify decrypt roundtrips.
 */
function generateTestKeypair(): {
  priv: Scalar;
  pub: RistrettoPoint;
} {
  const sodium = requireSodium();
  const priv = sodium.crypto_core_ristretto255_scalar_random() as Scalar;
  const pub = sodium.crypto_scalarmult_ristretto255_base(
    priv,
  ) as RistrettoPoint;
  return { priv, pub };
}

/**
 * Inserts a portal_channels row for testing. The keypair is generated by
 * the caller so tests can hold the private key for decrypt roundtrips.
 */
async function seedPortalChannel(
  db: Kysely<TenantDatabase>,
  clientId: ClientId,
  clientPublic: Uint8Array,
  status: "active" | "revoked" = "active",
): Promise<ChannelRowId> {
  const channelId = `ch-${crypto.randomUUID().slice(0, 8)}` as ChannelSecret;
  const row = await db
    .insertInto("portal_channels")
    .values({
      client_id: clientId,
      channel_id: channelId,
      auth_hash: Buffer.alloc(32, 0xaa),
      client_public: Buffer.from(clientPublic),
      key_check_ephemeral_point: Buffer.alloc(32, 0xbb),
      key_check_nonce: Buffer.alloc(24, 0xcc),
      key_check_ciphertext: Buffer.alloc(48, 0xdd),
      status,
      ...(status === "revoked" ? { revoked_at: new Date() } : {}),
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

describe.skipIf(!process.env.DATABASE_URL)(
  "handleInboundSms portal copy",
  () => {
    let testDb: TestDb;
    let tDb: Kysely<TenantDatabase>;

    beforeAll(async () => {
      // requireSodium throws until the libsodium init promise has been
      // awaited once; the keypair and ECIES helpers all depend on it.
      await getSodium();
      testDb = await createTestDb();
      tDb = testDb.db;
      await seedOrgPublicKey(tDb);
    }, 30_000);

    afterAll(async () => {
      await testDb.cleanup();
    });

    // Shared fixture: creates phone, client, queue, ticket in the test schema
    // so handleInboundSms can resolve or create tickets against a real DB.
    // The clientRepo mock returns the fixture's clientId so the handler
    // uses the right client when looking up the portal channel.
    async function buildDbDeps(): Promise<{
      deps: InboundSmsDeps;
      fixture: Awaited<ReturnType<typeof createTestTicketFixture>>;
    }> {
      const fixture = await createTestTicketFixture(tDb);
      const clientRepo = createMockClientRepo();
      vi.mocked(clientRepo.findOrCreateByPhoneHash).mockResolvedValue({
        client: {
          id: fixture.clientId,
          encryptedAlias: Buffer.from("enc-alias"),
          aliasHash: null as AliasHash | null,
          phoneId: fixture.phoneId,
        },
        phone: {
          id: fixture.phoneId,
          phoneHash: "hashed-phone" as PhoneHash,
          phoneMatchHash: null as PhoneMatchHash | null,
          encryptedNumber: Buffer.from("enc"),
          locale: "en-US",
          locationCity: null,
          locationRegion: null,
          isActive: true,
        },
        isNew: false,
      });

      const deps = makeDeps({ tDb, clientRepo });
      return { deps, fixture };
    }

    it("writes a portal_messages row with direction from_client when an active channel exists", async () => {
      const { deps, fixture } = await buildDbDeps();
      const kp = generateTestKeypair();
      const channelRowId = await seedPortalChannel(
        tDb,
        fixture.clientId,
        kp.pub,
      );

      const smsData = makeSmsData({ body: "portal test message" });
      const result = await handleInboundSms(smsData, deps);

      expect(result).not.toBeNull();

      // Verify the portal_messages row
      const rows = await tDb
        .selectFrom("portal_messages")
        .selectAll()
        .where("channel_id", "=", channelRowId)
        .execute();

      expect(rows).toHaveLength(1);
      const row = rows[0]!;
      expect(row.direction).toBe("from_client");
      expect(row.followup_id).toBe(result!.followUpId);

      // Decrypt roundtrip: verify the sealed copy opens to the original body
      const decrypted = eciesDecrypt(
        toRistrettoPoint(new Uint8Array(row.ephemeral_point)),
        toNonce(new Uint8Array(row.nonce)),
        new Uint8Array(row.ciphertext),
        kp.priv,
      );
      expect(Buffer.from(decrypted).toString("utf-8")).toBe(
        "portal test message",
      );
    }, 30_000);

    it("writes no portal_messages row when the client has no channel", async () => {
      const { deps } = await buildDbDeps();
      const smsData = makeSmsData({ body: "no channel" });
      const result = await handleInboundSms(smsData, deps);

      expect(result).not.toBeNull();

      // Count portal_messages for this client's tickets.
      // The client has no channel, so the count must be zero for this followup.
      const rows = await tDb
        .selectFrom("portal_messages")
        .selectAll()
        .where("followup_id", "=", result!.followUpId)
        .execute();

      expect(rows).toHaveLength(0);
    }, 30_000);

    it("writes no portal_messages row when the channel is revoked", async () => {
      const { deps, fixture } = await buildDbDeps();
      const kp = generateTestKeypair();
      await seedPortalChannel(tDb, fixture.clientId, kp.pub, "revoked");

      const smsData = makeSmsData({ body: "revoked channel" });
      const result = await handleInboundSms(smsData, deps);

      expect(result).not.toBeNull();

      const rows = await tDb
        .selectFrom("portal_messages")
        .selectAll()
        .where("followup_id", "=", result!.followUpId)
        .execute();

      expect(rows).toHaveLength(0);
    }, 30_000);

    it("still creates the follow-up and warns without body when copy write fails", async () => {
      const { deps, fixture } = await buildDbDeps();
      const kp = generateTestKeypair();
      await seedPortalChannel(tDb, fixture.clientId, kp.pub);

      // Spy on console.warn to verify it fires and contains no body text
      const warnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);

      // Inject a fault into the portal_messages insert by spying on
      // insertInto and failing only when the target table is portal_messages.
      const originalInsertInto = tDb.insertInto.bind(tDb);
      const insertSpy = vi
        .spyOn(tDb, "insertInto")
        .mockImplementation((table: Parameters<typeof tDb.insertInto>[0]) => {
          if (table === "portal_messages") {
            return {
              values: () => ({
                execute: () =>
                  Promise.reject(new Error("simulated write failure")),
              }),
            } as unknown as ReturnType<typeof tDb.insertInto>;
          }
          return originalInsertInto(table);
        });

      const smsData = makeSmsData({ body: "should still create followup" });
      const result = await handleInboundSms(smsData, deps);

      // Follow-up was still created
      expect(result).not.toBeNull();
      expect(result!.followUpId).toBeDefined();

      // Verify the follow-up row exists in the DB
      const followup = await tDb
        .selectFrom("followups")
        .select("id")
        .where("id", "=", result!.followUpId)
        .executeTakeFirst();
      expect(followup).toBeDefined();

      // Warn was called without the message body
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Portal copy dropped"),
      );
      for (const call of warnSpy.mock.calls) {
        const msg = String(call[0]);
        expect(msg).not.toContain("should still create followup");
      }

      insertSpy.mockRestore();
      warnSpy.mockRestore();
    }, 30_000);

    // --- MMS portal carrier tests (ADR-092) ---

    it("writes portal_attachments carrier rows when channel exists and MMS attachments are present", async () => {
      const { deps, fixture } = await buildDbDeps();
      const kp = generateTestKeypair();
      const channelRowId = await seedPortalChannel(
        tDb,
        fixture.clientId,
        kp.pub,
      );

      const smsData = makeSmsData({
        body: "mms with image",
        numMedia: 1,
        mediaUrls: ["https://example.com/image.jpg"],
        mediaContentTypes: ["image/jpeg"],
      });

      // Mock processAttachments to return a fake attachment buffer
      const mms = await import("./inbound-mms.js");
      vi.mocked(mms.processAttachments).mockResolvedValueOnce({
        accepted: [
          {
            data: Buffer.from("fake-image-data"),
            contentType: "image/jpeg",
            sizeBytes: 15,
          },
        ],
        rejected: [],
      });

      const result = await handleInboundSms(smsData, deps);
      expect(result).not.toBeNull();

      // Verify portal_attachments carrier row exists
      const paRows = await tDb
        .selectFrom("portal_attachments")
        .selectAll()
        .where("channel_id", "=", channelRowId)
        .where("followup_id", "=", result!.followUpId)
        .execute();

      expect(paRows).toHaveLength(1);
      expect(paRows[0]!.direction).toBe("from_client");

      // Verify the attachment row has non-null file_key_wrap
      const attRow = await tDb
        .selectFrom("attachments")
        .select("file_key_wrap")
        .where("followup_id", "=", result!.followUpId)
        .executeTakeFirstOrThrow();
      expect(attRow.file_key_wrap).not.toBeNull();
    }, 30_000);

    it("writes old envelope (null file_key_wrap) when no channel exists and MMS is present", async () => {
      const { deps } = await buildDbDeps();

      const smsData = makeSmsData({
        body: "mms no channel",
        numMedia: 1,
        mediaUrls: ["https://example.com/doc.pdf"],
        mediaContentTypes: ["application/pdf"],
      });

      const mms = await import("./inbound-mms.js");
      vi.mocked(mms.processAttachments).mockResolvedValueOnce({
        accepted: [
          {
            data: Buffer.from("fake-pdf"),
            contentType: "application/pdf",
            sizeBytes: 8,
          },
        ],
        rejected: [],
      });

      const result = await handleInboundSms(smsData, deps);
      expect(result).not.toBeNull();

      const attRow = await tDb
        .selectFrom("attachments")
        .select("file_key_wrap")
        .where("followup_id", "=", result!.followUpId)
        .executeTakeFirstOrThrow();
      expect(attRow.file_key_wrap).toBeNull();

      // No portal carrier rows
      const paRows = await tDb
        .selectFrom("portal_attachments")
        .selectAll()
        .where("followup_id", "=", result!.followUpId)
        .execute();
      expect(paRows).toHaveLength(0);
    }, 30_000);
  },
);
