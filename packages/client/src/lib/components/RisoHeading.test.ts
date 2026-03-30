// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import RisoHeading from "./RisoHeading.svelte";

afterEach(cleanup);

describe("RisoHeading", () => {
  it("renders the correct heading level", () => {
    render(RisoHeading, {
      props: { level: 3, children: snippetOf("Test heading") },
    });
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeTruthy();
    expect(heading.textContent!.trim()).toBe("Test heading");
  });

  it("applies ink filter class for level 1-2 by default", () => {
    render(RisoHeading, {
      props: { level: 2, children: snippetOf("Display") },
    });
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.classList.contains("heading-display")).toBe(true);
    expect(heading.classList.contains("heading-compact")).toBe(false);
  });

  it("applies compact class for level 3+ by default", () => {
    render(RisoHeading, {
      props: { level: 4, children: snippetOf("Compact") },
    });
    const heading = screen.getByRole("heading", { level: 4 });
    expect(heading.classList.contains("heading-compact")).toBe(true);
    expect(heading.classList.contains("heading-display")).toBe(false);
  });

  it("respects explicit ink=true override on small headings", () => {
    render(RisoHeading, {
      props: { level: 5, ink: true, children: snippetOf("Forced ink") },
    });
    const heading = screen.getByRole("heading", { level: 5 });
    expect(heading.classList.contains("heading-display")).toBe(true);
  });

  it("respects explicit ink=false override on large headings", () => {
    render(RisoHeading, {
      props: { level: 1, ink: false, children: snippetOf("Forced compact") },
    });
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.classList.contains("heading-compact")).toBe(true);
  });
});

/**
 * Creates a minimal Svelte snippet for testing.
 * Svelte 5 snippets are functions that receive an anchor node.
 */
function snippetOf(text: string): unknown {
  return (node: HTMLElement) => {
    node.textContent = text;
  };
}
