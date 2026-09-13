/**
 * Public context getters for portal bridge singletons.
 *
 * Every client-facing component can import these getters. The setters
 * live in context-init.ts and are restricted to PortalBridgeProvider.
 *
 * The context holds a factory function rather than a bridge instance
 * because PortalBridge lifetimes are page-scoped or even shorter
 * (proof-of-knowledge bridges, post-rotation bridges). The factory
 * gives each consumer an injection seam without sharing a single
 * long-lived worker across fundamentally different page flows.
 */

import { createContext } from "svelte";
import type { PortalBridge } from "$lib/workers/portal-bridge.js";

export type PortalBridgeFactory = () => PortalBridge;

const [getPortalBridgeFactory, setPortalBridgeFactory] =
  createContext<PortalBridgeFactory>();

// Public API: getter only. Any component under (client) can use this.
export { getPortalBridgeFactory };

// Private API: setter. Re-exported from context-init.ts for PortalBridgeProvider only.
export { setPortalBridgeFactory };
