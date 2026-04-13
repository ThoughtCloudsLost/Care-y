/**
 * Public context getters for crypto singletons and auth state.
 *
 * Every authenticated component can import these getters. The setters
 * live in context-init.ts and are restricted to CryptoProvider.
 *
 * Each pair is created via createContext<T>() (Svelte 5.40+), which
 * returns a [getter, setter] tuple. The getter throws if context was
 * not set by a parent component, failing fast if a page renders
 * outside the (app) layout.
 *
 * All contexts are set in CryptoProvider.svelte via context-init.ts.
 */

import { createContext } from "svelte";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { OrgKeyManager } from "./org-key.js";
import type { OrgDecryptCache } from "./org-decrypt-cache.js";
import type { TicketDecryptCache } from "./ticket-decrypt-cache.js";
import type { FollowUpDecryptCache } from "./follow-up-decrypt-cache.js";
import type { PreviewLoader } from "$lib/tickets/preview-loader.svelte.js";

const [getCryptoBridge, setCryptoBridge] = createContext<CryptoBridge>();
const [getOrgKeyManager, setOrgKeyManager] = createContext<OrgKeyManager>();
const [getOrgDecryptCache, setOrgDecryptCache] =
  createContext<OrgDecryptCache>();
const [getTicketDecryptCache, setTicketDecryptCache] =
  createContext<TicketDecryptCache>();
const [getCurrentUserId, setCurrentUserId] =
  createContext<() => string | undefined>();
const [getCurrentUserRoleId, setCurrentUserRoleId] =
  createContext<() => string | undefined>();
const [getFollowUpDecryptCache, setFollowUpDecryptCache] =
  createContext<FollowUpDecryptCache>();
const [getPreviewLoader, setPreviewLoader] = createContext<PreviewLoader>();

// Public API: getters only. Any component under (app) can use these.
export {
  getCryptoBridge,
  getOrgKeyManager,
  getOrgDecryptCache,
  getTicketDecryptCache,
  getCurrentUserId,
  getCurrentUserRoleId,
  getFollowUpDecryptCache,
  getPreviewLoader,
};

// Private API: setters. Re-exported from context-init.ts for CryptoProvider only.
export {
  setCryptoBridge,
  setOrgKeyManager,
  setOrgDecryptCache,
  setTicketDecryptCache,
  setCurrentUserId,
  setCurrentUserRoleId,
  setFollowUpDecryptCache,
  setPreviewLoader,
};
