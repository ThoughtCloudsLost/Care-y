// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import { flushSync } from "svelte";
import * as m from "$lib/paraglide/messages.js";
import SecurityBriefing from "./SecurityBriefing.svelte";
import type { WizardNavContainer } from "./wizard-nav-context.js";

const wizardNavContainer: WizardNavContainer = { current: undefined };

vi.mock("./wizard-nav-context.js", () => ({
  getWizardNavCtx: () => wizardNavContainer,
}));

afterEach(() => {
  cleanup();
  wizardNavContainer.current = undefined;
});

function advanceToPage(targetPage: number): void {
  for (let i = 0; i < targetPage; i++) {
    const action = wizardNavContainer.current?.right?.onaction;
    expect(action, `No right nav action on page ${String(i)}`).toBeTruthy();
    (action as () => void)();
    flushSync();
  }
}

describe("SecurityBriefing", () => {
  describe("page 0 - How Encryption Works", () => {
    it("renders the crypto diagram with correct src", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      const img = screen.getByAltText(m.onboarding_briefing_diagram_alt());
      expect(img.getAttribute("src")).toBe("/images/crypto-overview.png");
    });

    it("registers Next in nav context on page 0", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      expect(wizardNavContainer.current?.right?.label).toBe(m.common_next());
      expect(wizardNavContainer.current?.left).toBeUndefined();
    });
  });

  describe("page 1 - What's Protected", () => {
    it("registers Back and Next in nav context", async () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      advanceToPage(1);

      expect(wizardNavContainer.current?.left?.label).toBe(m.common_back());
      expect(wizardNavContainer.current?.right?.label).toBe(m.common_next());
    });
  });

  describe("page 3 - Security Choices", () => {
    it("confirm button is always enabled", async () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      advanceToPage(3);

      expect(wizardNavContainer.current?.right?.label).toBe(
        m.onboarding_briefing_confirm(),
      );
      expect(wizardNavContainer.current?.right?.disabled).toBe(false);
    });

    it("calls onconfirm when confirm button is clicked", async () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      advanceToPage(3);

      const action = wizardNavContainer.current?.right?.onaction;
      expect(action).toBeTruthy();
      (action as () => void)();
      expect(onconfirm).toHaveBeenCalledOnce();
    });

    it("registers Back and confirm in nav context, no Next", async () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      advanceToPage(3);

      expect(wizardNavContainer.current?.left?.label).toBe(m.common_back());
      expect(wizardNavContainer.current?.right?.label).toBe(
        m.onboarding_briefing_confirm(),
      );
    });
  });

  describe("navigation", () => {
    it("Next action advances to next page", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });

      expect(
        screen.queryByText(m.onboarding_briefing_practice_heading()),
      ).toBeNull();
      advanceToPage(1);
      expect(
        screen.getByText(m.onboarding_briefing_practice_heading()),
      ).toBeTruthy();
    });

    it("Back action returns to previous page", () => {
      const onconfirm = vi.fn();
      render(SecurityBriefing, { props: { onconfirm } });
      advanceToPage(1);

      const back = wizardNavContainer.current?.left?.onaction;
      expect(back).toBeTruthy();
      (back as () => void)();
      flushSync();
      expect(screen.getByText(m.onboarding_briefing_intro())).toBeTruthy();
    });

    it("active dot updates with page changes", () => {
      const onconfirm = vi.fn();
      const { container } = render(SecurityBriefing, {
        props: { onconfirm },
      });

      let activeDots = container.querySelectorAll(".page-dot--active");
      expect(activeDots.length).toBe(1);
      expect(activeDots[0]).toBe(container.querySelectorAll(".page-dot")[0]);

      advanceToPage(1);
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
      advanceToPage(1);

      const detailsWithFeedback = container.querySelectorAll(
        "details.touch-feedback",
      );
      const summariesWithFeedback = container.querySelectorAll(
        "summary.touch-feedback",
      );
      expect(detailsWithFeedback.length).toBe(0);
      expect(summariesWithFeedback.length).toBeGreaterThan(0);
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
