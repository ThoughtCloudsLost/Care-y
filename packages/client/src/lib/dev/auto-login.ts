/**
 * Dev-only auto-login with full production crypto pipeline.
 *
 * Runs registerCrypto (Argon2id -> OPRF -> deriveKeys -> initCryptoKeys)
 * and loginCrypto (Worker-based key derivation -> KEYED state), then
 * seeds test tickets via devSeedTickets. Identical to production
 * registration + login, the only shortcut is devBypass2fa for 2FA.
 *
 * This file is dynamically imported only when import.meta.env.DEV is true,
 * so Vite's dead-code elimination strips it from production builds entirely.
 */
import { trpc } from "$lib/trpc/index.js";
import { registerCrypto } from "$lib/auth/register-crypto.js";
import { loginCrypto } from "$lib/auth/login-crypto.js";
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

  // 5. Load org key for non-PII tier decryption (KB titles, display names, branding)
  if (orgPrivateKey) {
    orgKeyManager.load(orgPrivateKey);
    console.log("[dev] orgKeyManager: org key loaded");
  } else {
    console.warn(
      "[dev] orgKeyManager: no org key available (org not onboarded?)",
    );
  }

  // 6. Seed test tickets (server creates tickets with real ECIES key wraps)
  await getDevSeedTickets().mutate();
  console.log("[dev] devSeedTickets: tickets seeded");
}
