/**
 * Public barrel for @care-y/demo.
 *
 * External consumers (care-y.com embed) import from this entry point.
 * Flow components are re-exported even though the source files are not
 * yet on disk; they will exist before the build runs.
 */

export { default as DemoFrame } from "./DemoFrame.svelte";
export { default as DemoSurface } from "./DemoSurface.svelte";
export { default as TicketsFlowDemo } from "./flows/TicketsFlowDemo.svelte";
export { default as ConversationDemo } from "./flows/ConversationDemo.svelte";
export { default as SearchFlowDemo } from "./flows/SearchFlowDemo.svelte";
