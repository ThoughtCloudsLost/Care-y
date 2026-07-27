/**
 * Stub for $lib/crypto/context.
 *
 * Mirrors every exported getter name from the real module. Instead
 * of Svelte's createContext (which requires a live component tree),
 * each getter returns a demo-controlled singleton backed by SvelteMap.
 *
 * The reveal controller (written by a later task) calls demoSeed()
 * to inject plaintext values and demoReset() to clear all caches.
 * This is the descramble hook: components read from these caches
 * exactly as they would in the real app, so reveals look authentic.
 *
 * getCryptoBridge() returns a passthrough stub that carries base64
 * payloads through sealSelfBlob/openSelfBlob unchanged. This is
 * enough for recent-views (the only AppShell call site). Operations
 * not on that surface throw DemoStubError.
 */

import { SvelteMap } from "svelte/reactivity";
import { Permission } from "@care-y/shared";
import type { RawFollowUpPreview } from "$lib/tickets/preview-loader.svelte.js";

// Type-only imports of the real classes so getters present the expected
// types to consuming components. The runtime objects are structural stubs;
// the `as unknown as X` casts bridge the gap.
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";
import type { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";
import type { TicketDecryptCache } from "$lib/crypto/ticket-decrypt-cache.js";
import type { FollowUpDecryptCache } from "$lib/crypto/follow-up-decrypt-cache.js";
import type { PreviewLoader } from "$lib/tickets/preview-loader.svelte.js";

// -----------------------------------------------------------------------
// Ticket decrypt cache (mirrors TicketDecryptCache public methods)
// -----------------------------------------------------------------------

const ticketCache = new SvelteMap<string, string>();

const ticketDecryptCacheStub = {
  decryptTitle(
    ticketId: string,
    _keyWrap: unknown,
    _encryptedTitle: unknown,
  ): string | undefined {
    return ticketCache.get(ticketId);
  },
  decryptDescription(
    ticketId: string,
    _keyWrap: unknown,
    _encryptedDescription: unknown,
  ): string | undefined {
    return ticketCache.get(`desc:${ticketId}`);
  },
  decryptFollowUp(
    ticketId: string,
    followupId: string,
    _keyWrap: unknown,
    _ciphertext: string,
  ): string | undefined {
    return ticketCache.get(`fu:${ticketId}:${followupId}`);
  },
  decryptReadCursor(
    ticketId: string,
    _userId: string,
    _keyWrap: unknown,
    _encryptedReadCursor: unknown,
  ): string | undefined {
    return ticketCache.get(`cursor:${ticketId}`);
  },
  has(key: string): boolean {
    return ticketCache.has(key);
  },
  get(key: string): string | undefined {
    return ticketCache.get(key);
  },
  seed(key: string, plaintext: string): void {
    ticketCache.set(key, plaintext);
  },
  clear(): void {
    ticketCache.clear();
  },
  clearFollowUps(): void {
    for (const key of [...ticketCache.keys()]) {
      if (key.startsWith("fu:")) {
        ticketCache.delete(key);
      }
    }
  },
  deleteByPrefix(prefix: string): void {
    for (const key of [...ticketCache.keys()]) {
      if (key.startsWith(prefix)) {
        ticketCache.delete(key);
      }
    }
  },
  async whenSettled(): Promise<void> {
    await Promise.resolve();
  },
  get size(): number {
    return ticketCache.size;
  },
  entries(): IterableIterator<[string, string]> {
    return ticketCache.entries();
  },
};

// -----------------------------------------------------------------------
// Follow-up decrypt cache (mirrors FollowUpDecryptCache public methods)
// -----------------------------------------------------------------------

const followUpCache = new SvelteMap<string, string>();

const followUpDecryptCacheStub = {
  decryptContent(
    cacheKey: string,
    _ticketId: string,
    _slot: string,
    _keyWrap: unknown,
    _encryptedContent: unknown,
    _rewrapContext?: unknown,
  ): string | undefined {
    return followUpCache.get(cacheKey);
  },
  has(key: string): boolean {
    return followUpCache.has(key);
  },
  get(key: string): string | undefined {
    return followUpCache.get(key);
  },
  seed(key: string, plaintext: string): void {
    followUpCache.set(key, plaintext);
  },
  clear(): void {
    followUpCache.clear();
  },
  deleteByPrefix(prefix: string): void {
    for (const key of [...followUpCache.keys()]) {
      if (key.startsWith(prefix)) {
        followUpCache.delete(key);
      }
    }
  },
  async whenSettled(): Promise<void> {
    await Promise.resolve();
  },
  get size(): number {
    return followUpCache.size;
  },
  entries(): IterableIterator<[string, string]> {
    return followUpCache.entries();
  },
};

// -----------------------------------------------------------------------
// Org decrypt cache (mirrors OrgDecryptCache public methods)
// -----------------------------------------------------------------------

const orgCache = new SvelteMap<string, string>();

const orgDecryptCacheStub = {
  decrypt(id: string, _data: unknown): string | null {
    return orgCache.get(id) ?? null;
  },
  async decryptAsync(id: string, _data: unknown): Promise<string | null> {
    await Promise.resolve();
    return orgCache.get(id) ?? null;
  },
  has(id: string): boolean {
    return orgCache.has(id);
  },
  get(id: string): string | undefined {
    return orgCache.get(id);
  },
  delete(id: string): boolean {
    return orgCache.delete(id);
  },
  clear(): void {
    orgCache.clear();
  },
  async whenSettled(): Promise<void> {
    await Promise.resolve();
  },
  get size(): number {
    return orgCache.size;
  },
};

// -----------------------------------------------------------------------
// Org key manager stub
// -----------------------------------------------------------------------

const orgKeyManagerStub = {
  async unwrapOrgKey(): Promise<void> {
    await Promise.resolve();
  },
  // login-crypto result passes orgPublicKey to load()
  load(_orgPublicKey: string): void {
    // No-op: the demo does not perform real key unwrapping.
  },
  // cleanup.ts calls zero() on beforeunload
  zero(): void {
    // No-op: no real key material in the demo.
  },
  isReady(): boolean {
    return true;
  },
  get isLoaded(): boolean {
    return true;
  },
};

// -----------------------------------------------------------------------
// Preview loader (mirrors PreviewLoader interface from preview-loader.svelte.ts)
// -----------------------------------------------------------------------

const rawPreviews = new SvelteMap<string, RawFollowUpPreview[]>();

const previewLoaderStub = {
  rawPreviews,
  observe(_ticketId: string): void {
    // No-op: the demo pre-populates rawPreviews via demoSeed.
  },
  async eagerLoad(_ticketIds: string[]): Promise<void> {
    await Promise.resolve();
    // No-op: the demo pre-populates rawPreviews via demoSeed.
  },
  get(ticketId: string): RawFollowUpPreview[] | undefined {
    return rawPreviews.get(ticketId);
  },
};

// -----------------------------------------------------------------------
// Crypto bridge stub (passthrough seal/open for recent-views)
// -----------------------------------------------------------------------

/**
 * Lightweight envelope: carries the base64 payload through unchanged.
 * The demo has no real crypto, so sealSelfBlob wraps the payload in
 * a fake envelope and openSelfBlob unwraps it back.
 */
interface DemoSelfBlobEnvelope {
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly wrappedPayload: string;
}

const cryptoBridgeStub = {
  async sealSelfBlob(dataB64: string): Promise<DemoSelfBlobEnvelope> {
    await Promise.resolve();
    return {
      ephemeralPoint: "demo-ephemeral",
      nonce: "demo-nonce",
      wrappedPayload: dataB64,
    };
  },
  async openSelfBlob(envelope: DemoSelfBlobEnvelope): Promise<string> {
    await Promise.resolve();
    return envelope.wrappedPayload;
  },
  // Passthrough for direct bridge decrypts (read cursors): the demo's
  // "ciphertext" already carries the plaintext payload.
  async decrypt(
    _ticketId: string,
    _slot: string,
    _keyCacheId: string,
    _ephemeralPoint: string,
    _nonce: string,
    _wrappedKey: string,
    ciphertext: string,
  ): Promise<string> {
    await Promise.resolve();
    return ciphertext;
  },
  // Passthrough for org-level decrypts (e.g. encryptedPreferredLocale).
  // Returns the input unchanged; the demo's mock locale is null, but
  // having a working stub surfaces bugs if the mock changes.
  async orgDecrypt(ciphertext: string): Promise<string> {
    await Promise.resolve();
    return ciphertext;
  },
  // cleanup.ts installs a beforeunload handler that calls disconnect().
  // Iframe reload fires beforeunload, so this must exist.
  disconnect(): void {
    // No-op: the demo bridge has no port management.
  },
  onStateChange(_cb: unknown): void {
    // No-op: the demo bridge has no state transitions.
  },
  async zeroAll(): Promise<void> {
    await Promise.resolve();
  },
};

// -----------------------------------------------------------------------
// Auth state stubs
// -----------------------------------------------------------------------

/**
 * Default permission set: a manager-level volunteer who can see the
 * admin sidebar and use volunteer search. Scenes can override via
 * demoSeed({ permissions: ... }).
 */
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
let currentUserRoleId: string | undefined = "demo-role-001";
let currentPermissions: ReadonlySet<Permission> = DEFAULT_PERMISSIONS;

// -----------------------------------------------------------------------
// Public getters (mirror the real module's export names exactly)
// -----------------------------------------------------------------------

export function getCryptoBridge(): CryptoBridge {
  return cryptoBridgeStub as unknown as CryptoBridge;
}

export function getOrgKeyManager(): OrgKeyManager {
  return orgKeyManagerStub as unknown as OrgKeyManager;
}

export function getOrgDecryptCache(): OrgDecryptCache {
  return orgDecryptCacheStub as unknown as OrgDecryptCache;
}

export function getTicketDecryptCache(): TicketDecryptCache {
  return ticketDecryptCacheStub as unknown as TicketDecryptCache;
}

export function getFollowUpDecryptCache(): FollowUpDecryptCache {
  return followUpDecryptCacheStub as unknown as FollowUpDecryptCache;
}

export function getPreviewLoader(): PreviewLoader {
  return previewLoaderStub;
}

export function getCurrentUserId(): () => string | undefined {
  return () => currentUserId;
}

export function getCurrentUserRoleId(): () => string | undefined {
  return () => currentUserRoleId;
}

export function getCurrentPermissions(): () => ReadonlySet<Permission> {
  // Returned as a closure so re-seeding takes effect immediately:
  // the getter always reads the current `currentPermissions` reference.
  return (): ReadonlySet<Permission> => currentPermissions;
}

// The real module also exports setters (from context-init.ts).
// These are no-ops here: the demo never calls them, but they must
// exist for any transitive import that references the name.
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
// Demo engine API: populate and reset caches
// -----------------------------------------------------------------------

export interface DemoSeedData {
  /** ticket id -> plaintext title */
  titles?: Record<string, string>;
  /** "desc:<ticketId>" -> plaintext description */
  descriptions?: Record<string, string>;
  /** "fu:<ticketId>:<followupId>" -> plaintext content */
  followUps?: Record<string, string>;
  /** org-cache id -> plaintext */
  orgValues?: Record<string, string>;
  /** follow-up cache key -> plaintext */
  followUpContent?: Record<string, string>;
  /** preview loader: ticket id -> raw preview array */
  previews?: Record<string, RawFollowUpPreview[]>;
  /** read cursors: "cursor:<ticketId>" -> JSON payload */
  readCursors?: Record<string, string>;
  /** override the demo user/role IDs */
  userId?: string;
  userRoleId?: string;
  /** override the demo permission set (defaults to manager-level) */
  permissions?: ReadonlySet<Permission>;
}

/**
 * Populate the demo caches with plaintext values. Called by the
 * reveal controller to stage content before the descramble animation.
 */
export function demoSeed(data: DemoSeedData): void {
  if (data.titles) {
    for (const [id, text] of Object.entries(data.titles)) {
      ticketCache.set(id, text);
    }
  }
  if (data.descriptions) {
    for (const [key, text] of Object.entries(data.descriptions)) {
      ticketCache.set(key, text);
    }
  }
  if (data.followUps) {
    for (const [key, text] of Object.entries(data.followUps)) {
      ticketCache.set(key, text);
    }
  }
  if (data.readCursors) {
    for (const [key, text] of Object.entries(data.readCursors)) {
      ticketCache.set(key, text);
    }
  }
  if (data.orgValues) {
    for (const [id, text] of Object.entries(data.orgValues)) {
      orgCache.set(id, text);
    }
  }
  if (data.followUpContent) {
    for (const [key, text] of Object.entries(data.followUpContent)) {
      followUpCache.set(key, text);
    }
  }
  if (data.previews) {
    for (const [id, arr] of Object.entries(data.previews)) {
      rawPreviews.set(id, arr);
    }
  }
  if (data.userId !== undefined) currentUserId = data.userId;
  if (data.userRoleId !== undefined) currentUserRoleId = data.userRoleId;
  if (data.permissions !== undefined) currentPermissions = data.permissions;
}

/** Clear all demo caches and reset auth state to defaults. */
export function demoReset(): void {
  ticketCache.clear();
  followUpCache.clear();
  orgCache.clear();
  rawPreviews.clear();
  currentUserId = "demo-user-001";
  currentUserRoleId = "demo-role-001";
  currentPermissions = DEFAULT_PERMISSIONS;
}
