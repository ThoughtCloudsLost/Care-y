import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  findSectionNavButton,
  sectionAnchor,
  tapSectionNav,
} from "./section-nav.js";

/**
 * Minimal stand-in for a scroll-nav page: a SectionScrollNav whose
 * buttons carry data-section-id, plus the `#section-<id>` blocks they
 * scroll to.
 */
function mountScrollPage(ids: readonly string[]): void {
  const nav = document.createElement("nav");
  nav.className = "section-scroll-nav";
  for (const id of ids) {
    const button = document.createElement("button");
    button.dataset.sectionId = id;
    nav.appendChild(button);
  }
  document.body.appendChild(nav);

  for (const id of ids) {
    const block = document.createElement("div");
    block.id = `section-${id}`;
    document.body.appendChild(block);
  }
}

describe("findSectionNavButton", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("finds the button for a section id", () => {
    mountScrollPage(["general", "branding"]);
    const button = findSectionNavButton(document, "branding");
    expect(button?.dataset.sectionId).toBe("branding");
  });

  it("returns null for a section the page does not render", () => {
    mountScrollPage(["general"]);
    expect(findSectionNavButton(document, "retention")).toBeNull();
  });

  it("ignores a matching attribute outside the section nav", () => {
    // Only the subnavbar control scrolls; a stray data attribute
    // elsewhere must not be mistaken for it.
    const stray = document.createElement("button");
    stray.dataset.sectionId = "keys";
    document.body.appendChild(stray);

    expect(findSectionNavButton(document, "keys")).toBeNull();
  });
});

describe("sectionAnchor", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("finds the block for a section id", () => {
    mountScrollPage(["queues"]);
    expect(sectionAnchor(document, "queues")?.id).toBe("section-queues");
  });

  it("returns null when the block is absent", () => {
    expect(sectionAnchor(document, "queues")).toBeNull();
  });
});

describe("tapSectionNav", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  async function settle<T>(promise: Promise<T>): Promise<T> {
    await vi.advanceTimersByTimeAsync(500);
    return promise;
  }

  it("taps the nav button and resolves with the section block", async () => {
    mountScrollPage(["activity"]);
    const button = findSectionNavButton(document, "activity");
    const clicked = vi.fn();
    button?.addEventListener("click", clicked);

    const anchor = await settle(tapSectionNav(document, "activity"));

    expect(clicked).toHaveBeenCalledOnce();
    expect(anchor?.id).toBe("section-activity");
  });

  it("returns null when the page has no such section", async () => {
    mountScrollPage(["activity"]);
    const anchor = await settle(tapSectionNav(document, "retention"));
    expect(anchor).toBeNull();
  });

  it("returns the block when the section has no nav button", async () => {
    // A page can render section ids without a SectionScrollNav; the
    // block is still the right thing to point at.
    const block = document.createElement("div");
    block.id = "section-orphan";
    document.body.appendChild(block);

    const anchor = await settle(tapSectionNav(document, "orphan"));
    expect(anchor?.id).toBe("section-orphan");
  });

  it("abandons when the intent goes stale mid-scroll", async () => {
    mountScrollPage(["shift"]);
    const anchor = await settle(tapSectionNav(document, "shift", () => true));
    expect(anchor).toBeNull();
  });
});
