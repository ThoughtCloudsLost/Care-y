// @vitest-environment jsdom
/**
 * CaseHeader component tests.
 *
 * Covers the field list contents (description-first, queue meta grammar,
 * opened time), the closed stamp, the fold toggle and its session-only
 * per-ticket memory, and the loading states.
 *
 * vi.mock() is required for:
 *   - $lib/trpc/index.js: no live server
 *   - $lib/crypto/context.js: mock decrypt caches + user identity
 *   - @tanstack/svelte-query: controlled query state
 *   - $lib/terminology/with-terms.js: context-free term params
 *   - $lib/errors.js: requireRouter passthrough
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import CaseHeader from "./CaseHeader.svelte";
import { setCaseFolded } from "$lib/tickets/case-fold-store.svelte.js";

let ticketQueryState: Record<string, unknown> = {};

const mocks = vi.hoisted(() => ({
  description: "Needs help with a hearing.",
}));

const queuesQueryState: Record<string, unknown> = {
  isLoading: false,
  isError: false,
  error: null,
  data: [],
};

vi.mock("@tanstack/svelte-query", () => ({
  createQuery: (optsFn: () => { queryKey: unknown[] }) => {
    const opts = optsFn();
    if (Array.isArray(opts.queryKey) && opts.queryKey[0] === "queues") {
      return queuesQueryState;
    }
    return ticketQueryState;
  },
}));

vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      get: { query: vi.fn() },
    },
  },
}));

// Decrypt mocks: title/description resolve synchronously; the org cache
// resolves queue/assignee names by key prefix.
vi.mock("$lib/crypto/context.js", () => ({
  getTicketDecryptCache: () => ({
    decryptTitle: vi.fn().mockReturnValue("Employment program referral"),
    decryptDescription: vi.fn(() => mocks.description),
  }),
  getFollowUpDecryptCache: () => ({
    decryptContent: vi.fn(),
    get: vi.fn().mockReturnValue(undefined),
  }),
  getOrgDecryptCache: () => ({
    decrypt: vi.fn((key: string) => {
      if (key.startsWith("queue:")) return "Intake";
      if (key.startsWith("assignee:")) return "Casey Okafor";
      return null;
    }),
  }),
  getOrgKeyManager: () => ({ isLoaded: true }),
  getCurrentUserId: () => () => "user-001",
}));

vi.mock("$lib/terminology/with-terms.js", () => ({
  withTerms: (o?: Record<string, string>) => ({ Queue: "Queue", ...o }),
}));

vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

// jsdom lacks IntersectionObserver (DecryptPlaceholder scramble).
if (typeof globalThis.IntersectionObserver === "undefined") {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
}

const baseTicket = {
  id: "ticket-001",
  clientAlias: "Sparrow",
  status: "open",
  priority: "normal",
  onHold: false,
  assignedTo: null as string | null,
  queueId: "queue-001",
  encryptedQueueName: { type: "Buffer", data: [1] },
  assignedDisplayName: null as unknown,
  encryptedTitle: { type: "Buffer", data: [72, 101, 108, 108, 111] },
  encryptedDescription: { type: "Buffer", data: [1, 2, 3] },
  createdAt: "2026-04-05T09:00:00Z",
  keyWrap: {
    ephemeralPoint: "ep-base64",
    nonce: "nonce-base64",
    wrappedKey: "wk-base64",
  },
};

beforeEach(() => {
  mocks.description = "Needs help with a hearing.";
  ticketQueryState = {
    isLoading: false,
    isError: false,
    error: null,
    data: baseTicket,
  };
});

afterEach(() => {
  cleanup();
  // Reset session fold memory between tests.
  setCaseFolded("ticket-001", false);
});

describe("CaseHeader", () => {
  it("renders the decrypted title in an h2", () => {
    const { container } = render(CaseHeader, {
      props: { ticketId: "ticket-001" },
    });
    const h2 = container.querySelector("h2");
    expect(h2?.textContent).toContain("Employment program referral");
  });

  it("renders the description as the first field row", () => {
    const { container } = render(CaseHeader, {
      props: { ticketId: "ticket-001" },
    });
    const firstRow = container.querySelector(".fld");
    expect(firstRow?.querySelector("dt")?.textContent).toBe("Description");
    expect(firstRow?.querySelector("dd")?.textContent).toContain(
      "Needs help with a hearing.",
    );
  });

  it("omits the description row when the description is empty", () => {
    mocks.description = "";
    const { container } = render(CaseHeader, {
      props: { ticketId: "ticket-001" },
    });
    const labels = [...container.querySelectorAll("dt")].map(
      (d) => d.textContent,
    );
    expect(labels).not.toContain("Description");
    // The other rows survive.
    expect(labels).toContain("Queue");
  });

  it("renders queue with unassigned meta when nobody is assigned", () => {
    const { container } = render(CaseHeader, {
      props: { ticketId: "ticket-001" },
    });
    const rows = [...container.querySelectorAll(".fld")];
    const queueRow = rows.find(
      (r) => r.querySelector("dt")?.textContent === "Queue",
    );
    expect(queueRow?.querySelector("dd")?.textContent).toContain("Intake");
    expect(queueRow?.querySelector("dd")?.textContent).toContain("Unassigned");
  });

  it("renders 'you' when the ticket is assigned to the current user", () => {
    ticketQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: { ...baseTicket, assignedTo: "user-001" },
    };
    const { container } = render(CaseHeader, {
      props: { ticketId: "ticket-001" },
    });
    const you = container.querySelector(".meta-you");
    expect(you?.textContent).toBe("you");
  });

  it("renders the assignee display name when assigned to someone else", () => {
    ticketQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: {
        ...baseTicket,
        assignedTo: "user-002",
        assignedDisplayName: { type: "Buffer", data: [2] },
      },
    };
    const { container } = render(CaseHeader, {
      props: { ticketId: "ticket-001" },
    });
    expect(container.textContent).toContain("Casey Okafor");
  });

  it("shows the closed stamp only for closed tickets", () => {
    const { container: openContainer } = render(CaseHeader, {
      props: { ticketId: "ticket-001" },
    });
    expect(openContainer.querySelector(".stamp-closed")).toBeNull();
    cleanup();

    ticketQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: { ...baseTicket, status: "closed" },
    };
    const { container: closedContainer } = render(CaseHeader, {
      props: { ticketId: "ticket-001" },
    });
    const stamp = closedContainer.querySelector(".stamp-closed");
    expect(stamp?.textContent).toBe("Closed");
    // The CLOSED stamp wears the shared judgment-stamp anatomy.
    expect(stamp?.classList.contains("stamp-chip")).toBe(true);
  });

  it("renders no priority stamp for normal priority", () => {
    const { container } = render(CaseHeader, {
      props: { ticketId: "ticket-001" },
    });
    expect(container.querySelector("[data-priority]")).toBeNull();
  });

  it("renders the priority stamp for urgent tickets", () => {
    ticketQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: { ...baseTicket, priority: "urgent" },
    };
    const { container } = render(CaseHeader, {
      props: { ticketId: "ticket-001" },
    });
    const stamp = container.querySelector("[data-priority='urgent']");
    expect(stamp).not.toBeNull();
  });

  it("drag handle collapses the field list and flips aria-expanded", async () => {
    const { container } = render(CaseHeader, {
      props: { ticketId: "ticket-001" },
    });
    const handle = container.querySelector(".case-handle");
    expect(handle?.getAttribute("aria-expanded")).toBe("true");
    const wrap = container.querySelector(".case-fields-wrap");
    expect(wrap?.classList.contains("case-fields-wrap--folded")).toBe(false);

    handle?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    await vi.waitFor(() => {
      expect(handle?.getAttribute("aria-expanded")).toBe("false");
      expect(wrap?.classList.contains("case-fields-wrap--folded")).toBe(true);
    });
  });

  it("remembers fold state per ticket across remounts (session map)", async () => {
    const first = render(CaseHeader, { props: { ticketId: "ticket-001" } });
    const handle = first.container.querySelector(".case-handle");
    handle?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await vi.waitFor(() => {
      expect(
        first.container
          .querySelector(".case-fields-wrap")
          ?.classList.contains("case-fields-wrap--folded"),
      ).toBe(true);
    });
    first.unmount();

    const second = render(CaseHeader, { props: { ticketId: "ticket-001" } });
    expect(
      second.container
        .querySelector(".case-fields-wrap")
        ?.classList.contains("case-fields-wrap--folded"),
    ).toBe(true);
    expect(
      second.container
        .querySelector(".case-handle")
        ?.getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("shows skeleton field values while the ticket query loads", () => {
    ticketQueryState = {
      isLoading: true,
      isError: false,
      error: null,
      data: undefined,
    };
    const { container } = render(CaseHeader, {
      props: { ticketId: "ticket-001" },
    });
    expect(container.querySelectorAll(".fld").length).toBeGreaterThan(0);
    expect(container.querySelector(".skeleton-bar, .dp")).not.toBeNull();
  });

  it("renders nothing when the ticket query errors", () => {
    ticketQueryState = {
      isLoading: false,
      isError: true,
      error: new Error("boom"),
      data: undefined,
    };
    const { container } = render(CaseHeader, {
      props: { ticketId: "ticket-001" },
    });
    expect(container.querySelector(".case-header")).toBeNull();
  });

  it("tap on handle expands when already folded", async () => {
    setCaseFolded("ticket-001", true);
    const { container } = render(CaseHeader, {
      props: { ticketId: "ticket-001" },
    });
    const handle = container.querySelector(".case-handle");
    expect(handle?.getAttribute("aria-expanded")).toBe("false");

    handle?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    await vi.waitFor(() => {
      expect(handle?.getAttribute("aria-expanded")).toBe("true");
      expect(
        container
          .querySelector(".case-fields-wrap")
          ?.classList.contains("case-fields-wrap--folded"),
      ).toBe(false);
    });
  });

  it("does not render handle when alwaysExpanded is true", () => {
    const { container } = render(CaseHeader, {
      props: { ticketId: "ticket-001", alwaysExpanded: true },
    });
    expect(container.querySelector(".case-handle")).toBeNull();
  });

  describe("drag gesture", () => {
    function createTouch(clientY: number): Touch {
      return {
        clientY,
        clientX: 0,
        identifier: 0,
        target: document.body,
        pageX: 0,
        pageY: clientY,
        screenX: 0,
        screenY: clientY,
        radiusX: 0,
        radiusY: 0,
        rotationAngle: 0,
        force: 0,
      } as Touch;
    }

    function fireTouchEvent(el: Element, type: string, clientY: number): void {
      const touch = createTouch(clientY);
      el.dispatchEvent(
        new TouchEvent(type, {
          touches: type === "touchend" ? [] : [touch],
          changedTouches: [touch],
          bubbles: true,
          cancelable: true,
        }),
      );
    }

    // useFoldDrag requires wrapEl with scrollHeight and firstElementChild,
    // which jsdom doesn't provide in component render context. The drag
    // utility is tested directly in use-fold-drag.test.ts.
    it.skip("committed drag up when expanded toggles fold and suppresses click", async () => {
      const { container } = render(CaseHeader, {
        props: { ticketId: "ticket-001" },
      });
      const handle = container.querySelector(".case-handle")!;
      expect(handle.getAttribute("aria-expanded")).toBe("true");

      fireTouchEvent(handle, "touchstart", 200);
      fireTouchEvent(handle, "touchmove", 100);
      fireTouchEvent(handle, "touchend", 100);

      await vi.waitFor(() => {
        expect(handle.getAttribute("aria-expanded")).toBe("false");
      });

      handle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      expect(handle.getAttribute("aria-expanded")).toBe("false");
    });

    it("sub-commit-delta drag does not suppress click", async () => {
      const { container } = render(CaseHeader, {
        props: { ticketId: "ticket-001" },
      });
      const handle = container.querySelector(".case-handle")!;
      expect(handle.getAttribute("aria-expanded")).toBe("true");

      // 1px movement is below the 3px commit delta.
      fireTouchEvent(handle, "touchstart", 100);
      fireTouchEvent(handle, "touchmove", 101);
      fireTouchEvent(handle, "touchend", 101);

      // Click still works as a tap toggle.
      handle.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      await vi.waitFor(() => {
        expect(handle.getAttribute("aria-expanded")).toBe("false");
      });
    });

    it("drag in wrong direction when expanded does not toggle", () => {
      const { container } = render(CaseHeader, {
        props: { ticketId: "ticket-001" },
      });
      const handle = container.querySelector(".case-handle")!;
      expect(handle.getAttribute("aria-expanded")).toBe("true");

      // Drag DOWN when expanded (wrong direction; fold requires UP).
      fireTouchEvent(handle, "touchstart", 100);
      fireTouchEvent(handle, "touchmove", 200);
      fireTouchEvent(handle, "touchend", 200);

      expect(handle.getAttribute("aria-expanded")).toBe("true");
    });
  });
});
