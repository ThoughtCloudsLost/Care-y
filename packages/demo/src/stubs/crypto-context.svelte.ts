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
 *
 * Auth state (userId, roleId, permissions) is rune-backed so that
 * consumers wrapping the getters in $derived re-derive when the
 * role switcher mutates the signed-in user's role.
 */

import { Permission } from "@care-y/shared";
import { plainSet } from "../lib/non-reactive.js";
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
import {
  traceFlowLocal,
  buildFlowDetail,
  describeFlowBytes,
  startFlowRecording,
  stopFlowRecording,
} from "../lib/flow-events.js";
import type { FlowDetail, RecordedFlowEvent } from "../lib/flow-events.js";
import { cacheRegistry } from "$lib/crypto/cache-registry.js";
import {
  keepaliveDecision,
  KEEPALIVE_INTERVAL_MS,
} from "../lib/crypto-keepalive.js";

// -----------------------------------------------------------------------
// Error type
// -----------------------------------------------------------------------

class DemoCryptoContextError extends Error {
  override readonly name = "DemoCryptoContextError";
}

// -----------------------------------------------------------------------
// Base64 byte-length arithmetic
// -----------------------------------------------------------------------

/**
 * Compute the decoded byte length of a base64 string without decoding it.
 * Handles both standard and URL-safe base64, with or without padding.
 */
export function base64DecodedLength(b64: string): number {
  const len = b64.length;
  if (len === 0) return 0;
  // Count trailing '=' padding chars
  let padding = 0;
  if (b64[len - 1] === "=") padding += 1;
  if (len > 1 && b64[len - 2] === "=") padding += 1;
  return Math.floor((len * 3) / 4) - padding;
}

// -----------------------------------------------------------------------
// Decrypt flow detail
// -----------------------------------------------------------------------

/** The ciphertext-side arguments a decrypt is handed. */
export interface DecryptDetailArgs {
  readonly slot: string;
  readonly keyCacheId: string;
  readonly ciphertext: string;
  readonly wrappedKey: string;
  readonly nonce: string;
  readonly ephemeralPoint: string;
}

/**
 * Rows describing one decrypt for the flow band.
 *
 * Everything going in is opaque, and the only thing reported coming out
 * is how many bytes appeared. The decrypted string is never a parameter
 * here: this function takes a LENGTH, so there is no argument a caller
 * could pass that would put readable content on screen. That is the
 * whole reason it is separate from the call site.
 *
 * Pure and exported so the guarantee can be tested directly, without
 * standing up a keyed worker and waiting out the reveal stagger.
 */
export function buildDecryptDetail(
  args: DecryptDetailArgs,
  plaintextByteLength: number,
): FlowDetail {
  const ctBytes = base64DecodedLength(args.ciphertext);
  const wrappedBytes = base64DecodedLength(args.wrappedKey);
  const nonceBytes = base64DecodedLength(args.nonce);
  const pointBytes = base64DecodedLength(args.ephemeralPoint);
  return buildFlowDetail({
    input: [
      { name: "slot", value: args.slot, kind: "identifier" },
      { name: "keyCacheId", value: args.keyCacheId, kind: "identifier" },
      {
        name: "ciphertext",
        value: describeFlowBytes(ctBytes),
        kind: "ciphertext",
        bytes: ctBytes,
      },
      {
        name: "wrappedKey",
        value: describeFlowBytes(wrappedBytes),
        kind: "key-material",
        bytes: wrappedBytes,
      },
      {
        name: "nonce",
        value: describeFlowBytes(nonceBytes),
        kind: "key-material",
        bytes: nonceBytes,
      },
      {
        name: "ephemeralPoint",
        value: describeFlowBytes(pointBytes),
        kind: "key-material",
        bytes: pointBytes,
      },
    ],
    result: [
      {
        name: "plaintext",
        value: describeFlowBytes(plaintextByteLength),
        kind: "plaintext",
        bytes: plaintextByteLength,
      },
    ],
  });
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
  /** Clear the first-resolution stagger cache so subsequent decrypts
   *  re-play the descramble delay. */
  clearPacedKeys(): void;
}

