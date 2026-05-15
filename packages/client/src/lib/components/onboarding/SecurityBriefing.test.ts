// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import SecurityBriefing from "./SecurityBriefing.svelte";

afterEach(cleanup);

function mockIntersectionObserver(shouldIntersect: boolean): void {
  const entries = [{ isIntersecting: shouldIntersect }];
  vi.stubGlobal(
    "IntersectionObserver",
    class MockIntersectionObserver {
      callback: IntersectionObserverCallback;
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }
      observe(): void {
        this.callback(
          entries as unknown as IntersectionObserverEntry[],
          this as unknown as IntersectionObserver,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-empty-function -- mock stub
      disconnect(): void {}
    },
  );
}

describe("SecurityBriefing", () => {
  beforeEach(() => {
    mockIntersectionObserver(false);
  });

  describe("rendering", () => {
    it("renders the main heading", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      expect(screen.getByText("How CARE-Y Protects Your Data")).toBeTruthy();
    });

    it("renders all 6 compromise scenario headings", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });

      const scenarioTitles = [
        "Someone seizes or breaks into the CARE-Y server",
        "Someone compromises one of the two verification servers",
        "A volunteer's device is compromised",
        "A volunteer goes rogue (insider threat)",
        "The telephony provider is compromised or subpoenaed",
        "Network surveillance (ISP monitoring, traffic analysis)",
      ];

      for (const title of scenarioTitles) {
        expect(screen.getByText(title)).toBeTruthy();
      }
    });

    it("renders all 3 setup choice headings", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });

      expect(screen.getByText("Telephony provider")).toBeTruthy();
      expect(screen.getByText("Two-factor authentication policy")).toBeTruthy();
      expect(screen.getByText("Tor hidden service access")).toBeTruthy();
    });

    it("renders the protection table with all 7 data categories", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });

      const dataCategories = [
        "Client data (tickets, messages, case notes)",
        "Org resources (knowledge base, settings)",
        "Public branding (logo, name, color on intake pages)",
        "Volunteer display names, IP addresses, session details",
        "Volunteer usernames",
        "Volunteer email addresses (opt-in only)",
        "Phone system credentials",
      ];

      for (const category of dataCategories) {
        expect(screen.getByText(category)).toBeTruthy();
      }
    });

    it("renders the crypto diagram with alt text", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      const img = screen.getByAltText(
        "Simplified diagram showing how CARE-Y derives encryption keys from passwords using two verification servers",
      );
      expect(img).toBeTruthy();
      expect(img.getAttribute("src")).toBe("/images/crypto-overview.png");
    });

    it("shows scroll hint when not scrolled to bottom", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      expect(screen.getByText("Scroll to the bottom to continue")).toBeTruthy();
    });
  });

  describe("confirm button", () => {
    it("is disabled when user has not scrolled to bottom", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      const button = screen.getByText("I understand");
      expect(button.closest("button")?.disabled).toBe(true);
    });

    it("is enabled after IntersectionObserver fires with isIntersecting", () => {
      mockIntersectionObserver(true);
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      const button = screen.getByText("I understand");
      expect(button.closest("button")?.disabled).toBe(false);
    });

    it("calls onconfirm when clicked and scrolled to bottom", async () => {
      mockIntersectionObserver(true);
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      const button = screen.getByText("I understand");
      await fireEvent.click(button);
      expect(onconfirm).toHaveBeenCalledOnce();
    });

    it("does not call onconfirm when button is disabled", async () => {
      mockIntersectionObserver(false);
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      const button = screen.getByText("I understand");
      await fireEvent.click(button);
      expect(onconfirm).not.toHaveBeenCalled();
    });

    it("hides scroll hint after scrolling to bottom", () => {
      mockIntersectionObserver(true);
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      expect(screen.queryByText("Scroll to the bottom to continue")).toBeNull();
    });
  });

  describe("accessibility", () => {
    it("uses native details/summary for collapsible scenarios", () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      const detailsElements = container.querySelectorAll("details");
      expect(detailsElements.length).toBe(16);
    });

    it("scroll sentinel has aria-hidden", () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      const sentinel = container.querySelector(".scroll-sentinel");
      expect(sentinel?.getAttribute("aria-hidden")).toBe("true");
    });

    it("scroll hint uses aria-live polite", () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      const hint = container.querySelector(".scroll-hint");
      expect(hint?.getAttribute("aria-live")).toBe("polite");
    });

    it("touch-feedback class is on summary, not details", () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      const detailsWithFeedback = container.querySelectorAll(
        "details.touch-feedback",
      );
      const summariesWithFeedback = container.querySelectorAll(
        "summary.touch-feedback",
      );
      expect(detailsWithFeedback.length).toBe(0);
      expect(summariesWithFeedback.length).toBe(16);
    });

    it("renders practice section heading and row labels", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      expect(screen.getByText("What This Means in Practice")).toBeTruthy();
      const accessLabels = screen.getAllByText("Who can read it");
      expect(accessLabels.length).toBeGreaterThan(0);
    });
  });
});
