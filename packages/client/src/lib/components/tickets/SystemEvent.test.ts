// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import SystemEvent from "./SystemEvent.svelte";

afterEach(() => {
  cleanup();
});

describe("SystemEvent", () => {
  it("renders type-based label for assignment_change", () => {
    const { container } = render(SystemEvent, {
      props: { type: "assignment_change", timestamp: "2026-04-05T12:00:00Z" },
    });
    expect(container.textContent).toContain("Assigned");
  });

  it("renders type-based label for status_change", () => {
    const { container } = render(SystemEvent, {
      props: { type: "status_change", timestamp: "2026-04-05T12:00:00Z" },
    });
    expect(container.textContent).toContain("Status changed");
  });

  it("renders type-based label for hold_change", () => {
    const { container } = render(SystemEvent, {
      props: { type: "hold_change", timestamp: "2026-04-05T12:00:00Z" },
    });
    expect(container.textContent).toContain("Hold changed");
  });

  it("renders type-based label for priority_change", () => {
    const { container } = render(SystemEvent, {
      props: { type: "priority_change", timestamp: "2026-04-05T12:00:00Z" },
    });
    expect(container.textContent).toContain("Priority changed");
  });

  it("renders type-based label for merge_note", () => {
    const { container } = render(SystemEvent, {
      props: { type: "merge_note", timestamp: "2026-04-05T12:00:00Z" },
    });
    expect(container.textContent).toContain("Tickets merged");
  });

  it("renders fallback label for unknown type", () => {
    const { container } = render(SystemEvent, {
      props: { type: "some_future_type", timestamp: "2026-04-05T12:00:00Z" },
    });
    expect(container.textContent).toContain("Event");
  });

  it("has role='status' for screen reader announcements", () => {
    const { container } = render(SystemEvent, {
      props: { type: "assignment_change", timestamp: "2026-04-05T12:00:00Z" },
    });
    const statusEl = container.querySelector("[role='status']");
    expect(statusEl).not.toBeNull();
  });

  it("renders a <time> element with datetime attribute", () => {
    const ts = "2026-04-05T12:00:00Z";
    const { container } = render(SystemEvent, {
      props: { type: "status_change", timestamp: ts },
    });
    const timeEl = container.querySelector("time");
    expect(timeEl).not.toBeNull();
    expect(timeEl?.getAttribute("datetime")).toBe(ts);
  });
});
