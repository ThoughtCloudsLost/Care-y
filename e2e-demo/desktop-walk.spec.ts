/**
 * Story walk with the phone frame at the desktop preset. The iframe
 * viewport sits past the client's 1024px breakpoint, so every screen
 * the walk visits renders the desktop shell (sidebar navigation,
 * split views) instead of the phone shell.
 */

import { defineStoryWalk } from "./walk-suite.js";
import { enterDesktopPreset } from "./helpers.js";

defineStoryWalk({
  title: "story walk (desktop frame)",
  framePreset: "desktop",
  prepare: enterDesktopPreset,
});
