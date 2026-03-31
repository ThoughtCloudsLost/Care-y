// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import FieldError from "./FieldError.svelte";

afterEach(cleanup);

describe("FieldError", () => {
  it("renders nothing when message is undefined", () => {
    const { container } = render(FieldError);
    expect(container.querySelector(".field-error")).toBeNull();
  });

  it("renders with role=alert when message is present", () => {
    render(FieldError, { props: { message: "Required field" } });
    const alert = screen.getByRole("alert");
    expect(alert).toBeTruthy();
    expect(alert.textContent).toBe("Required field");
  });
});
