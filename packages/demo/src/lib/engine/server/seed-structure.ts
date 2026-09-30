/**
 * Structural seed for the demo org, run by the Node seed snapshot builder
 * before it replays the shared seed data through the product's endpoints.
 *
 * Writes what the replay neither creates nor wipes: the org and its keys,
 * org config, the admin with its 2FA methods, the roster people, the
 * telephony config, SMS templates and the blocklist entry. Ports those
 * inserts from packages/server/src/scripts/seed.ts without any
 * process/env/sodium-native usage, using the shimmed sealed-box and
 * secrets encryptors. The builder writes the greetings and the
 * deactivated roster people's queue memberships after the replay, with
 * {@link seedPhoneGreetings} and {@link assignRosterQueues}.
 *
 * The admin user gets a REAL Argon2id password hash (produced by the
 * product's password hasher over the sodium-native shim) for password
 * "DemoPassword2026" so that login verification exercises seed-vs-login
 * self-consistency.
 * Credentials match the LoginMount prefill (jdoe / DemoPassword2026).
 */

import { DemoEngineError } from "../errors.js";
import _sodium from "libsodium-wrappers-sumo";
import type { Kysely } from "kysely";
import { RoleId, type RoleIdValue } from "@care-y/shared";
import type {
  OrgId,
  OrgSlug,
  OrgSchema,
  UserId,
  QueueId,
  IdentifierHash,
  PasswordHash,
  PhoneHash,
  WebauthnCredentialId,
  PhoneSid,
  E164,
  BlobKey,
} from "@care-y/shared";
import type {
  TenantDatabase,
  PlatformDatabase,
} from "../../../../../server/src/db/types.js";
import type { FieldEncryptor, BlindIndexer } from "./field-encryptor-shim.js";
import type { SecretsEncryptor } from "./secrets-shim.js";
import type { SessionTokenizer } from "../../../../../server/src/crypto/session-tokenizer.js";
import type { BlobStore } from "../../../../../server/src/storage/store.js";
import { createSealedBoxEncryptor } from "./sealed-box-shim.js";
import { DEMO_ORG_NAME } from "./org-identity.js";

export const DEMO_ORG_SLUG = "demo-org" as OrgSlug;
export const DEMO_ORG_SCHEMA = "demo_org" as OrgSchema;
export const DEMO_ADMIN_IDENTIFIER = "jdoe";
export const DEMO_ADMIN_PASSWORD = "DemoPassword2026";
export const DEMO_ADMIN_DISPLAY_NAME = "Demo User";

// Credentials for the seeded client portal account. These ship in the
// published bundle the same way the admin pair does, which is acceptable
// only because the data is synthetic and the database is per-visitor and
// in-browser. They must never match a credential used by a real org.
export const DEMO_CLIENT_USERNAME = "riverbend";
export const DEMO_CLIENT_PASSWORD = "DemoPortal2026";

export interface SeedStructureResult {
  readonly orgId: OrgId;
  readonly adminUserId: UserId;
  readonly orgPublicKey: Buffer;
  readonly orgSecretKey: Buffer;
  /** User IDs for seeded roster volunteers (excludes admin). */
  readonly rosterUserIds: readonly UserId[];
}

export interface SeedStructureDeps {
  readonly platformDb: Kysely<PlatformDatabase>;
  readonly tenantDb: Kysely<TenantDatabase>;
  readonly encryptor: FieldEncryptor;
  readonly indexer: BlindIndexer;
  readonly secretsEncryptor: SecretsEncryptor;
  readonly hasher: { hash(password: string): Promise<string> };
  readonly tokenizer: SessionTokenizer;
}

/**
 * The demo org's name and colors. The seed replay sets its own branding,
 * so the snapshot builder re-applies these after it.
 */
export const DEMO_BRANDING = {
  name: DEMO_ORG_NAME,
  primaryColor: "#4A6FA5",
  accentColor: "#E07A5F",
} as const;

/** The queue names, in the order the replay creates them. */
const DEMO_QUEUE_NAMES = ["Intake", "Crisis", "Housing"] as const;

/** One of the demo's roster people, besides the admin. */
export interface DemoRosterMember {
  readonly identifier: string;
  readonly displayName: string;
  readonly roleId: RoleIdValue;
  readonly active: boolean;
  /** Queue memberships, by index into {@link DEMO_QUEUE_NAMES}. */
  readonly queueIndices: readonly number[];
}

/**
 * The demo's roster people. They are directory entries only, with no
 * keys, 2FA or phone. The snapshot builder hands the seed replay's
 * tickets to the active ones.
 */
