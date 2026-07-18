// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import SystemEvent from "./SystemEvent.svelte";

afterEach(() => {
  cleanup();
});

describe("SystemEvent", () => {
  it("renders label for volunteer_assigned", () => {
    const { container } = render(SystemEvent, {
      props: { type: "volunteer_assigned", timestamp: "2026-04-05T12:00:00Z" },
    });
    expect(container.textContent).toContain("assigned");
  });

  it("renders label for status_closed", () => {
    const { container } = render(SystemEvent, {
      props: { type: "status_closed", timestamp: "2026-04-05T12:00:00Z" },
    });
    expect(container.textContent).toContain("Closed");
  });

  it("renders label for hold_placed", () => {
    const { container } = render(SystemEvent, {
      props: { type: "hold_placed", timestamp: "2026-04-05T12:00:00Z" },
    });
    expect(container.textContent).toContain("Placed on hold");
  });

  it("renders label for priority_changed with event_params", () => {
    const { container } = render(SystemEvent, {
      props: {
        type: "priority_changed",
        timestamp: "2026-04-05T12:00:00Z",
        eventParams: { to: "urgent" },
      },
    });
    expect(container.textContent).toContain("Priority changed to Urgent");
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
      props: {
        type: "volunteer_assigned",
        timestamp: "2026-04-05T12:00:00Z",
      },
    });
    const statusEl = container.querySelector("[role='status']");
    expect(statusEl).not.toBeNull();
  });

  it("renders a <time> element with datetime attribute", () => {
    const ts = "2026-04-05T12:00:00Z";
    const { container } = render(SystemEvent, {
      props: { type: "status_opened", timestamp: ts },
    });
    const timeEl = container.querySelector("time");
    expect(timeEl).not.toBeNull();
    expect(timeEl?.getAttribute("datetime")).toBe(ts);
  });

  it("renders label and time inline with a middot separator", () => {
    const { container } = render(SystemEvent, {
      props: { type: "status_closed", timestamp: "2026-04-05T12:00:00Z" },
    });
    const line = container.querySelector(".system-line");
    expect(line).not.toBeNull();
    expect(line?.textContent).toMatch(/Closed · \S/);
    expect(line?.querySelector("time")).not.toBeNull();
  });
});
