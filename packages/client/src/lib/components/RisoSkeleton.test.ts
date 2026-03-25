// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import RisoSkeleton from "./RisoSkeleton.svelte";

afterEach(cleanup);

describe("RisoSkeleton", () => {
  it("renders with role=status and aria-busy for screen readers", () => {
    render(RisoSkeleton);
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-busy")).toBe("true");
    expect(status.getAttribute("aria-label")).toBe("Loading");
  });

  it("renders the default 3 skeleton bars", () => {
    render(RisoSkeleton);
    const bars = screen.getByRole("status").querySelectorAll(".skeleton-bar");
    expect(bars.length).toBe(3);
  });

  it("renders custom number of lines", () => {
    render(RisoSkeleton, { props: { lines: 5 } });
    const bars = screen.getByRole("status").querySelectorAll(".skeleton-bar");
    expect(bars.length).toBe(5);
  });

  it("staggers animation delays across bars", () => {
    render(RisoSkeleton, { props: { lines: 3 } });
    const bars = screen
      .getByRole("status")
      .querySelectorAll<HTMLElement>(".skeleton-bar");
    expect(bars[0]?.style.animationDelay).toBe("0ms");
    expect(bars[1]?.style.animationDelay).toBe("80ms");
    expect(bars[2]?.style.animationDelay).toBe("160ms");
  });
});
