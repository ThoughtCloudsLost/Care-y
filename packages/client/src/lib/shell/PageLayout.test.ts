// @vitest-environment jsdom
/**
 * PageLayout overlay mode tests.
 *
 * Covers: overlay-mode class application, scroll-region-overlay padding
 * class, bottom-bar-overlay class, and ResizeObserver CSS variable wiring.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { tick } from "svelte";
import { render, cleanup } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import PageLayout from "./PageLayout.svelte";

// jsdom has no ResizeObserver
let latestObserverCallback: ((entries: unknown[]) => void) | undefined;

vi.stubGlobal(
  "ResizeObserver",
  vi.fn(function (
    this: {
      observe: ReturnType<typeof vi.fn>;
      disconnect: ReturnType<typeof vi.fn>;
      unobserve: ReturnType<typeof vi.fn>;
    },
    cb: (entries: unknown[]) => void,
  ) {
    latestObserverCallback = cb;
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

afterEach(() => {
  cleanup();
  latestObserverCallback = undefined;
});

const contentSnippet = createRawSnippet(() => ({
  render: () => "<div>content</div>",
}));
const barSnippet = createRawSnippet(() => ({
  render: () => "<div>bar</div>",
}));

describe("PageLayout overlay mode", () => {
  it("applies overlay-mode class when overlayBottomBar is true", async () => {
    const { container } = render(PageLayout, {
      props: {
        lockScroll: true,
        overlayBottomBar: true,
        children: contentSnippet,
        bottomBar: barSnippet,
      },
    });
    await tick();

    const layout = container.querySelector(".page-layout");
    expect(layout?.classList.contains("overlay-mode")).toBe(true);
    expect(layout?.classList.contains("lock-scroll")).toBe(true);
  });

  it("does not apply overlay-mode when overlayBottomBar is false", async () => {
    const { container } = render(PageLayout, {
      props: {
        lockScroll: true,
        children: contentSnippet,
        bottomBar: barSnippet,
      },
    });
    await tick();

    const layout = container.querySelector(".page-layout");
    expect(layout?.classList.contains("overlay-mode")).toBe(false);
  });

  it("applies scroll-region-overlay class in overlay mode", async () => {
    const { container } = render(PageLayout, {
      props: {
        lockScroll: true,
        overlayBottomBar: true,
        children: contentSnippet,
        bottomBar: barSnippet,
      },
    });
    await tick();

    const scrollRegion = container.querySelector(".scroll-region");
    expect(scrollRegion?.classList.contains("scroll-region-overlay")).toBe(
      true,
    );
  });

  it("applies bottom-bar-overlay class in overlay mode", async () => {
    const { container } = render(PageLayout, {
      props: {
        lockScroll: true,
        overlayBottomBar: true,
        children: contentSnippet,
        bottomBar: barSnippet,
      },
    });
    await tick();

    const bottomBar = container.querySelector(".bottom-bar");
    expect(bottomBar?.classList.contains("bottom-bar-overlay")).toBe(true);
  });

  it("sets --bottom-bar-h CSS variable via ResizeObserver", async () => {
    const { container } = render(PageLayout, {
      props: {
        lockScroll: true,
        overlayBottomBar: true,
        children: contentSnippet,
        bottomBar: barSnippet,
      },
    });
    await tick();

    // Simulate a ResizeObserver callback
    if (latestObserverCallback) {
      latestObserverCallback([{ borderBoxSize: [{ blockSize: 64 }] }]);
    }

    const layout = container.querySelector(".page-layout") as HTMLElement;
    expect(layout.style.getPropertyValue("--bottom-bar-h")).toBe("64px");
  });
});
