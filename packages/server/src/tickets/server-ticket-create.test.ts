import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  generateContentKey,
  encryptContent,
  decryptContent,
  buildContentAad,
  eciesEncrypt,
  eciesDecrypt,
  toRistrettoPoint,
  toScalar,
  getSodium,
  type SymmetricKey,
  type RistrettoPoint,
  type Scalar,
} from "@care-y/crypto";
import * as fc from "fast-check";
import { resolveOrCreateTicket } from "./server-ticket-create.js";
import {
  createTestDb,
  createTestUser,
  createTestQueue,
  seedOrgPublicKey,
  noopEncryptor,
  testSealedBox,
  type TestDb,
} from "../test-utils.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

// ---------------------------------------------------------------------------
// Crypto roundtrip tests (no DB required)
// ---------------------------------------------------------------------------

let volPublic: RistrettoPoint;
let volPrivate: Scalar;

// The intake path binds title/description to the pre-minted ticket id;
// these simulations reuse one title-slot AAD (ADR-053).
const AAD = buildContentAad("ticket-stc-test", "title");

beforeAll(async () => {
  const sodium = await getSodium();
  const scalar = sodium.crypto_core_ristretto255_scalar_random();
  volPrivate = toScalar(scalar);
  volPublic = toRistrettoPoint(
    sodium.crypto_scalarmult_ristretto255_base(scalar),
  );
});

describe("server-ticket-create crypto roundtrips", () => {
  it("encrypt-then-decrypt roundtrip with generateContentKey", () => {
    const tk = generateContentKey();
    const plaintext = Buffer.from("Inbound SMS body from client");
    const ciphertext = encryptContent(new Uint8Array(plaintext), tk, AAD);
    const decrypted = decryptContent(ciphertext, tk, AAD);

    expect(Buffer.from(decrypted).toString("utf-8")).toBe(
      "Inbound SMS body from client",
    );
  });

  it("ECIES wrap-then-unwrap roundtrip recovers tk", () => {
    const tk = generateContentKey();
    const wrap = eciesEncrypt(tk, volPublic);
    const recovered = eciesDecrypt(
      wrap.ephemeralPoint,
      wrap.nonce,
      wrap.ciphertext,
      volPrivate,
    );

    expect(Buffer.from(recovered)).toEqual(Buffer.from(tk));
  });

  it("full roundtrip: encrypt content with tk, ECIES wrap tk, unwrap, decrypt content", () => {
    const tk = generateContentKey();
    const plaintext = Buffer.from("SMS from +15551234567: I need help");

    const encrypted = encryptContent(new Uint8Array(plaintext), tk, AAD);
    const wrap = eciesEncrypt(tk, volPublic);

    const recoveredTk = eciesDecrypt(
      wrap.ephemeralPoint,
      wrap.nonce,
      wrap.ciphertext,
      volPrivate,
    );

    const decrypted = decryptContent(
      encrypted,
      recoveredTk as SymmetricKey,
      AAD,
    );

    expect(Buffer.from(decrypted).toString("utf-8")).toBe(
      "SMS from +15551234567: I need help",
    );
  });

  it("wrong volunteer private key fails ECIES unwrap", async () => {
    const sodium = await getSodium();
    const wrongScalar = sodium.crypto_core_ristretto255_scalar_random();
    const wrongPrivate = toScalar(wrongScalar);

    const tk = generateContentKey();
    const wrap = eciesEncrypt(tk, volPublic);

    expect(() =>
      eciesDecrypt(
        wrap.ephemeralPoint,
        wrap.nonce,
        wrap.ciphertext,
        wrongPrivate,
      ),
    ).toThrow("ECIES decryption failed");
  });

  it("tampered ciphertext fails content decryption", () => {
    const tk = generateContentKey();
    const plaintext = Buffer.from("test content");
    const encrypted = encryptContent(new Uint8Array(plaintext), tk, AAD);

    const tampered = new Uint8Array(encrypted);
    tampered[25] = tampered[25]! ^ 0xff;

    expect(() => decryptContent(tampered as typeof encrypted, tk, AAD)).toThrow(
      "Content decryption failed",
    );
  });

  it("tampered ECIES wrap fails unwrap", () => {
    const tk = generateContentKey();
    const wrap = eciesEncrypt(tk, volPublic);

    const tamperedCiphertext = new Uint8Array(wrap.ciphertext);
    tamperedCiphertext[0] = tamperedCiphertext[0]! ^ 0xff;

    expect(() =>
      eciesDecrypt(
        wrap.ephemeralPoint,
        wrap.nonce,
        tamperedCiphertext,
        volPrivate,
      ),
    ).toThrow("ECIES decryption failed");
  });
});

