// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import TicketPreviewItem from "./TicketPreviewItem.svelte";

afterEach(cleanup);

describe("TicketPreviewItem", () => {
  const now = new Date("2026-03-31T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const ontap = vi.fn();

  const defaults = {
    ticketId: "t-001",
    title: "Test ticket title",
    status: "open",
    priority: "normal",
    onHold: false,
    assignedTo: null,
    createdAt: new Date("2026-03-31T11:30:00Z"),
    ontap,
  };

  it("renders decrypted title when provided", () => {
    const { container } = render(TicketPreviewItem, { props: defaults });
    expect(container.textContent).toContain("Test ticket title");
  });

  it("shows 'Encrypted ticket' placeholder when title is undefined", () => {
    const { container } = render(TicketPreviewItem, {
      props: { ...defaults, title: undefined },
    });
    expect(container.textContent).toContain("Encrypted ticket");
  });

  it("renders status dot with correct data-status attribute", () => {
    const { container } = render(TicketPreviewItem, { props: defaults });
    const dot = container.querySelector(".status-dot");
    expect(dot?.getAttribute("data-status")).toBe("open");
  });

  it("renders status dot as 'hold' when onHold is true", () => {
    const { container } = render(TicketPreviewItem, {
      props: { ...defaults, onHold: true },
    });
    const dot = container.querySelector(".status-dot");
    expect(dot?.getAttribute("data-status")).toBe("hold");
  });

  it("renders data-priority attribute on status dot", () => {
    const { container } = render(TicketPreviewItem, {
      props: { ...defaults, priority: "urgent" },
    });
    const dot = container.querySelector(".status-dot");
    expect(dot?.getAttribute("data-priority")).toBe("urgent");
  });

  it("shows assignee when provided", () => {
    const { container } = render(TicketPreviewItem, {
      props: { ...defaults, assignedTo: "JN" },
    });
    expect(container.textContent).toContain("JN");
  });

  it("does not render assignee span when assignedTo is null", () => {
    const { container } = render(TicketPreviewItem, { props: defaults });
    const assignee = container.querySelector(".preview-assignee");
    expect(assignee).toBeNull();
  });

  it("shows 'On Hold' status text when onHold is true", () => {
    const { container } = render(TicketPreviewItem, {
      props: { ...defaults, onHold: true },
    });
    expect(container.textContent).toContain("On Hold");
  });

  it("shows 'Open' status text for open tickets", () => {
    const { container } = render(TicketPreviewItem, { props: defaults });
    expect(container.textContent).toContain("Open");
  });

  it("shows 'Closed' status text for closed tickets", () => {
    const { container } = render(TicketPreviewItem, {
      props: { ...defaults, status: "closed" },
    });
    expect(container.textContent).toContain("Closed");
  });

  it("fires ontap with ticketId when clicked", async () => {
    const tapHandler = vi.fn();
    const { container } = render(TicketPreviewItem, {
      props: { ...defaults, ontap: tapHandler },
    });
    const listItem = container.querySelector(".k-list-item");
    if (listItem) await fireEvent.click(listItem);
    expect(tapHandler).toHaveBeenCalledWith("t-001");
  });
});

describe("formatRelativeTime (via rendered output)", () => {
  const now = new Date("2026-03-31T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  const base = {
    ticketId: "t-time",
    title: "Time test",
    status: "open",
    priority: "normal",
    onHold: false,
    assignedTo: null,
    ontap: vi.fn(),
  };

  const cases: Array<{ label: string; createdAt: Date; expected: string }> = [
    {
      label: "just now (30 seconds ago)",
      createdAt: new Date("2026-03-31T11:59:30Z"),
      expected: "Just now",
    },
    {
      label: "minutes ago",
      createdAt: new Date("2026-03-31T11:55:00Z"),
      expected: "5m ago",
    },
    {
      label: "hours ago",
      createdAt: new Date("2026-03-31T09:00:00Z"),
      expected: "3h ago",
    },
    {
      label: "days ago",
      createdAt: new Date("2026-03-29T12:00:00Z"),
      expected: "2d ago",
    },
  ];

  for (const { label, createdAt, expected } of cases) {
    it(`renders "${expected}" for ${label}`, () => {
      const { container } = render(TicketPreviewItem, {
        props: { ...base, createdAt },
      });
      expect(container.textContent).toContain(expected);
    });
  }
});
