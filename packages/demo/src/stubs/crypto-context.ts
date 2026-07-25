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
 * getCryptoBridge() throws because no real Worker or key material
 * exists in the demo. Any component that reaches the bridge directly
 * is outside the demo's supported surface.
 */

import { SvelteMap } from "svelte/reactivity";
import type { Permission } from "@care-y/shared";

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
    // Nothing is ever pending in the demo stub.
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
    // Nothing is ever pending in the demo stub.
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
    return Promise.resolve(orgCache.get(id) ?? null);
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
    // Nothing is ever pending in the demo stub.
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
    // No-op: the demo never unwraps real keys.
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

const rawPreviews = new SvelteMap<string, unknown[]>();

const previewLoaderStub = {
  rawPreviews,
  observe(_ticketId: string): void {
    // No-op: the demo pre-populates rawPreviews via demoSeed.
  },
  async eagerLoad(_ticketIds: string[]): Promise<void> {
    // No-op: the demo pre-populates rawPreviews via demoSeed.
  },
  get(ticketId: string): unknown[] | undefined {
    return rawPreviews.get(ticketId);
  },
};

// -----------------------------------------------------------------------
// Auth state stubs
// -----------------------------------------------------------------------

let currentUserId: string | undefined = "demo-user-001";
let currentUserRoleId: string | undefined = "demo-role-001";
const currentPermissions: ReadonlySet<Permission> = new Set<Permission>();

// -----------------------------------------------------------------------
// Public getters (mirror the real module's export names exactly)
// -----------------------------------------------------------------------

class DemoStubError extends Error {
  override readonly name = "DemoStubError";
  constructor(fnName: string) {
    super(
      `${fnName} is stubbed out in the demo: no crypto Worker or key material exists`,
    );
  }
}

export function getCryptoBridge(): never {
  throw new DemoStubError("getCryptoBridge");
}

export function getOrgKeyManager(): typeof orgKeyManagerStub {
  return orgKeyManagerStub;
}

export function getOrgDecryptCache(): typeof orgDecryptCacheStub {
  return orgDecryptCacheStub;
}

export function getTicketDecryptCache(): typeof ticketDecryptCacheStub {
  return ticketDecryptCacheStub;
}

export function getFollowUpDecryptCache(): typeof followUpDecryptCacheStub {
  return followUpDecryptCacheStub;
}

export function getPreviewLoader(): typeof previewLoaderStub {
  return previewLoaderStub;
}

export function getCurrentUserId(): () => string | undefined {
  return () => currentUserId;
}

export function getCurrentUserRoleId(): () => string | undefined {
  return () => currentUserRoleId;
}

export function getCurrentPermissions(): () => ReadonlySet<Permission> {
  return () => currentPermissions;
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
  previews?: Record<string, unknown[]>;
  /** read cursors: "cursor:<ticketId>" -> JSON payload */
  readCursors?: Record<string, string>;
  /** override the demo user/role IDs */
  userId?: string;
  userRoleId?: string;
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
}

/** Clear all demo caches and reset auth state to defaults. */
export function demoReset(): void {
  ticketCache.clear();
  followUpCache.clear();
  orgCache.clear();
  rawPreviews.clear();
  currentUserId = "demo-user-001";
  currentUserRoleId = "demo-role-001";
}
