import { describe, it, expect } from "vitest";
import { deriveSubState } from "./story-messages.js";

describe("deriveSubState", () => {
  it("marks active when slugs match", () => {
    const state = deriveSubState("overview", "overview", null, new Set());
    expect(state.isActive).toBe(true);
    expect(state.isSeen).toBe(false);
  });

  it("marks inactive when slugs differ", () => {
    const state = deriveSubState("overview", "details", null, new Set());
    expect(state.isActive).toBe(false);
  });

  it("marks inactive when activeSub is null", () => {
    const state = deriveSubState("overview", null, null, new Set());
    expect(state.isActive).toBe(false);
  });

  it("marks seen when the topic is in seenTopics", () => {
    const seen = new Set(["credentials"]);
    const state = deriveSubState("overview", null, "credentials", seen);
    expect(state.isSeen).toBe(true);
  });

  it("marks not seen when the topic is absent from seenTopics", () => {
    const seen = new Set(["credentials"]);
    const state = deriveSubState("overview", null, "twofa", seen);
    expect(state.isSeen).toBe(false);
  });

  it("marks not seen when sub has no topic", () => {
    const seen = new Set(["credentials"]);
    const state = deriveSubState("overview", null, null, seen);
    expect(state.isSeen).toBe(false);
  });
});
