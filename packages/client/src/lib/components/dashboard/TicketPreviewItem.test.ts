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
    titleResult: { status: "ready" as const, value: "Test ticket title" },
    status: "open",
    priority: "normal" as const,
    onHold: false,
    assignedTo: null,
    createdAt: new Date("2026-03-31T11:30:00Z"),
    clientAlias: "Sparrow",
    queueName: "Intake",
    lastActivityAt: new Date("2026-03-31T11:45:00Z"),
    followUpCount: 3,
    ontap,
  };

  it("renders decrypted title when provided", () => {
    const { container } = render(TicketPreviewItem, { props: defaults });
    expect(container.textContent).toContain("Test ticket title");
  });

  it("shows 'Encrypted ticket' placeholder when title is loading", () => {
    const { container } = render(TicketPreviewItem, {
      props: { ...defaults, titleResult: { status: "loading" as const } },
    });
    expect(container.textContent).toContain("Encrypted ticket");
  });

  it("renders normal priority label", () => {
    const { container } = render(TicketPreviewItem, { props: defaults });
    const indicator = container.querySelector("[data-priority]");
    expect(indicator?.textContent).toContain("Normal");
  });

  it("renders priority label even when onHold is true", () => {
    const { container } = render(TicketPreviewItem, {
      props: { ...defaults, onHold: true },
    });
    const indicator = container.querySelector("[data-priority]");
    expect(indicator?.textContent).toContain("Normal");
  });

  it("renders urgent priority label", () => {
    const { container } = render(TicketPreviewItem, {
      props: { ...defaults, priority: "urgent" },
    });
    const indicator = container.querySelector("[data-priority]");
    expect(indicator?.textContent).toContain("Urgent");
  });

  it("shows client alias in subtitle", () => {
    const { container } = render(TicketPreviewItem, { props: defaults });
    expect(container.textContent).toContain("Sparrow");
  });

  it("shows queue name in subtitle", () => {
    const { container } = render(TicketPreviewItem, { props: defaults });
    expect(container.textContent).toContain("Intake");
  });

  it("shows follow-up count when > 0", () => {
    const { container } = render(TicketPreviewItem, { props: defaults });
    expect(container.textContent).toContain("3 msgs");
  });

  it("hides follow-up count when 0", () => {
    const { container } = render(TicketPreviewItem, {
      props: { ...defaults, followUpCount: 0 },
    });
    expect(container.textContent).not.toContain("msgs");
  });

  it("shows singular 'msg' for count of 1", () => {
    const { container } = render(TicketPreviewItem, {
      props: { ...defaults, followUpCount: 1 },
    });
    expect(container.textContent).toContain("1 msg");
    expect(container.textContent).not.toContain("1 msgs");
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
    titleResult: { status: "ready" as const, value: "Time test" },
    status: "open",
    priority: "normal" as const,
    onHold: false,
    assignedTo: null,
    clientAlias: "Wren",
    queueName: "Crisis",
    followUpCount: 0,
    ontap: vi.fn(),
  };

  const cases: Array<{
    label: string;
    lastActivityAt: Date;
    expected: string;
  }> = [
    {
      label: "just now (30 seconds ago)",
      lastActivityAt: new Date("2026-03-31T11:59:30Z"),
      expected: "Just now",
    },
    {
      label: "minutes ago",
      lastActivityAt: new Date("2026-03-31T11:55:00Z"),
      expected: "5m ago",
    },
    {
      label: "hours ago",
      lastActivityAt: new Date("2026-03-31T09:00:00Z"),
      expected: "3h ago",
    },
    {
      label: "days ago",
      lastActivityAt: new Date("2026-03-29T12:00:00Z"),
      expected: "2d ago",
    },
  ];

  for (const { label, lastActivityAt, expected } of cases) {
    it(`renders "${expected}" for ${label}`, () => {
      const { container } = render(TicketPreviewItem, {
        props: {
          ...base,
          createdAt: new Date("2026-03-28T12:00:00Z"),
          lastActivityAt,
        },
      });
      expect(container.textContent).toContain(expected);
    });
  }
});
