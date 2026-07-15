// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import StatusMark from "./StatusMark.svelte";

afterEach(cleanup);

describe("StatusMark", () => {
  it("renders the new mark as a single filled disc", () => {
    const { container } = render(StatusMark, { props: { status: "new" } });
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(1);
    expect(circles[0]?.getAttribute("r")).toBe("5.4");
    expect(circles[0]?.getAttribute("fill")).toBe("currentColor");
  });

  it("renders the active mark as a ring plus center dot", () => {
    const { container } = render(StatusMark, { props: { status: "active" } });
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
    expect(circles[0]?.getAttribute("fill")).toBe("none");
    expect(circles[0]?.getAttribute("stroke")).toBe("currentColor");
    expect(circles[1]?.getAttribute("r")).toBe("2.1");
    expect(circles[1]?.getAttribute("fill")).toBe("currentColor");
  });

  it("renders the hold mark as two pause bars", () => {
    const { container } = render(StatusMark, { props: { status: "hold" } });
    const rects = container.querySelectorAll("rect");
    expect(rects).toHaveLength(2);
    expect(rects[0]?.getAttribute("fill")).toBe("currentColor");
    expect(rects[1]?.getAttribute("fill")).toBe("currentColor");
  });

  it("renders the closed mark as two crossing lines", () => {
    const { container } = render(StatusMark, { props: { status: "closed" } });
    expect(container.querySelectorAll("circle")).toHaveLength(0);
    const lines = container.querySelectorAll("line");
    expect(lines).toHaveLength(2);
    expect(lines[0]?.getAttribute("stroke-linecap")).toBe("round");
  });

  it("carries the status word as the accessible label", () => {
    render(StatusMark, { props: { status: "new" } });
    expect(screen.getByRole("img", { name: "New" })).toBeTruthy();
    cleanup();

    render(StatusMark, { props: { status: "active" } });
    expect(screen.getByRole("img", { name: "Active" })).toBeTruthy();
    cleanup();

    render(StatusMark, { props: { status: "hold" } });
    expect(screen.getByRole("img", { name: "On hold" })).toBeTruthy();
    cleanup();

    render(StatusMark, { props: { status: "closed" } });
    expect(screen.getByRole("img", { name: "Closed" })).toBeTruthy();
  });

  it("hides the svg from assistive tech (the label lives on the wrapper)", () => {
    const { container } = render(StatusMark, { props: { status: "new" } });
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  it("exposes the status as a data attribute for styling hooks", () => {
    const { container } = render(StatusMark, { props: { status: "hold" } });
    expect(
      container.querySelector(".status-mark")?.getAttribute("data-status"),
    ).toBe("hold");
  });

  it("keeps the same 13x13 viewBox across all marks (no layout shift)", () => {
    for (const status of ["new", "active", "hold", "closed"] as const) {
      const { container } = render(StatusMark, { props: { status } });
      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("viewBox")).toBe("0 0 13 13");
      expect(svg?.getAttribute("width")).toBe("13");
      cleanup();
    }
  });
});
