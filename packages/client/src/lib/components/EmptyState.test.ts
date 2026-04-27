// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import EmptyState from "./EmptyState.svelte";

// Konsta Button uses Web Animations API
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

afterEach(cleanup);

describe("EmptyState", () => {
  it("renders default message when no props provided", () => {
    render(EmptyState);
    expect(screen.getByText("Nothing here yet.")).toBeTruthy();
  });

  it("renders custom message via message prop (backward compat)", () => {
    render(EmptyState, { props: { message: "No tickets found" } });
    expect(screen.getByText("No tickets found")).toBeTruthy();
  });

  it("prefers title over message when both provided", () => {
    render(EmptyState, {
      props: { message: "fallback", title: "Empty inbox" },
    });
    expect(screen.getByText("Empty inbox")).toBeTruthy();
    expect(screen.queryByText("fallback")).toBeNull();
  });

  it("renders subtitle when provided", () => {
    render(EmptyState, {
      props: { title: "No results", subtitle: "Try different filters" },
    });
    expect(screen.getByText("Try different filters")).toBeTruthy();
  });

  it("does not render subtitle when not provided", () => {
    const { container } = render(EmptyState, { props: { title: "Empty" } });
    expect(container.querySelector(".empty-subtitle")).toBeNull();
  });

  it("renders action button when provided", () => {
    const onclick = vi.fn();
    render(EmptyState, {
      props: {
        title: "No items",
        action: { label: "Create one", onclick },
      },
    });
    const button = screen.getByText("Create one");
    expect(button).toBeTruthy();
  });

  it("does not render action button when not provided", () => {
    const { container } = render(EmptyState, { props: { title: "Empty" } });
    expect(container.querySelector(".empty-action")).toBeNull();
  });

  it("sets role=status for accessibility", () => {
    render(EmptyState, { props: { title: "Custom label" } });
    const el = screen.getByRole("status");
    expect(el).toBeTruthy();
  });

  it("sets aria-label to the display title", () => {
    render(EmptyState, { props: { title: "Custom label" } });
    const el = screen.getByLabelText("Custom label");
    expect(el).toBeTruthy();
  });
});
