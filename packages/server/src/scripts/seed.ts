/**
 * Dev seed script. Creates a dev org and admin user for local development.
 *
 * Idempotent: skips creation if the org or user already exists (catches
 * ConflictError from unique constraint violations rather than pre-checking).
 *
 * Generates a Curve25519 keypair for the dev org so that org resolution
 * succeeds (the context factory requires org_public_key to be non-null).
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
import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";

const DEV_ORG_SLUG = "dev-org";
const ADMIN_IDENTIFIER = "admin.dev";
const ADMIN_PASSWORD = "dev-password-1234!";
const ADMIN_DISPLAY_NAME = "Dev Admin";
const ADMIN_ROLE_ID = RoleId.ADMIN;

/**
 * Generates a Curve25519 keypair and stores the public key in org_config.
 * Idempotent: skips if org_public_key is already set.
 * Returns the public key buffer.
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

    console.log("Generated dev org Curve25519 keypair.");
    return pk;
  } finally {
    // Zero the secret key. The dev SK is not stored anywhere;
    // it's only needed for the seed script's own admin session creation.
    // In production, the org SK is wrapped per-volunteer via ECIES.
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
  const hasher = createScryptHasher();

  const orgService = createOrgService(db, tenantDb);

  // --- Create org ---
  let orgId: string;
  let schemaName: string;
  try {
    const org = await orgService.createOrg({ slug: DEV_ORG_SLUG });
    orgId = org.id;
    schemaName = org.schemaName;
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

  // --- Generate org keypair ---
  const tenantDatabase = tenantDb(schemaName);
  const orgPublicKey = await ensureOrgKeypair(tenantDatabase);

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

  // Queue: "Intake"
  let queueId: string;
  const existingQueue = await tenantDatabase
    .selectFrom("queues")
    .select("id")
    .where("name", "=", "Intake")
    .executeTakeFirst();

  if (existingQueue) {
    queueId = existingQueue.id;
    console.log("Queue 'Intake' already exists, skipping.");
  } else {
    const inserted = await tenantDatabase
      .insertInto("queues")
      .values({ name: "Intake" })
      .returning("id")
      .executeTakeFirstOrThrow();
    queueId = inserted.id;
    console.log(`Created queue "Intake" (${queueId})`);
  }

  // Queue assignment: admin -> Intake
  const existingAssignment = await tenantDatabase
    .selectFrom("queue_assignments")
    .select("queue_id")
    .where("queue_id", "=", queueId)
    .where("user_id", "=", adminUserId)
    .executeTakeFirst();

  if (existingAssignment) {
    console.log("Queue assignment already exists, skipping.");
  } else {
    await tenantDatabase
      .insertInto("queue_assignments")
      .values({ queue_id: queueId, user_id: adminUserId })
      .execute();
    console.log("Assigned admin to Intake queue.");
  }

  // Clients: Sparrow, Wren, Finch, Robin
  const clientAliases = ["Sparrow", "Wren", "Finch", "Robin"];
  for (const alias of clientAliases) {
    const existingClient = await tenantDatabase
      .selectFrom("clients")
      .select("id")
      .where("alias", "=", alias)
      .executeTakeFirst();

    if (existingClient) {
      console.log(`Client "${alias}" already exists, skipping.`);
    } else {
      const inserted = await tenantDatabase
        .insertInto("clients")
        .values({ alias, phone_id: phoneId })
        .returning("id")
        .executeTakeFirstOrThrow();
      console.log(`Created client "${alias}" (${inserted.id})`);
    }
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
