/**
 * Scene registry for the demo.
 *
 * Each built feature maps to a Svelte component rendered inside the
 * phone app. Login renders outside the AppShell; tickets renders
 * inside it. The scene component lookup determines what the
 * PhoneApp mounts for each feature.
 */

import type { Component } from "svelte";
import type { DemoFeature } from "../bridge.js";
import TicketsMount from "./TicketsMount.svelte";
import LoginMount from "./LoginMount.svelte";

/**
 * Scene entry: a component to render as page content.
 */
export interface SceneEntry {
  /** Svelte component rendered for this feature. */
  readonly component: Component;
  /** Human-readable label for debugging/logging. */
  readonly label: string;
}

/** Registry mapping each demo feature to its scene entry. */
export type SceneRegistry = Record<DemoFeature, SceneEntry>;

export const scenes: SceneRegistry = {
  login: {
    component: LoginMount,
    label: "Login",
  },
  tickets: {
    component: TicketsMount,
    label: "Tickets",
  },
};

/**
 * Look up the scene component for a feature. Returns the login scene
 * if the feature is "login", otherwise the tickets scene.
 */
export function getSceneComponent(feature: DemoFeature): Component {
  // eslint-disable-next-line security/detect-object-injection -- feature is a typed DemoFeature union, not user input
  return scenes[feature].component;
}
