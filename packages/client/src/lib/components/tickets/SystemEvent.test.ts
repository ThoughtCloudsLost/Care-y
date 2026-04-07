// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import SystemEvent from "./SystemEvent.svelte";

afterEach(() => {
  cleanup();
});

describe("SystemEvent", () => {
  it("renders decrypted content inside a Chip", () => {
    const { container } = render(SystemEvent, {
      props: {
        content: "Status changed to closed",
        timestamp: "2026-04-05T12:00:00Z",
      },
    });
    expect(container.textContent).toContain("Status changed to closed");
  });

  it("renders shimmer when content is undefined (decrypt pending)", () => {
    const { container } = render(SystemEvent, {
      props: {
        content: undefined,
        timestamp: "2026-04-05T12:00:00Z",
      },
    });
    const shimmer = container.querySelector("[aria-busy='true']");
    expect(shimmer).not.toBeNull();
  });

  it("renders error text when content is DECRYPT_ERROR_SENTINEL", () => {
    const { container } = render(SystemEvent, {
      props: {
        content: "\0DECRYPT_FAILED",
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
        content: "Priority raised to high",
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
        content: "Tickets merged",
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
        content: eventContent,
        timestamp: "2026-04-05T12:00:00Z",
      },
    });
    expect(container.textContent).toContain(eventContent);
  });
});
