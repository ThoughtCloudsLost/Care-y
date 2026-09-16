import { describe, it, expect, beforeEach } from "vitest";
import {
  toggleStep,
  isStepDone,
  guideProgress,
  resetGuideProgress,
} from "./guide-progress.svelte.js";

beforeEach(() => {
  resetGuideProgress();
});

describe("guide-progress", () => {
  it("starts with no steps done", () => {
    expect(isStepDone("take-a-call", 0)).toBe(false);
    expect(guideProgress("take-a-call").done).toBe(0);
  });

  it("toggleStep marks a step as done", () => {
    toggleStep("take-a-call", 0);
    expect(isStepDone("take-a-call", 0)).toBe(true);
  });

  it("toggleStep again unmarks the step", () => {
    toggleStep("take-a-call", 0);
    toggleStep("take-a-call", 0);
    expect(isStepDone("take-a-call", 0)).toBe(false);
  });

  it("tracks multiple steps independently", () => {
    toggleStep("take-a-call", 0);
    toggleStep("take-a-call", 2);
    expect(isStepDone("take-a-call", 0)).toBe(true);
    expect(isStepDone("take-a-call", 1)).toBe(false);
    expect(isStepDone("take-a-call", 2)).toBe(true);
  });

  it("guideProgress returns correct done/total", () => {
    toggleStep("take-a-call", 0);
    toggleStep("take-a-call", 1);
    const p = guideProgress("take-a-call");
    expect(p.done).toBe(2);
    // take-a-call has 4 steps
    expect(p.total).toBe(4);
  });

  it("tracks guides independently", () => {
    toggleStep("take-a-call", 0);
    toggleStep("reply-to-client", 1);
    expect(isStepDone("take-a-call", 0)).toBe(true);
    expect(isStepDone("take-a-call", 1)).toBe(false);
    expect(isStepDone("reply-to-client", 0)).toBe(false);
    expect(isStepDone("reply-to-client", 1)).toBe(true);
  });

  it("resetGuideProgress clears all progress", () => {
    toggleStep("take-a-call", 0);
    toggleStep("reply-to-client", 1);
    resetGuideProgress();
    expect(isStepDone("take-a-call", 0)).toBe(false);
    expect(isStepDone("reply-to-client", 1)).toBe(false);
    expect(guideProgress("take-a-call").done).toBe(0);
  });

  it("guideProgress returns total 0 for unknown slug", () => {
    const p = guideProgress("nonexistent" as "take-a-call");
    expect(p.done).toBe(0);
    expect(p.total).toBe(0);
  });
});
