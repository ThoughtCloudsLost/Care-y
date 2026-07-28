/**
 * Stub for $lib/crypto/context.
 *
 * Mirrors every exported getter name from the real module. Lazily
 * constructs real CryptoBridge, OrgKeyManager, decrypt caches, and
 * PreviewLoader singletons on first access. A pacing-bridge wrapper
 * queues decrypt calls until the bridge reaches KEYED state and
 * staggers first-resolution per cache key so the descramble
 * animation clears the 150ms threshold (preserving the demo's
 * reveal beat on top of sub-frame real decrypts).
 *
 * ensureKeyed() runs the real loginCrypto pipeline with demo
 * credentials, idempotent and in-flight-guarded.
 */

import { Permission } from "@care-y/shared";
import { RoleId } from "@care-y/shared";
import { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { OrgKeyManager } from "$lib/crypto/org-key.js";
import { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";
import { TicketDecryptCache } from "$lib/crypto/ticket-decrypt-cache.js";
import { FollowUpDecryptCache } from "$lib/crypto/follow-up-decrypt-cache.js";
import { createPreviewLoader } from "$lib/tickets/preview-loader.svelte.js";
import { setCryptoKeyed } from "$lib/crypto/crypto-keyed.svelte.js";
import { setCryptoSettled } from "$lib/crypto/crypto-settled.svelte.js";
import { setOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";
import type { CryptoBridge as CryptoBridgeType } from "$lib/workers/crypto-bridge.js";
import type { OrgKeyManager as OrgKeyManagerType } from "$lib/crypto/org-key.js";
import type { OrgDecryptCache as OrgDecryptCacheType } from "$lib/crypto/org-decrypt-cache.js";
import type { TicketDecryptCache as TicketDecryptCacheType } from "$lib/crypto/ticket-decrypt-cache.js";
import type { FollowUpDecryptCache as FollowUpDecryptCacheType } from "$lib/crypto/follow-up-decrypt-cache.js";
import type {
  PreviewLoader,
  RawFollowUpPreview,
} from "$lib/tickets/preview-loader.svelte.js";
import type { BridgeState } from "$lib/workers/crypto-bridge.js";
import type { LoginCryptoResult } from "$lib/auth/login-crypto.js";

// -----------------------------------------------------------------------
// Error type
// -----------------------------------------------------------------------

class DemoCryptoContextError extends Error {
  override readonly name = "DemoCryptoContextError";
}

// -----------------------------------------------------------------------
// Pacing bridge wrapper
// -----------------------------------------------------------------------

/**
 * Wraps the real CryptoBridge so that decrypt and decryptAndRewrap
 * calls queue (returning a pending promise) until the bridge reaches
 * KEYED state. This prevents permanent DECRYPT_ERROR_SENTINEL caching
 * in the async-decrypt-cache when a component fires decrypt before
 * the login pipeline finishes.
 *
 * Additionally, the first resolution for each distinct cache key is
 * delayed by a random 400-1400ms stagger so the descramble animation
 * clears the 150ms threshold. Subsequent lookups hit the SvelteMap
 * and stay instant.
 */
interface PacingBridgeWrapper {
  /** The wrapper object, typed as CryptoBridge for consumers. */
  readonly wrapped: CryptoBridgeType;
  /** Resolve the internal keyed promise, unblocking queued decrypts. */
  resolveKeyed(): void;
  /** The underlying promise that resolves when keyed. */
  readonly keyedPromise: Promise<void>;
}

function createPacingBridge(real: CryptoBridge): PacingBridgeWrapper {
  let resolveKeyed: (() => void) | null = null;
  const keyedPromise = new Promise<void>((resolve) => {
    resolveKeyed = resolve;
  });

  // Track which cache keys have had their first paced resolution.
  // Only the first decrypt per key gets the stagger delay.
  const pacedKeys = new Set<string>();

  /**
   * Wait for keyed, then add a stagger delay on first access per key.
   */
  async function pacedWait(cacheKey: string): Promise<void> {
    await keyedPromise;
    if (!pacedKeys.has(cacheKey)) {
      pacedKeys.add(cacheKey);
      const stagger = 400 + Math.random() * 1000;
      await new Promise<void>((r) => {
        setTimeout(r, stagger);
      });
    }
  }

  // Build the wrapper as a Proxy. All property accesses pass through
  // to the real bridge except decrypt and decryptAndRewrap, which
  // queue behind the keyed promise with pacing.
  const handler: ProxyHandler<CryptoBridge> = {
    get(
      target: CryptoBridge,
      prop: string | symbol,
      _receiver: unknown,
    ): unknown {
      if (prop === "decrypt") {
        return async function pacedDecrypt(
          ticketId: string,
          slot: string,
          keyCacheId: string,
          ephemeralPoint: string,
          nonce: string,
          wrappedKey: string,
          ciphertext: string,
        ): Promise<string> {
          await pacedWait(keyCacheId);
          return target.decrypt(
            ticketId,
            slot,
            keyCacheId,
            ephemeralPoint,
            nonce,
            wrappedKey,
            ciphertext,
          );
        };
      }
      if (prop === "decryptAndRewrap") {
        return async function pacedDecryptAndRewrap(
          followUpId: string,
          ticketId: string,
          ephemeralPoint: string,
          nonce: string,
          wrappedKey: string,
          ciphertext: string,
        ): Promise<string> {
          await pacedWait(`rewrap:${followUpId}`);
          return target.decryptAndRewrap(
            followUpId,
            ticketId,
            ephemeralPoint,
            nonce,
            wrappedKey,
            ciphertext,
          );
        };
      }
      // All other methods pass through to the real bridge.
      // Use Reflect.get with the real target as receiver so private
      // fields resolve correctly (Kysely Proxy lesson).
      return Reflect.get(target, prop, target);
    },
  };

  const wrapped = new Proxy(real, handler);

  return {
    wrapped,
    resolveKeyed(): void {
      resolveKeyed?.();
      resolveKeyed = null;
    },
    keyedPromise,
  };
}

// -----------------------------------------------------------------------
// Lazy singletons
// -----------------------------------------------------------------------

let realBridge: CryptoBridge | null = null;
let pacingBridge: PacingBridgeWrapper | null = null;
let orgKeyManager: OrgKeyManager | null = null;
let orgDecryptCache: OrgDecryptCache | null = null;
let ticketDecryptCache: TicketDecryptCache | null = null;
let followUpDecryptCache: FollowUpDecryptCache | null = null;
let previewLoader: PreviewLoader | null = null;

function initBridge(): CryptoBridge {
  if (realBridge !== null) return realBridge;
  const bridge = new CryptoBridge("dedicated");
  realBridge = bridge;

  // Wire state change signals (mirrors CryptoProvider.svelte:43-51)
  bridge.onBridgeStateChange((state: BridgeState) => {
    setCryptoKeyed(state === "KEYED");
    if (state === "KEYED" && bridge.isReconnected()) {
      const reconnect = bridge.getReconnectData();
      if (reconnect.orgPublicKey != null) {
        getOrgKeyManager().load(reconnect.orgPublicKey);
      }
    }
  });

  realBridge.onSettled(() => {
    setCryptoSettled(true);
  });

  return realBridge;
}

function initPacingBridge(): PacingBridgeWrapper {
  if (pacingBridge !== null) return pacingBridge;
  pacingBridge = createPacingBridge(initBridge());
  return pacingBridge;
}

function initOrgKeyManager(): OrgKeyManager {
  if (orgKeyManager !== null) return orgKeyManager;
  orgKeyManager = new OrgKeyManager(initBridge());

  // Wire org key ready signal (mirrors CryptoProvider.svelte:57-59)
  orgKeyManager.onLoadChange((loaded: boolean) => {
    setOrgKeyReady(loaded);
  });

  return orgKeyManager;
}

// -----------------------------------------------------------------------
// Auth state
// -----------------------------------------------------------------------

const DEFAULT_PERMISSIONS: ReadonlySet<Permission> = new Set<Permission>([
  Permission.VIEW_TICKETS,
  Permission.MANAGE_OWN_TICKETS,
  Permission.VIEW_KNOWLEDGE_BASE,
  Permission.EDIT_KNOWLEDGE_BASE,
  Permission.VIEW_OWN_SHIFTS,
  Permission.MODERATE_CONTENT,
  Permission.MANAGE_USERS,
  Permission.MANAGE_QUEUES,
  Permission.MANAGE_PRESETS,
  Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES,
  Permission.VIEW_REPORTS,
]);

let currentUserId: string | undefined = "demo-user-001";
let currentUserRoleId: string | undefined = RoleId.ADMIN;
let currentPermissions: ReadonlySet<Permission> = DEFAULT_PERMISSIONS;

// -----------------------------------------------------------------------
// Public getters (mirror the real module's export names exactly)
// -----------------------------------------------------------------------

export function getCryptoBridge(): CryptoBridgeType {
  return initPacingBridge().wrapped;
}

export function getOrgKeyManager(): OrgKeyManagerType {
  return initOrgKeyManager();
}

export function getOrgDecryptCache(): OrgDecryptCacheType {
  if (orgDecryptCache !== null) return orgDecryptCache;
  orgDecryptCache = new OrgDecryptCache(initOrgKeyManager(), initBridge());
  return orgDecryptCache;
}

export function getTicketDecryptCache(): TicketDecryptCacheType {
  if (ticketDecryptCache !== null) return ticketDecryptCache;
  // Ticket cache gets the PACING wrapper so pre-keyed calls queue
  // as loading (scrambles) instead of caching permanent error sentinels.
  ticketDecryptCache = new TicketDecryptCache(initPacingBridge().wrapped);
  return ticketDecryptCache;
}

export function getFollowUpDecryptCache(): FollowUpDecryptCacheType {
  if (followUpDecryptCache !== null) return followUpDecryptCache;
  // Follow-up cache also gets the pacing wrapper.
  followUpDecryptCache = new FollowUpDecryptCache(initPacingBridge().wrapped);
  return followUpDecryptCache;
}

/**
 * Set by the trpc stub at init time to break the circular dependency.
 * The trpc stub calls registerTrpcForPreview() during its own module
 * init, which runs before any component calls getPreviewLoader().
 */
let trpcForPreview: {
  tickets: {
    recentFollowUps: {
      query: (input: {
        ticketIds: string[];
        perTicket: number;
      }) => Promise<Record<string, RawFollowUpPreview[]>>;
    };
  };
} | null = null;

/**
 * Called by the trpc stub to register the engine-backed trpc proxy.
 * This avoids a circular import between crypto-context and trpc.
 */
export function registerTrpcForPreview(t: typeof trpcForPreview): void {
  trpcForPreview = t;
}

export function getPreviewLoader(): PreviewLoader {
  if (previewLoader !== null) return previewLoader;
  if (trpcForPreview === null) {
    throw new DemoCryptoContextError(
      "trpc not registered for preview loader. Ensure trpc stub is imported before getPreviewLoader().",
    );
  }
  const t = trpcForPreview;
  previewLoader = createPreviewLoader({
    queryFn: async (ids: string[]) =>
      t.tickets.recentFollowUps.query({
        ticketIds: ids,
        perTicket: 3,
      }),
  });
  return previewLoader;
}

export function getCurrentUserId(): () => string | undefined {
  return () => currentUserId;
}

export function getCurrentUserRoleId(): () => string | undefined {
  return () => currentUserRoleId;
}

export function getCurrentPermissions(): () => ReadonlySet<Permission> {
  return (): ReadonlySet<Permission> => currentPermissions;
}

// The real module also exports setters (from context-init.ts).
// These are no-ops here: the demo constructs objects directly instead
// of delegating to CryptoProvider/AppCryptoProvider.
export function setCryptoBridge(_v: unknown): void {
  /* no-op */
}
export function setOrgKeyManager(_v: unknown): void {
  /* no-op */
}
export function setOrgDecryptCache(_v: unknown): void {
  /* no-op */
}
export function setTicketDecryptCache(_v: unknown): void {
  /* no-op */
}
export function setFollowUpDecryptCache(_v: unknown): void {
  /* no-op */
}
export function setPreviewLoader(_v: unknown): void {
  /* no-op */
}
export function setCurrentUserId(_v: unknown): void {
  /* no-op */
}
export function setCurrentUserRoleId(_v: unknown): void {
  /* no-op */
}
export function setCurrentPermissions(_v: unknown): void {
  /* no-op */
}

// -----------------------------------------------------------------------
// ensureKeyed: idempotent real login crypto pipeline
// -----------------------------------------------------------------------

let ensureKeyedPromise: Promise<void> | null = null;
let ensureKeyedResult: LoginCryptoResult | null = null;

/**
 * Run the real loginCrypto pipeline with demo credentials if the bridge
 * is not already KEYED. Idempotent: concurrent calls share the same
 * in-flight promise. On completion, the pacing bridge's keyed promise
 * resolves, unblocking all queued decrypt calls.
 *
 * Returns void externally. The real LoginCryptoResult is cached
 * internally for the login-crypto stub to retrieve.
 */
export async function ensureKeyed(): Promise<void> {
  if (ensureKeyedPromise !== null) {
    return ensureKeyedPromise;
  }

  const bridge = initBridge();
  if (bridge.getState() === "KEYED") {
    initPacingBridge().resolveKeyed();
    return;
  }

  // Clear the cached promise on rejection so a later attempt can
  // retry. Without this, one transient failure (engine still booting,
  // a raced worker state) would leave login permanently rejected
  // until the iframe reloads.
  ensureKeyedPromise = runEnsureKeyed().catch((err: unknown) => {
    ensureKeyedPromise = null;
    throw err;
  });
  return ensureKeyedPromise;
}

/**
 * Retrieve the cached LoginCryptoResult from the most recent
 * ensureKeyed run. Returns null if ensureKeyed has not completed.
 */
export function getEnsureKeyedResult(): LoginCryptoResult | null {
  return ensureKeyedResult;
}

async function runEnsureKeyed(): Promise<void> {
  const bridge = initBridge();
  const pacing = initPacingBridge();
  const okm = initOrgKeyManager();

  // Import the REAL loginCrypto by relative path. The $lib/auth/login-crypto
  // alias resolves to THIS stub's sibling login-crypto.ts, which is the
  // demo's choreography wrapper. We need the real pipeline.
  const { loginCrypto: realLoginCrypto } =
    await import("../../../client/src/lib/auth/login-crypto.js");

  // Import demo credentials
  const { DEMO_ADMIN_IDENTIFIER, DEMO_ADMIN_PASSWORD } =
    await import("../lib/engine/server/seed-structure.js");

  const noopCallbacks = {
    onArgon2idStart(): void {
      /* no-op */
    },
    onArgon2idDone(): void {
      /* no-op */
    },
    onOprfStart(): void {
      /* no-op */
    },
    onOprfDone(): void {
      /* no-op */
    },
    onDeriveStart(): void {
      /* no-op */
    },
    onDone(): void {
      /* no-op */
    },
    async onPowRequired(): Promise<string> {
      await Promise.resolve();
      throw new DemoCryptoContextError(
        "PoW challenge unexpected in demo login",
      );
    },
  };

  const result = await realLoginCrypto(
    DEMO_ADMIN_IDENTIFIER,
    DEMO_ADMIN_PASSWORD,
    bridge,
    noopCallbacks,
  );

  ensureKeyedResult = result;

  // Load the org key so OrgDecryptCache can decrypt
  if (result.orgPublicKey !== null) {
    okm.load(result.orgPublicKey);
  }

  // Unblock all queued decrypt calls in the pacing wrapper
  pacing.resolveKeyed();
}

// -----------------------------------------------------------------------
// Demo engine API: seed and reset (slimmed for E2 scope)
// -----------------------------------------------------------------------

export interface DemoSeedData {
  /** Override the demo user ID */
  userId?: string;
  /** Override the demo user role ID */
  userRoleId?: string;
  /** Override the demo permission set */
  permissions?: ReadonlySet<Permission>;
}

/**
 * Populate identity/permissions state. Content seeding is removed
 * post-E2 because real decrypt caches handle all content.
 */
export function demoSeed(data: DemoSeedData): void {
  if (data.userId !== undefined) currentUserId = data.userId;
  if (data.userRoleId !== undefined) currentUserRoleId = data.userRoleId;
  if (data.permissions !== undefined) currentPermissions = data.permissions;
}

/**
 * Reset auth state to defaults. Does NOT destroy the bridge (restart
 * is an iframe reload that gives a fresh module graph).
 */
export function demoReset(): void {
  currentUserId = "demo-user-001";
  currentUserRoleId = RoleId.ADMIN;
  currentPermissions = DEFAULT_PERMISSIONS;
}
