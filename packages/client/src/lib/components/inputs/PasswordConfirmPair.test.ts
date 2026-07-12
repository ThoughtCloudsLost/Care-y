// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";

vi.mock("$lib/paraglide/messages.js", () => ({
  register_note: () => "Note",
  register_careful: () => "Careful",
  register_warning: () => "Warning",
  register_protected: () => "Protected",
  password_show: () => "Show password",
  password_hide: () => "Hide password",
  password_strength_too_short: ({ min }: { min: number }) =>
    `At least ${String(min)} characters`,
  password_strength_acceptable: () => "Acceptable",
  password_strength_good: () => "Good",
  password_strength_strong: () => "Strong",
  password_common_pattern: () => "This looks like a common pattern",
}));

const { default: PasswordConfirmPair } =
  await import("./PasswordConfirmPair.svelte");

afterEach(cleanup);

const BASE_PROPS = {
  passwordLabel: "New password",
  confirmLabel: "Confirm password",
  mismatchError: "Passwords do not match",
  passwordPlaceholder: "Enter password",
  confirmPlaceholder: "Repeat password",
};

function passwordField(): HTMLInputElement {
  return screen.getByPlaceholderText("Enter password") as HTMLInputElement;
}

function confirmField(): HTMLInputElement {
  return screen.getByPlaceholderText("Repeat password") as HTMLInputElement;
}

describe("PasswordConfirmPair", () => {
  it("renders both fields and no strength meter while empty", () => {
    const { container } = render(PasswordConfirmPair, { props: BASE_PROPS });
    expect(passwordField()).toBeTruthy();
    expect(confirmField()).toBeTruthy();
    expect(container.querySelector(".strength-meter")).toBeNull();
  });

  it("shows the strength meter once the password has content", async () => {
    const { container } = render(PasswordConfirmPair, { props: BASE_PROPS });
    await fireEvent.input(passwordField(), {
      target: { value: "a1b2c3d4e5f6g7h8" },
    });
    expect(container.querySelector(".strength-meter")).not.toBeNull();
    expect(screen.getByText("Acceptable")).toBeTruthy();
  });

  it("shows the mismatch error while the values differ and clears it on match", async () => {
    render(PasswordConfirmPair, { props: BASE_PROPS });
    await fireEvent.input(passwordField(), {
      target: { value: "a1b2c3d4e5f6g7h8" },
    });
    await fireEvent.input(confirmField(), { target: { value: "different" } });
    expect(screen.getByText("Passwords do not match")).toBeTruthy();

    await fireEvent.input(confirmField(), {
      target: { value: "a1b2c3d4e5f6g7h8" },
    });
    expect(screen.queryByText("Passwords do not match")).toBeNull();
  });

  it("stays quiet while the confirm field is still empty", async () => {
    render(PasswordConfirmPair, { props: BASE_PROPS });
    await fireEvent.input(passwordField(), {
      target: { value: "a1b2c3d4e5f6g7h8" },
    });
    expect(screen.queryByText("Passwords do not match")).toBeNull();
  });

  it("forwards the minimum length to the strength meter", async () => {
    render(PasswordConfirmPair, {
      props: { ...BASE_PROPS, minLength: 20 },
    });
    await fireEvent.input(passwordField(), {
      target: { value: "a1b2c3d4e5f6g7h8" }, // 16 chars, under the custom 20
    });
    expect(screen.getByText("At least 20 characters")).toBeTruthy();
  });

  it("passes through the consumer's password error and help text", () => {
    render(PasswordConfirmPair, {
      props: {
        ...BASE_PROPS,
        passwordInfo: "Pick something long.",
        passwordError: "Too short",
      },
    });
    expect(screen.getByText("Too short")).toBeTruthy();
  });
});
