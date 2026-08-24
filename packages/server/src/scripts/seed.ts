/**
 * Dev seed script. Creates a dev org, admin user, and structural data for
 * local development.
 *
 * Idempotent: skips creation if the org or user already exists (catches
 * ConflictError from unique constraint violations rather than pre-checking).
 *
 * Generates a throwaway Curve25519 keypair for the dev org so that org
 * resolution succeeds (the context factory requires org_public_key to be
 * non-null for the sealedBox auth gate). devAutoLogin replaces this with
 * a real client-generated keypair via key rotation. The throwaway secret
 * key is zeroed immediately and never stored.
 *
 * KB articles are NOT seeded here. They are sealed client-side by
 * devAutoLogin after the real org keypair is established (matching the
 * production flow where the browser seals content with crypto_box_seal).
 *
 * Usage: pnpm seed (runs via tsx --env-file=.env)
 */

import { validateEnv, EnvValidationError } from "../env.js";
import { extractErrorMessage, ConflictError } from "../errors.js";

try {
  validateEnv();
} catch (err) {
  if (err instanceof EnvValidationError) {
    console.error(err.message);
    process.exit(1);
  }
  throw err;
}

import { RoleId, phoneSidSchema } from "@care-y/shared";
import type {
  OrgId,
  OrgSchema,
  UserId,
  PhoneId,
  QueueId,
  TicketId,
} from "@care-y/shared";
import sodium from "sodium-native";
import { db, tenantDb } from "../db/db.js";
import { getEnv } from "../env.js";
import { createOrgService } from "../org/service.js";
import { createScryptHasher } from "../auth/password.js";
import { createAuthService } from "../auth/service.js";
import { createDbSessionRepository } from "../auth/session-repository.js";
import { createSealedBoxEncryptor } from "../crypto/sealed-box.js";
import {
  deriveKeys,
  createFieldEncryptor,
  createBlindIndexer,
} from "../crypto/field-encryptor.js";
import {
  deriveSessionHmacKey,
  createSessionTokenizer,
} from "../crypto/session-tokenizer.js";
import { deriveSecretsKey, createSecretsEncryptor } from "../config/secrets.js";
import { seedDefaultNoteTypes } from "../tickets/note-type-service.js";
import { generateAlias } from "../telephony/models/alias-generator.js";
import {
  DEV_MOCK_ACCOUNT_SID,
  DEV_MOCK_AUTH_TOKEN,
} from "../telephony/mock-provider.js";
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

const ORG_SLUG = process.env.SEED_ORG_SLUG ?? "dev-org";
const ADMIN_IDENTIFIER = "admin.dev";
const ADMIN_PASSWORD = "dev-password-1234!";
const ADMIN_DISPLAY_NAME = "Dev Admin";
const ADMIN_ROLE_ID = RoleId.ADMIN;
const NUM_SEED_CLIENTS = 120;

/**
 * Generates a throwaway Curve25519 keypair and stores the public key in
 * org_config. The secret key is zeroed immediately. devAutoLogin replaces
 * this with a real client-generated keypair via org key rotation.
 *
 * Idempotent: skips if org_public_key is already set.
 */
async function ensureOrgKeypair(
  tenantDatabase: Kysely<TenantDatabase>,
): Promise<Buffer> {
  const existing = await tenantDatabase
    .selectFrom("org_config")
    .select("org_public_key")
    .executeTakeFirst();

  if (existing?.org_public_key) {
    console.log("Org keypair already exists, skipping generation.");
    return existing.org_public_key;
  }

  const pk = Buffer.alloc(sodium.crypto_box_PUBLICKEYBYTES);
  const sk = Buffer.alloc(sodium.crypto_box_SECRETKEYBYTES);
  try {
    sodium.crypto_box_keypair(pk, sk);

    await tenantDatabase
      .updateTable("org_config")
      .set({ org_public_key: pk })
      .execute();

    console.log("Generated throwaway org Curve25519 keypair (for auth gate).");
    return pk;
  } finally {
    sk.fill(0);
  }
}

