import { describe, it, expect, beforeEach } from "vitest";
import {
  activeExcursion,
  openAggregation,
  openGuide,
  closeExcursion,
  closeOnPhoneNavigation,
  resetExcursion,
} from "./excursion.svelte.js";
import { isLinked, toggleLinked, resetLinked } from "./link-state.svelte.js";

beforeEach(() => {
  resetExcursion();
  resetLinked();
});

describe("excursion", () => {
  // -------------------------------------------------------------------
  // Mutual exclusion
  // -------------------------------------------------------------------

  it("starts with no active excursion", () => {
    expect(activeExcursion()).toBe(null);
  });

  it("openAggregation sets an aggregation excursion", () => {
    openAggregation("encryption");
    const ex = activeExcursion();
    expect(ex).not.toBe(null);
    expect(ex!.kind).toBe("aggregation");
    if (ex!.kind === "aggregation") {
      expect(ex!.page).toBe("encryption");
    }
  });

  it("openGuide sets a guide excursion", () => {
    openGuide("take-a-call");
    const ex = activeExcursion();
    expect(ex).not.toBe(null);
    expect(ex!.kind).toBe("guide");
    if (ex!.kind === "guide") {
      expect(ex!.slug).toBe("take-a-call");
    }
  });

  it("opening a guide then an aggregation closes the guide and restores link", () => {
    // Start linked, open a guide (unlinks)
    expect(isLinked()).toBe(true);
    openGuide("reply-to-client");
    expect(isLinked()).toBe(false);

    // Open aggregation replaces the guide
    openAggregation("who-sees");
    const ex = activeExcursion();
    expect(ex!.kind).toBe("aggregation");

    // Link was restored because the guide was open and had unlinked
    expect(isLinked()).toBe(true);
  });

  it("opening an aggregation then a guide closes the aggregation", () => {
    openAggregation("searching");
    openGuide("secure-share");
    const ex = activeExcursion();
    expect(ex!.kind).toBe("guide");
    if (ex!.kind === "guide") {
      expect(ex!.slug).toBe("secure-share");
    }
  });

  // -------------------------------------------------------------------
  // Link management on guide open
  // -------------------------------------------------------------------

  it("openGuide unlinks when currently linked", () => {
    expect(isLinked()).toBe(true);
    openGuide("take-a-call");
    expect(isLinked()).toBe(false);
  });

  it("openGuide does not toggle when already unlinked", () => {
    toggleLinked(); // now unlinked
    expect(isLinked()).toBe(false);
    openGuide("take-a-call");
    // Still unlinked, not re-linked
    expect(isLinked()).toBe(false);
  });

  // -------------------------------------------------------------------
  // Link restoration on close
  // -------------------------------------------------------------------

  it("closeExcursion relinks when guide was opened while linked", () => {
    openGuide("take-a-call");
    expect(isLinked()).toBe(false);
    closeExcursion("user");
    expect(isLinked()).toBe(true);
    expect(activeExcursion()).toBe(null);
  });

  it("closeExcursion does not relink when guide was opened while unlinked", () => {
    toggleLinked(); // unlink first
    openGuide("take-a-call");
    expect(isLinked()).toBe(false);
    closeExcursion("user");
    // Was already unlinked, so it stays unlinked
    expect(isLinked()).toBe(false);
  });

  it("closeExcursion does not relink when user manually relinked during the guide", () => {
    openGuide("take-a-call");
    expect(isLinked()).toBe(false);
    // User manually relinks during the guide
    toggleLinked();
    expect(isLinked()).toBe(true);
    closeExcursion("user");
    // wasLinkedOnOpen is true but isLinked is already true, so no toggle
    expect(isLinked()).toBe(true);
  });

  // -------------------------------------------------------------------
  // Phone navigation close
  // -------------------------------------------------------------------

  it("closeOnPhoneNavigation closes aggregations", () => {
    openAggregation("encryption");
    closeOnPhoneNavigation();
    expect(activeExcursion()).toBe(null);
  });

  it("closeOnPhoneNavigation does NOT close guides", () => {
    openGuide("take-a-call");
    closeOnPhoneNavigation();
    expect(activeExcursion()).not.toBe(null);
    expect(activeExcursion()!.kind).toBe("guide");
  });

  it("closeOnPhoneNavigation is a no-op when no excursion is active", () => {
    closeOnPhoneNavigation();
    expect(activeExcursion()).toBe(null);
  });

  // -------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------

  it("resetExcursion clears without link side effects", () => {
    openGuide("take-a-call");
    expect(isLinked()).toBe(false);
    resetExcursion();
    expect(activeExcursion()).toBe(null);
    // Reset does not relink (App calls resetLinked separately)
    expect(isLinked()).toBe(false);
  });
});
