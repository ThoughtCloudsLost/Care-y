/**
 * Structural seed for the demo org.
 *
 * Ports the org/queues/roles/admin-user inserts from
 * packages/server/src/scripts/seed.ts without any process/env/sodium-native
 * usage. Uses the shimmed sealed-box and secrets encryptors.
 *
 * The admin user gets a REAL scrypt password hash (produced by the shimmed
 * scrypt-hash.ts via the node-crypto-shim) for password "DemoPassword2026"
 * so that login verification exercises shim-vs-seed self-consistency.
 * Credentials match the LoginMount prefill (jdoe / DemoPassword2026).
 */

import { DemoEngineError } from "../errors.js";
import _sodium from "libsodium-wrappers-sumo";
import type { Kysely } from "kysely";
import { RoleId } from "@care-y/shared";
import type {
  TenantDatabase,
  PlatformDatabase,
} from "../../../../../server/src/db/types.js";
import type { FieldEncryptor, BlindIndexer } from "./field-encryptor-shim.js";
import type { SecretsEncryptor } from "./secrets-shim.js";
import type { SessionTokenizer } from "../../../../../server/src/crypto/session-tokenizer.js";
import type { BlobStore } from "../../../../../server/src/storage/store.js";
import { createSealedBoxEncryptor } from "./sealed-box-shim.js";
import { randomInt } from "./node-crypto-shim.js";

export const DEMO_ORG_SLUG = "demo-org";
export const DEMO_ORG_SCHEMA = "demo_org";
export const DEMO_ADMIN_IDENTIFIER = "jdoe";
export const DEMO_ADMIN_PASSWORD = "DemoPassword2026";
export const DEMO_ADMIN_DISPLAY_NAME = "Demo Admin";
export const NUM_SEED_CLIENTS = 30; // Fewer than prod seed (120) for speed

export interface SeedStructureResult {
  readonly orgId: string;
  readonly adminUserId: string;
  readonly orgPublicKey: Buffer;
  readonly orgSecretKey: Buffer;
  readonly queueIds: Map<string, string>;
  /** User IDs for seeded roster volunteers (excludes admin). */
  readonly rosterUserIds: readonly string[];
}

export interface SeedStructureDeps {
  readonly platformDb: Kysely<PlatformDatabase>;
  readonly tenantDb: Kysely<TenantDatabase>;
  readonly encryptor: FieldEncryptor;
  readonly indexer: BlindIndexer;
  readonly secretsEncryptor: SecretsEncryptor;
  readonly hasher: { hash(password: string): Promise<string> };
  readonly tokenizer: SessionTokenizer;
  /** Optional blob store. When absent, blob-backed rows (audio greetings, quarantine) are skipped. */
  readonly blobStore?: BlobStore;
}

// Word lists for alias generation (subset of server alias-generator)
const ADJECTIVES = [
  "bright",
  "calm",
  "clear",
  "cool",
  "crisp",
  "dawn",
  "deep",
  "fair",
  "firm",
  "fleet",
  "fresh",
  "full",
  "glad",
  "green",
  "hale",
  "keen",
];
const NOUNS = [
  "aspen",
  "birch",
  "brook",
  "cedar",
  "cliff",
  "cloud",
  "cove",
  "creek",
  "dove",
  "elm",
  "fern",
  "frost",
  "glen",
  "hawk",
  "hill",
  "jade",
];

function generateAlias(): string {
  const adjIdx = randomInt(ADJECTIVES.length);
  const adj = ADJECTIVES.at(adjIdx);
  if (adj === undefined) {
    throw new DemoEngineError(`ADJECTIVES missing index ${String(adjIdx)}`);
  }
  const nounIdx = randomInt(NOUNS.length);
  const noun = NOUNS.at(nounIdx);
  if (noun === undefined) {
    throw new DemoEngineError(`NOUNS missing index ${String(nounIdx)}`);
  }
  const num = randomInt(1, 100);
  return `${adj}-${noun}-${String(num)}`;
}

