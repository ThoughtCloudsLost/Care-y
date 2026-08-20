/**
 * Webhook-to-DB integration test (Group D from security-contract test plan).
 *
 * Proves the full chain: signed webhook request -> signature validated ->
 * message parsed -> handleInboundSms called -> body encrypted -> blob stored
 * -> client record created/found -> auto-reply sent -> provider log deletion
 * attempted/enqueued.
 *
 * Uses real: DB (platform + tenant via createTestDb), crypto (sealed box,
 * blind index, secrets encryptor), ConfigService (decrypts config from DB),
 * WebhookDispatch, WebhookHandler, DedupStore, RateLimiter.
 *
 * Uses mock: TelephonyProvider (sendSms, deleteMessageLog), JobQueue,
 * BlobStore (capturing mock to inspect stored ciphertext).
 *
 * Runs inside Docker via `pnpm test:server:db` (requires DATABASE_URL).
 */

import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import {
  createWebhookHandler,
  type WebhookDispatch,
} from "../routes/webhooks.js";
import { createWebhookDispatch } from "./webhook-dispatch.js";
import type { NotificationService } from "../notifications/service.js";
import { createTelephonyConfigService } from "./config-service.js";
import type { ProviderFactory } from "./factory.js";
import { createDedupStore } from "./dedup-store.js";
import { createInMemoryRateLimiter } from "../ratelimit/rate-limiter.js";
import { twilioHmacValidator } from "./webhook-crypto.js";
import {
  extractMediaFromWebhookBody,
  type TelephonyProvider,
  type SendSmsResult,
} from "./provider.js";
import { twilioConfigSchema } from "./schemas.js";
import {
  deriveSecretsKey,
  createSecretsEncryptor,
  type SecretsEncryptor,
} from "../config/secrets.js";
import {
  createTestDb,
  seedOrgPublicKey,
  TestSetupError,
  TEST_OPS_KEY,
  testBlindIndexer,
  type TestDb,
} from "../test-utils.js";
import { createCallTracker } from "./call-tracker.js";
import type { BlobStore, BlobCategory } from "../storage/store.js";
import type { JobQueue } from "../jobs/queue.js";
import type { OrgService } from "../org/service.js";
import { SYSTEM_ACTOR_ID, RoleId } from "@care-y/shared";

// ---------------------------------------------------------------------------
// Test constants
// ---------------------------------------------------------------------------

// Distinct from WEBHOOK_INTEG_ORG_ID in test-utils to avoid unique constraint conflicts
// with tests that insert into public.orgs concurrently.
const WEBHOOK_INTEG_ORG_ID = "d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1";
const TEST_AUTH_TOKEN = "integration-test-auth-token-xyz";
const TEST_ACCOUNT_SID = "AC_INTEGRATION_TEST";
const WEBHOOK_BASE_URL = "https://api.care-y.app";

// ---------------------------------------------------------------------------
// Capturing BlobStore mock
// ---------------------------------------------------------------------------

interface CapturingBlobStore extends BlobStore {
  readonly storedBlobs: ReadonlyArray<{
    orgSchema: string;
    category: BlobCategory;
    blob: Buffer;
    key: string;
  }>;
}

function createCapturingBlobStore(): CapturingBlobStore {
  const stored: {
    orgSchema: string;
    category: BlobCategory;
    blob: Buffer;
    key: string;
  }[] = [];
  let counter = 0;

  return {
    get storedBlobs() {
      return stored;
    },
    async put(
      orgSchema: string,
      category: BlobCategory,
      blob: Buffer,
    ): Promise<string> {
      counter++;
      const key = `${orgSchema}/${category}/blob-${String(counter)}`;
      // Copy the buffer: the handler may zero it after storing
      stored.push({ orgSchema, category, blob: Buffer.from(blob), key });
      return key;
    },
    async get(): Promise<Buffer | null> {
      return null;
    },
    async delete(): Promise<void> {
      // no-op
    },
    async exists(): Promise<boolean> {
      return false;
    },
  };
}

