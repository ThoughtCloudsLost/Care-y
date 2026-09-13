// @vitest-environment jsdom
/**
 * CallOptionsContent component tests.
 *
 * Verifies browser call is always shown, phone callback is conditional
 * on hasVerifiedPhone, and onaction dispatches the correct action string.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import CallOptionsContent from "./CallOptionsContent.svelte";

// --- Mock i18n ---
vi.mock("$lib/paraglide/messages.js", () => ({
  ticket_call_browser: () => "Call via browser",
  ticket_call_phone: () => "Call to my phone",
  common_cancel: () => "Cancel",
  contact_correction_pending_warning: () =>
    "A contact correction is pending below.",
}));

afterEach(() => {
  cleanup();
});

describe("CallOptionsContent", () => {
  it("always shows 'Call via browser'", () => {
    const { container } = render(CallOptionsContent, {
      props: { hasVerifiedPhone: false, onaction: vi.fn() },
    });
    expect(container.textContent).toContain("Call via browser");
  });

  it("hides 'Call to my phone' when hasVerifiedPhone is false", () => {
    const { container } = render(CallOptionsContent, {
      props: { hasVerifiedPhone: false, onaction: vi.fn() },
    });
    expect(container.textContent).not.toContain("Call to my phone");
  });

  it("shows 'Call to my phone' when hasVerifiedPhone is true", () => {
    const { container } = render(CallOptionsContent, {
      props: { hasVerifiedPhone: true, onaction: vi.fn() },
    });
    expect(container.textContent).toContain("Call to my phone");
  });

  it("always shows Cancel", () => {
    const { container } = render(CallOptionsContent, {
      props: { hasVerifiedPhone: false, onaction: vi.fn() },
    });
    expect(container.textContent).toContain("Cancel");
  });

  it("calls onaction with 'browser-call' when browser call is clicked", async () => {
    const onaction = vi.fn();
    const { container } = render(CallOptionsContent, {
      props: { hasVerifiedPhone: false, onaction },
    });
    const buttons = container.querySelectorAll("button");
    const browserBtn = Array.from(buttons).find(
      (b) => b.textContent!.trim() === "Call via browser",
    );
    expect(browserBtn).toBeDefined();
    await fireEvent.click(browserBtn!);
    expect(onaction).toHaveBeenCalledWith("browser-call");
  });

  it("calls onaction with 'phone-call' when phone call is clicked", async () => {
    const onaction = vi.fn();
    const { container } = render(CallOptionsContent, {
      props: { hasVerifiedPhone: true, onaction },
    });
    const buttons = container.querySelectorAll("button");
    const phoneBtn = Array.from(buttons).find(
      (b) => b.textContent!.trim() === "Call to my phone",
    );
    expect(phoneBtn).toBeDefined();
    await fireEvent.click(phoneBtn!);
    expect(onaction).toHaveBeenCalledWith("phone-call");
  });

  it("shows correction warning when hasUnacknowledgedCorrection is true", () => {
    const { container } = render(CallOptionsContent, {
      props: {
        hasVerifiedPhone: false,
        hasUnacknowledgedCorrection: true,
        onaction: vi.fn(),
      },
    });
    const warning = container.querySelector(
      "[data-testid='call-correction-warning']",
    );
    expect(warning).toBeTruthy();
    expect(warning?.textContent).toContain(
      "A contact correction is pending below.",
    );
  });

  it("hides correction warning when hasUnacknowledgedCorrection is false", () => {
    const { container } = render(CallOptionsContent, {
      props: {
        hasVerifiedPhone: false,
        hasUnacknowledgedCorrection: false,
        onaction: vi.fn(),
      },
    });
    const warning = container.querySelector(
      "[data-testid='call-correction-warning']",
    );
    expect(warning).toBeNull();
  });
});
