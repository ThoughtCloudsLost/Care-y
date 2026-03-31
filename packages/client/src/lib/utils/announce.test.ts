import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { announceToLiveRegion } from "./announce.js";

let mockElements: Map<string, { textContent: string }>;

beforeEach(() => {
  mockElements = new Map([
    ["live-assertive", { textContent: "" }],
    ["live-polite", { textContent: "" }],
  ]);

  vi.stubGlobal("document", {
    getElementById: vi.fn((id: string) => mockElements.get(id) ?? null),
  });

  vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
    cb();
    return 1;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("announceToLiveRegion", () => {
  it("sets message on the assertive live region", () => {
    announceToLiveRegion("assertive", "Connection lost");

    expect(mockElements.get("live-assertive")!.textContent).toBe(
      "Connection lost",
    );
  });

  it("sets message on the polite live region", () => {
    announceToLiveRegion("polite", "3 new tickets");

    expect(mockElements.get("live-polite")!.textContent).toBe("3 new tickets");
  });

  it("clears textContent before setting to trigger re-announcement", () => {
    const el = mockElements.get("live-assertive")!;
    el.textContent = "Previous message";

    // Override rAF to capture the clear-then-set sequence
    const calls: string[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => {
      calls.push(`before-raf: ${el.textContent}`);
      cb();
      calls.push(`after-raf: ${el.textContent}`);
      return 1;
    });

    announceToLiveRegion("assertive", "New message");

    // textContent was cleared before rAF callback
    expect(calls[0]).toBe("before-raf: ");
    expect(calls[1]).toBe("after-raf: New message");
  });

  it("does nothing when the element does not exist", () => {
    vi.stubGlobal("document", {
      getElementById: vi.fn(() => null),
    });

    // Should not throw
    announceToLiveRegion("assertive", "Message");
  });
});
