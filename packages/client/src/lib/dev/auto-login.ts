/**
 * Dev-only auto-login with full production crypto pipeline.
 *
 * Runs registerCrypto (Argon2id -> OPRF -> deriveKeys -> initCryptoKeys)
 * and loginCrypto (Worker-based key derivation -> KEYED state), then
 * rotates the throwaway org keypair (from seed) with a real client-generated
 * Curve25519 keypair, seals KB articles client-side, and seeds test tickets.
 *
 * The org key rotation matches the production flow: the browser generates
 * the keypair, ECIES-wraps the secret for authorized volunteers, and uploads
 * via the rotateOrgKey endpoint. The server never holds the org secret key.
 *
 * This file is dynamically imported only when import.meta.env.DEV is true,
 * so Vite's dead-code elimination strips it from production builds entirely.
 */
import { trpc } from "$lib/trpc/index.js";
import { registerCrypto } from "$lib/auth/register-crypto.js";
import { loginCrypto } from "$lib/auth/login-crypto.js";
import {
  generateOrgKeypair,
  sealForOrgKey,
  wrapKey,
  encode,
  decode,
  getSodium,
  toRistrettoPoint,
} from "@care-y/crypto";
import type { RegisterCryptoCallbacks } from "$lib/auth/register-crypto.js";
import type { LoginCryptoCallbacks } from "$lib/auth/login-crypto.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";

const DEV_IDENTIFIER = "admin.dev";
const DEV_PASSWORD = "dev-password-1234!";

function getBypass2fa(): { mutate: () => Promise<unknown> } {
  const route = trpc.auth.devBypass2fa;
  if (!route) throw new Error("devBypass2fa route missing (not in dev mode?)");
  return route;
}

function getDevSeedTickets(): { mutate: () => Promise<unknown> } {
  // tickets and devSeedTickets are both conditionally spread on the server
  // (ticketDeps optional, devSeedTickets dev-only), so TypeScript doesn't
  // guarantee their existence. This file only runs in dev mode.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- dev-only, runtime guard follows
  const tickets = trpc.tickets as
    | Record<string, { mutate: () => Promise<unknown> }>
    | undefined;
  const route = tickets?.devSeedTickets;
  if (route === undefined) {
    throw new Error("devSeedTickets route missing (not in dev mode?)");
  }
  return route;
}

/** No-op callbacks for registerCrypto. Logs phase transitions for dev visibility. */
const noopRegisterCallbacks: RegisterCryptoCallbacks = {
  onArgon2idStart: () => {
    console.log("[dev] registerCrypto: Argon2id start");
  },
  onArgon2idDone: () => {
    console.log("[dev] registerCrypto: Argon2id done");
  },
  onOprfStart: () => {
    console.log("[dev] registerCrypto: OPRF start");
  },
  onOprfDone: () => {
    console.log("[dev] registerCrypto: OPRF done");
  },
  onDeriveStart: () => {
    console.log("[dev] registerCrypto: derive start");
  },
  onDone: () => {
    console.log("[dev] registerCrypto: done");
  },
  onUploadStart: () => {
    console.log("[dev] registerCrypto: upload start");
  },
};

/** No-op callbacks for loginCrypto. Logs phase transitions for dev visibility. */
const noopLoginCallbacks: LoginCryptoCallbacks = {
  onArgon2idStart: () => {
    console.log("[dev] loginCrypto: Argon2id start");
  },
  onArgon2idDone: () => {
    console.log("[dev] loginCrypto: Argon2id done");
  },
  onOprfStart: () => {
    console.log("[dev] loginCrypto: OPRF start");
  },
  onOprfDone: () => {
    console.log("[dev] loginCrypto: OPRF done");
  },
  onDeriveStart: () => {
    console.log("[dev] loginCrypto: derive start");
  },
  onDone: () => {
    console.log("[dev] loginCrypto: done");
  },
  onPowRequired: () => {
    throw new Error("PoW should not be required in dev auto-login");
  },
};

/**
 * Check if a tRPC error is a CONFLICT (e.g., crypto keys already initialized).
 * tRPC client errors have a `data` property with the server's error shape,
 * and the top-level `code` is the tRPC error code string.
 */
function isConflictError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  // TRPCClientError exposes `.code` as the HTTP-style tRPC code
  if ("code" in err) {
    const { code } = err as Record<string, unknown>;
    if (code === "CONFLICT") return true;
  }
  // Fallback: check data.httpStatus for 409
  if ("data" in err) {
    const { data } = err as Record<string, unknown>;
    if (typeof data === "object" && data !== null && "httpStatus" in data) {
      const { httpStatus } = data as Record<string, unknown>;
      if (httpStatus === 409) return true;
    }
  }
  return false;
}

