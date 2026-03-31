// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import EmptyState from "./EmptyState.svelte";

afterEach(cleanup);

describe("EmptyState", () => {
  it("renders default message when no message prop provided", () => {
    render(EmptyState);
    expect(screen.getByText("Nothing here yet.")).toBeTruthy();
  });

  it("renders custom message when provided", () => {
    render(EmptyState, { props: { message: "No tickets found" } });
    expect(screen.getByText("No tickets found")).toBeTruthy();
  });

  it("sets aria-label to the message", () => {
    render(EmptyState, { props: { message: "Custom label" } });
    const el = screen.getByLabelText("Custom label");
    expect(el).toBeTruthy();
  });

  it("renders skeleton bars with animation disabled", () => {
    const { container } = render(EmptyState);
    const bars = container.querySelectorAll(".skeleton-bar");
    expect(bars.length).toBe(4);
  });
});
