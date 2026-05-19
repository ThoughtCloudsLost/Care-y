// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import SecurityBriefing from "./SecurityBriefing.svelte";

afterEach(cleanup);

async function advanceToPage(
  container: HTMLElement,
  targetPage: number,
): Promise<void> {
  for (let i = 0; i < targetPage; i++) {
    const nextButton = screen.getByText("Next");
    await fireEvent.click(nextButton);
  }
}

describe("SecurityBriefing", () => {
  describe("page 0 - How Encryption Works", () => {
    it("renders the main heading", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      expect(screen.getByText("How CARE-Y Protects Your Data")).toBeTruthy();
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

    it("renders the intro paragraph", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      expect(
        screen.getByText(/encrypts everything in the volunteer's browser/),
      ).toBeTruthy();
    });

    it("shows Next button on page 0", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      expect(screen.getByText("Next")).toBeTruthy();
      expect(screen.queryByText("Back")).toBeNull();
    });
  });

  describe("page 1 - What's Protected", () => {
    it("renders the protection table with all 7 data categories", async () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      await advanceToPage(container, 1);

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

    it("renders practice section heading and row labels", async () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      await advanceToPage(container, 1);

      expect(screen.getByText("What This Means in Practice")).toBeTruthy();
      const accessLabels = screen.getAllByText("Who can read it");
      expect(accessLabels.length).toBeGreaterThan(0);
    });

    it("has 7 details elements", async () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      await advanceToPage(container, 1);

      const detailsElements = container.querySelectorAll("details");
      expect(detailsElements.length).toBe(7);
    });

    it("shows Back and Next buttons", async () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      await advanceToPage(container, 1);

      expect(screen.getByText("Back")).toBeTruthy();
      expect(screen.getByText("Next")).toBeTruthy();
    });
  });

  describe("page 2 - Compromise Scenarios", () => {
    it("renders all 6 compromise scenario headings", async () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      await advanceToPage(container, 2);

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

    it("has 6 details elements", async () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      await advanceToPage(container, 2);

      const detailsElements = container.querySelectorAll("details");
      expect(detailsElements.length).toBe(6);
    });
  });

  describe("page 3 - Security Choices", () => {
    it("renders all 3 setup choice headings", async () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      await advanceToPage(container, 3);

      expect(screen.getByText("Telephony provider")).toBeTruthy();
      expect(screen.getByText("Two-factor authentication policy")).toBeTruthy();
      expect(screen.getByText("Tor hidden service access")).toBeTruthy();
    });

    it("has 3 details elements", async () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      await advanceToPage(container, 3);

      const detailsElements = container.querySelectorAll("details");
      expect(detailsElements.length).toBe(3);
    });

    it("confirm button is always enabled", async () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      await advanceToPage(container, 3);

      const button = screen.getByText("I understand");
      expect(button.closest("button")?.disabled).toBe(false);
    });

    it("calls onconfirm when confirm button is clicked", async () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      await advanceToPage(container, 3);

      const button = screen.getByText("I understand");
      await fireEvent.click(button);
      expect(onconfirm).toHaveBeenCalledOnce();
    });

    it("shows Back button and confirm, no Next", async () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      await advanceToPage(container, 3);

      expect(screen.getByText("Back")).toBeTruthy();
      expect(screen.getByText("I understand")).toBeTruthy();
      expect(screen.queryByText("Next")).toBeNull();
    });
  });

  describe("navigation", () => {
    it("Next button advances to next page", async () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });

      expect(screen.queryByText("What This Means in Practice")).toBeNull();
      await fireEvent.click(screen.getByText("Next"));
      expect(screen.getByText("What This Means in Practice")).toBeTruthy();
    });

    it("Back button returns to previous page", async () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      await advanceToPage(container, 1);

      await fireEvent.click(screen.getByText("Back"));
      expect(
        screen.getByText(/encrypts everything in the volunteer's browser/),
      ).toBeTruthy();
    });

    it("renders page dots indicator", () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      const dots = container.querySelectorAll(".page-dot");
      expect(dots.length).toBe(4);
    });

    it("active dot updates with page changes", async () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });

      let activeDots = container.querySelectorAll(".page-dot--active");
      expect(activeDots.length).toBe(1);
      expect(activeDots[0]).toBe(container.querySelectorAll(".page-dot")[0]);

      await fireEvent.click(screen.getByText("Next"));
      activeDots = container.querySelectorAll(".page-dot--active");
      expect(activeDots[0]).toBe(container.querySelectorAll(".page-dot")[1]);
    });
  });

  describe("accessibility", () => {
    it("touch-feedback class is on summary, not details", async () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      await advanceToPage(container, 1);

      const detailsWithFeedback = container.querySelectorAll(
        "details.touch-feedback",
      );
      const summariesWithFeedback = container.querySelectorAll(
        "summary.touch-feedback",
      );
      expect(detailsWithFeedback.length).toBe(0);
      expect(summariesWithFeedback.length).toBe(7);
    });

    it("page dots have aria-hidden", () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });
      const dotsContainer = container.querySelector(".page-dots");
      expect(dotsContainer?.getAttribute("aria-hidden")).toBe("true");
    });
  });
});
