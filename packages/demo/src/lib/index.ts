/**
 * Public barrel for @care-y/demo.
 *
 * External consumers (care-y.com embed) import from this entry point.
 * Scene components are exported from the scenes registry; flow
 * components have been superseded by the scene architecture.
 */

export { default as DemoFrame } from "./DemoFrame.svelte";
export { default as NarrativePanel } from "./NarrativePanel.svelte";
export { default as FeatureList } from "./FeatureList.svelte";
export { createDemoRouter } from "./router.svelte.js";
export {
  createDemoQueryClient,
  reseedDemoQueryClient,
} from "./demo-query-client.js";
export { scenes, getSceneComponent } from "./scenes/index.js";
export { default as TicketsMount } from "./scenes/TicketsMount.svelte";
export type {
  DemoFeature,
  DemoDetail,
  DemoRouterState,
  DemoRouter,
} from "./router.svelte.js";
export type { SceneEntry, SceneRegistry } from "./scenes/index.js";
export type {
  DemoBridge,
  DemoBridgeState,
  DemoBridgeListener,
} from "./bridge.js";
