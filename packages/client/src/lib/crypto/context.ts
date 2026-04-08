/**
 * Typed Svelte 5 context pairs for crypto singletons and auth state.
 *
 * Each pair is created via createContext<T>() (Svelte 5.40+), which
 * returns a [getter, setter] tuple. The getter throws if context was
 * not set by a parent component, failing fast if a page renders
 * outside the (app) layout.
 *
 * All contexts are set in (app)/+layout.svelte and available to
 * every authenticated route via the getter functions.
 */

import { createContext } from "svelte";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { OrgKeyManager } from "./org-key.js";
import type { OrgDecryptCache } from "./org-decrypt-cache.js";
import type { TicketDecryptCache } from "./ticket-decrypt-cache.js";
import type { FollowUpDecryptCache } from "./follow-up-decrypt-cache.js";
import type { PreviewLoader } from "$lib/tickets/preview-loader.svelte.js";

export const [getCryptoBridge, setCryptoBridge] = createContext<CryptoBridge>();

export const [getOrgKeyManager, setOrgKeyManager] =
  createContext<OrgKeyManager>();

export const [getOrgDecryptCache, setOrgDecryptCache] =
  createContext<OrgDecryptCache>();

export const [getTicketDecryptCache, setTicketDecryptCache] =
  createContext<TicketDecryptCache>();

export const [getCurrentUserId, setCurrentUserId] =
  createContext<() => string | undefined>();

export const [getCurrentUserRoleId, setCurrentUserRoleId] =
  createContext<() => string | undefined>();

export const [getFollowUpDecryptCache, setFollowUpDecryptCache] =
  createContext<FollowUpDecryptCache>();

export const [getPreviewLoader, setPreviewLoader] =
  createContext<PreviewLoader>();
