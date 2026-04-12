// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import InlineSkeleton from "./InlineSkeleton.svelte";

afterEach(cleanup);

describe("InlineSkeleton", () => {
  it("renders a span with role=presentation", () => {
    const { container } = render(InlineSkeleton);
    const span = container.querySelector("span.isk");
    expect(span).not.toBeNull();
    expect(span?.getAttribute("role")).toBe("presentation");
  });

  it("applies default width of 6ch", () => {
    const { container } = render(InlineSkeleton);
    const span = container.querySelector<HTMLElement>("span.isk");
    expect(span?.style.width).toBe("6ch");
  });

  it("applies custom width", () => {
    const { container } = render(InlineSkeleton, {
      props: { width: "12ch" },
    });
    const span = container.querySelector<HTMLElement>("span.isk");
    expect(span?.style.width).toBe("12ch");
  });

  it("includes skeleton-bar class for theme animation inheritance", () => {
    const { container } = render(InlineSkeleton);
    const span = container.querySelector("span.isk");
    expect(span?.classList.contains("skeleton-bar")).toBe(true);
  });

  it("applies custom class", () => {
    const { container } = render(InlineSkeleton, {
      props: { class: "extra" },
    });
    const span = container.querySelector("span.isk");
    expect(span?.classList.contains("extra")).toBe(true);
  });
});
