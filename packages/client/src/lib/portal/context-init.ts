/**
 * Context setters for portal bridge singletons.
 *
 * ONLY import in PortalBridgeProvider. Page components and content
 * components should never set context. If you need a bridge, import
 * the getter from context.ts instead.
 */

export { setPortalBridgeFactory } from "./context.js";