function createPacingBridge(real: CryptoBridge): PacingBridgeWrapper {
  let resolveKeyed: (() => void) | null = null;
  const keyedPromise = new Promise<void>((resolve) => {
    resolveKeyed = resolve;
  });

  // Track which cache keys have had their first paced resolution.
  // Only the first decrypt per key gets the stagger delay.
  // Plain Set: used as non-reactive bookkeeping on the per-decrypt
  // hot path, never read by a $derived or template expression.
  const pacedKeys = plainSet<string>();

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

  // Create the paced wrapper functions once, up front. The Proxy get
  // trap returns these cached references instead of allocating a fresh
  // closure per property access.
  const pacedDecrypt = async function pacedDecrypt(
    ticketId: string,
    slot: string,
    keyCacheId: string,
    ephemeralPoint: string,
    nonce: string,
    wrappedKey: string,
    ciphertext: string,
  ): Promise<string> {
    await pacedWait(keyCacheId);
    // Timed after pacedWait, so the reported duration is the real
    // worker decrypt without the demo's reveal stagger.
    return traceFlowLocal(
      {
        lane: "crypto",
        label: `decrypt ${slot} ${keyCacheId}`,
        // Keyed per slot, so a list decrypting twelve titles folds into
        // one stack while a title and a body stay apart. Reading each
        // title decrypt separately tells you nothing the count does not.
        groupKey: `decrypt:${slot}`,
        resultDetail: (plaintext) =>
          buildDecryptDetail(
            {
              slot,
              keyCacheId,
              ciphertext,
              wrappedKey,
              nonce,
              ephemeralPoint,
            },
            plaintext.length,
          ),
      },
      async () =>
        real.decrypt(
          ticketId,
          slot,
          keyCacheId,
          ephemeralPoint,
          nonce,
          wrappedKey,
          ciphertext,
        ),
    );
  };

  const pacedDecryptAndRewrap = async function pacedDecryptAndRewrap(
    followUpId: string,
    ticketId: string,
    ephemeralPoint: string,
    nonce: string,
    wrappedKey: string,
    ciphertext: string,
  ): Promise<string> {
    const cacheKey = `rewrap:${followUpId}`;
    await pacedWait(cacheKey);
    return traceFlowLocal(
      {
        lane: "crypto",
        label: `decryptAndRewrap ${cacheKey}`,
        groupKey: "decryptAndRewrap",
        resultDetail: (plaintext) =>
          buildDecryptDetail(
            {
              slot: "followUp",
              keyCacheId: cacheKey,
              ciphertext,
              wrappedKey,
              nonce,
              ephemeralPoint,
            },
            plaintext.length,
          ),
      },
      async () =>
        real.decryptAndRewrap(
          followUpId,
          ticketId,
          ephemeralPoint,
          nonce,
          wrappedKey,
          ciphertext,
        ),
    );
  };

  // The login page's handleSubmit calls bridge.zeroAll() before every
  // submit (a product defense against a stale KEYED worker from a
  // previous session). In the demo, the worker is keyed exactly once
  // per iframe with the demo credentials and the login scene replays
  // its submit over that keyed worker. Letting the zeroAll through
  // would wipe the keys while the memoized ensureKeyed promise keeps
  // reporting them derived, breaking every decrypt afterward. The
  // stale-session case the product defends against cannot occur here,
  // so the wrapper swallows zeroAll entirely.
  const noopZeroAll = async function noopZeroAll(): Promise<void> {
    await Promise.resolve();
  };

  // Build the wrapper as a Proxy. All property accesses pass through
  // to the real bridge except decrypt and decryptAndRewrap, which
  // return the pre-built paced wrappers, and zeroAll, which is
  // swallowed (see above).
  const handler: ProxyHandler<CryptoBridge> = {
    get(
      target: CryptoBridge,
      prop: string | symbol,
      _receiver: unknown,
    ): unknown {
      if (prop === "decrypt") return pacedDecrypt;
      if (prop === "decryptAndRewrap") return pacedDecryptAndRewrap;
      if (prop === "zeroAll") return noopZeroAll;
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
    clearPacedKeys(): void {
      pacedKeys.clear();
    },
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

  // Start the keepalive interval. Re-arms the worker's 30-minute idle
  // timer by posting a lightweight getVolPublic message every 5 minutes.
  // If the worker zeroed (e.g. machine slept past the backstop), the
  // ping fails and the recovery path re-derives keys from demo creds.
  startKeepalive(bridge);

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
// Auth state (rune-backed for reactive consumers)
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
  Permission.DELETE_CLIENTS,
  Permission.VIEW_CLIENTS,
  Permission.MANAGE_ORG_CONFIG,
  Permission.MANAGE_KEYS,
  Permission.MANAGE_INFRASTRUCTURE,
  Permission.MANAGE_ROLES,
]);

let currentUserId: string | undefined = $state("demo-user-001");
let currentUserRoleId: string | undefined = $state(RoleId.ADMIN);
let currentPermissions: ReadonlySet<Permission> = $state(DEFAULT_PERMISSIONS);

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
// Keepalive: re-arm the worker's idle timer + self-heal on silent zero
// -----------------------------------------------------------------------

let keepaliveStarted = false;
let recoveryInFlight = false;
let hasEverKeyed = false;

function startKeepalive(bridge: CryptoBridge): void {
  if (keepaliveStarted) return;
  keepaliveStarted = true;

  setInterval(() => {
    // Fire-and-forget ping. The message itself re-arms the worker's
    // idle timer regardless of whether the request succeeds.
    void bridge
      .getVolPublic()
      .then(() => {
        // Ping succeeded, worker is still keyed. Nothing to do.
      })
      .catch(() => {
        // Ping failed. Evaluate whether this is a silent idle-zero
        // that needs recovery (vs. a pre-keying boot failure or an
        // already-in-flight recovery).
        const action = keepaliveDecision({
          pingFailed: true,
          believedKeyed: bridge.getState() === "KEYED",
          recoveryInFlight,
          hasEverKeyed,
        });

        if (action === "recover") {
          recoveryInFlight = true;

          // Sync the stale main-thread bridge state to READY.
          // The worker side already zeroed; this call is idempotent.
          void bridge
            .zeroAll()
            .catch(() => {
              // Swallowed: the worker may reject if already zeroed.
              // The important thing is that the bridge state resets
              // so the next ensureKeyed can re-derive.
            })
            .then(() => {
              // Reset the ensureKeyed memos so a fresh derivation runs.
              resetEnsureKeyedMemos();

              // Clear all decrypt caches (including poisoned error sentinels).
              cacheRegistry.reset();

              // Re-derive keys with the demo credentials.
              void ensureKeyed()
                .catch(() => {
                  // Swallowed: if re-keying fails the visitor is already
                  // in a degraded state and a page reload is the only
                  // real fix. Logging here would risk leaking internals.
                })
                .finally(() => {
                  recoveryInFlight = false;
                });
            });
        }
      });
  }, KEEPALIVE_INTERVAL_MS);
}

// -----------------------------------------------------------------------
// ensureKeyed: idempotent real login crypto pipeline
// -----------------------------------------------------------------------

let ensureKeyedPromise: Promise<void> | null = null;
let ensureKeyedResult: LoginCryptoResult | null = null;
let derivationRecording: readonly RecordedFlowEvent[] | null = null;

/**
 * Reset the ensureKeyed memos so a subsequent call runs the full
 * derivation pipeline again. Called by the keepalive recovery path
 * after a silent worker idle-zero.
 */
function resetEnsureKeyedMemos(): void {
  ensureKeyedPromise = null;
  ensureKeyedResult = null;
}

/**
 * Retrieve the flow events recorded during the real derivation.
 * Returns null until the first ensureKeyed run completes.
 */
export function getDerivationRecording(): readonly RecordedFlowEvent[] | null {
  return derivationRecording;
}

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

  // Record flow events emitted during the real derivation so the
  // boot burst does not appear in the band. The login-crypto stub
  // replays the recording during its paced choreography.
  startFlowRecording();
  let recorded: readonly RecordedFlowEvent[];
  try {
    const result = await realLoginCrypto(
      DEMO_ADMIN_IDENTIFIER,
      DEMO_ADMIN_PASSWORD,
      bridge,
      noopCallbacks,
    );
    ensureKeyedResult = result;
  } finally {
    recorded = stopFlowRecording();
  }
  derivationRecording = recorded;

  // Load the org key so OrgDecryptCache can decrypt
  if (ensureKeyedResult.orgPublicKey != null) {
    okm.load(ensureKeyedResult.orgPublicKey);
  }

  // Mark that initial keying succeeded so the keepalive recovery path
  // knows a future getVolPublic failure is a silent idle-zero, not a
  // boot-time error.
  hasEverKeyed = true;

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
 * Update the role and permissions of the signed-in demo user.
 * Called by PhoneApp after the engine mutates the DB row and
 * refetches auth.me to get the server-authoritative permission set.
 */
export function setRoleAndPermissions(
  roleId: string,
  permissions: ReadonlySet<Permission>,
): void {
  currentUserRoleId = roleId;
  currentPermissions = permissions;
}

/**
 * Clear the pacing bridge's first-resolution stagger cache so the next
 * query reset re-triggers the descramble animation on every visible
 * decrypt placeholder. Called by the PhoneApp "decryption" pulse topic.
 */
export function replayDescramble(): void {
  if (pacingBridge !== null) {
    pacingBridge.clearPacedKeys();
  }
}
