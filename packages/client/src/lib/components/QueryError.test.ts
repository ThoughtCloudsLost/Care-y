// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import QueryError from "./QueryError.svelte";

afterEach(cleanup);

describe("QueryError", () => {
  it("renders generic message for unknown errors", () => {
    render(QueryError, { props: { error: new Error("UNKNOWN_CODE") } });
    expect(
      screen.getByText("Something went wrong. Please try again."),
    ).toBeTruthy();
  });

  it("maps RATE_LIMIT_COOLDOWN to translated message", () => {
    render(QueryError, { props: { error: new Error("RATE_LIMIT_COOLDOWN") } });
    expect(
      screen.getByText("Please wait before requesting another code."),
    ).toBeTruthy();
  });

  it("maps RATE_LIMIT_HOURLY to translated message", () => {
    render(QueryError, { props: { error: new Error("RATE_LIMIT_HOURLY") } });
    expect(
      screen.getByText("Too many codes requested. Please try again later."),
    ).toBeTruthy();
  });

  it("maps NO_ACTIVE_CODE to translated message", () => {
    render(QueryError, { props: { error: new Error("NO_ACTIVE_CODE") } });
    expect(
      screen.getByText(
        "No active verification code. Please request a new one.",
      ),
    ).toBeTruthy();
  });

  it("maps TOO_MANY_ATTEMPTS to translated message", () => {
    render(QueryError, { props: { error: new Error("TOO_MANY_ATTEMPTS") } });
    expect(
      screen.getByText("Too many attempts. Please request a new code."),
    ).toBeTruthy();
  });

  it("renders generic message for non-Error values", () => {
    render(QueryError, { props: { error: "some string" } });
    expect(
      screen.getByText("Something went wrong. Please try again."),
    ).toBeTruthy();
  });

  it("does not render retry button when onretry is not provided", () => {
    render(QueryError, { props: { error: new Error("test") } });
    expect(screen.queryByText("Try again")).toBeNull();
  });

  it("renders retry button when onretry is provided", () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function -- stub for presence test
    const onretry = () => {};
    render(QueryError, { props: { error: new Error("test"), onretry } });
    expect(screen.getByText("Try again")).toBeTruthy();
  });
});
