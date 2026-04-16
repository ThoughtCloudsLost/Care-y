// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import SystemEvent from "./SystemEvent.svelte";

// IntersectionObserver stub for DecryptPlaceholder
vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: () => void;
    disconnect: () => void;
    unobserve: () => void;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

afterEach(() => {
  cleanup();
});

describe("SystemEvent", () => {
  it("renders decrypted content inside a Chip", () => {
    const { container } = render(SystemEvent, {
      props: {
        result: { status: "ready" as const, value: "Status changed to closed" },
        timestamp: "2026-04-05T12:00:00Z",
      },
    });
    expect(container.textContent).toContain("Status changed to closed");
  });

  it("renders shimmer when result is loading", () => {
    const { container } = render(SystemEvent, {
      props: {
        result: { status: "loading" as const },
        timestamp: "2026-04-05T12:00:00Z",
      },
    });
    // DecryptPlaceholder container (.dp) renders immediately; the scramble
    // (aria-busy) is delayed by 150ms, so check the container only.
    const shimmer = container.querySelector(".dp");
    expect(shimmer).not.toBeNull();
  });

  it("renders error text when result is error", () => {
    const { container } = render(SystemEvent, {
      props: {
        result: { status: "error" as const },
        timestamp: "2026-04-05T12:00:00Z",
      },
    });
    expect(container.textContent).toContain(
      "This content could not be decrypted.",
    );
  });

  it("has role='status' for screen reader announcements", () => {
    const { container } = render(SystemEvent, {
      props: {
        result: { status: "ready" as const, value: "Priority raised to high" },
        timestamp: "2026-04-05T12:00:00Z",
      },
    });
    const statusEl = container.querySelector("[role='status']");
    expect(statusEl).not.toBeNull();
  });

  it("renders a <time> element with datetime attribute", () => {
    const ts = "2026-04-05T12:00:00Z";
    const { container } = render(SystemEvent, {
      props: {
        result: { status: "ready" as const, value: "Tickets merged" },
        timestamp: ts,
      },
    });
    const timeEl = container.querySelector("time");
    expect(timeEl).not.toBeNull();
    expect(timeEl?.getAttribute("datetime")).toBe(ts);
  });

  it.each([
    "Status changed to closed",
    "Assigned to Alice",
    "Put on hold",
    "Priority raised to high",
    "Tickets merged",
  ])("renders event content '%s' without error", (eventContent) => {
    const { container } = render(SystemEvent, {
      props: {
        result: { status: "ready" as const, value: eventContent },
        timestamp: "2026-04-05T12:00:00Z",
      },
    });
    expect(container.textContent).toContain(eventContent);
  });
});
