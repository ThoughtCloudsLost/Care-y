// @vitest-environment jsdom
/**
 * TicketActionsContent component tests.
 *
 * Verifies context-aware action rendering based on ticket state
 * (assigned/unassigned, hold/unhold, open/closed, watching/unwatching).
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import TicketActionsContent from "./TicketActionsContent.svelte";

// --- Mock i18n ---
vi.mock("$lib/paraglide/messages.js", () => ({
  ticket_action_take: () => "Take",
  ticket_action_release: () => "Release",
  ticket_action_assign: () => "Assign",
  ticket_action_hold: () => "Hold",
  ticket_action_unhold: () => "Unhold",
  ticket_action_close: () => "Close",
  ticket_action_reopen: () => "Reopen",
  ticket_action_watch: () => "Watch",
  ticket_action_unwatch: () => "Unwatch",
  ticket_action_client_info: () => "Client Info",
  ticket_zoom_out: () => "Zoom out",
  ticket_zoom_in: () => "Zoom in",
  ticket_action_timeline: () => "View timeline",
  ticket_action_messages: () => "View messages",
  common_cancel: () => "Cancel",
}));

afterEach(() => {
  cleanup();
});

const baseProps = {
  ticketStatus: "open",
  isOnHold: false,
  isAssignedToMe: false,
  isWatching: false,
  onaction: vi.fn(),
};

describe("TicketActionsContent", () => {
  it("shows 'Take' when not assigned to me", () => {
    const { container } = render(TicketActionsContent, {
      props: { ...baseProps, isAssignedToMe: false },
    });
    expect(container.textContent).toContain("Take");
    expect(container.textContent).not.toContain("Release");
  });

  it("shows 'Release' when assigned to me", () => {
    const { container } = render(TicketActionsContent, {
      props: { ...baseProps, isAssignedToMe: true },
    });
    expect(container.textContent).toContain("Release");
    expect(container.textContent).not.toContain("Take");
  });

  it("shows 'Hold' when not on hold", () => {
    const { container } = render(TicketActionsContent, {
      props: { ...baseProps, isOnHold: false },
    });
    expect(container.textContent).toContain("Hold");
    expect(container.textContent).not.toContain("Unhold");
  });

  it("shows 'Unhold' when on hold", () => {
    const { container } = render(TicketActionsContent, {
      props: { ...baseProps, isOnHold: true },
    });
    expect(container.textContent).toContain("Unhold");
    expect(container.textContent).not.toContain("Hold");
  });

  it("shows 'Close' when ticket is open", () => {
    const { container } = render(TicketActionsContent, {
      props: { ...baseProps, ticketStatus: "open" },
    });
    expect(container.textContent).toContain("Close");
    expect(container.textContent).not.toContain("Reopen");
  });

  it("shows 'Reopen' when ticket is closed", () => {
    const { container } = render(TicketActionsContent, {
      props: { ...baseProps, ticketStatus: "closed" },
    });
    expect(container.textContent).toContain("Reopen");
    expect(container.textContent).not.toContain("Close");
  });

  it("shows 'Watch' when not watching", () => {
    const { container } = render(TicketActionsContent, {
      props: { ...baseProps, isWatching: false },
    });
    expect(container.textContent).toContain("Watch");
    expect(container.textContent).not.toContain("Unwatch");
  });

  it("shows 'Unwatch' when watching", () => {
    const { container } = render(TicketActionsContent, {
      props: { ...baseProps, isWatching: true },
    });
    expect(container.textContent).toContain("Unwatch");
    expect(container.textContent).not.toContain("Watch");
  });

  it("always shows Assign and Client Info", () => {
    const { container } = render(TicketActionsContent, {
      props: baseProps,
    });
    expect(container.textContent).toContain("Assign");
    expect(container.textContent).toContain("Client Info");
  });

  it("always shows Cancel", () => {
    const { container } = render(TicketActionsContent, {
      props: baseProps,
    });
    expect(container.textContent).toContain("Cancel");
  });

  it("calls onaction with 'take' when Take is clicked", async () => {
    const onaction = vi.fn();
    const { container } = render(TicketActionsContent, {
      props: { ...baseProps, onaction },
    });
    // Konsta ActionsButton renders as a <button> element
    const buttons = container.querySelectorAll("button");
    const takeBtn = Array.from(buttons).find(
      (b) => b.textContent!.trim() === "Take",
    );
    expect(takeBtn).toBeDefined();
    await fireEvent.click(takeBtn!);
    expect(onaction).toHaveBeenCalledWith("take");
  });

  it("calls onaction with 'hold' when Hold is clicked", async () => {
    const onaction = vi.fn();
    const { container } = render(TicketActionsContent, {
      props: { ...baseProps, onaction },
    });
    const buttons = container.querySelectorAll("button");
    const holdBtn = Array.from(buttons).find(
      (b) => b.textContent!.trim() === "Hold",
    );
    expect(holdBtn).toBeDefined();
    await fireEvent.click(holdBtn!);
    expect(onaction).toHaveBeenCalledWith("hold");
  });

  it("calls onaction with 'cancel' when Cancel is clicked", async () => {
    const onaction = vi.fn();
    const { container } = render(TicketActionsContent, {
      props: { ...baseProps, onaction },
    });
    const buttons = container.querySelectorAll("button");
    const cancelBtn = Array.from(buttons).find(
      (b) => b.textContent!.trim() === "Cancel",
    );
    expect(cancelBtn).toBeDefined();
    await fireEvent.click(cancelBtn!);
    expect(onaction).toHaveBeenCalledWith("cancel");
  });
});
