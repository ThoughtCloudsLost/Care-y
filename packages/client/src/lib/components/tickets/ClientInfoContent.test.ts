// @vitest-environment jsdom
/**
 * ClientInfoContent component tests.
 *
 * Verifies rendering of client alias, tier label, contact method,
 * and recent ticket history. Handles graceful degradation when
 * optional fields are undefined.
 */

import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import ClientInfoContent from "./ClientInfoContent.svelte";

// --- Mock i18n ---
import { vi } from "vitest";
vi.mock("$lib/paraglide/messages.js", () => ({
  ticket_contact_method: () => "Contact",
  ticket_recent_history: () => "Recent Tickets",
}));

afterEach(() => {
  cleanup();
});

const baseProps = {
  clientAlias: "Jane D.",
  clientTier: undefined as string | undefined,
  contactMethod: undefined as string | undefined,
  recentTickets: [] as Array<{
    id: string;
    title: string | undefined;
    status: string;
  }>,
};

describe("ClientInfoContent", () => {
  it("renders client alias", () => {
    const { container } = render(ClientInfoContent, { props: baseProps });
    expect(container.textContent).toContain("Jane D.");
  });

  it("renders tier label when provided", () => {
    const { container } = render(ClientInfoContent, {
      props: { ...baseProps, clientTier: "SMS/Email" },
    });
    expect(container.textContent).toContain("SMS/Email");
  });

  it("omits tier when undefined", () => {
    const { container } = render(ClientInfoContent, {
      props: { ...baseProps, clientTier: undefined },
    });
    // No tier paragraph rendered
    const tierEl = container.querySelector(".client-tier");
    expect(tierEl).toBeNull();
  });

  it("renders contact method when provided", () => {
    const { container } = render(ClientInfoContent, {
      props: { ...baseProps, contactMethod: "SMS" },
    });
    expect(container.textContent).toContain("Contact");
    expect(container.textContent).toContain("SMS");
  });

  it("omits contact method when undefined", () => {
    const { container } = render(ClientInfoContent, {
      props: { ...baseProps, contactMethod: undefined },
    });
    expect(container.textContent).not.toContain("Contact");
  });

  it("renders recent tickets when provided", () => {
    const { container } = render(ClientInfoContent, {
      props: {
        ...baseProps,
        recentTickets: [
          { id: "t-1", title: "Emergency Housing", status: "open" },
          { id: "t-2", title: "Benefits Question", status: "closed" },
        ],
      },
    });
    expect(container.textContent).toContain("Recent Tickets");
    expect(container.textContent).toContain("Emergency Housing");
    expect(container.textContent).toContain("Benefits Question");
    expect(container.textContent).toContain("open");
    expect(container.textContent).toContain("closed");
  });

  it("renders '...' for tickets with undefined title", () => {
    const { container } = render(ClientInfoContent, {
      props: {
        ...baseProps,
        recentTickets: [{ id: "t-1", title: undefined, status: "open" }],
      },
    });
    expect(container.textContent).toContain("...");
  });

  it("omits recent tickets section when list is empty", () => {
    const { container } = render(ClientInfoContent, {
      props: { ...baseProps, recentTickets: [] },
    });
    expect(container.textContent).not.toContain("Recent Tickets");
  });
});
