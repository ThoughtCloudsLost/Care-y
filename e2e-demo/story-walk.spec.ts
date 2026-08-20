/**
 * Story walk on the default phone frame. The suite body lives in
 * walk-suite.ts; desktop-walk.spec.ts runs the same walk with the
 * frame at the desktop preset.
 */

import { defineStoryWalk } from "./walk-suite.js";

defineStoryWalk({ title: "story walk" });
