// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/svelte";

let mockBrandingData: {
  orgName: string;
  primaryColor: string;
  accentColor: string | null;
  iconUrl: string | null;
  orgSlug: string;
} | null = null;

// vi.mock required: createPublicBrandingQuery builds a TanStack Query, which
// needs a QueryClient from component context this render never provides.
vi.mock("$lib/branding/public-branding.js", async (importOriginal) => ({
  ...(await importOriginal()),
  createPublicBrandingQuery: () => ({
    get data() {
      return mockBrandingData;
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

vi.mock("$lib/branding/title.svelte.js", async (importOriginal) => ({
  ...(await importOriginal()),
  getBrandingTitle: () => "CARE-Y",
}));

import * as m from "$lib/paraglide/messages.js";
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

// PasswordInput renders through ListInput's input snippet and carries no
// testid, so the field is addressed by its accessible name.
function getPasswordInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector(
    `input[aria-label="${m.account_login_password()}"]`,
  ) as HTMLInputElement;
}

describe("AccountLoginForm", () => {
  beforeEach(() => {
    mockBrandingData = null;
  });

  afterEach(cleanup);

  it("blocks submit when username is empty", async () => {
    const { container } = renderForm();

    const password = getPasswordInput(container);
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

    const password = getPasswordInput(container);
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

    const password = getPasswordInput(container);
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

  // The form had no form element before, so Enter did nothing and the only
  // way to sign in was tapping the button.
  it("submits on the form's submit event, not just a button click", async () => {
    const onsubmit = vi.fn();
    const { container } = renderForm({ onsubmit });

    await fireEvent.input(getInput(container, "account-username"), {
      target: { value: "ada" },
    });
    await fireEvent.input(getPasswordInput(container), {
      target: { value: "password123" },
    });

    const form = container.querySelector("form") as HTMLFormElement;
    expect(form).toBeTruthy();
    await fireEvent.submit(form);

    expect(onsubmit).toHaveBeenCalledWith("ada", "password123");
  });

  it("does not submit the form while pending", async () => {
    const onsubmit = vi.fn();
    const { container } = renderForm({ onsubmit, pending: true });

    await fireEvent.submit(container.querySelector("form") as HTMLFormElement);

    expect(onsubmit).not.toHaveBeenCalled();
  });

  it("gives both fields a visible label", () => {
    const { container } = renderForm();
    expect(container.textContent).toContain("Username");
    expect(container.textContent).toContain("Password");
  });

  it("shows the org name and logo from branding", () => {
    mockBrandingData = {
      orgName: "Safe Harbor",
      primaryColor: "#636366",
      accentColor: null,
      iconUrl: "/branding/safe-harbor/icon-192.png?v=1",
      orgSlug: "safe-harbor",
    };

    const { container } = renderForm();

    expect(container.textContent).toContain("Safe Harbor");
    const img = container.querySelector("img.login-logo");
    expect(img?.getAttribute("src")).toBe(
      "/branding/safe-harbor/icon-192.png?v=1",
    );
    expect(img?.getAttribute("alt")).toBe("");
  });

  it("falls back to the generic title when branding is unavailable", () => {
    mockBrandingData = null;
    const { container } = renderForm();
    expect(container.textContent).toContain("CARE-Y");
  });

  it("labels the derivation phase the page reports", () => {
    const { container } = renderForm({ pending: true, phase: "argon2id" });
    const progress = container.querySelector("[role='progressbar']");
    expect(progress?.getAttribute("aria-label")).toBeTruthy();
    expect(progress?.getAttribute("aria-label")).not.toBe("");
  });

  // Shared-device threat: the reveal toggle must be a deliberate tap, never
  // the starting state.
  it("starts with the password hidden", () => {
    const { container } = renderForm();
    expect(getPasswordInput(container).getAttribute("type")).toBe("password");
  });
});
