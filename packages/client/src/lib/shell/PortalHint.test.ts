// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import PortalHint from "./PortalHint.svelte";

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseProps = {
  opened: true,
  ondismiss: vi.fn(),
  message: "What you wrote has been encrypted.",
  dismissLabel: "Got it",
  dismissTestid: "intake-hint-dismiss",
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

    it("renders the dismiss button with the given label and testid", () => {
      const { container } = render(PortalHint, { props: { ...baseProps } });
      const dismissBtn = container.querySelector(
        '[data-testid="intake-hint-dismiss"]',
      );
      expect(dismissBtn).not.toBeNull();
      expect(dismissBtn!.textContent!.trim()).toBe("Got it");
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

  describe("interactions", () => {
    it("calls ondismiss when the dismiss button is clicked", async () => {
      const ondismiss = vi.fn();
      const { container } = render(PortalHint, {
        props: { ...baseProps, ondismiss },
      });

      const dismissBtn = container.querySelector(
        '[data-testid="intake-hint-dismiss"]',
      )!;
      await fireEvent.click(dismissBtn);

      expect(ondismiss).toHaveBeenCalledOnce();
    });
  });
});
