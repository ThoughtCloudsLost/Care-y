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

  it("maps NOT_AUTHENTICATED to translated message", () => {
    render(QueryError, { props: { error: new Error("NOT_AUTHENTICATED") } });
    expect(screen.getByText("You are not signed in.")).toBeTruthy();
  });

  it("maps INVALID_CREDENTIALS to translated message", () => {
    render(QueryError, { props: { error: new Error("INVALID_CREDENTIALS") } });
    expect(
      screen.getByText("Invalid login username or password."),
    ).toBeTruthy();
  });

  it("maps TICKET_NOT_FOUND to translated message", () => {
    render(QueryError, { props: { error: new Error("TICKET_NOT_FOUND") } });
    expect(screen.getByText("Ticket not found.")).toBeTruthy();
  });

  it("maps KB_CATEGORY_NOT_FOUND to translated message", () => {
    render(QueryError, {
      props: { error: new Error("KB_CATEGORY_NOT_FOUND") },
    });
    expect(screen.getByText("Category not found.")).toBeTruthy();
  });

  it("maps TELEPHONY_NOT_CONFIGURED to translated message", () => {
    render(QueryError, {
      props: { error: new Error("TELEPHONY_NOT_CONFIGURED") },
    });
    expect(
      screen.getByText("Telephony is not configured for this organization."),
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