describe("server-ticket-create property-based tests", () => {
  it("decrypt(encrypt(x, tk), tk) === x for arbitrary plaintext", () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 1024 }), (data) => {
        const tk = generateContentKey();
        const encrypted = encryptContent(data, tk, AAD);
        const decrypted = decryptContent(encrypted, tk, AAD);
        expect(Buffer.from(decrypted)).toEqual(Buffer.from(data));
      }),
      { numRuns: 50 },
    );
  });

  it("eciesDecrypt(eciesEncrypt(tk, pub), priv) === tk for arbitrary 32-byte tk", () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 32, maxLength: 32 }), (rawTk) => {
        const tk = rawTk as unknown as SymmetricKey;
        const wrap = eciesEncrypt(tk, volPublic);
        const recovered = eciesDecrypt(
          wrap.ephemeralPoint,
          wrap.nonce,
          wrap.ciphertext,
          volPrivate,
        );
        expect(Buffer.from(recovered)).toEqual(Buffer.from(rawTk));
      }),
      { numRuns: 50 },
    );
  });
});

// ---------------------------------------------------------------------------
// DB integration tests
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.DATABASE_URL)(
  "resolveOrCreateTicket (DB integration)",
  () => {
    let testDb: TestDb;
    let db: Kysely<TenantDatabase>;
    let queueId: string;
    let userId: string;

    beforeAll(async () => {
      testDb = await createTestDb();
      db = testDb.db;
      await seedOrgPublicKey(db);

      const queue = await createTestQueue(db, { label: "Intake" });
      queueId = queue.id;

      // Create a volunteer with vol_public so ECIES wraps can be generated
      const sodium = await getSodium();
      const scalar = sodium.crypto_core_ristretto255_scalar_random();
      const pubPoint = sodium.crypto_scalarmult_ristretto255_base(scalar);

      const user = await createTestUser(db);
      userId = user.id;

      await db
        .insertInto("user_keys")
        .values({
          user_id: userId,
          salt: Buffer.alloc(16),
          vol_public: Buffer.from(pubPoint),
        })
        .onConflict((oc) =>
          oc
            .column("user_id")
            .doUpdateSet({ vol_public: Buffer.from(pubPoint) }),
        )
        .execute();

      await db
        .insertInto("queue_assignments")
        .values({ queue_id: queueId, user_id: userId })
        .onConflict((oc) => oc.columns(["queue_id", "user_id"]).doNothing())
        .execute();
    });

    afterAll(async () => {
      await testDb.cleanup();
    });

    async function createClient(): Promise<string> {
      const uid = crypto.randomUUID().slice(0, 8);
      const phone = await db
        .insertInto("phones")
        .values({
          phone_hash: `ph-${uid}`,
          encrypted_number: noopEncryptor.encrypt(`+1555${uid}`),
          locale: "en-US",
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      // care-y-ignore-next-line no-plaintext-db-write -- test fixture: encrypted_alias is a dummy sealed blob, not real PII
      const client = await db
        .insertInto("clients")
        .values({
          encrypted_alias: testSealedBox.seal(`cl-${uid}`),
          alias_hash: null,
          phone_id: phone.id,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      return client.id;
    }

    it("creates a new ticket with ECIES wraps when no ticket exists", async () => {
      const clientId = await createClient();
      const title = Buffer.from("SMS from client");
      const desc = Buffer.from("Inbound SMS");

      const result = await resolveOrCreateTicket(
        db,
        clientId,
        queueId,
        title,
        desc,
      );

      expect(result.isNew).toBe(true);
      expect(result.tk).not.toBeNull();
      expect(result.keyGeneration).not.toBeNull();

      // Verify ticket exists in DB
      const ticket = await db
        .selectFrom("tickets")
        .selectAll()
        .where("id", "=", result.ticketId)
        .executeTakeFirstOrThrow();
      expect(ticket.client_id).toBe(clientId);
      expect(ticket.queue_id).toBe(queueId);
      expect(ticket.status).toBe("open");
      expect(ticket.priority).toBe("normal");

      // Verify ECIES wrap exists
      const wraps = await db
        .selectFrom("ticket_key_wraps")
        .selectAll()
        .where("ticket_id", "=", result.ticketId)
        .execute();
      expect(wraps).toHaveLength(1);
      expect(wraps[0]!.volunteer_id).toBe(userId);
      expect(wraps[0]!.algorithm).toBe("ecies-ristretto255-v1");

      // Verify Buffers zeroed
      expect(title.every((b) => b === 0)).toBe(true);
      expect(desc.every((b) => b === 0)).toBe(true);

      // Zero tk
      const sodium = await getSodium();
      sodium.memzero(result.tk!);
    });

    it("returns existing open ticket without creating a new one", async () => {
      const clientId = await createClient();
      const title1 = Buffer.from("First SMS");
      const desc1 = Buffer.from("First");

      const first = await resolveOrCreateTicket(
        db,
        clientId,
        queueId,
        title1,
        desc1,
      );

      if (first.tk) {
        const sodium = await getSodium();
        sodium.memzero(first.tk);
      }

      // Second call should find the open ticket
      const title2 = Buffer.from("Second SMS");
      const desc2 = Buffer.from("Second");

      const second = await resolveOrCreateTicket(
        db,
        clientId,
        queueId,
        title2,
        desc2,
      );

      expect(second.isNew).toBe(false);
      expect(second.ticketId).toBe(first.ticketId);
      expect(second.tk).toBeNull();
      expect(second.keyGeneration).toBeNull();

      // Buffers zeroed
      expect(title2.every((b) => b === 0)).toBe(true);
      expect(desc2.every((b) => b === 0)).toBe(true);
    });

    it("reopens a closed ticket instead of creating a new one", async () => {
      const clientId = await createClient();
      const title1 = Buffer.from("Original");
      const desc1 = Buffer.from("desc");

      const first = await resolveOrCreateTicket(
        db,
        clientId,
        queueId,
        title1,
        desc1,
      );

      if (first.tk) {
        const sodium = await getSodium();
        sodium.memzero(first.tk);
      }

      // Close the ticket
      await db
        .updateTable("tickets")
        .set({ status: "closed" })
        .where("id", "=", first.ticketId)
        .execute();

      // Second call should reopen
      const title2 = Buffer.from("Reopen");
      const desc2 = Buffer.from("desc2");

      const second = await resolveOrCreateTicket(
        db,
        clientId,
        queueId,
        title2,
        desc2,
      );

      expect(second.isNew).toBe(false);
      expect(second.ticketId).toBe(first.ticketId);
      expect(second.tk).toBeNull();

      // Verify status changed back to open
      const ticket = await db
        .selectFrom("tickets")
        .select("status")
        .where("id", "=", first.ticketId)
        .executeTakeFirstOrThrow();
      expect(ticket.status).toBe("open");

      // Verify system follow-up was created for reopen
      const followups = await db
        .selectFrom("followups")
        .selectAll()
        .where("ticket_id", "=", first.ticketId)
        .where("type", "=", "status_opened")
        .execute();
      expect(followups.length).toBeGreaterThanOrEqual(1);
    });

    it("creates ticket with zero wraps when no volunteers have vol_public", async () => {
      // Create a queue with no assigned volunteers
      const emptyQueue = await createTestQueue(db, { label: "Empty" });
      const clientId = await createClient();

      const result = await resolveOrCreateTicket(
        db,
        clientId,
        emptyQueue.id,
        Buffer.from("title"),
        Buffer.from("desc"),
      );

      expect(result.isNew).toBe(true);
      expect(result.tk).not.toBeNull();

      const wraps = await db
        .selectFrom("ticket_key_wraps")
        .selectAll()
        .where("ticket_id", "=", result.ticketId)
        .execute();
      expect(wraps).toHaveLength(0);

      const sodium = await getSodium();
      sodium.memzero(result.tk!);
    });

    it("encrypted title and description decrypt with the returned tk", async () => {
      const clientId = await createClient();
      const titleText = "SMS from calm-pebble-7";
      const descText = "Inbound SMS";

      const result = await resolveOrCreateTicket(
        db,
        clientId,
        queueId,
        Buffer.from(titleText),
        Buffer.from(descText),
      );

      expect(result.tk).not.toBeNull();

      const ticket = await db
        .selectFrom("tickets")
        .select(["encrypted_title", "encrypted_description"])
        .where("id", "=", result.ticketId)
        .executeTakeFirstOrThrow();

      const decTitle = decryptContent(
        new Uint8Array(ticket.encrypted_title) as ReturnType<
          typeof encryptContent
        >,
        result.tk!,
        buildContentAad(result.ticketId, "title"),
      );

      const decDesc = decryptContent(
        new Uint8Array(ticket.encrypted_description) as ReturnType<
          typeof encryptContent
        >,
        result.tk!,
        buildContentAad(result.ticketId, "description"),
      );

      expect(Buffer.from(decTitle).toString("utf-8")).toBe(titleText);
      expect(Buffer.from(decDesc).toString("utf-8")).toBe(descText);

      const sodium = await getSodium();
      sodium.memzero(result.tk!);
    });
  },
);
