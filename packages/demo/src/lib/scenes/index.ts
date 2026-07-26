/**
 * Scene registry for the demo.
 *
 * Each built feature maps to either a Svelte component (rendered
 * inside AppShell as the page content) or null (meaning the feature
 * uses a shell overlay like the search sheet, not page content).
 */

import type { Component } from "svelte";
import type { DemoFeature } from "../router.svelte.js";
import TicketsScene from "./TicketsScene.svelte";

/**
 * Scene entry: a component to render as page content, or null
 * when the feature uses a shell overlay (search sheet) instead.
 */
export interface SceneEntry {
  /** Svelte component rendered inside AppShell's children slot.
   *  Null means the feature is handled by a shell overlay (e.g. search sheet). */
  readonly component: Component | null;
  /** Human-readable label for debugging/logging. */
  readonly label: string;
}

/** Registry mapping each demo feature to its scene entry. */
export type SceneRegistry = Record<DemoFeature, SceneEntry>;

export const scenes: SceneRegistry = {
  tickets: {
    component: TicketsScene,
    label: "Tickets",
  },
  search: {
    component: null,
    label: "Search",
  },
};

/**
 * Look up the scene component for a feature. Returns null if the
 * feature uses a shell overlay or is not in the registry.
 */
export function getSceneComponent(
  feature: DemoFeature | null,
): Component | null {
  if (feature === null) return null;
  switch (feature) {
    case "tickets":
      return scenes.tickets.component;
    case "search":
      return scenes.search.component;
  }
}