// ---------------------------------------------------------------------------
// Mock HTTP helpers (from webhooks.test.ts pattern)
// ---------------------------------------------------------------------------

function createMockReq(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
}): IncomingMessage {
  const readable = new Readable({
    read() {
      // No-op: data pushed via process.nextTick
    },
  }) as IncomingMessage;
  Object.defineProperty(readable, "method", {
    value: options.method ?? "POST",
  });
  Object.defineProperty(readable, "url", { value: options.url ?? "/" });
  Object.defineProperty(readable, "headers", {
    value: {
      "content-type": "application/x-www-form-urlencoded",
      ...options.headers,
    },
  });
  if (options.body !== undefined) {
    process.nextTick(() => {
      readable.push(options.body);
      readable.push(null);
    });
  } else {
    process.nextTick(() => readable.push(null));
  }
  return readable;
}

interface MockRes {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
}

function createMockRes(): ServerResponse & MockRes {
  const res = {
    statusCode: 0,
    body: "",
    headers: {} as Record<string, string>,
    writeHead(
      status: number,
      headersArg?: Record<string, string>,
    ): ServerResponse {
      res.statusCode = status;
      if (headersArg) {
        for (const [k, v] of Object.entries(headersArg)) {
          res.headers[k] = v;
        }
      }
      return res as unknown as ServerResponse;
    },
    end(body?: string): ServerResponse {
      res.body = body ?? "";
      return res as unknown as ServerResponse;
    },
  } as unknown as ServerResponse & MockRes;
  return res;
}

// ---------------------------------------------------------------------------
// Signed request builder (real HMAC)
// ---------------------------------------------------------------------------

function buildSignedSmsRequest(options: {
  orgId: string;
  from?: string;
  to?: string;
  messageBody?: string;
  messageSid?: string;
}): {
  url: string;
  body: string;
  signature: string;
  bodyRecord: Record<string, string>;
} {
  const endpoint = "sms";
  const tsSeconds = Math.floor(Date.now() / 1000);
  const urlPath = `/webhooks/twilio/${options.orgId}/${endpoint}?ts=${String(tsSeconds)}`;
  const fullUrl = WEBHOOK_BASE_URL + urlPath;

  const bodyRecord: Record<string, string> = {
    AccountSid: TEST_ACCOUNT_SID,
    MessageSid: options.messageSid ?? "SM_INTEG_001",
    From: options.from ?? "+15559876543",
    To: options.to ?? "+15551234567",
    Body: options.messageBody ?? "I need help with my situation",
    NumMedia: "0",
  };

  const signature = twilioHmacValidator.computeSignature(
    fullUrl,
    bodyRecord,
    TEST_AUTH_TOKEN,
  );

  const params = new URLSearchParams(bodyRecord);
  return { url: urlPath, body: params.toString(), signature, bodyRecord };
}

function buildSignedVoiceRecordingRequest(options: {
  orgId: string;
  callSid?: string;
  recordingSid?: string;
  recordingDuration?: string;
}): {
  url: string;
  body: string;
  signature: string;
  bodyRecord: Record<string, string>;
} {
  const endpoint = "voice";
  const tsSeconds = Math.floor(Date.now() / 1000);
  const urlPath = `/webhooks/twilio/${options.orgId}/${endpoint}?ts=${String(tsSeconds)}`;
  const fullUrl = WEBHOOK_BASE_URL + urlPath;

  const bodyRecord: Record<string, string> = {
    AccountSid: TEST_ACCOUNT_SID,
    CallSid: options.callSid ?? "CA_INTEG_Q_001",
    RecordingSid: options.recordingSid ?? "RE_INTEG_Q_001",
    RecordingDuration: options.recordingDuration ?? "10",
  };

  const signature = twilioHmacValidator.computeSignature(
    fullUrl,
    bodyRecord,
    TEST_AUTH_TOKEN,
  );

  const params = new URLSearchParams(bodyRecord);
  return { url: urlPath, body: params.toString(), signature, bodyRecord };
}