/** KB article definitions for dev seeding. */
const KB_ARTICLES: readonly {
  category: string;
  title: string;
  body: string;
}[] = [
  {
    category: "Procedures",
    title: "Intake call checklist",
    body: "Body content for: Intake call checklist",
  },
  {
    category: "Procedures",
    title: "Escalation protocol",
    body: "Body content for: Escalation protocol",
  },
  {
    category: "Resources",
    title: "Housing referral contacts",
    body: "Body content for: Housing referral contacts",
  },
  {
    category: "Resources",
    title: "Legal aid directory",
    body: "Body content for: Legal aid directory",
  },
  {
    category: "Safety",
    title: "Safety planning template",
    body: "Body content for: Safety planning template",
  },
];

/**
 * Rotate the throwaway seed keypair with a real client-generated one.
 * Returns the org public key and loads the secret into OrgKeyManager.
 */
async function bootstrapOrgKeypair(
  bridge: CryptoBridge,
  orgKeyManager: OrgKeyManager,
  userId: string,
): Promise<Uint8Array> {
  await getSodium();

  // Generate real Curve25519 org keypair in the browser
  const { publicKey, secretKey } = generateOrgKeypair();

  try {
    // Get the admin's volPublic for ECIES wrapping
    const volPublicB64 = await bridge.getVolPublic();
    const volPublicBytes = decode(volPublicB64);
    const volPublicPoint = toRistrettoPoint(volPublicBytes);

    // ECIES-wrap org secret for the admin
    const wrap = wrapKey(secretKey, volPublicPoint);

    // Rotate: replace the throwaway seed keypair with the real one
    await trpc.keys.rotateOrgKey.mutate({
      newOrgPublicKey: encode(publicKey),
      wrappedKeys: [
        {
          userId,
          ephemeralPoint: encode(wrap.ephemeralPoint),
          nonce: encode(wrap.nonce),
          wrappedKey: encode(wrap.ciphertext),
        },
      ],
    });

    // Load org secret into OrgKeyManager (main thread, non-PII tier)
    const skCopy = new ArrayBuffer(secretKey.byteLength);
    new Uint8Array(skCopy).set(secretKey);
    orgKeyManager.load(skCopy);

    console.log("[dev] org keypair: rotated seed keypair with real one");
    return publicKey;
  } finally {
    // Zero the org secret key material
    const sodium = await getSodium();
    sodium.memzero(secretKey);
  }
}

/**
 * Seal and upload KB articles using the real org public key.
 * Skips if articles already exist for the admin user.
 */
async function seedKBArticles(
  orgPublicKey: Uint8Array,
  orgKeyManager: OrgKeyManager,
): Promise<void> {
  // kb router is conditionally spread on the server, so TypeScript
  // doesn't guarantee its existence. This file only runs in dev mode.
  const kb = trpc.kb;
  if (!kb) throw new Error("kb router unavailable (not in dev mode?)");

  // Fetch category list from server. Category names are encrypted (ADR-030),
  // so we decrypt them with the org key to map article definitions by name.
  const categories = await kb.listCategories.query();
  const decoder = new TextDecoder();
  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    try {
      const ciphertext =
        c.encryptedName instanceof Uint8Array
          ? c.encryptedName
          : new Uint8Array((c.encryptedName as { data: number[] }).data);
      const plainBytes = orgKeyManager.decrypt(ciphertext);
      categoryMap.set(decoder.decode(plainBytes), c.id);
    } catch {
      // Can't decrypt (wrong key or corrupted), skip
    }
  }

  // Check if articles already exist (idempotent re-run)
  const existingItems = await kb.listItems.query({ limit: 1 });
  if (existingItems.items.length > 0) {
    console.log("[dev] KB articles already seeded, skipping.");
    return;
  }

  const encoder = new TextEncoder();

  for (const article of KB_ARTICLES) {
    const categoryId = categoryMap.get(article.category);
    if (categoryId === undefined) {
      console.warn(
        `[dev] KB category "${article.category}" not found, skipping article "${article.title}"`,
      );
      continue;
    }

    // Seal title and body client-side with the org public key
    const encryptedTitle = sealForOrgKey(
      encoder.encode(article.title),
      orgPublicKey,
    );
    const encryptedBody = sealForOrgKey(
      encoder.encode(article.body),
      orgPublicKey,
    );

    await kb.createItem.mutate({
      categoryId,
      encryptedTitle: encode(encryptedTitle),
      encryptedBody: encode(encryptedBody),
    });

    console.log(`[dev] Created KB article "${article.title}"`);
  }
}

