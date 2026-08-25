// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/svelte";
import AccountCreateForm from "./AccountCreateForm.svelte";

if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

function renderForm(overrides: Record<string, unknown> = {}) {
  return render(AccountCreateForm, {
    props: {
      onsubmit: vi.fn(),
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

describe("AccountCreateForm", () => {
  afterEach(cleanup);

  it("blocks submit when username is shorter than 3 characters", async () => {
    const { container } = renderForm();

    const username = getInput(container, "account-create-username");
    await fireEvent.input(username, { target: { value: "ab" } });

    const password = getInput(container, "account-create-password");
    await fireEvent.input(password, { target: { value: "longpassword" } });

    const confirm = getInput(container, "account-create-confirm");
    await fireEvent.input(confirm, { target: { value: "longpassword" } });

    const btn = container.querySelector(
      "[data-testid='account-create-submit']",
    ) as HTMLElement;
    expect(
      btn.hasAttribute("disabled") ||
        btn.classList.contains("pointer-events-none"),
    ).toBe(true);
  });

  it("blocks submit when password is shorter than 8 characters", async () => {
    const { container } = renderForm();

    const username = getInput(container, "account-create-username");
    await fireEvent.input(username, { target: { value: "validuser" } });

    const password = getInput(container, "account-create-password");
    await fireEvent.input(password, { target: { value: "short" } });

    const confirm = getInput(container, "account-create-confirm");
    await fireEvent.input(confirm, { target: { value: "short" } });

    const btn = container.querySelector(
      "[data-testid='account-create-submit']",
    ) as HTMLElement;
    expect(
      btn.hasAttribute("disabled") ||
        btn.classList.contains("pointer-events-none"),
    ).toBe(true);
  });

  it("blocks submit when passwords do not match", async () => {
    const { container } = renderForm();

    const username = getInput(container, "account-create-username");
    await fireEvent.input(username, { target: { value: "validuser" } });

    const password = getInput(container, "account-create-password");
    await fireEvent.input(password, { target: { value: "longpassword" } });

    const confirm = getInput(container, "account-create-confirm");
    await fireEvent.input(confirm, { target: { value: "differentpw" } });

    const btn = container.querySelector(
      "[data-testid='account-create-submit']",
    ) as HTMLElement;
    expect(
      btn.hasAttribute("disabled") ||
        btn.classList.contains("pointer-events-none"),
    ).toBe(true);
  });

  it("allows submit when all fields valid and not pending", async () => {
    const onsubmit = vi.fn();
    const { container } = renderForm({ onsubmit });

    const username = getInput(container, "account-create-username");
    await fireEvent.input(username, { target: { value: "validuser" } });

    const password = getInput(container, "account-create-password");
    await fireEvent.input(password, { target: { value: "longpassword" } });

    const confirm = getInput(container, "account-create-confirm");
    await fireEvent.input(confirm, { target: { value: "longpassword" } });

    const btn = container.querySelector(
      "[data-testid='account-create-submit']",
    ) as HTMLElement;
    expect(btn.hasAttribute("disabled")).toBe(false);

    await fireEvent.click(btn);
    expect(onsubmit).toHaveBeenCalledWith("validuser", "longpassword");
  });

  it("shows mismatch only when both passwords have content and differ", async () => {
    const { container } = renderForm();

    const mismatch = (): Element | null =>
      container.querySelector("[data-testid='account-mismatch']");
    const password = getInput(container, "account-create-password");
    const confirm = getInput(container, "account-create-confirm");

    await fireEvent.input(password, { target: { value: "longpassword" } });
    expect(mismatch()).toBeNull();

    await fireEvent.input(confirm, { target: { value: "different" } });
    expect(mismatch()).toBeTruthy();

    await fireEvent.input(confirm, { target: { value: "longpassword" } });
    expect(mismatch()).toBeNull();
  });

  it("renders both warning messages", () => {
    const { container } = renderForm();
    expect(
      container.querySelector("[data-testid='warning-password']"),
    ).toBeTruthy();
    expect(
      container.querySelector("[data-testid='warning-reset']"),
    ).toBeTruthy();
  });
});
