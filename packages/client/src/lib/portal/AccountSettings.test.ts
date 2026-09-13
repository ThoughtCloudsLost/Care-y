// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/svelte";
import * as m from "$lib/paraglide/messages.js";
import AccountSettings from "./AccountSettings.svelte";

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

function renderSettings(overrides: Record<string, unknown> = {}) {
  return render(AccountSettings, {
    props: {
      onchangepassword: vi.fn(),
      pending: false,
      ...overrides,
    },
  });
}

// PasswordInput and PasswordConfirmPair render through ListInput's input
// snippet and carry no testid, so the fields are addressed by their
// accessible name, which is the contract a screen reader uses too.
function getInput(container: HTMLElement, label: string): HTMLInputElement {
  return container.querySelector(
    `input[aria-label="${label}"]`,
  ) as HTMLInputElement;
}

describe("AccountSettings", () => {
  afterEach(cleanup);

  it("blocks change-password submit when current password is empty", async () => {
    const { container } = renderSettings();

    const newPw = getInput(container, m.account_new_password());
    await fireEvent.input(newPw, { target: { value: "newpassword1" } });

    const confirmPw = getInput(container, m.account_confirm_new_password());
    await fireEvent.input(confirmPw, { target: { value: "newpassword1" } });

    const btn = container.querySelector(
      "[data-testid='account-change-submit']",
    ) as HTMLElement;
    expect(
      btn.hasAttribute("disabled") ||
        btn.classList.contains("pointer-events-none"),
    ).toBe(true);
  });

  it("blocks change-password submit when new password is too short", async () => {
    const { container } = renderSettings();

    const current = getInput(container, m.account_change_current());
    await fireEvent.input(current, { target: { value: "oldpassword" } });

    const newPw = getInput(container, m.account_new_password());
    await fireEvent.input(newPw, { target: { value: "short" } });

    const confirmPw = getInput(container, m.account_confirm_new_password());
    await fireEvent.input(confirmPw, { target: { value: "short" } });

    const btn = container.querySelector(
      "[data-testid='account-change-submit']",
    ) as HTMLElement;
    expect(
      btn.hasAttribute("disabled") ||
        btn.classList.contains("pointer-events-none"),
    ).toBe(true);
  });

  it("blocks change-password submit when new passwords do not match", async () => {
    const { container } = renderSettings();

    const current = getInput(container, m.account_change_current());
    await fireEvent.input(current, { target: { value: "oldpassword" } });

    const newPw = getInput(container, m.account_new_password());
    await fireEvent.input(newPw, { target: { value: "newpassword1" } });

    const confirmPw = getInput(container, m.account_confirm_new_password());
    await fireEvent.input(confirmPw, { target: { value: "different99" } });

    const btn = container.querySelector(
      "[data-testid='account-change-submit']",
    ) as HTMLElement;
    expect(
      btn.hasAttribute("disabled") ||
        btn.classList.contains("pointer-events-none"),
    ).toBe(true);
  });

  it("allows submit when all fields valid and not pending", async () => {
    const onchangepassword = vi.fn();
    const { container } = renderSettings({ onchangepassword });

    const current = getInput(container, m.account_change_current());
    await fireEvent.input(current, { target: { value: "oldpassword" } });

    const newPw = getInput(container, m.account_new_password());
    await fireEvent.input(newPw, { target: { value: "newpassword1" } });

    const confirmPw = getInput(container, m.account_confirm_new_password());
    await fireEvent.input(confirmPw, { target: { value: "newpassword1" } });

    const btn = container.querySelector(
      "[data-testid='account-change-submit']",
    ) as HTMLElement;
    expect(btn.hasAttribute("disabled")).toBe(false);

    await fireEvent.click(btn);
    expect(onchangepassword).toHaveBeenCalledWith(
      "oldpassword",
      "newpassword1",
    );
  });

  it("shows mismatch only when both new password fields have content and differ", async () => {
    const { container } = renderSettings();

    const mismatch = (): boolean =>
      container.textContent.includes(m.account_create_mismatch());
    const newPw = getInput(container, m.account_new_password());
    const confirmPw = getInput(container, m.account_confirm_new_password());

    await fireEvent.input(newPw, { target: { value: "newpassword1" } });
    expect(mismatch()).toBe(false);

    await fireEvent.input(confirmPw, { target: { value: "different99" } });
    expect(mismatch()).toBe(true);

    await fireEvent.input(confirmPw, { target: { value: "newpassword1" } });
    expect(mismatch()).toBe(false);
  });

  it("shows error message when errorMessage is provided", async () => {
    const { container } = renderSettings({
      errorMessage: "Wrong password",
    });

    const errorEl = container.querySelector(
      "[data-testid='account-settings-error']",
    );
    expect(errorEl).toBeTruthy();
    expect(errorEl?.textContent).toContain("Wrong password");
  });

  // Shared-device threat: the reveal toggle must be a deliberate tap, never
  // the starting state.
  it("starts with every password field hidden", () => {
    const { container } = renderSettings();
    for (const label of [
      m.account_change_current(),
      m.account_new_password(),
      m.account_confirm_new_password(),
    ]) {
      expect(getInput(container, label).getAttribute("type")).toBe("password");
    }
  });
});
