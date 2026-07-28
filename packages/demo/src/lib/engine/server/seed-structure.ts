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
    })
    .execute();

  const sealedBox = createSealedBoxEncryptor(orgPublicKey);

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

  // 9. Clients
  for (let i = 0; i < NUM_SEED_CLIENTS; i++) {
    let created = false;
    for (let attempt = 0; attempt < 5 && !created; attempt++) {
      const alias = generateAlias();
      try {
        await tenantDb
          .insertInto("clients")
          .values({ alias, phone_id: phoneId })
          .execute();
        created = true;
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("unique")) {
          continue;
        }
        throw err;
      }
    }
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

  return {
    orgId,
    adminUserId,
    orgPublicKey,
    orgSecretKey,
    queueIds,
  };
}
