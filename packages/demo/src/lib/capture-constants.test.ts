/**
 * Drift guard: asserts that the capture script constants in
 * scripts/capture/constants.mjs match their TypeScript sources of truth.
 *
 * Adding a sub to scroll-sections.ts without a corresponding crop entry
 * in crop-registry.mjs (or an explicit default) will fail the coverage
 * check below.
 */

import { describe, it, expect } from "vitest";
import { PHONE_PRESET, BEZEL } from "./frame-geometry.svelte.js";
import { DEFAULT_CLIP_ASPECT } from "./clip-registry.js";
import { SECTIONS } from "./scroll-sections.js";
import {
  PHONE_W,
  PHONE_H,
  BEZEL as SCRIPT_BEZEL,
  DEFAULT_CROP_W,
  DEFAULT_CROP_H,
} from "../../scripts/capture/constants.mjs";
import { registeredSubs } from "../../scripts/capture/crop-registry.mjs";

// ---------------------------------------------------------------------------
// Shared numeric constants
// ---------------------------------------------------------------------------

describe("capture constants match TS sources", () => {
  it("PHONE_W matches PHONE_PRESET.w", () => {
    expect(PHONE_W).toBe(PHONE_PRESET.w);
  });

  it("PHONE_H matches PHONE_PRESET.h", () => {
    expect(PHONE_H).toBe(PHONE_PRESET.h);
  });

  it("BEZEL matches frame-geometry BEZEL", () => {
    expect(SCRIPT_BEZEL).toBe(BEZEL);
  });

  it("DEFAULT_CROP_W matches PHONE_PRESET.w", () => {
    expect(DEFAULT_CROP_W).toBe(PHONE_PRESET.w);
  });

  it("DEFAULT_CROP_H matches PHONE_W / DEFAULT_CLIP_ASPECT", () => {
    expect(DEFAULT_CROP_H).toBe(
      Math.round(PHONE_PRESET.w / DEFAULT_CLIP_ASPECT),
    );
  });
});

// ---------------------------------------------------------------------------
// Crop registry coverage
// ---------------------------------------------------------------------------

describe("crop registry completeness", () => {
  it("every SECTIONS sub has a crop entry or uses the default", () => {
    const registered = new Set(registeredSubs());
    const missing: string[] = [];

    for (const section of SECTIONS) {
      for (const sub of section.subs) {
        const key = `${section.id}/${sub.slug}`;
        if (!registered.has(key)) {
          missing.push(key);
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it("every crop registry key corresponds to a real SECTIONS sub", () => {
    const validKeys = new Set<string>();
    for (const section of SECTIONS) {
      for (const sub of section.subs) {
        validKeys.add(`${section.id}/${sub.slug}`);
      }
    }

    const registered = registeredSubs();
    const stale = registered.filter(
      (/** @type {string} */ key) => !validKeys.has(key),
    );

    expect(stale).toEqual([]);
  });
});
