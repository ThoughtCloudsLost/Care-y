/**
 * Context setters for crypto singletons. ONLY import this in CryptoProvider.
 *
 * Page components and content components should never set context.
 * All contexts are initialized once in CryptoProvider.svelte at app startup.
 * If you need access to a cache, import the getter from context.ts instead.
 */

export {
  setCryptoBridge,
  setOrgKeyManager,
  setOrgDecryptCache,
  setTicketDecryptCache,
  setCurrentUserId,
  setCurrentUserRoleId,
  setCurrentPermissions,
  setFollowUpDecryptCache,
  setPreviewLoader,
} from "./context.js";
