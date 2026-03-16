/**
 * Dev seed script. Creates a dev org and admin user for local development.
 *
 * Idempotent: skips creation if the org or user already exists (catches
 * ConflictError from unique constraint violations rather than pre-checking).
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

import { db, tenantDb } from "../db/db.js";
import { getEnv } from "../env.js";
import { createOrgService } from "../org/service.js";
import { createScryptHasher } from "../auth/password.js";
import { createAuthService } from "../auth/service.js";
import { createDbSessionRepository } from "../auth/session-repository.js";
import {
  deriveKeys,
  createFieldEncryptor,
  createBlindIndexer,
} from "../crypto/field-encryptor.js";
import {
  deriveSessionHmacKey,
  createSessionTokenizer,
} from "../crypto/session-tokenizer.js";

const DEV_ORG_SLUG = "dev-org";
const ADMIN_IDENTIFIER = "admin@dev.local";
const ADMIN_PASSWORD = "devpassword123!";
const ADMIN_DISPLAY_NAME = "Dev Admin";
const ADMIN_ROLE_ID = "admin";

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

  // --- Create admin user ---
  const tenantDatabase = tenantDb(schemaName);
  const tokenizer = createSessionTokenizer(deriveSessionHmacKey(opsKey));
  const sessions = createDbSessionRepository(
    tenantDatabase,
    encryptor,
    tokenizer,
    null, // no sealed box yet (org keypair not generated during seed)
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

  try {
    const user = await authService.register({
      identifier: ADMIN_IDENTIFIER,
      password: ADMIN_PASSWORD,
      displayName: ADMIN_DISPLAY_NAME,
      roleId: ADMIN_ROLE_ID,
    });
    console.log(`Created admin user "${ADMIN_IDENTIFIER}" (${user.id})`);
  } catch (err) {
    if (err instanceof ConflictError) {
      console.log(`User "${ADMIN_IDENTIFIER}" already exists, skipping.`);
    } else {
      console.error("Failed to create admin user:", extractErrorMessage(err));
      process.exit(1);
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
