// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";

vi.mock("$lib/paraglide/messages.js", () => ({
  register_note: () => "Note",
  register_careful: () => "Careful",
  register_warning: () => "Warning",
  register_protected: () => "Protected",
  password_strength_too_short: ({ min }: { min: number }) =>
    `At least ${String(min)} characters`,
  password_strength_acceptable: () => "Acceptable",
  password_strength_good: () => "Good",
  password_strength_strong: () => "Strong",
  password_common_pattern: () => "This looks like a common pattern",
}));

const { default: PasswordStrengthMeter } =
  await import("./PasswordStrengthMeter.svelte");

afterEach(cleanup);

// PASSWORD_MIN_LENGTH is 16; the tiers step +10 from there.
const ACCEPTABLE = "a1b2c3d4e5f6g7h8"; // 16 chars
const GOOD = "a1b2c3d4e5f6g7h8i9j0k1l2m3"; // 26 chars
const STRONG = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8"; // 36 chars
const COMMON = "aaaaaaaaaaaaaaaa"; // 16 chars, single repeated character

describe("PasswordStrengthMeter", () => {
  it("renders nothing for an empty password", () => {
    const { container } = render(PasswordStrengthMeter, {
      props: { password: "" },
    });
    expect(container.querySelector(".strength-meter")).toBeNull();
  });

  it("labels a password under the minimum as too short", () => {
    render(PasswordStrengthMeter, { props: { password: "short" } });
    expect(screen.getByText("At least 16 characters")).toBeTruthy();
  });

  it("labels the tiers at their length steps", () => {
    for (const [password, label] of [
      [ACCEPTABLE, "Acceptable"],
      [GOOD, "Good"],
      [STRONG, "Strong"],
    ] as const) {
      render(PasswordStrengthMeter, { props: { password } });
      expect(screen.getByText(label)).toBeTruthy();
      cleanup();
    }
  });

  it("shows the common-pattern caution as a Careful register with role=alert", () => {
    render(PasswordStrengthMeter, { props: { password: COMMON } });
    const alert = screen.getByRole("alert");
    expect(alert.getAttribute("data-register")).toBe("careful");
    expect(screen.getByText("This looks like a common pattern")).toBeTruthy();
    expect(screen.getByText("Careful")).toBeTruthy();
  });

  it("suppresses the common-pattern caution when showCommonWarning is false", () => {
    render(PasswordStrengthMeter, {
      props: { password: COMMON, showCommonWarning: false },
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("stays quiet about common patterns below the minimum length", () => {
    render(PasswordStrengthMeter, { props: { password: "aaaa" } });
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
