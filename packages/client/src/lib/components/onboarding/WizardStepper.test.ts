// @vitest-environment jsdom
/**
 * WizardStepper tests.
 *
 * The component renders a Konsta Progressbar with step-count text.
 * No list items or individual step labels are rendered (the old
 * horizontal stepper was replaced with a progress bar).
 */
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import WizardStepper from "./WizardStepper.svelte";

afterEach(cleanup);

const STEPS = [
  "Account",
  "Briefing",
  "Organization",
  "Branding",
  "Queue",
  "Telephony",
  "Backup",
  "Invites",
];

describe("WizardStepper", () => {
  it("renders correct step count text", () => {
    render(WizardStepper, {
      props: {
        steps: STEPS,
        currentStep: 0,
        completedSteps: new Set<number>(),
      },
    });
    const matches = screen.getAllByText("Step 1 of 8");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("updates step count text for a middle step", () => {
    render(WizardStepper, {
      props: {
        steps: STEPS,
        currentStep: 3,
        completedSteps: new Set<number>(),
      },
    });
    const matches = screen.getAllByText("Step 4 of 8");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("renders a progress group with accessible label", () => {
    const { container } = render(WizardStepper, {
      props: {
        steps: STEPS,
        currentStep: 2,
        completedSteps: new Set([0, 1]),
      },
    });
    const group = container.querySelector('[role="group"]');
    expect(group).toBeTruthy();
    expect(group!.getAttribute("aria-label")).toBeTruthy();
  });

  it("includes screen-reader-only progress text", () => {
    const { container } = render(WizardStepper, {
      props: {
        steps: STEPS,
        currentStep: 4,
        completedSteps: new Set<number>(),
      },
    });
    const srOnly = container.querySelector(".sr-only");
    expect(srOnly).toBeTruthy();
    expect(srOnly!.textContent).toContain("Step 5 of 8");
  });

  it("renders a Progressbar element", () => {
    const { container } = render(WizardStepper, {
      props: {
        steps: STEPS,
        currentStep: 2,
        completedSteps: new Set([0, 1]),
      },
    });
    const progressbar = container.querySelector(
      ".k-progressbar, [role='progressbar']",
    );
    expect(progressbar).toBeTruthy();
  });
});