// ---------------------------------------------------------------------------
// Encrypted config builder (isolates plaintext from DB write scope)
// ---------------------------------------------------------------------------

/**
 * Builds an encrypted Twilio config blob suitable for inserting into
 * telephony_config. Plaintext is zeroed inside this function so it never
 * exists in the same scope as a DB write call.
 */
function buildEncryptedTwilioConfig(encryptor: SecretsEncryptor): Buffer {
  const config = {
    mode: "byot" as const,
    accountSid: TEST_ACCOUNT_SID,
    authToken: TEST_AUTH_TOKEN,
    phoneNumbers: [{ number: "+15551234567", sid: "PN_TEST_001" }],
  };
  twilioConfigSchema.parse(config);
  const buf = Buffer.from(JSON.stringify(config), "utf-8");
  try {
    return encryptor.encrypt(buf);
  } finally {
    buf.fill(0);
  }
}

// ---------------------------------------------------------------------------
// Integration test suite
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "Webhook-to-DB integration (D1)",
  () => {
    // Shared state across tests
    let testDb: TestDb;
    let tDb: Kysely<TenantDatabase>;
    let secretsEncryptor: SecretsEncryptor;
    let blobStore: CapturingBlobStore;
    let handler: (req: IncomingMessage, res: ServerResponse) => Promise<void>;
    let mockJobQueue: JobQueue;
    let sendSmsSpy: ReturnType<
      typeof vi.fn<
        (to: string, body: string, callerId: string) => Promise<SendSmsResult>
      >
    >;
    let deleteMessageLogSpy: ReturnType<
      typeof vi.fn<(messageId: string) => Promise<void>>
    >;
    let dedupStore: ReturnType<typeof createDedupStore>;
    let mockNotificationService: NotificationService;

    beforeAll(async () => {
      // Initialize sodium (required by @care-y/crypto before sync crypto ops)
      const { getSodium } = await import("@care-y/crypto");
      await getSodium();

      // 1. Create isolated test schema (fast, designed for concurrent use)
      testDb = await createTestDb();
      tDb = testDb.db;

      // 2. Insert default org_config row with intake_queue_id.
      //    createTestDb runs migrations but doesn't insert the default row;
      //    that's done by createOrg in production.
      const intakeQueue = await tDb
        .insertInto("queues")
        .values({
          encrypted_name: Buffer.from("Intake"),
          sort_order: 1,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await tDb
        .insertInto("org_config")
        .values({
          pii_retention_days: null,
          intake_queue_id: intakeQueue.id,
        })
        .execute();
      await seedOrgPublicKey(tDb);

      // 3. Seed an SMS auto-reply response
      await tDb
        .insertInto("sms_responses")
        .values({
          response_type: "new_client",
          locale: "en-US",
          text: "Thank you for reaching out. A volunteer will follow up.",
        })
        .execute();

      // 3b. Seed a minimal admin user so the quarantine notification path fires
      await tDb
        .insertInto("users")
        .values({
          identifier_hash: "integ-admin-hash",
          encrypted_identifier: Buffer.from("integ-admin"),
          password_hash: "not-a-real-hash",
          encrypted_display_name: Buffer.from("Admin"),
          role_id: RoleId.ADMIN,
          is_active: true,
        })
        .execute();

      // 4. Insert an org row in the platform DB pointing to our test schema.
      //    resolveOrgForWebhook looks up orgs by ID and checks isActive.
      await testDb.platformDb
        .insertInto("orgs")
        .values({
          id: WEBHOOK_INTEG_ORG_ID,
          slug: `integ-${testDb.schemaName}`,
          schema_name: testDb.schemaName,
        })
        .execute();

      // 5. Secrets encryptor (for telephony config in platform DB)
      const secretsKey = deriveSecretsKey(TEST_OPS_KEY);
      secretsEncryptor = createSecretsEncryptor(secretsKey);

      // 6. Seed telephony_config with encrypted Twilio config.
      //    Encryption is done inside buildEncryptedTwilioConfig so that
      //    plaintext variables stay out of scope of the DB write below.
      const encryptedConfig = buildEncryptedTwilioConfig(secretsEncryptor);

      await testDb.platformDb
        .insertInto("telephony_config")
        .values({
          org_id: WEBHOOK_INTEG_ORG_ID,
          provider: "twilio",
          config: encryptedConfig,
        })
        .execute();

      // 7. Capturing BlobStore (inspectable mock, avoids filesystem + org_ prefix requirement)
      blobStore = createCapturingBlobStore();

      // 8. Mock JobQueue
      mockJobQueue = {
        enqueue: vi.fn().mockResolvedValue("job-1"),
        process: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };

      // 9. Build a hybrid provider with real webhook validation + real SMS
      //    parsing, but mock send/delete (can't call real Twilio).
      sendSmsSpy = vi
        .fn<
          (to: string, body: string, callerId: string) => Promise<SendSmsResult>
        >()
        .mockResolvedValue({ messageId: "SM_SENT_001" });
      deleteMessageLogSpy = vi
        .fn<(messageId: string) => Promise<void>>()
        .mockResolvedValue(undefined);

      const hybridProvider: TelephonyProvider = {
        providerId: "twilio",
        validateWebhook(request) {
          return twilioHmacValidator.validate(
            request.url,
            request.body,
            request.authToken,
            request.signature,
          );
        },
        parseIncomingSms(body) {
          const messageId = body.MessageSid;
          const from = body.From;
          const to = body.To;
          const smsBody = body.Body;
          if (
            messageId === undefined ||
            from === undefined ||
            to === undefined ||
            smsBody === undefined
          ) {
            throw new TestSetupError("Missing required SMS fields");
          }
          const numMedia = parseInt(body.NumMedia ?? "0", 10);
          const { mediaUrls, mediaContentTypes } = extractMediaFromWebhookBody(
            body,
            numMedia,
          );
          return {
            messageId,
            from,
            to,
            body: smsBody,
            numMedia,
            mediaUrls,
            mediaContentTypes,
          };
        },
        sendSms: sendSmsSpy,
        deleteMessageLog: deleteMessageLogSpy,
        async initiateOutboundCall() {
          throw new TestSetupError("Not expected in SMS flow");
        },
        async initiateWebRtcCall() {
          throw new TestSetupError("Not expected in SMS flow");
        },
        parseIncomingCall() {
          throw new TestSetupError("Not expected in SMS flow");
        },
        generateVoiceResponse() {
          return ""; // Recording-complete callbacks return null TwiML
        },
        async getRecording() {
          return Buffer.from("fake-audio-for-quarantine");
        },
        async getCallDetails() {
          return { from: "+15551112222", to: "+15553334444" };
        },
        async deleteRecording() {
          // Best-effort deletion after quarantine
        },
        async deleteCallLog() {
          // Best-effort deletion after quarantine
        },
        maskConfig() {
          return {
            provider: "twilio",
            mode: "byot",
            maskedAccountId: "AC***",
            maskedAuthToken: "****",
            phoneNumbers: [],
          };
        },
      };

      const providerFactory: ProviderFactory = {
        getProvider: vi.fn().mockResolvedValue(hybridProvider),
        invalidate: vi.fn(),
        invalidateAll: vi.fn(),
      };

      // 10. Real config service (reads encrypted config from DB)
      const configService = createTelephonyConfigService({
        db: testDb.platformDb,
        secretsEncryptor,
        providerFactory,
        providerStatics: new Map(),
      });

      // 11. Stub OrgService that returns our test org.
      //     resolveOrgForWebhook calls orgService.findById, then reads
      //     org_config.org_public_key from the tenant DB.
      const orgService: OrgService = {
        async createOrg() {
          throw new TestSetupError("Not expected");
        },
        async findBySlug() {
          return null;
        },
        async findById(id: string) {
          if (id === WEBHOOK_INTEG_ORG_ID) {
            return {
              id: WEBHOOK_INTEG_ORG_ID,
              slug: `integ-${testDb.schemaName}`,
              schemaName: testDb.schemaName,
              isActive: true,
            };
          }
          return null;
        },
        async validateSetupToken() {
          return false;
        },
        async consumeSetupToken() {
          /* no-op in test */
        },
      };

      // 12. Real webhook dispatch (wires org resolution, repos, handlers)
      function tenantDbFactory(schema: string): Kysely<TenantDatabase> {
        return testDb.platformDb.withSchema(
          schema,
        ) as unknown as Kysely<TenantDatabase>;
      }

      mockNotificationService = {
        dispatch: vi.fn().mockResolvedValue(undefined),
        dispatchTicketless: vi.fn().mockResolvedValue(undefined),
      };

      const dispatch: WebhookDispatch = createWebhookDispatch({
        orgService,
        tenantDb: tenantDbFactory,
        providerFactory,
        indexer: testBlindIndexer,
        blobStore,
        jobQueue: mockJobQueue,
        webhookBaseUrl: WEBHOOK_BASE_URL,
        callTracker: createCallTracker(),
        notificationService: mockNotificationService,
      });

      // 13. Real webhook handler (rate limiter, dedup, signature validation)
      dedupStore = createDedupStore();
      const rateLimiter = createInMemoryRateLimiter({
        windowMs: 60_000,
        maxRequests: 200,
      });

      handler = createWebhookHandler(
        {
          configService,
          providerFactory,
          rateLimiter,
          dedupStore,
        },
        dispatch,
        WEBHOOK_BASE_URL,
      );
    });

    afterAll(async () => {
      // Clean up platform rows seeded for this test
      await testDb.platformDb
        .deleteFrom("telephony_config")
        .where("org_id", "=", WEBHOOK_INTEG_ORG_ID)
        .execute();
      await testDb.platformDb
        .deleteFrom("orgs")
        .where("id", "=", WEBHOOK_INTEG_ORG_ID)
        .execute();
      // Stop dedup cleanup interval
      dedupStore.stop();
      // Drop test schema and close pool
      await testDb.cleanup();
    });

    // -----------------------------------------------------------------
    // D1: Full chain test
    // -----------------------------------------------------------------

    it("signed SMS webhook creates encrypted blob and client record in DB", async () => {
      const senderPhone = "+15559876543";
      const hotlineNumber = "+15551234567";
      const messageText = "I need help with my situation";
      const messageSid = "SM_INTEG_FULL_CHAIN";

      const { url, body, signature } = buildSignedSmsRequest({
        orgId: WEBHOOK_INTEG_ORG_ID,
        from: senderPhone,
        to: hotlineNumber,
        messageBody: messageText,
        messageSid,
      });

      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      // --- Assert: 200 OK (dispatch succeeded) ---
      expect(res.statusCode).toBe(200);

      // --- Assert: auto-reply SMS was sent ---
      expect(sendSmsSpy).toHaveBeenCalledOnce();
      expect(sendSmsSpy).toHaveBeenCalledWith(
        senderPhone,
        "Thank you for reaching out. A volunteer will follow up.",
        hotlineNumber,
      );

      // --- Assert: deleteMessageLog was called ---
      expect(deleteMessageLogSpy).toHaveBeenCalledOnce();
      expect(deleteMessageLogSpy).toHaveBeenCalledWith(messageSid);

      // --- Assert: client record exists in DB with blind index hash ---
      const expectedHash = testBlindIndexer.hash(
        senderPhone,
        WEBHOOK_INTEG_ORG_ID,
      );
      const phoneRow = await tDb
        .selectFrom("phones")
        .selectAll()
        .where("phone_hash", "=", expectedHash)
        .executeTakeFirst();

      expect(phoneRow).toBeDefined();
      expect(phoneRow!.phone_hash).toBe(expectedHash);
      // encrypted_number must NOT be the plaintext phone
      expect(phoneRow!.encrypted_number.toString("utf-8")).not.toContain(
        senderPhone,
      );
      // Sealed box adds 48 bytes overhead; plaintext "+15559876543" is 12 bytes
      expect(phoneRow!.encrypted_number.length).toBeGreaterThanOrEqual(48 + 12);

      const clientRow = await tDb
        .selectFrom("clients")
        .selectAll()
        .where("phone_id", "=", phoneRow!.id)
        .executeTakeFirst();

      expect(clientRow).toBeDefined();
      expect(clientRow!.encrypted_alias).toBeTruthy(); // auto-generated pseudonym (sealed)

      // --- Assert: ticket created for this client ---
      const tickets = await tDb
        .selectFrom("tickets")
        .selectAll()
        .where("client_id", "=", clientRow!.id)
        .execute();
      expect(tickets).toHaveLength(1);
      expect(tickets[0]!.status).toBe("open");

      // --- Assert: follow-up created with ECIES-encrypted content ---
      const followups = await tDb
        .selectFrom("followups")
        .selectAll()
        .where("ticket_id", "=", tickets[0]!.id)
        .where("type", "=", "sms_inbound")
        .execute();
      expect(followups).toHaveLength(1);
      // Encrypted content must NOT contain plaintext
      expect(followups[0]!.encrypted_content.toString("utf-8")).not.toContain(
        messageText,
      );
      // Content is encrypted with crypto_secretbox: nonce(24) + ciphertext(plaintext + MAC(16))
      expect(followups[0]!.encrypted_content.length).toBeGreaterThanOrEqual(
        24 + 16 + messageText.length,
      );
    });

    it("second message from the same phone finds existing client (not a duplicate)", async () => {
      const senderPhone = "+15559876543";
      const hotlineNumber = "+15551234567";

      const { url, body, signature } = buildSignedSmsRequest({
        orgId: WEBHOOK_INTEG_ORG_ID,
        from: senderPhone,
        to: hotlineNumber,
        messageBody: "Follow-up question",
        messageSid: "SM_INTEG_FOLLOWUP",
      });

      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);

      // Only one phone record should exist for this hash
      const expectedHash = testBlindIndexer.hash(
        senderPhone,
        WEBHOOK_INTEG_ORG_ID,
      );
      const phoneRows = await tDb
        .selectFrom("phones")
        .selectAll()
        .where("phone_hash", "=", expectedHash)
        .execute();

      // The first test already created a phone. There should still be exactly
      // one because findOrCreateByPhoneHash finds the existing record.
      expect(phoneRows).toHaveLength(1);

      // And exactly one client for that phone
      const clientRows = await tDb
        .selectFrom("clients")
        .selectAll()
        .where("phone_id", "=", phoneRows[0]!.id)
        .execute();

      expect(clientRows).toHaveLength(1);

      // Still one ticket (existing open ticket reused)
      const tickets = await tDb
        .selectFrom("tickets")
        .selectAll()
        .where("client_id", "=", clientRows[0]!.id)
        .execute();
      expect(tickets).toHaveLength(1);

      // But two follow-ups (one per SMS)
      const followups = await tDb
        .selectFrom("followups")
        .selectAll()
        .where("ticket_id", "=", tickets[0]!.id)
        .where("type", "=", "sms_inbound")
        .execute();
      expect(followups).toHaveLength(2);
    });

    it("invalid signature is rejected before any DB writes occur", async () => {
      const { url, body } = buildSignedSmsRequest({
        orgId: WEBHOOK_INTEG_ORG_ID,
        from: "+15550000000",
        messageBody: "Should not be stored",
        messageSid: "SM_INTEG_BAD_SIG",
      });

      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": "invalid-signature-value" },
      });
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(403);

      // No phone record for this number
      const hash = testBlindIndexer.hash("+15550000000", WEBHOOK_INTEG_ORG_ID);
      const phoneRow = await tDb
        .selectFrom("phones")
        .selectAll()
        .where("phone_hash", "=", hash)
        .executeTakeFirst();

      expect(phoneRow).toBeUndefined();

      // Response must not contain any PII from the request
      expect(res.body).not.toContain("+15550000000");
      expect(res.body).not.toContain("Should not be stored");
    });

    it("enqueues log deletion retry when deleteMessageLog fails", async () => {
      deleteMessageLogSpy.mockRejectedValueOnce(new Error("Twilio 500"));

      const { url, body, signature } = buildSignedSmsRequest({
        orgId: WEBHOOK_INTEG_ORG_ID,
        from: "+15558887777",
        messageBody: "Delete should fail",
        messageSid: "SM_INTEG_DEL_FAIL",
      });

      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      // Handler should still succeed (log deletion is best-effort)
      expect(res.statusCode).toBe(200);

      // JobQueue.enqueue should have been called for the retry
      expect(mockJobQueue.enqueue).toHaveBeenCalledWith(
        "log-deletion",
        expect.objectContaining({
          orgId: WEBHOOK_INTEG_ORG_ID,
          resourceType: "message",
          resourceId: "SM_INTEG_DEL_FAIL",
        }),
        expect.objectContaining({
          maxRetries: 3,
          backoff: "exponential",
        }),
      );
    });

    // -----------------------------------------------------------------
    // D2: Tracker-miss recording quarantine
    // -----------------------------------------------------------------

    it("quarantines a recording on tracker miss with audit row and notification job", async () => {
      const callSid = "CA_INTEG_Q_MISS";
      const recordingSid = "RE_INTEG_Q_MISS";

      const { url, body, signature } = buildSignedVoiceRecordingRequest({
        orgId: WEBHOOK_INTEG_ORG_ID,
        callSid,
        recordingSid,
        recordingDuration: "15",
      });

      const req = createMockReq({
        url,
        body,
        headers: { "x-twilio-signature": signature },
      });
      const res = createMockRes();

      await handler(req, res);

      // Webhook handler returns 200 (quarantine succeeded, no TwiML needed)
      expect(res.statusCode).toBe(200);

      // Quarantine row exists with correct reason
      const quarantineRows = await tDb
        .selectFrom("voicemail_quarantine")
        .selectAll()
        .where("recording_sid", "=", recordingSid)
        .execute();

      expect(quarantineRows).toHaveLength(1);
      expect(quarantineRows[0]!.reason).toBe("tracker_miss");
      expect(quarantineRows[0]!.call_sid).toBe(callSid);
      expect(quarantineRows[0]!.duration_seconds).toBe(15);
      expect(quarantineRows[0]!.status).toBe("pending");
      // Sealed blob was stored (blob_key is non-empty)
      expect(quarantineRows[0]!.blob_key).toBeTruthy();
      // Encrypted caller numbers are present (getCallDetails succeeded)
      expect(quarantineRows[0]!.encrypted_caller_number).not.toBeNull();
      expect(quarantineRows[0]!.encrypted_called_number).not.toBeNull();

      // Audit row with SYSTEM_ACTOR_ID
      const auditRows = await tDb
        .selectFrom("audit_log")
        .selectAll()
        .where("event_type", "=", "voicemail_quarantined")
        .where("actor_id", "=", SYSTEM_ACTOR_ID)
        .execute();

      const matchingAudit = auditRows.find(
        (r) => (r.metadata as Record<string, unknown>).callSid === callSid,
      );
      expect(matchingAudit).toBeDefined();
      expect((matchingAudit!.metadata as Record<string, unknown>).reason).toBe(
        "tracker_miss",
      );

      // dispatchTicketless was called on the notification service mock.
      // The mock does not actually enqueue jobs, but the call proves
      // the quarantine path attempted admin notification.
      // orgId and orgSchema are adjacent strings, so matching orgId on UUID
      // shape rather than on type is what catches a swap between them.
      expect(mockNotificationService.dispatchTicketless).toHaveBeenCalledWith(
        expect.anything(), // tDb
        expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        ), // orgId
        expect.any(String), // orgSchema
        expect.any(String), // orgSlug
        "voicemail_quarantined",
        expect.any(Array), // adminIds
      );
    });
  },
);
