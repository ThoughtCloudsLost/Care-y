// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import PortalHint from "./PortalHint.svelte";

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

vi.useFakeTimers();

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

const baseProps = {
  opened: true,
  ondismiss: vi.fn(),
  message: "What you wrote has been encrypted.",
};

describe("PortalHint", () => {
  describe("rendering", () => {
    it("renders the hint message when opened", () => {
      const { container } = render(PortalHint, { props: { ...baseProps } });
      expect(container.textContent).toContain(
        "What you wrote has been encrypted.",
      );
    });

    it("does not render content when opened is false", () => {
      const { container } = render(PortalHint, {
        props: { ...baseProps, opened: false },
      });
      expect(container.textContent).not.toContain(
        "What you wrote has been encrypted.",
      );
    });

    it("does not render a dismiss button", () => {
      const { container } = render(PortalHint, { props: { ...baseProps } });
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(0);
    });
  });

  describe("accessibility", () => {
    it("has role=status and aria-live=polite on the content region", () => {
      const { container } = render(PortalHint, { props: { ...baseProps } });
      const liveRegion = container.querySelector('[role="status"]');
      expect(liveRegion).not.toBeNull();
      expect(liveRegion!.getAttribute("aria-live")).toBe("polite");
    });
  });

  describe("auto-dismiss", () => {
    it("calls ondismiss after 6 seconds", () => {
      vi.useFakeTimers();
      const ondismiss = vi.fn();
      render(PortalHint, {
        props: { ...baseProps, ondismiss },
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
      render(PortalHint, {
        props: { ...baseProps, opened: false, ondismiss },
      });

      vi.advanceTimersByTime(10_000);
      expect(ondismiss).not.toHaveBeenCalled();
    });

    it("cleans up timer on unmount before firing", () => {
      vi.useFakeTimers();
      const ondismiss = vi.fn();
      const { unmount } = render(PortalHint, {
        props: { ...baseProps, ondismiss },
      });

      vi.advanceTimersByTime(3_000);
      unmount();
      vi.advanceTimersByTime(10_000);

      expect(ondismiss).not.toHaveBeenCalled();
    });
  });
});
