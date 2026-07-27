/**
 * Public barrel for @care-y/demo.
 *
 * External consumers (care-y.com embed) import from this entry point.
 * Scene components are exported from the scenes registry; flow
 * components have been superseded by the scene architecture.
 */

export { default as DemoFrame } from "./DemoFrame.svelte";
export { default as TopBar } from "./TopBar.svelte";
export { default as StorySection } from "./StorySection.svelte";
export { createDemoRouter } from "./router.svelte.js";
export {
  createDemoQueryClient,
  reseedDemoQueryClient,
} from "./demo-query-client.js";
export { scenes, getSceneComponent } from "./scenes/index.js";
export { default as TicketsMount } from "./scenes/TicketsMount.svelte";
export { DEMO_TOPICS } from "./bridge.js";
export { classifyDemoLabel } from "./topic-classifier.js";
export {
  SECTIONS,
  parseHash,
  buildHash,
  resolvePhoneCommand,
  bridgeStateToLocation,
  sectionMatchesPhone,
  loginTopicMatchesStage,
} from "./scroll-sections.js";
export { createDemoLocationStore } from "./demo-location.svelte.js";
export {
  createScrollEngine,
  createTopicProgress,
} from "./scroll-engine.svelte.js";
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
  DemoTopic,
  DemoLocation,
  LocationOrigin,
  PageOrigin,
} from "./bridge.js";
export type {
  DemoLocationStore,
  LocationStoreDeps,
  PhoneScreenState,
} from "./demo-location.svelte.js";
export type { ClassifierContext } from "./topic-classifier.js";
export type {
  Section,
  SubSection,
  SectionId,
  ParsedHash,
  PhoneCommand,
} from "./scroll-sections.js";
export type { ScrollEngine, TopicProgress } from "./scroll-engine.svelte.js";
