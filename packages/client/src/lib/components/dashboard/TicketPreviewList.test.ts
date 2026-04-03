// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import TicketPreviewList from "./TicketPreviewList.svelte";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-31T12:00:00Z"));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const ontickettap = vi.fn();

function makeTicket(id: string, overrides?: Record<string, unknown>) {
  return {
    ticketId: id,
    title: `Ticket ${id}`,
    status: "open",
    priority: "normal",
    onHold: false,
    assignedTo: null,
    createdAt: new Date("2026-03-31T11:30:00Z"),
    clientAlias: "Sparrow",
    queueName: "Intake",
    lastActivityAt: new Date("2026-03-31T11:45:00Z"),
    followUpCount: 1,
    ...overrides,
  };
}

describe("TicketPreviewList", () => {
  it("shows EmptyState when tickets array is empty", () => {
    render(TicketPreviewList, {
      props: { heading: "My Tickets", tickets: [], ontickettap },
    });
    expect(screen.getByText("Nothing here right now")).toBeTruthy();
  });

  it("renders heading", () => {
    render(TicketPreviewList, {
      props: {
        heading: "My Tickets",
        tickets: [makeTicket("1")],
        ontickettap,
      },
    });
    expect(screen.getByText("My Tickets")).toBeTruthy();
  });

  it("renders correct number of ticket items", () => {
    const tickets = [makeTicket("1"), makeTicket("2"), makeTicket("3")];
    const { container } = render(TicketPreviewList, {
      props: { heading: "Test", tickets, ontickettap },
    });
    const items = container.querySelectorAll(".priority-indicator");
    expect(items.length).toBe(3);
  });

  it("limits visible items to maxVisible", () => {
    const tickets = Array.from({ length: 8 }, (_, i) =>
      makeTicket(String(i + 1)),
    );
    const { container } = render(TicketPreviewList, {
      props: { heading: "Test", tickets, maxVisible: 3, ontickettap },
    });
    const items = container.querySelectorAll(".priority-indicator");
    expect(items.length).toBe(3);
  });

  it("shows 'see all' button when items exceed maxVisible and onseeall is set", () => {
    const onseeall = vi.fn();
    const tickets = Array.from({ length: 8 }, (_, i) =>
      makeTicket(String(i + 1)),
    );
    render(TicketPreviewList, {
      props: {
        heading: "Test",
        tickets,
        maxVisible: 3,
        onseeall,
        ontickettap,
      },
    });
    const button = screen.getByText("See all (8)");
    expect(button).toBeTruthy();
    expect(button.tagName).toBe("BUTTON");
  });

  it("fires onseeall callback when 'see all' button is clicked", async () => {
    const onseeall = vi.fn();
    const tickets = Array.from({ length: 8 }, (_, i) =>
      makeTicket(String(i + 1)),
    );
    render(TicketPreviewList, {
      props: {
        heading: "Test",
        tickets,
        maxVisible: 3,
        onseeall,
        ontickettap,
      },
    });
    await fireEvent.click(screen.getByText("See all (8)"));
    expect(onseeall).toHaveBeenCalledOnce();
  });

  it("does not show 'see all' button when items fit within maxVisible", () => {
    const tickets = [makeTicket("1"), makeTicket("2")];
    render(TicketPreviewList, {
      props: {
        heading: "Test",
        tickets,
        maxVisible: 5,
        onseeall: vi.fn(),
        ontickettap,
      },
    });
    expect(screen.queryByText(/See all/)).toBeNull();
  });

  it("does not show 'see all' button when onseeall is omitted", () => {
    const tickets = Array.from({ length: 8 }, (_, i) =>
      makeTicket(String(i + 1)),
    );
    render(TicketPreviewList, {
      props: { heading: "Test", tickets, maxVisible: 3, ontickettap },
    });
    expect(screen.queryByText(/See all/)).toBeNull();
  });
});
