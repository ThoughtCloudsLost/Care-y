import { describe, it, expect } from "vitest";
import {
  hasClip,
  getClip,
  buildClipUrl,
  DEFAULT_CLIP_ASPECT,
  type PeekFirePayload,
} from "./clip-registry.js";
import type { SectionId } from "./scroll-sections.js";

// -----------------------------------------------------------------------
// buildClipUrl
// -----------------------------------------------------------------------

describe("buildClipUrl", () => {
  it("builds the conventional path from base, sectionId, and subSlug", () => {
    const url = buildClipUrl("login" as SectionId, "credentials", "/demo/");
    expect(url).toBe("/demo/clips/login/credentials.webm");
  });

  it("handles a base without a trailing slash", () => {
    const url = buildClipUrl("tickets" as SectionId, "sort", "/app");
    expect(url).toBe("/app/clips/tickets/sort.webm");
  });

  it("handles a root base", () => {
    const url = buildClipUrl("dashboard" as SectionId, "intro", "/");
    expect(url).toBe("/clips/dashboard/intro.webm");
  });
});

// -----------------------------------------------------------------------
// hasClip
// -----------------------------------------------------------------------

describe("hasClip", () => {
  // CLIPS_ENABLED is false until clip assets exist on disk, so hasClip
  // reports false for every sub, narrated or not. When the switch
  // flips, restore positive assertions for narrated subs here
  // (e.g. login/credentials, dashboard/queues, tickets/sort).
  it("returns false for narrated subs while clips are disabled", () => {
    expect(hasClip("login" as SectionId, "credentials")).toBe(false);
    expect(hasClip("dashboard" as SectionId, "queues")).toBe(false);
    expect(hasClip("tickets" as SectionId, "sort")).toBe(false);
  });

  it("returns false for a non-narrated section", () => {
    // "coming-soon" is not in SECTIONS
    expect(hasClip("coming-soon" as SectionId, "any-slug")).toBe(false);
  });
});

// -----------------------------------------------------------------------
// getClip
// -----------------------------------------------------------------------

describe("getClip", () => {
  it("returns the default aspect ratio when no override exists", () => {
    const clip = getClip("login" as SectionId, "credentials");
    expect(clip.aspectRatio).toBe(DEFAULT_CLIP_ASPECT);
  });

  it("returns a URL ending in .webm with the section and sub path", () => {
    const clip = getClip("admin" as SectionId, "quarantine");
    expect(clip.url).toContain("/clips/admin/quarantine.webm");
  });
});

// -----------------------------------------------------------------------
// PeekFirePayload viaKeyboard discriminator
// -----------------------------------------------------------------------

describe("PeekFirePayload", () => {
  it("accepts viaKeyboard as an optional boolean", () => {
    // The type contract: pointer fires omit viaKeyboard (or set false),
    // keyboard fires set true. This test pins the discriminator field so
    // removing it from the interface causes a compile error.
    const pointerPayload: PeekFirePayload = {
      rect: new DOMRect(),
      video: document.createElement("video"),
      sectionId: "login" as SectionId,
      subSlug: "credentials",
    };
    expect(pointerPayload.viaKeyboard).toBeUndefined();

    const kbPayload: PeekFirePayload = {
      rect: new DOMRect(),
      video: document.createElement("video"),
      sectionId: "login" as SectionId,
      subSlug: "credentials",
      viaKeyboard: true,
    };
    expect(kbPayload.viaKeyboard).toBe(true);
  });
});
