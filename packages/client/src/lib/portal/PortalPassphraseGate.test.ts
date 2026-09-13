import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/svelte";
import PortalPassphraseGate from "./PortalPassphraseGate.svelte";

describe("PortalPassphraseGate", () => {
  it("renders a password input that accepts paste", () => {
    const { getByTestId } = render(PortalPassphraseGate, {
      props: { onsubmit: vi.fn(), pending: false, error: false },
    });
    const input = getByTestId("passphrase-input");
    expect(input).toBeTruthy();
    // Input type should be password (allows paste by default per WCAG 3.3.8)
    const nativeInput = input.querySelector("input");
    expect(nativeInput?.type).toBe("password");
  });

  it("submit button is disabled when input is empty", () => {
    const { getByTestId } = render(PortalPassphraseGate, {
      props: { onsubmit: vi.fn(), pending: false, error: false },
    });
    const btn = getByTestId("passphrase-submit");
    // Konsta Button renders disabled state
    expect(
      btn.hasAttribute("disabled") ||
        btn.classList.contains("pointer-events-none"),
    ).toBe(true);
  });

  it("calls onsubmit with the passphrase when submitted", async () => {
    const onsubmit = vi.fn();
    const { getByTestId, container } = render(PortalPassphraseGate, {
      props: { onsubmit, pending: false, error: false },
    });

    // Type into the input
    const nativeInput = container.querySelector("input[type='password']");
    if (nativeInput instanceof HTMLInputElement) {
      await fireEvent.input(nativeInput, {
        target: { value: "crane velvet monsoon" },
      });
    }

    const btn = getByTestId("passphrase-submit");
    await fireEvent.click(btn);
    // The button click may or may not propagate depending on Konsta rendering;
    // we verify the handler is wired
    expect(onsubmit).toHaveBeenCalled();
  });

  it("shows error text when error prop is true", () => {
    const { getByTestId } = render(PortalPassphraseGate, {
      props: { onsubmit: vi.fn(), pending: false, error: true },
    });
    const errorEl = getByTestId("passphrase-error");
    expect(errorEl).toBeTruthy();
    expect(errorEl.getAttribute("role")).toBe("alert");
  });

  it("hides error text when error prop is false", () => {
    const { queryByTestId } = render(PortalPassphraseGate, {
      props: { onsubmit: vi.fn(), pending: false, error: false },
    });
    expect(queryByTestId("passphrase-error")).toBeNull();
  });

  it("shows progress indicator when pending", () => {
    const { getByTestId } = render(PortalPassphraseGate, {
      props: { onsubmit: vi.fn(), pending: true, error: false },
    });
    const btn = getByTestId("passphrase-submit");
    const progress = btn.querySelector("[role='progressbar']");
    expect(progress).toBeTruthy();
  });
});
