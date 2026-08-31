// @vitest-environment jsdom
/**
 * ContactCorrectionSheet tests.
 *
 * Covers: title and body render when opened, submit disabled with empty
 * inputs, phone only enables submit, email only enables submit, both
 * fields submit, invalid email disables submit, onsubmit receives a
 * payload object, pending disables submit.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { tick } from "svelte";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import ContactCorrectionSheet from "./ContactCorrectionSheet.svelte";
import type * as MessagesMod from "$lib/paraglide/messages.js";
import type * as ShellSheetMod from "$lib/shell/ShellSheet.svelte";

vi.mock("$lib/paraglide/messages.js", async (importOriginal) => ({
  ...(await importOriginal<typeof MessagesMod>()),
  portal_correction_sheet_title: () => "Correct my contact info",
  portal_correction_sheet_body: () => "Enter your updated information",
  portal_correction_phone_label: () => "New phone number",
  portal_correction_email_label: () => "New email",
  portal_correction_sheet_submit: () => "Send correction",
}));

// ShellSheet portals to .k-page and depends on Konsta internals.
vi.mock("$lib/shell/ShellSheet.svelte", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellSheetMod>()),
  default: (
    await import("../components/tickets/test-helpers/PassthroughShell.svelte")
  ).default,
}));

// jsdom has no ResizeObserver
vi.stubGlobal(
  "ResizeObserver",
  vi.fn(function (this: {
    observe: () => void;
    disconnect: () => void;
    unobserve: () => void;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

afterEach(cleanup);

describe("ContactCorrectionSheet", () => {
  const baseProps = {
    opened: true,
    ondismiss: vi.fn(),
    onsubmit: vi.fn(),
  };

  it("renders title and body when opened", () => {
    const { container } = render(ContactCorrectionSheet, {
      props: baseProps,
    });
    expect(container.textContent).toContain("Correct my contact info");
    expect(container.textContent).toContain("Enter your updated information");
  });

  it("does not render content when closed", () => {
    const { container } = render(ContactCorrectionSheet, {
      props: { ...baseProps, opened: false },
    });
    // PassthroughShell hides children when opened=false
    expect(container.textContent).not.toContain(
      "Enter your updated information",
    );
  });

  it("submit button is disabled with empty inputs", () => {
    const { container } = render(ContactCorrectionSheet, {
      props: baseProps,
    });
    const btn = container.querySelector("button.soft-btn") as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.disabled).toBe(true);
  });

  it("typing a phone value enables the submit button", async () => {
    const { container } = render(ContactCorrectionSheet, {
      props: baseProps,
    });
    const input = container.querySelector(
      "input[type='tel']",
    ) as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "+1 555-1234" } });
    await tick();

    const btn = container.querySelector("button.soft-btn") as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it("typing an email value enables the submit button", async () => {
    const { container } = render(ContactCorrectionSheet, {
      props: baseProps,
    });
    const input = container.querySelector(
      "input[type='email']",
    ) as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "user@example.com" } });
    await tick();

    const btn = container.querySelector("button.soft-btn") as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it("invalid email disables the submit button", async () => {
    const { container } = render(ContactCorrectionSheet, {
      props: baseProps,
    });
    const input = container.querySelector(
      "input[type='email']",
    ) as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "not-an-email" } });
    await tick();

    const btn = container.querySelector("button.soft-btn") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("submit calls onsubmit with phone-only payload", async () => {
    const onsubmit = vi.fn();
    const { container } = render(ContactCorrectionSheet, {
      props: { ...baseProps, onsubmit },
    });

    const input = container.querySelector(
      "input[type='tel']",
    ) as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "  +1 555-1234  " } });
    await tick();

    const btn = container.querySelector("button.soft-btn") as HTMLButtonElement;
    await fireEvent.click(btn);

    expect(onsubmit).toHaveBeenCalledWith({
      v: 1,
      phone: "+1 555-1234",
    });
  });

  it("submit calls onsubmit with email-only payload", async () => {
    const onsubmit = vi.fn();
    const { container } = render(ContactCorrectionSheet, {
      props: { ...baseProps, onsubmit },
    });

    const input = container.querySelector(
      "input[type='email']",
    ) as HTMLInputElement;
    await fireEvent.input(input, {
      target: { value: "user@example.com" },
    });
    await tick();

    const btn = container.querySelector("button.soft-btn") as HTMLButtonElement;
    await fireEvent.click(btn);

    expect(onsubmit).toHaveBeenCalledWith({
      v: 1,
      email: "user@example.com",
    });
  });

  it("submit calls onsubmit with both fields", async () => {
    const onsubmit = vi.fn();
    const { container } = render(ContactCorrectionSheet, {
      props: { ...baseProps, onsubmit },
    });

    const phoneInput = container.querySelector(
      "input[type='tel']",
    ) as HTMLInputElement;
    const emailInput = container.querySelector(
      "input[type='email']",
    ) as HTMLInputElement;
    await fireEvent.input(phoneInput, { target: { value: "+15551234567" } });
    await fireEvent.input(emailInput, {
      target: { value: "user@example.com" },
    });
    await tick();

    const btn = container.querySelector("button.soft-btn") as HTMLButtonElement;
    await fireEvent.click(btn);

    expect(onsubmit).toHaveBeenCalledWith({
      v: 1,
      phone: "+15551234567",
      email: "user@example.com",
    });
  });

  it("pending disables the submit button", async () => {
    const { container } = render(ContactCorrectionSheet, {
      props: { ...baseProps, pending: true },
    });

    const input = container.querySelector(
      "input[type='tel']",
    ) as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "+1 555-1234" } });
    await tick();

    const btn = container.querySelector("button.soft-btn") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