async function seed(): Promise<void> {
  const env = getEnv();

  // Derive field-level encryption keys (same chain as index.ts).
  const opsKey = Buffer.from(env.OPS_SECRETS_KEY, "hex");
  const derivedKeys = deriveKeys(opsKey);
  const encryptor = createFieldEncryptor(derivedKeys.fieldEncryptKey);
  const indexer = createBlindIndexer(derivedKeys.blindIndexKey);
  const secretsEncryptor = createSecretsEncryptor(deriveSecretsKey(opsKey));
  const hasher = createScryptHasher();

  const orgService = createOrgService(db, tenantDb);

  // --- Create org ---
  let orgId: OrgId;
  let schemaName: OrgSchema;
  let setupToken: string | null = null;
  try {
    const org = await orgService.createOrg({ slug: ORG_SLUG });
    orgId = org.id;
    schemaName = org.schemaName;
    setupToken = org.setupToken;
    console.log(`Created org "${ORG_SLUG}" (${orgId})`);
  } catch (err) {
    if (err instanceof ConflictError) {
      const existing = await orgService.findBySlug(ORG_SLUG);
      if (!existing) {
        console.error(
          "Org conflict but slug not found. Database may be inconsistent.",
        );
        process.exit(1);
      }
      orgId = existing.id;
      schemaName = existing.schemaName;
      console.log(`Org "${ORG_SLUG}" already exists (${orgId}), skipping.`);
    } else {
      console.error("Failed to create org:", extractErrorMessage(err));
      process.exit(1);
    }
  }

  if (process.argv.includes("--bootstrap-only")) {
    if (setupToken) {
      console.log(`\n  Setup URL: http://localhost:5173/setup/${setupToken}\n`);
    } else {
      console.log(
        "Bootstrap complete (org already existed, no new setup token).",
      );
    }
    return;
  }

  if (process.env.SEED_SKIP_ADMIN === "1") {
    console.log(`ORG_ID=${orgId}`);
    if (setupToken) {
      console.log(`SETUP_TOKEN=${setupToken}`);
    }
    console.log(
      "SEED_SKIP_ADMIN: org created with migrations. Skipping admin, keypair, and structural data.",
    );
    return;
  }

  // --- Generate throwaway org keypair (unblocks auth gate) ---
  const tenantDatabase = tenantDb(schemaName);
  const orgPublicKey = await ensureOrgKeypair(tenantDatabase);

  // Mark setup as complete (seed bypasses the onboarding wizard)
  await tenantDatabase
    .updateTable("org_config")
    .set({ setup_completed: true })
    .execute();

  // --- Create admin user ---
  const tokenizer = createSessionTokenizer(deriveSessionHmacKey(opsKey));
  const sealedBox = createSealedBoxEncryptor(orgPublicKey);
  const sessions = createDbSessionRepository(
    tenantDatabase,
    tokenizer,
    sealedBox,
  );
  const authService = createAuthService(
    tenantDatabase,
    hasher,
    sessions,
    encryptor,
    sealedBox,
    indexer,
    tokenizer,
    orgId,
  );

  let adminUserId: UserId;
  try {
    const user = await authService.register({
      identifier: ADMIN_IDENTIFIER,
      password: ADMIN_PASSWORD,
      displayName: ADMIN_DISPLAY_NAME,
      roleId: ADMIN_ROLE_ID,
    });
    adminUserId = user.id;
    console.log(`Created admin user "${ADMIN_IDENTIFIER}" (${user.id})`);
  } catch (err) {
    if (err instanceof ConflictError) {
      const identifierHash = indexer.hashIdentifier(ADMIN_IDENTIFIER, orgId);
      const existing = await tenantDatabase
        .selectFrom("users")
        .select("id")
        .where("identifier_hash", "=", identifierHash)
        .where("is_active", "=", true)
        .executeTakeFirst();
      if (!existing) {
        console.error(
          "User conflict but identifier not found. Database may be inconsistent.",
        );
        process.exit(1);
      }
      adminUserId = existing.id;
      console.log(
        `User "${ADMIN_IDENTIFIER}" already exists (${adminUserId}), skipping.`,
      );
    } else {
      console.error("Failed to create admin user:", extractErrorMessage(err));
      process.exit(1);
    }
  }

  // --- Seed structural data (phone, queue, queue assignment, clients) ---
  // No crypto here. Tickets and key wraps are created later by the browser
  // (registerCrypto + loginCrypto) and server (devSeedTickets).

  // Phone record (encrypted via OPS_SECRETS_KEY field encryption)
  let phoneId: PhoneId;
  const existingPhone = await tenantDatabase
    .selectFrom("phones")
    .select("id")
    .where("phone_hash", "=", indexer.hashPhone("+15550001234", orgId))
    .executeTakeFirst();

  if (existingPhone) {
    phoneId = existingPhone.id;
    console.log("Phone record already exists, skipping.");
  } else {
    const inserted = await tenantDatabase
      .insertInto("phones")
      .values({
        phone_hash: indexer.hashPhone("+15550001234", orgId),
        encrypted_number: encryptor.encrypt("+15550001234"),
        locale: "en",
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    phoneId = inserted.id;
    console.log("Created dev telephony seed row.");
  }

  // Seal a plaintext string with the org public key (crypto_box_seal).
  function sealName(plaintext: string): Buffer {
    const pt = Buffer.from(plaintext, "utf8");
    const ct = Buffer.alloc(pt.length + sodium.crypto_box_SEALBYTES);
    sodium.crypto_box_seal(ct, pt, orgPublicKey);
    return ct;
  }

  const seedQueues = [
    { name: "Intake", color: "blue", icon: "phone" },
    { name: "Crisis", color: "red", icon: "triangle-alert" },
    { name: "Housing", color: "green", icon: "house" },
  ];
  const queueIds = new Map<string, QueueId>();

  for (let i = 0; i < seedQueues.length; i++) {
    const { name, color, icon } = seedQueues[i]!;
    const sortOrder = i + 1;

    // Idempotency: check by sort_order (deterministic for seed data).
    // Sealed-box ciphertext is non-deterministic so we can't match by value.
    const existing = await tenantDatabase
      .selectFrom("queues")
      .select("id")
      .where("sort_order", "=", sortOrder)
      .executeTakeFirst();

    if (existing) {
      queueIds.set(name, existing.id);
      console.log(
        `Queue "${name}" already exists (sort_order=${String(sortOrder)}), skipping.`,
      );
    } else {
      const inserted = await tenantDatabase
        .insertInto("queues")
        .values({
          encrypted_name: sealName(name),
          encrypted_color: sealName(color),
          encrypted_icon: sealName(icon),
          sort_order: sortOrder,
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      queueIds.set(name, inserted.id);
      console.log(`Created queue "${name}" (${inserted.id})`);
    }
  }

  // Queue assignments: admin -> all queues
  for (const [name, qId] of queueIds) {
    const existing = await tenantDatabase
      .selectFrom("queue_assignments")
      .select("queue_id")
      .where("queue_id", "=", qId)
      .where("user_id", "=", adminUserId)
      .executeTakeFirst();

    if (existing) {
      console.log(`Admin already assigned to "${name}", skipping.`);
    } else {
      await tenantDatabase
        .insertInto("queue_assignments")
        .values({ queue_id: qId, user_id: adminUserId })
        .execute();
      console.log(`Assigned admin to "${name}" queue.`);
    }
  }

  // Clients: generated aliases via alias-generator
  const existingClientCount = await tenantDatabase
    .selectFrom("clients")
    .select(tenantDatabase.fn.countAll<string>().as("count"))
    .executeTakeFirstOrThrow();

  const currentCount = Number(existingClientCount.count);
  if (currentCount >= NUM_SEED_CLIENTS) {
    console.log("Seed records already exist, skipping seeding.");
  } else {
    const toCreate = NUM_SEED_CLIENTS - currentCount;
    for (let i = 0; i < toCreate; i++) {
      // Generated aliases draw their suffix from a per-org sequence, so they
      // are unique by construction and need no collision retry. alias_hash is
      // null because the blind index key lives in the browser; the first
      // session to decrypt the row backfills it.
      const alias = await generateAlias(tenantDatabase);
      await tenantDatabase
        .insertInto("clients")
        .values({
          encrypted_alias: sealName(alias),
          alias_hash: null,
          phone_id: phoneId,
        })
        .execute();
    }
    // Summary rather than a line per row: the alias is sealed and the id is
    // opaque, so a per-row log costs a hundred lines and says nothing useful.
    console.log(`Seeded ${String(toCreate)} more.`);
  }

  // --- Seed KB categories (structural data, encrypted names) ---
  // KB articles are seeded client-side by devAutoLogin after the real org
  // keypair is established via rotation (articles require sealed-box encryption).
  const kbCategoryNames = ["Procedures", "Resources", "Safety"];

  for (let i = 0; i < kbCategoryNames.length; i++) {
    const name = kbCategoryNames[i]!;
    const sortOrder = i + 1;

    const existingCat = await tenantDatabase
      .selectFrom("kb_categories")
      .select("id")
      .where("sort_order", "=", sortOrder)
      .executeTakeFirst();

    if (existingCat) {
      console.log(
        `KB category "${name}" already exists (sort_order=${String(sortOrder)}), skipping.`,
      );
    } else {
      const inserted = await tenantDatabase
        .insertInto("kb_categories")
        .values({ encrypted_name: sealName(name), sort_order: sortOrder })
        .returning("id")
        .executeTakeFirstOrThrow();
      console.log(`Created KB category "${name}" (${inserted.id})`);
    }
  }

  // --- Seed default note types ---
  const existingNoteTypes = await tenantDatabase
    .selectFrom("note_types")
    .select("id")
    .limit(1)
    .executeTakeFirst();

  if (existingNoteTypes) {
    console.log("Note types already exist, skipping.");
  } else {
    await seedDefaultNoteTypes(tenantDatabase, sealedBox, secretsEncryptor);
    console.log("Seeded 4 default note types.");
  }

  // --- Seed mock telephony config ---
  // Placement: AFTER the SEED_SKIP_ADMIN early return (line 154). The e2e
  // onboarding test uses SEED_SKIP_ADMIN=1 to create an org with no telephony
  // config, then asserts the communications wizard step shows "Skip" rather
  // than "Next". Seeding telephony here keeps that org unconfigured.

  // Platform table: telephony_config (keyed by org UUID, OPS-encrypted blob).
  // Encrypt in a tight scope so the cleartext buffer is zeroed before the
  // DB write (and the variable falls out of scope).
  const telephonySealed = ((): Buffer => {
    const configObj = {
      accountSid: DEV_MOCK_ACCOUNT_SID,
      authToken: DEV_MOCK_AUTH_TOKEN,
      phoneNumbers: [
        { number: "+15550001111", sid: "PNdev001", label: "Main" },
        { number: "+15550002222", sid: "PNdev002", label: "Support" },
      ],
    };
    const buf = Buffer.from(JSON.stringify(configObj), "utf-8");
    try {
      return secretsEncryptor.encrypt(buf);
    } finally {
      buf.fill(0);
    }
  })();

  await db
    .insertInto("telephony_config")
    .values({
      org_id: orgId,
      provider: "mock",
      config: telephonySealed,
    })
    .onConflict((oc) =>
      oc.column("org_id").doUpdateSet({
        provider: "mock",
        config: telephonySealed,
        updated_at: new Date(),
      }),
    )
    .execute();
  console.log("Seeded mock telephony config (platform table).");

  // Tenant table: org_config purpose SIDs (migration 022 columns).
  // These are provider SID identifiers (e.g. "PNdev001"), not numbers.
  // care-y-ignore-next-line no-plaintext-db-write -- SIDs are opaque provider identifiers, not PII
  await tenantDatabase
    .updateTable("org_config")
    .set({
      phone_outbound_sid: phoneSidSchema.parse("PNdev001"),
      phone_system_sid: phoneSidSchema.parse("PNdev002"),
    })
    .execute();
  console.log("Seeded purpose SIDs (tenant org_config).");

  // --- Seed audit log entries (sample activity for dashboard feed) ---
  const ticketRows = await tenantDatabase
    .selectFrom("tickets")
    .select("id")
    .limit(5)
    .execute();

  if (ticketRows.length > 0) {
    const existingAudit = await tenantDatabase
      .selectFrom("audit_log")
      .select("id")
      .limit(1)
      .executeTakeFirst();

    if (!existingAudit) {
      const events: Array<{
        event_type: string;
        actor_id: UserId;
        ticket_id: TicketId;
        metadata: Record<string, unknown>;
      }> = [];

      for (const ticket of ticketRows) {
        events.push({
          event_type: "ticket_created",
          actor_id: adminUserId,
          ticket_id: ticket.id,
          metadata: {},
        });
      }

      if (ticketRows.length >= 2 && ticketRows[1]) {
        events.push({
          event_type: "followup_added",
          actor_id: adminUserId,
          ticket_id: ticketRows[1].id,
          metadata: {},
        });
      }

      for (const entry of events) {
        await tenantDatabase.insertInto("audit_log").values(entry).execute();
      }
      console.log(`Seeded ${String(events.length)} audit log entries.`);
    } else {
      console.log("Audit log already has entries, skipping.");
    }
  } else {
    console.log(
      "No tickets found for audit seeding (run devSeedTickets first).",
    );
  }

  console.log("Seed complete.");
}

try {
  await seed();
} catch (err) {
  console.error("Seed failed:", extractErrorMessage(err));
  process.exit(1);
} finally {
  await db.destroy();
}