/**
 * Re-encrypt seed queue and KB category names with the real org public key.
 * The seed script encrypts with the throwaway keypair; after org key rotation
 * the ciphertext is undecryptable. This re-seals with the real key.
 *
 * Dev-only. Matches known seed names by sort_order (deterministic).
 */
async function reEncryptSeedNames(orgPublicKey: Uint8Array): Promise<void> {
  const tickets = trpc.tickets;
  const kb = trpc.kb;
  if (!tickets || !kb) return;

  const encoder = new TextEncoder();

  // Re-encrypt queue names by sort_order (seed assigns 1=Intake, 2=Crisis, 3=Housing)
  const queueNamesBySortOrder = ["Intake", "Crisis", "Housing"];
  const queues = await tickets.listQueues.query();
  for (const q of queues) {
    const expectedName = queueNamesBySortOrder.at(q.sortOrder - 1);
    if (expectedName === undefined) continue;
    const sealed = sealForOrgKey(encoder.encode(expectedName), orgPublicKey);
    await tickets.updateQueue.mutate({
      queueId: q.id,
      encryptedName: encode(sealed),
    });
  }
  console.log("[dev] re-encrypted queue names with real org key");

  // Re-encrypt KB category names (seed assigns 1=Procedures, 2=Resources, 3=Safety)
  const kbNamesBySortOrder = ["Procedures", "Resources", "Safety"];
  const categories = await kb.listCategories.query();
  for (const c of categories) {
    const expectedName = kbNamesBySortOrder.at(c.sortOrder - 1);
    if (expectedName === undefined) continue;
    const sealed = sealForOrgKey(encoder.encode(expectedName), orgPublicKey);
    await kb.updateCategory.mutate({
      categoryId: c.id,
      encryptedName: encode(sealed),
    });
  }
  console.log("[dev] re-encrypted KB category names with real org key");
}

export async function devAutoLogin(
  bridge: CryptoBridge,
  orgKeyManager: OrgKeyManager,
): Promise<void> {
  // 1. Auth login (creates session)
  try {
    await getBypass2fa().mutate();
  } catch {
    await trpc.auth.login.mutate({
      identifier: DEV_IDENTIFIER,
      password: DEV_PASSWORD,
    });
    await getBypass2fa().mutate();
  }

  // 2. Get userId for registerCrypto
  const { user } = await trpc.auth.me.query();

  // 3. Register crypto keys (first run only, idempotent on re-runs)
  try {
    await registerCrypto(user.id, DEV_PASSWORD, noopRegisterCallbacks);
    console.log("[dev] registerCrypto: keys initialized");
  } catch (err: unknown) {
    if (isConflictError(err)) {
      console.log("[dev] registerCrypto: keys already exist, skipping");
    } else {
      throw err;
    }
  }

  // 4. Login crypto (Worker-based key derivation -> KEYED state)
  await bridge.waitReady();
  const { orgPrivateKey } = await loginCrypto(
    DEV_IDENTIFIER,
    DEV_PASSWORD,
    bridge,
    noopLoginCallbacks,
  );
  console.log("[dev] loginCrypto: Worker is KEYED");

  // 5. Org key bootstrap
  // On first run: orgPrivateKey is null (seed created a throwaway keypair,
  // no wrapped_org_keys row exists). Generate real keypair and rotate.
  // On re-run: orgPrivateKey is non-null (rotation already happened,
  // wrapped_org_keys row exists). Load directly.
  let orgPublicKey: Uint8Array | null = null;

  if (orgPrivateKey) {
    orgKeyManager.load(orgPrivateKey);
    console.log("[dev] orgKeyManager: org key loaded (existing)");
  } else {
    orgPublicKey = await bootstrapOrgKeypair(bridge, orgKeyManager, user.id);
    // Re-encrypt seed data (queue names, KB category names) with the real org key.
    // The seed encrypted them with the throwaway keypair which is now gone.
    await reEncryptSeedNames(orgPublicKey);
  }

  // 6. Seed KB articles client-side (first run only)
  // Need the org public key. On first run we have it from bootstrapOrgKeypair.
  // On re-run, derive it from the secret key in OrgKeyManager.
  if (!orgPublicKey) {
    // Re-run path: derive public key from secret key. OrgKeyManager holds
    // the secret. We can derive pk = scalarmult_base(sk), but OrgKeyManager
    // doesn't expose the raw key. KB articles should already exist on re-run
    // so we just skip seeding. The listItems check in seedKBArticles handles this.
    console.log("[dev] KB seeding: skipping (re-run, articles should exist)");
  } else {
    await seedKBArticles(orgPublicKey, orgKeyManager);
  }

  // 7. Seed test tickets (server creates tickets with real ECIES key wraps)
  await getDevSeedTickets().mutate();
  console.log("[dev] devSeedTickets: tickets seeded");
}
