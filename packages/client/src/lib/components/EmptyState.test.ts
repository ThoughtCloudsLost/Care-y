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

  it("lets a stamp stand alone when no title is given", () => {
    const { container } = render(EmptyState, {
      props: { stamp: "No matches", subtitle: "Nothing here matches." },
    });
    expect(screen.getByText("No matches")).toBeTruthy();
    expect(screen.getByText("Nothing here matches.")).toBeTruthy();
    expect(container.querySelector(".empty-title")).toBeNull();
    expect(screen.getByRole("status", { name: "No matches" })).toBeTruthy();
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

  describe("seal variant", () => {
    it("renders the org initial as a decorative seal", () => {
      const { container } = render(EmptyState, {
        props: { seal: "H", title: "Nothing here yet" },
      });
      const seal = container.querySelector(".empty-seal");
      expect(seal).toBeTruthy();
      expect(seal?.textContent).toBe("H");
      expect(seal?.getAttribute("aria-hidden")).toBe("true");
    });

    it("applies the display anatomy to the container", () => {
      const { container } = render(EmptyState, {
        props: { seal: "H", title: "Nothing here yet" },
      });
      expect(container.querySelector(".empty-state--display")).toBeTruthy();
    });

    it("keeps the plain anatomy when no seal or stamp is given", () => {
      const { container } = render(EmptyState, { props: { title: "Empty" } });
      expect(container.querySelector(".empty-state--display")).toBeNull();
      expect(container.querySelector(".empty-seal")).toBeNull();
      expect(container.querySelector(".empty-stamp")).toBeNull();
    });
  });

  describe("stamp variant", () => {
    it("renders the stamped word", () => {
      const { container } = render(EmptyState, {
        props: { stamp: "All caught up", title: "You've read everything" },
      });
      const stamp = container.querySelector(".empty-stamp");
      expect(stamp).toBeTruthy();
      expect(stamp?.textContent).toBe("All caught up");
      expect(container.querySelector(".empty-state--display")).toBeTruthy();
    });

    it("wins over seal and icon when several are passed", () => {
      const { container } = render(EmptyState, {
        props: { stamp: "Done", seal: "H", title: "Caught up" },
      });
      expect(container.querySelector(".empty-stamp")).toBeTruthy();
      expect(container.querySelector(".empty-seal")).toBeNull();
    });
  });
});
