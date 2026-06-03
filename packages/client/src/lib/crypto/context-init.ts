/**
 * Context setters for crypto singletons.
 *
 * ONLY import in CryptoProvider (bridge + orgKeyManager) or
 * AppCryptoProvider (caches, identity, PreviewLoader).
 *
 * Page components and content components should never set context.
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
