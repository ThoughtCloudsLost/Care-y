/**
 * Public barrel for @care-y/demo.
 *
 * No in-monorepo consumer imports from this barrel today. It is the
 * intentional future embed surface for care-y.com. Kept by design so
 * the API contract is maintained and tested as the package evolves.
 *
 * RouteMount renders real client routes via the glob-derived manifest;
 * LoginMount is imported directly for the login feature.
 */

export { default as DemoFrame } from "./DemoFrame.svelte";
export { default as TopBar } from "./TopBar.svelte";
export { default as FlowStory } from "./FlowStory.svelte";
export type { PeekFirePayload } from "./clip-registry.js";
export { resolveStoryMessage } from "./story-messages.js";
export { createDemoRouter } from "./router.svelte.js";
export { createDemoQueryClient } from "./demo-query-client.js";
export { DEMO_TOPICS } from "./bridge.js";
export { classifyDemoLabel } from "./topic-classifier.js";
export {
  SECTIONS,
  ENTRY_SECTION,
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
export type { DemoFeature, DemoDetail, DemoRouter } from "./router.svelte.js";
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
export {
  READING_LINE_RATIO,
  readingLineY,
  scrollTargetFor,
  flowGeometryReady,
  setFlowGeometrySource,
} from "./flow-geometry.svelte.js";
export type {
  FlowLocation,
  FlowGeometrySource,
} from "./flow-geometry.svelte.js";
export {
  computeFlowLayout,
  hitTestBlock,
  locationAtY,
  scrollTargetForBlock,
  DEFAULT_METRICS,
  MIN_SEGMENT,
  HOLE_GAP,
  BOTH_SIDES_MIN,
  BALANCE_RATIO,
} from "./flow-layout.js";
export {
  presetAnchoredLeft,
  presetAnchoredTop,
  clampTopToViewport,
  FRAME_FIT_MARGIN,
} from "./frame-geometry.svelte.js";
export type {
  FlowBlock,
  FlowTextBlock,
  FlowFigureBlock,
  FlowTextKind,
  FlowBlockKind,
  FlowHole,
  FlowLine,
  FlowBlockGeometry,
  FlowFigureGeometry,
  FlowLayoutResult,
  FlowKindMetrics,
  FlowMetrics,
  LineFiller,
  LineCursor,
  LineFillerResult,
} from "./flow-layout.js";
