import { describe, it, expect } from "vitest";
import {
  shouldBackstopUnmute,
  backstopDecision,
  relinkDecision,
} from "./scroll-intent-guard.js";

describe("shouldBackstopUnmute", () => {
  // -----------------------------------------------------------------
  // Regression: backstop must not unmute while page is misaligned
  // -----------------------------------------------------------------

  it("returns false when derived position does not match the suppression target", () => {
    const target = { section: "login" as const, sub: "key-derivation" };
    // The page is at an intermediate login sub during a smooth scroll
    expect(shouldBackstopUnmute(target, "login", "totp")).toBe(false);
  });

  it("returns false when derived section differs from target", () => {
    const target = { section: "tickets" as const, sub: "sort" };
    expect(shouldBackstopUnmute(target, "login", "credentials")).toBe(false);
  });

  it("returns false when derived sub is null but target has a sub", () => {
    const target = { section: "login" as const, sub: "key-derivation" };
    expect(shouldBackstopUnmute(target, "login", null)).toBe(false);
  });

  // -----------------------------------------------------------------
  // Normal unmuting when aligned
  // -----------------------------------------------------------------

  it("returns true when derived position matches the target exactly", () => {
    const target = { section: "login" as const, sub: "key-derivation" };
    expect(shouldBackstopUnmute(target, "login", "key-derivation")).toBe(true);
  });

  it("returns true when target is null (layout-shift suppression)", () => {
    expect(shouldBackstopUnmute(null, "login", "credentials")).toBe(true);
  });

  it("returns true when derived section is null (geometry not ready)", () => {
    const target = { section: "login" as const, sub: "key-derivation" };
    expect(shouldBackstopUnmute(target, null, null)).toBe(true);
  });

  it("returns true when both section and sub match with null sub", () => {
    const target = { section: "tickets" as const, sub: null };
    expect(shouldBackstopUnmute(target, "tickets", null)).toBe(true);
  });
});

describe("backstopDecision", () => {
  // -----------------------------------------------------------------
  // Regression: a click must not be overridden by a stale derived
  // position when the first alignment lands short (frame preset
  // spring, hole re-layout past the fixed-point cap). The backstop
  // gets one healing re-align before it may surrender.
  // -----------------------------------------------------------------

  it("realigns when misaligned and no retry has been spent", () => {
    const target = { section: "login" as const, sub: "language" };
    expect(backstopDecision(target, "login", "credentials", false)).toBe(
      "realign",
    );
  });

  it("surrenders when misaligned after the retry was spent", () => {
    const target = { section: "login" as const, sub: "language" };
    expect(backstopDecision(target, "login", "credentials", true)).toBe(
      "surrender",
    );
  });

  it("unmutes when the derived position reaches the target", () => {
    const target = { section: "login" as const, sub: "language" };
    expect(backstopDecision(target, "login", "language", false)).toBe("unmute");
    expect(backstopDecision(target, "login", "language", true)).toBe("unmute");
  });

  it("unmutes for targetless layout-shift suppression without realigning", () => {
    expect(backstopDecision(null, "tickets", "sort", false)).toBe("unmute");
  });

  it("unmutes when geometry is not ready rather than realigning blind", () => {
    const target = { section: "tickets" as const, sub: "sort" };
    expect(backstopDecision(target, null, null, false)).toBe("unmute");
  });
});

describe("relinkDecision", () => {
  // -----------------------------------------------------------------
  // Relink reconciliation: whichever side moved most recently during
  // the unlink wins. 0 means that side never moved.
  // -----------------------------------------------------------------

  it("returns none when neither side moved during the unlink", () => {
    expect(relinkDecision(0, 0)).toBe("none");
  });

  it("pushes the local location when only the story moved", () => {
    expect(relinkDecision(5000, 0)).toBe("push-local");
  });

  it("adopts the phone position when only the phone moved", () => {
    expect(relinkDecision(0, 5000)).toBe("adopt-phone");
  });

  it("pushes the local location when the story moved after the phone", () => {
    expect(relinkDecision(9000, 5000)).toBe("push-local");
  });

  it("adopts the phone position when the phone moved after the story", () => {
    expect(relinkDecision(5000, 9000)).toBe("adopt-phone");
  });

  it("favors the reader on a same-millisecond tie", () => {
    expect(relinkDecision(5000, 5000)).toBe("push-local");
  });
});
