// @vitest-environment jsdom
import { beforeEach, describe, it, expect } from "vitest";
import {
  createExposureHint,
  _resetSessionShown,
} from "./create-exposure-hint.svelte.js";

describe("createExposureHint", () => {
  beforeEach(() => {
    _resetSessionShown();
  });

  describe("show", () => {
    it("opens the hint on first invocation for a type", () => {
      const hint = createExposureHint();

      hint.show("sms");

      expect(hint.open).toBe(true);
      expect(hint.type).toBe("sms");
    });

    it("skips the hint on second invocation (once per session)", () => {
      const hint = createExposureHint();

      hint.show("sms");
      hint.dismiss();

      hint.show("sms");

      expect(hint.open).toBe(false);
    });

    it("tracks sms and call types independently", () => {
      const hint = createExposureHint();

      hint.show("sms");
      expect(hint.open).toBe(true);
      expect(hint.type).toBe("sms");
      hint.dismiss();

      hint.show("call");
      expect(hint.open).toBe(true);
      expect(hint.type).toBe("call");
    });
  });

  describe("dismiss", () => {
    it("closes the hint", () => {
      const hint = createExposureHint();

      hint.show("call");
      hint.dismiss();

      expect(hint.open).toBe(false);
    });

    it("is safe to call when no hint is showing", () => {
      const hint = createExposureHint();
      expect(() => {
        hint.dismiss();
      }).not.toThrow();
    });
  });
});
