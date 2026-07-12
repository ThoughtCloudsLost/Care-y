// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

vi.mock("$lib/paraglide/messages.js", () => ({
  onboarding_telephony_byot_label: () => "I have a Twilio account",
  onboarding_telephony_byot_description: () => "Bring your own credentials.",
  onboarding_telephony_managed_label: () => "Set up telephony for me",
  onboarding_telephony_managed_description: () => "Managed subaccount.",
  onboarding_telephony_skip_label: () => "Configure later",
  onboarding_telephony_skip_description: () => "Set up from admin panel.",
  onboarding_telephony_sid_label: () => "Account SID",
  onboarding_telephony_sid_placeholder: () => "ACxxxxxxxx",
  onboarding_telephony_token_label: () => "Auth Token",
  onboarding_telephony_token_placeholder: () => "Your auth token",
  password_show: () => "Show password",
  password_hide: () => "Hide password",
}));

const { default: TelephonyModePicker } =
  await import("./TelephonyModePicker.svelte");

afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

describe("TelephonyModePicker", () => {
  it("renders all three options when showSkip is true", () => {
    render(TelephonyModePicker, {
      props: {
        mode: "skip",
        onmodechange: vi.fn(),
      },
    });
    expect(screen.getByText("I have a Twilio account")).toBeTruthy();
    expect(screen.getByText("Set up telephony for me")).toBeTruthy();
    expect(screen.getByText("Configure later")).toBeTruthy();
  });

  it("hides skip option when showSkip is false", () => {
    render(TelephonyModePicker, {
      props: {
        mode: "byot",
        onmodechange: vi.fn(),
        showSkip: false,
      },
    });
    expect(screen.getByText("I have a Twilio account")).toBeTruthy();
    expect(screen.getByText("Set up telephony for me")).toBeTruthy();
    expect(screen.queryByText("Configure later")).toBeNull();
  });

  it("shows credential fields when mode is byot", () => {
    const { container } = render(TelephonyModePicker, {
      props: {
        mode: "byot",
        onmodechange: vi.fn(),
      },
    });
    expect(screen.getByText("Account SID")).toBeTruthy();
    expect(screen.getByText("Auth Token")).toBeTruthy();
    expect(container.querySelector('input[type="password"]')).toBeTruthy();
  });

  it("hides credential fields when mode is not byot", () => {
    const { container } = render(TelephonyModePicker, {
      props: {
        mode: "managed",
        onmodechange: vi.fn(),
      },
    });
    expect(container.querySelector('input[type="password"]')).toBeNull();
  });

  it("calls onmodechange when radio is selected", async () => {
    const onmodechange = vi.fn();
    const { container } = render(TelephonyModePicker, {
      props: {
        mode: "skip",
        onmodechange,
      },
    });

    const radios = container.querySelectorAll('input[type="radio"]');
    await fireEvent.change(radios[0] as HTMLInputElement);

    expect(onmodechange).toHaveBeenCalledWith("byot");
  });

  it("calls onsidchange when SID input changes", async () => {
    const onsidchange = vi.fn();
    const { container } = render(TelephonyModePicker, {
      props: {
        mode: "byot",
        onmodechange: vi.fn(),
        onsidchange,
      },
    });

    const inputs = container.querySelectorAll("input:not([type='radio'])");
    await fireEvent.input(inputs[0] as HTMLInputElement, {
      target: { value: "AC123" },
    });

    expect(onsidchange).toHaveBeenCalledWith("AC123");
  });
});