export async function seedStructure(
  deps: SeedStructureDeps,
): Promise<SeedStructureResult> {
  const { platformDb, tenantDb, encryptor, indexer, secretsEncryptor, hasher } =
    deps;

  // 1. Insert org into platform table
  const orgId = globalThis.crypto.randomUUID();
  await platformDb
    .insertInto("orgs")
    .values({
      id: orgId,
      slug: DEMO_ORG_SLUG,
      schema_name: DEMO_ORG_SCHEMA,
      is_active: true,
    })
    .execute();

  // 2. Generate org keypair (kept for the demo, not zeroed)
  const kp = _sodium.crypto_box_keypair();
  const orgPublicKey = Buffer.from(kp.publicKey);
  const orgSecretKey = Buffer.from(kp.privateKey);

  // 3. Insert org_config row with org_public_key and setup_completed.
  // The migration creates the table but does not insert a row; in
  // production the org service inserts a default. The demo skips the
  // org service, so we insert directly.
  await tenantDb
    .insertInto("org_config")
    .values({
      org_public_key: orgPublicKey,
      setup_completed: true,
      getting_started_dismissed_at: new Date(),
    })
    .execute();

  const sealedBox = createSealedBoxEncryptor(orgPublicKey);

  // 3b. Update org_config with branding/general config fields.
  // OrgGeneralSection reads encrypted_name, default_language, default_country_code.
  // BrandingSection reads encrypted_primary_color, encrypted_accent_color,
  // encrypted_client_text, encrypted_terminology.
  await tenantDb
    .updateTable("org_config")
    .set({
      encrypted_name: sealedBox.seal("Harbor Support"),
      default_language: "en",
      default_country_code: "US",
      encrypted_primary_color: sealedBox.seal("#4A6FA5"),
      encrypted_accent_color: sealedBox.seal("#E07A5F"),
      encrypted_client_text: sealedBox.seal(
        "If you or someone you know needs help, please call our support line. All calls are confidential.",
      ),
    })
    .execute();

  // 4. Create admin user
  const passwordHash = await hasher.hash(DEMO_ADMIN_PASSWORD);
  const identifierHash = indexer.hash(DEMO_ADMIN_IDENTIFIER, orgId);
  const adminUserId = globalThis.crypto.randomUUID();

  await tenantDb
    .insertInto("users")
    .values({
      id: adminUserId,
      identifier_hash: identifierHash,
      encrypted_identifier: sealedBox.seal(DEMO_ADMIN_IDENTIFIER),
      encrypted_display_name: sealedBox.seal(DEMO_ADMIN_DISPLAY_NAME),
      role_id: RoleId.ADMIN,
      password_hash: passwordHash,
      is_active: true,
      // Without this the real login flow routes to the /complete
      // onboarding page after key derivation, which the demo router
      // has no mapping for, stranding the phone on the login feature.
      has_seen_briefing: true,
    })
    .execute();

  // 5. Enroll all 2FA method types for the admin user.
  // This makes auth.login return requiresTwoFactor: true with
  // enrolledMethods containing all five canonical types (webauthn,
  // totp, email, sms, push). Backup codes are UI-only, not a
  // method_type row.
  const twoFactorMethodTypes = [
    "webauthn",
    "totp",
    "email",
    "sms",
    "push",
  ] as const;
  for (const methodType of twoFactorMethodTypes) {
    await tenantDb
      .insertInto("two_factor_methods")
      .values({
        user_id: adminUserId,
        method_type: methodType,
        is_active: true,
      })
      .execute();
  }

  // 5b. WebAuthn credential row. twoFactor.status derives its webauthn
  // entries from webauthn_credentials, not from the method_type row, so
  // without this the enrolled-methods list shows 4 of the 5 seeded
  // methods. Fake credential bytes, computed (never pasted) per the
  // no-baked-literals rule.
  await tenantDb
    .insertInto("webauthn_credentials")
    .values({
      user_id: adminUserId,
      credential_id: Buffer.from("demo-webauthn-credential").toString("base64"),
      public_key: Buffer.from("demo-webauthn-public-key").toString("base64"),
      transports: ["internal"],
      device_type: "platform",
      backed_up: true,
      aaguid: null,
      ordinal: 1,
    })
    .execute();

  // 6. Phone record
  const phoneId = globalThis.crypto.randomUUID();
  await tenantDb
    .insertInto("phones")
    .values({
      id: phoneId,
      phone_hash: indexer.hash("+15550001234", orgId),
      encrypted_number: encryptor.encrypt("+15550001234"),
      locale: "en",
    })
    .execute();

  // 7. Queues
  const seedQueues = [
    { name: "Intake", color: "blue", icon: "phone" },
    { name: "Crisis", color: "red", icon: "triangle-alert" },
    { name: "Housing", color: "green", icon: "house" },
  ];
  const queueIds = new Map<string, string>();

  for (let i = 0; i < seedQueues.length; i++) {
    const entry = seedQueues.at(i);
    if (entry === undefined) {
      throw new DemoEngineError(`seedQueues missing index ${String(i)}`);
    }
    const { name, color, icon } = entry;
    const sortOrder = i + 1;

    const inserted = await tenantDb
      .insertInto("queues")
      .values({
        encrypted_name: sealedBox.seal(name),
        encrypted_color: sealedBox.seal(color),
        encrypted_icon: sealedBox.seal(icon),
        sort_order: sortOrder,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    queueIds.set(name, inserted.id);
  }

  // 8. Queue assignments: admin -> all queues
  for (const [, qId] of queueIds) {
    await tenantDb
      .insertInto("queue_assignments")
      .values({ queue_id: qId, user_id: adminUserId })
      .execute();
  }

  // 8b. Roster users (directory entries only, no keys/2FA/phone)
  const rosterDefs = [
    {
      identifier: "mgarcia",
      displayName: "Maria Garcia",
      role: RoleId.MANAGER,
      active: true,
    },
    {
      identifier: "tchen",
      displayName: "Tao Chen",
      role: RoleId.VOLUNTEER,
      active: true,
    },
    {
      identifier: "abrown",
      displayName: "Aisha Brown",
      role: RoleId.VOLUNTEER,
      active: true,
    },
    {
      identifier: "jmiller",
      displayName: "Jordan Miller",
      role: RoleId.VOLUNTEER,
      active: false,
    },
    {
      identifier: "rkhan",
      displayName: "Ravi Khan",
      role: RoleId.VOLUNTEER,
      active: true,
    },
  ] as const;

  const rosterUserIds: string[] = [];

  for (let i = 0; i < rosterDefs.length; i++) {
    const def = rosterDefs.at(i);
    if (def === undefined) {
      throw new DemoEngineError(`rosterDefs missing index ${String(i)}`);
    }
    const userId = globalThis.crypto.randomUUID();

    // UsersTable exposes no created_at column (the DB default applies),
    // so roster rows cannot carry varied creation dates.
    await tenantDb
      .insertInto("users")
      .values({
        id: userId,
        identifier_hash: indexer.hash(def.identifier, orgId),
        encrypted_identifier: sealedBox.seal(def.identifier),
        encrypted_display_name: sealedBox.seal(def.displayName),
        role_id: def.role,
        password_hash: passwordHash,
        is_active: def.active,
        has_seen_briefing: true,
      })
      .execute();

    rosterUserIds.push(userId);
  }

  // 8c. Queue assignments for roster users (varied, some in multiple queues)
  const queueIdList = [...queueIds.values()];
  // roster user 0 (manager): all queues
  // roster user 1: Intake + Crisis
  // roster user 2: Housing only
  // roster user 3 (inactive): Intake only
  // roster user 4: Crisis + Housing
  const rosterQueueMap: readonly number[][] = [
    [0, 1, 2],
    [0, 1],
    [2],
    [0],
    [1, 2],
  ];
  for (let i = 0; i < rosterQueueMap.length; i++) {
    const queueIndices = rosterQueueMap.at(i);
    if (queueIndices === undefined) {
      throw new DemoEngineError(`rosterQueueMap missing index ${String(i)}`);
    }
    const userId = rosterUserIds.at(i);
    if (userId === undefined) {
      throw new DemoEngineError(`rosterUserIds missing index ${String(i)}`);
    }
    for (let j = 0; j < queueIndices.length; j++) {
      const qIdx = queueIndices.at(j);
      if (qIdx === undefined) {
        throw new DemoEngineError(`queueIndices missing index ${String(j)}`);
      }
      const qId = queueIdList.at(qIdx);
      if (qId === undefined) {
        throw new DemoEngineError(`queueIdList missing index ${String(qIdx)}`);
      }
      await tenantDb
        .insertInto("queue_assignments")
        .values({ queue_id: qId, user_id: userId })
        .execute();
    }
  }

  // 9. Clients. Aliases are org-tier sealed (clients.encrypted_alias);
  // alias_hash stays null, which the blind-index design allows for
  // server-side write paths, and the sealed ciphertext carries no
  // unique constraint, so no retry loop is needed.
  for (let i = 0; i < NUM_SEED_CLIENTS; i++) {
    const alias = generateAlias();
    await tenantDb
      .insertInto("clients")
      .values({ encrypted_alias: sealedBox.seal(alias), phone_id: phoneId })
      .execute();
  }

  // 10. KB categories
  const kbCategoryNames = ["Procedures", "Resources", "Safety"];
  for (let i = 0; i < kbCategoryNames.length; i++) {
    const name = kbCategoryNames.at(i);
    if (name === undefined) {
      throw new DemoEngineError(`kbCategoryNames missing index ${String(i)}`);
    }
    const sortOrder = i + 1;
    await tenantDb
      .insertInto("kb_categories")
      .values({ encrypted_name: sealedBox.seal(name), sort_order: sortOrder })
      .execute();
  }

  // 11. Default note types
  const { seedDefaultNoteTypes } =
    await import("../../../../../server/src/tickets/note-type-service.js");
  await seedDefaultNoteTypes(tenantDb, sealedBox, secretsEncryptor);

  // 12. Telephony config. TelephonyConfigSection reads telephonyAdmin.getConfig
  // which calls configService.getMaskedConfig, which calls providerFactory.getProvider.
  // The provider decrypts telephony_config.config via the secretsEncryptor.
  // Production shape: mode "byot", accountSid, authToken, phoneNumbers array.
  const DEMO_PHONES = [
    {
      number: "+15550001234",
      sid: "PN" + "demo0001234".padEnd(32, "0"),
      label: "Main Line",
      friendlyName: "Main Line (+1 555-000-1234)",
    },
    {
      number: "+15550005678",
      sid: "PN" + "demo0005678".padEnd(32, "0"),
      label: "Crisis Line",
      friendlyName: "Crisis Line (+1 555-000-5678)",
    },
  ] as const;

  const telephonyConfigObj = {
    mode: "byot" as const,
    accountSid: "AC" + "demo555".padEnd(32, "0"),
    authToken: "demo_auth_token_" + "0".repeat(16),
    phoneNumbers: DEMO_PHONES.map((p) => ({
      number: p.number,
      sid: p.sid,
      label: p.label,
      friendlyName: p.friendlyName,
    })),
  };
  const telephonyConfigPlain = Buffer.from(
    JSON.stringify(telephonyConfigObj),
    "utf-8",
  );
  const telephonyConfigSealed = secretsEncryptor.encrypt(telephonyConfigPlain);
  telephonyConfigPlain.fill(0);

  await platformDb
    .insertInto("telephony_config")
    .values({
      org_id: orgId,
      provider: "twilio",
      config: telephonyConfigSealed,
    })
    .execute();

  // Set phone purpose SIDs in org_config (outbound and system)
  await tenantDb
    .updateTable("org_config")
    .set({
      phone_outbound_sid: DEMO_PHONES[0].sid,
      phone_system_sid: DEMO_PHONES[1].sid,
    })
    .execute();

  // 13. Phone greetings (GreetingsSection lists per phone, grouped by type).
  // Columns rendered: phone_number, greeting_type, locale, text, is_audio,
  // audio_blob_key, audio_content_type.
  const greetings: {
    phone_number: string;
    greeting_type: string;
    locale: string;
    text: string;
    is_audio: boolean;
    audio_blob_key: string | null;
    audio_content_type: string | null;
  }[] = [
    // Main line greetings
    {
      phone_number: "+15550001234",
      greeting_type: "answer",
      locale: "en",
      text: "Thank you for calling Harbor Support. Your call is important to us.",
      is_audio: false,
      audio_blob_key: null,
      audio_content_type: null,
    },
    {
      phone_number: "+15550001234",
      greeting_type: "answer",
      locale: "es",
      text: "Gracias por llamar a Harbor Support. Su llamada es importante para nosotros.",
      is_audio: false,
      audio_blob_key: null,
      audio_content_type: null,
    },
    {
      phone_number: "+15550001234",
      greeting_type: "language_prompt",
      locale: "en",
      text: "For English, press 1. Para espanol, oprima el 2.",
      is_audio: false,
      audio_blob_key: null,
      audio_content_type: null,
    },
    {
      phone_number: "+15550001234",
      greeting_type: "new_client",
      locale: "en",
      text: "Welcome. A volunteer will be with you shortly. All calls are confidential.",
      is_audio: false,
      audio_blob_key: null,
      audio_content_type: null,
    },
    {
      phone_number: "+15550001234",
      greeting_type: "existing_client",
      locale: "en",
      text: "Welcome back. We are connecting you now.",
      is_audio: false,
      audio_blob_key: null,
      audio_content_type: null,
    },
    {
      phone_number: "+15550001234",
      greeting_type: "staff_menu",
      locale: "en",
      text: "Staff menu. Press 1 to check messages. Press 2 for the volunteer directory.",
      is_audio: false,
      audio_blob_key: null,
      audio_content_type: null,
    },
    // Crisis line greetings
    {
      phone_number: "+15550005678",
      greeting_type: "answer",
      locale: "en",
      text: "You have reached the Harbor crisis line. A trained volunteer is available to help.",
      is_audio: false,
      audio_blob_key: null,
      audio_content_type: null,
    },
    {
      phone_number: "+15550005678",
      greeting_type: "new_client",
      locale: "en",
      text: "Please stay on the line. You will be connected to a volunteer shortly.",
      is_audio: false,
      audio_blob_key: null,
      audio_content_type: null,
    },
  ];

  // Generate an audio greeting if a blob store is available.
  // E4 precedent: compute binary content in code, never commit blobs.
  // Greeting audio is NOT encrypted (stored as raw audio in the blob store,
  // served via a public HTTP handler at /api/greetings/<blobKey>).
  if (deps.blobStore !== undefined) {
    const audioWav = generateMinimalWav();
    const audioBlobKey = await deps.blobStore.put(
      DEMO_ORG_SCHEMA,
      "greeting",
      Buffer.from(audioWav),
    );
    greetings.push({
      phone_number: "+15550005678",
      greeting_type: "answer",
      locale: "es",
      text: "",
      is_audio: true,
      audio_blob_key: audioBlobKey,
      audio_content_type: "audio/wav",
    });
  }

  for (const g of greetings) {
    await tenantDb
      .insertInto("phone_greetings")
      .values({
        phone_number: g.phone_number,
        greeting_type: g.greeting_type,
        locale: g.locale,
        text: g.text,
        is_audio: g.is_audio,
        audio_blob_key: g.audio_blob_key,
        audio_content_type: g.audio_content_type,
      })
      .execute();
  }

  // 14. SMS response templates (SmsTemplatesSection lists per type and
  // renders the response_type, locale, and text columns).
  const smsTemplates = [
    {
      response_type: "auto_reply",
      locale: "en",
      text: "We received your message. A volunteer will follow up soon.",
    },
    {
      response_type: "auto_reply",
      locale: "es",
      text: "Recibimos su mensaje. Un voluntario le contactara pronto.",
    },
    {
      response_type: "after_hours",
      locale: "en",
      text: "Our support line is currently closed. We will respond during the next available shift.",
    },
    {
      response_type: "after_hours",
      locale: "es",
      text: "Nuestra linea de apoyo esta cerrada en este momento. Responderemos durante el proximo turno disponible.",
    },
    {
      response_type: "new_client",
      locale: "en",
      text: "Welcome to Harbor Support. Reply HELP for a list of commands, or a volunteer will reach out shortly.",
    },
    {
      response_type: "error",
      locale: "en",
      text: "We could not process your message. Please try again or call +1 (555) 000-1234.",
    },
  ];
  for (const t of smsTemplates) {
    await tenantDb
      .insertInto("sms_responses")
      .values({
        response_type: t.response_type,
        locale: t.locale,
        text: t.text,
      })
      .execute();
  }

  // 15. Phone blocklist (one entry so hubStatus.blocklistCount is non-zero)
  await tenantDb
    .insertInto("phone_blocklist")
    .values({
      phone_hash: indexer.hash("+15559990000", orgId),
      encrypted_number: encryptor.encrypt("+15559990000"),
      added_by: adminUserId,
    })
    .execute();

  // 16. Voicemail quarantine rows. QuarantineSection reads
  // voicemailQuarantine.list (status, reason, createdAt, durationSeconds,
  // encryptedCallerNumber, encryptedCalledNumber) and
  // voicemailQuarantine.download (sealedBase64 from blob store).
  // Production writes sealed audio via sealBufferAndZero (crypto_box_seal)
  // and caller/called via sealString (crypto_box_seal on UTF-8 Buffer).
  // Skip if no blob store (E4 precedent: metadata without bytes is worse
  // than nothing).
  if (deps.blobStore !== undefined) {
    const quarantineRows = [
      {
        recordingSid: "RE" + "demo_quarantine_1".padEnd(32, "0"),
        callSid: "CA" + "demo_qcall_1".padEnd(32, "0"),
        reason: "tracker_miss",
        callerNumber: "+15550009876",
        calledNumber: "+15550001234",
        durationSeconds: 47,
        minutesAgo: 180,
      },
      {
        recordingSid: "RE" + "demo_quarantine_2".padEnd(32, "0"),
        callSid: "CA" + "demo_qcall_2".padEnd(32, "0"),
        reason: "no_intake_queue",
        callerNumber: "+15550004321",
        calledNumber: "+15550005678",
        durationSeconds: 12,
        minutesAgo: 90,
      },
      {
        recordingSid: "RE" + "demo_quarantine_3".padEnd(32, "0"),
        callSid: "CA" + "demo_qcall_3".padEnd(32, "0"),
        reason: "unresolved_client",
        callerNumber: "+15550007777",
        calledNumber: "+15550001234",
        durationSeconds: 63,
        minutesAgo: 30,
      },
    ] as const;

    const quarantineNow = Date.now();
    for (const qr of quarantineRows) {
      // Generate a minimal valid WAV and seal it exactly as the product does:
      // crypto_box_seal on the raw audio bytes. QuarantinePlayer decrypts
      // via orgKeyManager.decrypt (crypto_box_seal_open).
      const rawAudio = Buffer.from(generateMinimalWav());
      const sealedAudio = sealedBox.sealBuffer(rawAudio);
      rawAudio.fill(0);

      const blobKey = await deps.blobStore.put(
        DEMO_ORG_SCHEMA,
        "quarantine",
        sealedAudio,
      );

      await tenantDb
        .insertInto("voicemail_quarantine")
        .values({
          recording_sid: qr.recordingSid,
          call_sid: qr.callSid,
          blob_key: blobKey,
          size_bytes: sealedAudio.length,
          duration_seconds: qr.durationSeconds,
          reason: qr.reason,
          status: "pending",
          client_id: null,
          encrypted_caller_number: sealedBox.seal(qr.callerNumber),
          encrypted_called_number: sealedBox.seal(qr.calledNumber),
          routed_ticket_id: null,
          routed_followup_id: null,
          resolved_by: null,
          resolved_at: null,
          created_at: new Date(quarantineNow - qr.minutesAgo * 60 * 1000),
        })
        .execute();
    }
  }

  return {
    orgId,
    adminUserId,
    orgPublicKey,
    orgSecretKey,
    queueIds,
    rosterUserIds,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a minimal valid WAV file (44 bytes header + 800 bytes of silence).
 * Produces a decodable audio file that AudioContext.decodeAudioData can parse.
 * 8000 Hz, 16-bit mono, 50ms of silence (400 samples = 800 bytes).
 *
 * Layout: RIFF header (12 bytes) + fmt chunk (24 bytes) + data chunk header
 * (8 bytes) + PCM samples.
 */
function generateMinimalWav(): Uint8Array {
  const sampleRate = 8000;
  const numSamples = 400; // 50ms at 8kHz
  const bitsPerSample = 16;
  const numChannels = 1;
  const bytesPerSample = bitsPerSample / 8;
  const dataSize = numSamples * numChannels * bytesPerSample;
  const fileSize = 44 + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, fileSize - 8, true); // file size minus RIFF header
  writeString(view, 8, "WAVE");

  // fmt sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // sub-chunk size (PCM = 16)
  view.setUint16(20, 1, true); // audio format (PCM = 1)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // byte rate
  view.setUint16(32, numChannels * bytesPerSample, true); // block align
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // PCM samples: all zeros = silence (already zeroed by ArrayBuffer)

  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}
