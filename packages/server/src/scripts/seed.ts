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

import { RoleId } from "@care-y/shared";
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
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

const DEV_ORG_SLUG = "dev-org";
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
  let orgId: string;
  let schemaName: string;
  let setupToken: string | null = null;
  try {
    const org = await orgService.createOrg({ slug: DEV_ORG_SLUG });
    orgId = org.id;
    schemaName = org.schemaName;
    setupToken = org.setupToken;
    console.log(`Created org "${DEV_ORG_SLUG}" (${orgId})`);
  } catch (err) {
    if (err instanceof ConflictError) {
      const existing = await orgService.findBySlug(DEV_ORG_SLUG);
      if (!existing) {
        console.error(
          "Org conflict but slug not found. Database may be inconsistent.",
        );
        process.exit(1);
      }
      orgId = existing.id;
      schemaName = existing.schemaName;
      console.log(`Org "${DEV_ORG_SLUG}" already exists (${orgId}), skipping.`);
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

  let adminUserId: string;
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
      const identifierHash = indexer.hash(ADMIN_IDENTIFIER, orgId);
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
  let phoneId: string;
  const existingPhone = await tenantDatabase
    .selectFrom("phones")
    .select("id")
    .where("phone_hash", "=", indexer.hash("+15550001234", orgId))
    .executeTakeFirst();

  if (existingPhone) {
    phoneId = existingPhone.id;
    console.log("Phone record already exists, skipping.");
  } else {
    const inserted = await tenantDatabase
      .insertInto("phones")
      .values({
        phone_hash: indexer.hash("+15550001234", orgId),
        encrypted_number: encryptor.encrypt("+15550001234"),
        locale: "en",
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    phoneId = inserted.id;
    console.log(`Created phone record (${phoneId})`);
  }

  // Seal a plaintext string with the org public key (crypto_box_seal).
  function sealName(plaintext: string): Buffer {
    const pt = Buffer.from(plaintext, "utf8");
    const ct = Buffer.alloc(pt.length + sodium.crypto_box_SEALBYTES);
    sodium.crypto_box_seal(ct, pt, orgPublicKey);
    return ct;
  }

  const queueNames = ["Intake", "Crisis", "Housing"];
  const queueIds = new Map<string, string>();

  for (let i = 0; i < queueNames.length; i++) {
    const name = queueNames[i]!;
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
        .values({ encrypted_name: sealName(name), sort_order: sortOrder })
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
    console.log(
      `${String(currentCount)} clients already exist, skipping client seeding.`,
    );
  } else {
    const toCreate = NUM_SEED_CLIENTS - currentCount;
    for (let i = 0; i < toCreate; i++) {
      // generateAlias uses crypto.randomInt, so collisions are possible.
      // Retry on unique constraint violation (same pattern as client-repo.ts).
      let created = false;
      for (let attempt = 0; attempt < 5 && !created; attempt++) {
        const alias = generateAlias();
        try {
          const inserted = await tenantDatabase
            .insertInto("clients")
            .values({ alias, phone_id: phoneId })
            .returning("id")
            .executeTakeFirstOrThrow();
          console.log(`Created client "${alias}" (${inserted.id})`);
          created = true;
        } catch (err: unknown) {
          if (
            err instanceof Error &&
            err.message.includes("unique") // PG unique violation on alias
          ) {
            continue; // retry with a new alias
          }
          throw err;
        }
      }
      if (!created) {
        console.warn("Failed to generate unique alias after 5 attempts");
      }
    }
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
        actor_id: string;
        ticket_id: string;
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
