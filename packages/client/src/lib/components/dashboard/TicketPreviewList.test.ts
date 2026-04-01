// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import TicketPreviewList from "./TicketPreviewList.svelte";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-03-31T12:00:00Z"));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function makeTicket(id: string, overrides?: Record<string, unknown>) {
  return {
    ticketId: id,
    title: `Ticket ${id}`,
    status: "open",
    priority: "normal",
    onHold: false,
    assignedTo: null,
    createdAt: new Date("2026-03-31T11:30:00Z"),
    ...overrides,
  };
}

describe("TicketPreviewList", () => {
  it("shows EmptyState when tickets array is empty", () => {
    render(TicketPreviewList, {
      props: { heading: "My Tickets", tickets: [] },
    });
    expect(screen.getByText("Nothing here right now")).toBeTruthy();
  });

  it("renders heading", () => {
    render(TicketPreviewList, {
      props: { heading: "My Tickets", tickets: [makeTicket("1")] },
    });
    expect(screen.getByText("My Tickets")).toBeTruthy();
  });

  it("renders correct number of ticket items", () => {
    const tickets = [makeTicket("1"), makeTicket("2"), makeTicket("3")];
    const { container } = render(TicketPreviewList, {
      props: { heading: "Test", tickets },
    });
    // Each TicketPreviewItem renders a ListItem which becomes an <a> or <li>
    const items = container.querySelectorAll(".status-dot");
    expect(items.length).toBe(3);
  });

  it("limits visible items to maxVisible", () => {
    const tickets = Array.from({ length: 8 }, (_, i) =>
      makeTicket(String(i + 1)),
    );
    const { container } = render(TicketPreviewList, {
      props: { heading: "Test", tickets, maxVisible: 3 },
    });
    const items = container.querySelectorAll(".status-dot");
    expect(items.length).toBe(3);
  });

  it("shows 'see all' link when items exceed maxVisible and filterParam is set", () => {
    const tickets = Array.from({ length: 8 }, (_, i) =>
      makeTicket(String(i + 1)),
    );
    render(TicketPreviewList, {
      props: {
        heading: "Test",
        tickets,
        maxVisible: 3,
        filterParam: "my-open",
      },
    });
    const link = screen.getByText("See all (8)");
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/tickets?filter=my-open");
  });

  it("does not show 'see all' link when items fit within maxVisible", () => {
    const tickets = [makeTicket("1"), makeTicket("2")];
    render(TicketPreviewList, {
      props: {
        heading: "Test",
        tickets,
        maxVisible: 5,
        filterParam: "my-open",
      },
    });
    expect(screen.queryByText(/See all/)).toBeNull();
  });

  it("does not show 'see all' link when filterParam is omitted", () => {
    const tickets = Array.from({ length: 8 }, (_, i) =>
      makeTicket(String(i + 1)),
    );
    render(TicketPreviewList, {
      props: { heading: "Test", tickets, maxVisible: 3 },
    });
    expect(screen.queryByText(/See all/)).toBeNull();
  });
});