export const DEMO_ROSTER: readonly DemoRosterMember[] = [
  {
    identifier: "mgarcia",
    displayName: "Maria Garcia",
    roleId: RoleId.MANAGER,
    active: true,
    queueIndices: [0, 1, 2],
  },
  {
    identifier: "tchen",
    displayName: "Tao Chen",
    roleId: RoleId.VOLUNTEER,
    active: true,
    queueIndices: [0, 1],
  },
  {
    identifier: "abrown",
    displayName: "Aisha Brown",
    roleId: RoleId.VOLUNTEER,
    active: true,
    queueIndices: [2],
  },
  {
    identifier: "jmiller",
    displayName: "Jordan Miller",
    roleId: RoleId.VOLUNTEER,
    active: false,
    queueIndices: [0],
  },
  {
    identifier: "rkhan",
    displayName: "Ravi Khan",
    roleId: RoleId.VOLUNTEER,
    active: true,
    queueIndices: [1, 2],
  },
];

export async function seedStructure(
  deps: SeedStructureDeps,
): Promise<SeedStructureResult> {
  const { platformDb, tenantDb, encryptor, indexer, secretsEncryptor, hasher } =
    deps;

  // 1. Insert org into platform table
  const orgId = globalThis.crypto.randomUUID() as OrgId;
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
      // Left undismissed so the dashboard's getting started checklist
      // renders; the handbook narrates it and visitors can dismiss it
      // themselves (the write lands in the in-browser PGlite only).
      getting_started_dismissed_at: null,
      // Seed a retention policy so RetentionSection renders its active
      // path with a populated days input (365 days is a common baseline).
      pii_retention_days: 365,
    })
    .execute();

  const sealedBox = createSealedBoxEncryptor(orgPublicKey, 1);

  // 3b. Update org_config with branding/general config fields.
  // OrgGeneralSection reads name, default_language, default_country_code.
  // BrandingSection reads primary_color, accent_color, client_text.
  // Branding columns are plaintext (ADR-094); terminology stays sealed.
  await tenantDb
    .updateTable("org_config")
    .set({
      default_language: "en",
      default_country_code: "US",
      client_text:
        "If you or someone you know needs help, please call our support line. All calls are confidential.",
    })
    .execute();
  await applyDemoBranding(tenantDb);

  // 4. Create admin user
  const passwordHash = (await hasher.hash(DEMO_ADMIN_PASSWORD)) as PasswordHash;
  const identifierHash = indexer.hash(
    DEMO_ADMIN_IDENTIFIER,
    orgId,
  ) as IdentifierHash;
  const adminUserId = globalThis.crypto.randomUUID() as UserId;

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
      credential_id: Buffer.from("demo-webauthn-credential").toString(
        "base64",
      ) as WebauthnCredentialId,
      public_key: Buffer.from("demo-webauthn-public-key").toString("base64"),
      transports: ["internal"],
      device_type: "platform",
      backed_up: true,
      aaguid: null,
      ordinal: 1,
      algorithm: "ES256",
    })
    .execute();

  // 6. Roster users (directory entries only, no keys/2FA/phone). The
  // replay creates the queues and gives the active ones their queues.
  const rosterUserIds: UserId[] = [];

  for (const def of DEMO_ROSTER) {
    const userId = globalThis.crypto.randomUUID() as UserId;

    // UsersTable exposes no created_at column (the DB default applies),
    // so roster rows cannot carry varied creation dates.
    await tenantDb
      .insertInto("users")
      .values({
        id: userId,
        identifier_hash: indexer.hash(def.identifier, orgId) as IdentifierHash,
        encrypted_identifier: sealedBox.seal(def.identifier),
        encrypted_display_name: sealedBox.seal(def.displayName),
        role_id: def.roleId,
        password_hash: passwordHash,
        is_active: def.active,
        has_seen_briefing: true,
      })
      .execute();

    rosterUserIds.push(userId);
  }

  // 7. Telephony config. TelephonyConfigSection reads telephonyAdmin.getConfig
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
      phone_outbound_sid: DEMO_PHONES[0].sid as PhoneSid,
      phone_system_sid: DEMO_PHONES[1].sid as PhoneSid,
    })
    .execute();

  // 8. SMS response templates (SmsTemplatesSection lists per type and
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
      text: "Recibimos su mensaje. Un voluntario le contactará pronto.",
    },
    {
      response_type: "after_hours",
      locale: "en",
      text: "Our support line is currently closed. We will respond during the next available shift.",
    },
    {
      response_type: "after_hours",
      locale: "es",
      text: "Nuestra línea de apoyo está cerrada en este momento. Responderemos durante el próximo turno disponible.",
    },
    {
      response_type: "new_client",
      locale: "en",
      text: "Welcome to Handbook Example Org. Reply HELP for a list of commands, or a volunteer will reach out shortly.",
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

  // 9. Phone blocklist (one entry so auth.hubBlocklistCount is non-zero)
  await tenantDb
    .insertInto("phone_blocklist")
    .values({
      phone_hash: indexer.hash("+15559990000", orgId) as PhoneHash,
      encrypted_number: encryptor.encrypt("+15559990000"),
      added_by: adminUserId,
    })
    .execute();

  return {
    orgId,
    adminUserId,
    orgPublicKey,
    orgSecretKey,
    rosterUserIds,
  };
}

