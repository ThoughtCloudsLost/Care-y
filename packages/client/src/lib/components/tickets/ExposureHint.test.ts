// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import ExposureHint from "./ExposureHint.svelte";

vi.mock("$lib/paraglide/messages.js", () => ({
  exposure_hint_sms: () =>
    "SMS is not encrypted. Your phone provider can read it.",
  exposure_hint_call: () =>
    "This call routes through your phone provider. They can hear the call.",
  exposure_hint_dismiss: () => "Got it",
}));

vi.mock("$lib/shell/context.js", () => ({
  getSectionRailCtx: () => ({ current: undefined }),
  getScrollContainer: () => () => undefined,
  getTabbarOverrideCtx: () => ({ current: undefined }),
  getTabbarHiddenCtx: () => ({ current: false }),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
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

    it("renders dismiss button with correct text", () => {
      const { container } = render(ExposureHint, {
        props: { type: "sms", opened: true, ondismiss: vi.fn() },
      });

      const dismissBtn = container.querySelector(
        '[data-testid="exposure-dismiss"]',
      );
      expect(dismissBtn).not.toBeNull();
      expect(dismissBtn!.textContent!.trim()).toBe("Got it");
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

  describe("interactions", () => {
    it("calls ondismiss when dismiss button is clicked", async () => {
      const ondismiss = vi.fn();
      const { container } = render(ExposureHint, {
        props: { type: "sms", opened: true, ondismiss },
      });

      const dismissBtn = container.querySelector(
        '[data-testid="exposure-dismiss"]',
      )!;
      await fireEvent.click(dismissBtn);

      expect(ondismiss).toHaveBeenCalledOnce();
    });
  });
});
