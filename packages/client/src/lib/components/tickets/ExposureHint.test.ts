// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import ExposureHint from "./ExposureHint.svelte";
import type * as MessagesMod from "$lib/paraglide/messages.js";
import type * as ShellContextMod from "$lib/shell/context.js";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesMod>()),
  exposure_hint_sms: () =>
    "SMS is not encrypted. Your phone provider can read it.",
  exposure_hint_call: () =>
    "This call routes through your phone provider. They can hear the call.",
  exposure_hint_dismiss: () => "Got it",
}));

vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellContextMod>()),
  getSectionRailCtx: () => ({ current: undefined }),
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

vi.useFakeTimers();

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("ExposureHint", () => {
  describe("rendering", () => {
    it("renders SMS warning when type is sms and opened is true", () => {
      const { container } = render(ExposureHint, {
        props: { type: "sms", opened: true, ondismiss: vi.fn() },
      });

      expect(container.textContent).toContain(
        "SMS is not encrypted. Your phone provider can read it.",
      );
    });

    it("renders call warning when type is call and opened is true", () => {
      const { container } = render(ExposureHint, {
        props: { type: "call", opened: true, ondismiss: vi.fn() },
      });

      expect(container.textContent).toContain(
        "This call routes through your phone provider.",
      );
    });

    it("does not render content when opened is false", () => {
      const { container } = render(ExposureHint, {
        props: { type: "sms", opened: false, ondismiss: vi.fn() },
      });

      expect(container.textContent).not.toContain("SMS is not encrypted.");
    });

    it("renders an OK dismiss button when opened", () => {
      const { container } = render(ExposureHint, {
        props: { type: "sms", opened: true, ondismiss: vi.fn() },
      });

      const btn = container.querySelector("[data-testid='exposure-hint-ok']");
      expect(btn).not.toBeNull();
      expect(btn?.textContent).toContain("Got it");
    });

    it("OK button meets 44px touch target", () => {
      const { container } = render(ExposureHint, {
        props: { type: "sms", opened: true, ondismiss: vi.fn() },
      });

      const btn = container.querySelector(
        "[data-testid='exposure-hint-ok']",
      ) as HTMLElement;
      expect(btn).not.toBeNull();
      // The min-height/min-width is set via global class; verify the
      // class is present (jsdom does not compute applied CSS from <style>).
      expect(btn.className).toContain("hint-ok-btn");
    });
  });

  describe("OK button dismiss", () => {
    it("calls ondismiss immediately when OK is clicked", async () => {
      const ondismiss = vi.fn();
      const { container } = render(ExposureHint, {
        props: { type: "sms", opened: true, ondismiss },
      });

      const btn = container.querySelector(
        "[data-testid='exposure-hint-ok']",
      ) as HTMLElement;
      await fireEvent.click(btn);

      expect(ondismiss).toHaveBeenCalledOnce();
    });

    it("OK dismiss fires before the auto-dismiss timer", async () => {
      vi.useFakeTimers();
      const ondismiss = vi.fn();
      const { container } = render(ExposureHint, {
        props: { type: "sms", opened: true, ondismiss },
      });

      vi.advanceTimersByTime(1_000);
      const btn = container.querySelector(
        "[data-testid='exposure-hint-ok']",
      ) as HTMLElement;
      await fireEvent.click(btn);

      expect(ondismiss).toHaveBeenCalledOnce();
    });
  });

  describe("accessibility", () => {
    it("has ARIA live region with status role", () => {
      const { container } = render(ExposureHint, {
        props: { type: "sms", opened: true, ondismiss: vi.fn() },
      });

      const liveRegion = container.querySelector('[role="status"]');
      expect(liveRegion).not.toBeNull();
    });

    it("includes aria-live=polite on the content region", () => {
      const { container } = render(ExposureHint, {
        props: { type: "call", opened: true, ondismiss: vi.fn() },
      });

      const polite = container.querySelector('[aria-live="polite"]');
      expect(polite).not.toBeNull();
    });
  });

  describe("auto-dismiss", () => {
    it("calls ondismiss after 6 seconds", () => {
      vi.useFakeTimers();
      const ondismiss = vi.fn();
      render(ExposureHint, {
        props: { type: "sms", opened: true, ondismiss },
      });

      expect(ondismiss).not.toHaveBeenCalled();

      vi.advanceTimersByTime(5_999);
      expect(ondismiss).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(ondismiss).toHaveBeenCalledOnce();
    });

    it("does not start a timer when opened is false", () => {
      vi.useFakeTimers();
      const ondismiss = vi.fn();
      render(ExposureHint, {
        props: { type: "sms", opened: false, ondismiss },
      });

      vi.advanceTimersByTime(10_000);
      expect(ondismiss).not.toHaveBeenCalled();
    });

    it("cleans up timer on unmount before firing", () => {
      vi.useFakeTimers();
      const ondismiss = vi.fn();
      const { unmount } = render(ExposureHint, {
        props: { type: "call", opened: true, ondismiss },
      });

      vi.advanceTimersByTime(3_000);
      unmount();
      vi.advanceTimersByTime(10_000);

      expect(ondismiss).not.toHaveBeenCalled();
    });
  });
});
