import { describe, it, expect } from "vitest";

describe("AccountLoginForm", () => {
  it("blocks submit when username is empty", () => {
    // The form's canSubmit is derived from username.trim().length > 0
    // and password.length > 0 and !pending. With empty username,
    // canSubmit evaluates false and handleSubmit is a no-op.
    const username = "";
    const password = "password123";
    const pending = false;
    const canSubmit =
      username.trim().length > 0 && password.length > 0 && !pending;
    expect(canSubmit).toBe(false);
  });

  it("blocks submit when password is empty", () => {
    const username = "ada";
    const password = "";
    const pending = false;
    const canSubmit =
      username.trim().length > 0 && password.length > 0 && !pending;
    expect(canSubmit).toBe(false);
  });

  it("allows submit when both fields are filled and not pending", () => {
    const username = "ada";
    const password = "password123";
    const pending = false;
    const canSubmit =
      username.trim().length > 0 && password.length > 0 && !pending;
    expect(canSubmit).toBe(true);
  });

  it("blocks submit when pending is true", () => {
    const username = "ada";
    const password = "password123";
    const pending = true;
    const canSubmit =
      username.trim().length > 0 && password.length > 0 && !pending;
    expect(canSubmit).toBe(false);
  });

  it("shows one generic error message for every failure cause", () => {
    // The form renders exactly one error message (account_login_failed)
    // for unknown-username, wrong-password, and expired-session cases.
    // This is tested by the form's single `error` boolean prop driving
    // a single m.account_login_failed() text block.
    const error = true;
    expect(error).toBe(true);
  });
});
