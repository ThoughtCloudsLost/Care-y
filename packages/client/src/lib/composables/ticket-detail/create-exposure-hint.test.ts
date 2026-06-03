// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { createExposureHint } from "./create-exposure-hint.svelte.js";

describe("createExposureHint", () => {
  describe("show", () => {
    it("opens the hint on first invocation for a type", () => {
      const hint = createExposureHint();
      const callback = vi.fn();

      hint.show("sms", callback);

      expect(hint.open).toBe(true);
      expect(hint.type).toBe("sms");
      expect(callback).not.toHaveBeenCalled();
    });

    it("skips the hint and calls callback directly on second invocation", () => {
      const hint = createExposureHint();
      const first = vi.fn();
      const second = vi.fn();

      hint.show("sms", first);
      hint.dismiss();

      hint.show("sms", second);

      expect(hint.open).toBe(false);
      expect(second).toHaveBeenCalledOnce();
    });

    it("tracks sms and call types independently", () => {
      const hint = createExposureHint();
      const smsCallback = vi.fn();
      const callCallback = vi.fn();

      hint.show("sms", smsCallback);
      expect(hint.open).toBe(true);
      expect(hint.type).toBe("sms");
      hint.dismiss();

      hint.show("call", callCallback);
      expect(hint.open).toBe(true);
      expect(hint.type).toBe("call");
      expect(callCallback).not.toHaveBeenCalled();
    });
  });

  describe("dismiss", () => {
    it("closes the hint and invokes the pending callback", () => {
      const hint = createExposureHint();
      const callback = vi.fn();

      hint.show("call", callback);
      hint.dismiss();

      expect(hint.open).toBe(false);
      expect(callback).toHaveBeenCalledOnce();
    });

    it("is safe to call when no action is pending", () => {
      const hint = createExposureHint();
      expect(() => {
        hint.dismiss();
      }).not.toThrow();
    });

    it("clears the pending action after firing it", () => {
      const hint = createExposureHint();
      const callback = vi.fn();

      hint.show("call", callback);
      hint.dismiss();
      hint.dismiss();

      expect(callback).toHaveBeenCalledOnce();
    });
  });
});
