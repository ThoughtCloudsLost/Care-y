// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/svelte";
import AccountLoginForm from "./AccountLoginForm.svelte";

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

function renderForm(overrides: Record<string, unknown> = {}) {
  return render(AccountLoginForm, {
    props: {
      onsubmit: vi.fn(),
      pending: false,
      error: false,
      ...overrides,
    },
  });
}

function getInput(container: HTMLElement, testId: string): HTMLInputElement {
  const wrapper = container.querySelector(`[data-testid="${testId}"]`);
  const input = wrapper?.querySelector("input") ?? wrapper;
  return input as HTMLInputElement;
}

describe("AccountLoginForm", () => {
  afterEach(cleanup);

  it("blocks submit when username is empty", async () => {
    const { container } = renderForm();

    const password = getInput(container, "account-password");
    await fireEvent.input(password, { target: { value: "password123" } });

    const btn = container.querySelector(
      "[data-testid='account-login-submit']",
    ) as HTMLElement;
    expect(
      btn.hasAttribute("disabled") ||
        btn.classList.contains("pointer-events-none"),
    ).toBe(true);
  });

  it("blocks submit when password is empty", async () => {
    const { container } = renderForm();

    const username = getInput(container, "account-username");
    await fireEvent.input(username, { target: { value: "ada" } });

    const btn = container.querySelector(
      "[data-testid='account-login-submit']",
    ) as HTMLElement;
    expect(
      btn.hasAttribute("disabled") ||
        btn.classList.contains("pointer-events-none"),
    ).toBe(true);
  });

  it("allows submit when both fields are filled and not pending", async () => {
    const onsubmit = vi.fn();
    const { container } = renderForm({ onsubmit });

    const username = getInput(container, "account-username");
    await fireEvent.input(username, { target: { value: "ada" } });

    const password = getInput(container, "account-password");
    await fireEvent.input(password, { target: { value: "password123" } });

    const btn = container.querySelector(
      "[data-testid='account-login-submit']",
    ) as HTMLElement;
    expect(btn.hasAttribute("disabled")).toBe(false);

    await fireEvent.click(btn);
    expect(onsubmit).toHaveBeenCalledWith("ada", "password123");
  });

  it("blocks submit when pending is true", async () => {
    const { container } = renderForm({ pending: true });

    const username = getInput(container, "account-username");
    await fireEvent.input(username, { target: { value: "ada" } });

    const password = getInput(container, "account-password");
    await fireEvent.input(password, { target: { value: "password123" } });

    const btn = container.querySelector(
      "[data-testid='account-login-submit']",
    ) as HTMLElement;
    expect(
      btn.hasAttribute("disabled") ||
        btn.classList.contains("pointer-events-none"),
    ).toBe(true);
  });

  it("shows error message when error prop is true", () => {
    const { container } = renderForm({ error: true });
    const errorEl = container.querySelector(
      "[data-testid='account-login-error']",
    );
    expect(errorEl).toBeTruthy();
    expect(errorEl?.textContent).toContain("did not match");
  });

  it("hides error message when error prop is false", () => {
    const { container } = renderForm({ error: false });
    expect(
      container.querySelector("[data-testid='account-login-error']"),
    ).toBeNull();
  });

  it("shows signed-out note when signedOutMessage is provided", () => {
    const { container } = renderForm({
      signedOutMessage: "Session expired",
    });
    const note = container.querySelector("[data-testid='signed-out-note']");
    expect(note).toBeTruthy();
    expect(note?.textContent).toContain("Session expired");
  });

  it("shows progressbar when pending", () => {
    const { container } = renderForm({ pending: true });
    const progress = container.querySelector("[role='progressbar']");
    expect(progress).toBeTruthy();
  });
});
