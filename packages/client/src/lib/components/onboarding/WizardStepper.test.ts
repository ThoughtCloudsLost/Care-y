// @vitest-environment jsdom
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
  it("renders correct step count in mobile text", () => {
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

  it("updates mobile text for a middle step", () => {
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

  it("marks current step with aria-current", () => {
    render(WizardStepper, {
      props: {
        steps: STEPS,
        currentStep: 2,
        completedSteps: new Set([0, 1]),
      },
    });
    const items = screen.getAllByRole("listitem");
    expect(items[2]?.getAttribute("aria-current")).toBe("step");
    expect(items[0]?.getAttribute("aria-current")).toBeNull();
  });

  it("renders all step labels", () => {
    render(WizardStepper, {
      props: {
        steps: STEPS,
        currentStep: 0,
        completedSteps: new Set<number>(),
      },
    });
    for (const label of STEPS) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });

  it("renders checkmark SVG for completed steps", () => {
    const { container } = render(WizardStepper, {
      props: {
        steps: STEPS,
        currentStep: 2,
        completedSteps: new Set([0, 1]),
      },
    });
    const checkmarks = container.querySelectorAll(".stepper-check");
    expect(checkmarks.length).toBe(2);
  });

  it("renders accessible progress summary for screen readers", () => {
    render(WizardStepper, {
      props: {
        steps: STEPS,
        currentStep: 4,
        completedSteps: new Set<number>(),
      },
    });
    const srText = screen.getAllByText("Step 5 of 8");
    expect(srText.length).toBeGreaterThanOrEqual(1);
  });
});