/**
 * Write the org's line greetings. The Crisis line's English answer
 * greeting is the audio row, playing `greetingAudioEn`.
 */
export async function seedPhoneGreetings(
  tenantDb: Kysely<TenantDatabase>,
  blobStore: BlobStore,
  greetingAudioEn: { readonly bytes: Uint8Array },
): Promise<void> {
  // GreetingsSection lists per phone, grouped by type.
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
      text: "Thank you for calling Handbook Example Org. All calls are confidential.",
      is_audio: false,
      audio_blob_key: null,
      audio_content_type: null,
    },
    {
      phone_number: "+15550001234",
      greeting_type: "answer",
      locale: "es",
      text: "Gracias por llamar a Handbook Example Org. Todas las llamadas son confidenciales.",
      is_audio: false,
      audio_blob_key: null,
      audio_content_type: null,
    },
    {
      phone_number: "+15550001234",
      greeting_type: "language_prompt",
      locale: "en",
      text: "For English, press 1. Para español, oprima el 2.",
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
    // Crisis line greetings. The English answer greeting is the audio
    // row pushed below; Spanish is text.
    {
      phone_number: "+15550005678",
      greeting_type: "answer",
      locale: "es",
      text: "Ha llamado a nuestra línea de crisis. Un voluntario capacitado está disponible para ayudarle.",
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

  // Greeting audio is NOT encrypted (stored as raw audio in the blob store,
  // served via a public HTTP handler at /api/greetings/<blobKey>).
  const audioBlobKey = await blobStore.put(
    DEMO_ORG_SCHEMA,
    "greeting",
    Buffer.from(greetingAudioEn.bytes),
  );
  greetings.push({
    phone_number: "+15550005678",
    greeting_type: "answer",
    locale: "en",
    text: "",
    is_audio: true,
    audio_blob_key: audioBlobKey,
    audio_content_type: "audio/mp4",
  });

  for (const g of greetings) {
    // phone_greetings.phone_number is the org's own inbound line (migration
    // 054), operational config rather than client PII, and plaintext by
    // design. The demo value is a fixture number.
    await tenantDb
      // care-y-ignore-next-line no-plaintext-db-write -- org line number, not client PII
      .insertInto("phone_greetings")
      // care-y-ignore-next-line no-plaintext-db-write -- org line number, not client PII
      .values({
        // care-y-ignore-next-line ast-pii-in-db-write -- org line number, not client PII
        phone_number: g.phone_number as E164,
        greeting_type: g.greeting_type,
        locale: g.locale,
        text: g.text,
        is_audio: g.is_audio,
        audio_blob_key: (g.audio_blob_key ?? undefined) as
          BlobKey | null | undefined,
        audio_content_type: g.audio_content_type,
      })
      .execute();
  }
}

/** Set the demo org's name and colors on org_config. */
export async function applyDemoBranding(
  tenantDb: Kysely<TenantDatabase>,
): Promise<void> {
  // Branding columns are plaintext (ADR-094).
  await tenantDb
    .updateTable("org_config")
    .set({
      // care-y-ignore-next-line ast-pii-in-db-write -- plaintext branding column (ADR-094)
      name: DEMO_BRANDING.name,
      primary_color: DEMO_BRANDING.primaryColor,
      accent_color: DEMO_BRANDING.accentColor,
    })
    .execute();
}

/**
 * Give the roster users their queue memberships. `rosterUserIds` lists
 * the users in {@link DEMO_ROSTER} order and `queueIds` lists the three
 * queues in Intake, Crisis, Housing order. `include` limits the members
 * written, for a caller whose seed already added the others.
 */
export async function assignRosterQueues(
  tenantDb: Kysely<TenantDatabase>,
  rosterUserIds: readonly UserId[],
  queueIds: readonly QueueId[],
  include: (member: DemoRosterMember) => boolean = () => true,
): Promise<void> {
  if (queueIds.length !== DEMO_QUEUE_NAMES.length) {
    throw new DemoEngineError(
      `Expected ${String(DEMO_QUEUE_NAMES.length)} queues, found ${String(queueIds.length)}`,
    );
  }
  if (rosterUserIds.length !== DEMO_ROSTER.length) {
    throw new DemoEngineError(
      `Expected ${String(DEMO_ROSTER.length)} roster users, found ${String(rosterUserIds.length)}`,
    );
  }
  for (const [i, member] of DEMO_ROSTER.entries()) {
    if (!include(member)) continue;
    const userId = rosterUserIds.at(i);
    if (userId === undefined) {
      throw new DemoEngineError(`rosterUserIds missing index ${String(i)}`);
    }
    for (const qIdx of member.queueIndices) {
      const qId = queueIds.at(qIdx);
      if (qId === undefined) {
        throw new DemoEngineError(`queueIdList missing index ${String(qIdx)}`);
      }
      await tenantDb
        .insertInto("queue_assignments")
        .values({
          queue_id: qId,
          user_id: userId,
        })
        .execute();
    }
  }
}
