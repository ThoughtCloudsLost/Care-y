// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/svelte";
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
      onlogout: vi.fn(),
      pending: false,
      ...overrides,
    },
  });
}

function getInput(container: HTMLElement, testId: string): HTMLInputElement {
  const wrapper = container.querySelector(`[data-testid="${testId}"]`);
  const input = wrapper?.querySelector("input") ?? wrapper;
  return input as HTMLInputElement;
}

async function expandSettings(container: HTMLElement): Promise<void> {
  const toggle = container.querySelector(
    "[data-testid='account-settings-toggle']",
  ) as HTMLElement;
  await fireEvent.click(toggle);
}

describe("AccountSettings", () => {
  afterEach(cleanup);

  it("blocks change-password submit when current password is empty", async () => {
    const { container } = renderSettings();
    await expandSettings(container);

    const newPw = getInput(container, "account-new-password");
    await fireEvent.input(newPw, { target: { value: "newpassword1" } });

    const confirmPw = getInput(container, "account-confirm-new-password");
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
    await expandSettings(container);

    const current = getInput(container, "account-current-password");
    await fireEvent.input(current, { target: { value: "oldpassword" } });

    const newPw = getInput(container, "account-new-password");
    await fireEvent.input(newPw, { target: { value: "short" } });

    const confirmPw = getInput(container, "account-confirm-new-password");
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
    await expandSettings(container);

    const current = getInput(container, "account-current-password");
    await fireEvent.input(current, { target: { value: "oldpassword" } });

    const newPw = getInput(container, "account-new-password");
    await fireEvent.input(newPw, { target: { value: "newpassword1" } });

    const confirmPw = getInput(container, "account-confirm-new-password");
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
    await expandSettings(container);

    const current = getInput(container, "account-current-password");
    await fireEvent.input(current, { target: { value: "oldpassword" } });

    const newPw = getInput(container, "account-new-password");
    await fireEvent.input(newPw, { target: { value: "newpassword1" } });

    const confirmPw = getInput(container, "account-confirm-new-password");
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
    await expandSettings(container);

    const mismatch = (): Element | null =>
      container.querySelector("[data-testid='settings-mismatch']");
    const newPw = getInput(container, "account-new-password");
    const confirmPw = getInput(container, "account-confirm-new-password");

    await fireEvent.input(newPw, { target: { value: "newpassword1" } });
    expect(mismatch()).toBeNull();

    await fireEvent.input(confirmPw, { target: { value: "different99" } });
    expect(mismatch()).toBeTruthy();

    await fireEvent.input(confirmPw, { target: { value: "newpassword1" } });
    expect(mismatch()).toBeNull();
  });

  it("calls onlogout when sign-out button is clicked", async () => {
    const onlogout = vi.fn();
    const { container } = renderSettings({ onlogout });
    await expandSettings(container);

    const logoutBtn = container.querySelector(
      "[data-testid='account-logout']",
    ) as HTMLElement;
    await fireEvent.click(logoutBtn);
    expect(onlogout).toHaveBeenCalled();
  });

  it("shows error message when errorMessage is provided", async () => {
    const { container } = renderSettings({
      errorMessage: "Wrong password",
    });
    await expandSettings(container);

    const errorEl = container.querySelector(
      "[data-testid='account-settings-error']",
    );
    expect(errorEl).toBeTruthy();
    expect(errorEl?.textContent).toContain("Wrong password");
  });
});
