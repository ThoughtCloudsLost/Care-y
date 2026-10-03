import { describe, it, expect } from "vitest";
import {
  canGoBack,
  type CompletionStepId,
  type FirstLoginStepId,
} from "./completion-steps.js";

describe("canGoBack", () => {
  it("offers no Back on the first step", () => {
    expect(canGoBack(0, ["briefing", "twofa"])).toBe(false);
    expect(canGoBack(0, ["password", "briefing", "twofa"])).toBe(false);
  });

  it("offers Back between steps when there is no password step", () => {
    expect(canGoBack(1, ["briefing", "twofa"])).toBe(true);
  });

  it("never returns into a completed password step", () => {
    const steps: CompletionStepId[] = ["password", "briefing", "twofa"];
    expect(canGoBack(1, steps)).toBe(false);
  });

  it("keeps Back between the steps after a completed password step", () => {
    const steps: CompletionStepId[] = ["password", "briefing", "twofa"];
    expect(canGoBack(2, steps)).toBe(true);
  });

  it("treats the step after a completed password step as the first", () => {
    expect(canGoBack(1, ["password", "twofa"])).toBe(false);
  });

  it("never returns into the completed account step", () => {
    const steps: FirstLoginStepId[] = ["account", "briefing", "twofa"];
    expect(canGoBack(0, steps)).toBe(false);
    expect(canGoBack(1, steps)).toBe(false);
  });

  it("keeps Back between the steps after the account step", () => {
    const steps: FirstLoginStepId[] = ["account", "briefing", "twofa"];
    expect(canGoBack(2, steps)).toBe(true);
  });
});
