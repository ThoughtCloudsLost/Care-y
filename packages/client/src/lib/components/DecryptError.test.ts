// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import DecryptError from "./DecryptError.svelte";

afterEach(cleanup);

describe("DecryptError", () => {
  it("renders with role=alert", () => {
    render(DecryptError);
    const alert = screen.getByRole("alert");
    expect(alert).toBeTruthy();
  });

  it("displays decryption failed message", () => {
    render(DecryptError);
    expect(
      screen.getByText("This content could not be decrypted."),
    ).toBeTruthy();
  });
});
