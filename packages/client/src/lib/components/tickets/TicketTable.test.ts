// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import { tick } from "svelte";
import TicketTable from "./TicketTable.svelte";

vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(function (this: {
    observe: () => void;
    disconnect: () => void;
    unobserve: () => void;
  }) {
    this.observe = vi.fn();
    this.disconnect = vi.fn();
    this.unobserve = vi.fn();
  }),
);

afterEach(cleanup);

describe("TicketTable", () => {
  const now = new Date("2026-04-13T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const ontap = vi.fn();
  const onsortchange = vi.fn();
  const onselect = vi.fn();

  const row1 = {
    ticketId: "t-001",
    displayStatus: "active" as const,
    priority: "high" as const,
    clientAlias: "gold-rain-90",
    titleResult: { status: "ready" as const, value: "Caller seeking help" },
    queueName: "General",
    assignedName: "Volunteer A",
    assignedIsSelf: false,
    lastActivityAt: new Date("2026-04-13T10:00:00Z"),
    createdAt: new Date("2026-04-12T08:00:00Z"),
    followUpCount: 3,
    unreadCount: 1,
  };

  const row2 = {
    ticketId: "t-002",
    displayStatus: "new" as const,
    priority: "normal" as const,
    clientAlias: "humble-opal-13",
    titleResult: { status: "ready" as const, value: "Enrollment request" },
    queueName: "Intake",
    assignedName: null,
    assignedIsSelf: false,
    lastActivityAt: null,
    createdAt: new Date("2026-04-11T14:00:00Z"),
    followUpCount: 0,
    unreadCount: 0,
  };

  const defaults = {
    rows: [row1, row2],
    sortField: null as string | null,
    sortDirection: "desc" as const,
    onsortchange,
    ontap,
    onselect,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Column rendering ---

  describe("columns", () => {
    it("renders all column headers", () => {
      const { container } = render(TicketTable, defaults);

      const headers = Array.from(container.querySelectorAll("th")).map((th) =>
        th.textContent.trim(),
      );
      expect(headers).toContain("Priority");
      expect(headers).toContain("Client");
      expect(headers).toContain("Title");
      expect(headers).toContain("Queue");
      expect(headers).toContain("Assignee");
      expect(headers).toContain("Activity");
      expect(headers).toContain("Msgs");
    });

    it("renders status dot for each row", () => {
      const { container } = render(TicketTable, defaults);
      const statusCells = container.querySelectorAll(".col-status");
      expect(statusCells.length).toBeGreaterThanOrEqual(2);
    });

    it("renders client alias in each row", () => {
      const { getByText } = render(TicketTable, defaults);
      expect(getByText("gold-rain-90")).toBeTruthy();
      expect(getByText("humble-opal-13")).toBeTruthy();
    });

    it("renders decrypted title text", () => {
      const { getByText } = render(TicketTable, defaults);
      expect(getByText("Caller seeking help")).toBeTruthy();
    });

    it("renders queue name", () => {
      const { getByText } = render(TicketTable, defaults);
      expect(getByText("General")).toBeTruthy();
      expect(getByText("Intake")).toBeTruthy();
    });

    it("renders assignee name or empty for unassigned", () => {
      const { getByText, container } = render(TicketTable, defaults);
      expect(getByText("Volunteer A")).toBeTruthy();
      const assigneeCells = container.querySelectorAll(".col-assignee");
      const lastAssignee = assigneeCells[assigneeCells.length - 1];
      expect(lastAssignee?.textContent.trim()).toBe("");
    });

    it("renders message count for rows with follow-ups", () => {
      const readRow = {
        ...row1,
        unreadCount: 0,
        followUpCount: 3,
      };
      const { container } = render(TicketTable, {
        ...defaults,
        rows: [readRow, row2],
      });
      const msgsCells = container.querySelectorAll("td.col-msgs");
      const firstMsgs = msgsCells[0];
      expect(firstMsgs?.textContent.trim()).toBe("3");
    });
  });

  // --- Sort headers ---

  describe("sorting", () => {
    it("calls onsortchange with field and desc when inactive header clicked", async () => {
      const { container } = render(TicketTable, defaults);
      const sortButtons = container.querySelectorAll(".sort-header");
      const priorityBtn = Array.from(sortButtons).find((btn) =>
        btn.textContent.includes("Priority"),
      );
      await fireEvent.click(priorityBtn!);
      expect(onsortchange).toHaveBeenCalledWith("priority", "desc");
    });

    it("toggles direction to asc when active header clicked again", async () => {
      const { container } = render(TicketTable, {
        ...defaults,
        sortField: "priority",
        sortDirection: "desc" as const,
      });
      const sortButtons = container.querySelectorAll(".sort-header");
      const priorityBtn = Array.from(sortButtons).find((btn) =>
        btn.textContent.includes("Priority"),
      );
      await fireEvent.click(priorityBtn!);
      expect(onsortchange).toHaveBeenCalledWith("priority", "asc");
    });

    it("toggles direction back to desc when asc header clicked", async () => {
      const { container } = render(TicketTable, {
        ...defaults,
        sortField: "client",
        sortDirection: "asc" as const,
      });
      const sortButtons = container.querySelectorAll(".sort-header");
      const clientBtn = Array.from(sortButtons).find((btn) =>
        btn.textContent.includes("Client"),
      );
      await fireEvent.click(clientBtn!);
      expect(onsortchange).toHaveBeenCalledWith("client", "desc");
    });

    it("highlights active sort header with sort-active class", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        sortField: "last_activity",
      });
      const activeHeader = container.querySelector(".sort-active");
      expect(activeHeader).toBeTruthy();
      expect(activeHeader?.textContent).toContain("Activity");
    });

    it("shows ascending arrow when direction is asc", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        sortField: "msgs",
        sortDirection: "asc" as const,
      });
      const activeHeader = container.querySelector(".sort-active");
      expect(activeHeader).toBeTruthy();
    });

    it("every column header except status is a sort button", () => {
      const { container } = render(TicketTable, defaults);
      const sortButtons = container.querySelectorAll(".sort-header");
      expect(sortButtons.length).toBe(8);
    });

    it("title and assignee headers are sortable", async () => {
      const { container } = render(TicketTable, defaults);
      const sortButtons = container.querySelectorAll(".sort-header");
      const titleBtn = Array.from(sortButtons).find((btn) =>
        btn.textContent.includes("Title"),
      );
      const assigneeBtn = Array.from(sortButtons).find((btn) =>
        btn.textContent.includes("Assignee"),
      );

      await fireEvent.click(titleBtn!);
      expect(onsortchange).toHaveBeenCalledWith("title", "desc");

      vi.clearAllMocks();
      await fireEvent.click(assigneeBtn!);
      expect(onsortchange).toHaveBeenCalledWith("assignee", "desc");
    });

    it("sets aria-sort on the active column and none on inactive columns", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        sortField: "priority",
        sortDirection: "asc" as const,
      });

      const priority = container.querySelector("th.col-priority");
      expect(priority?.getAttribute("aria-sort")).toBe("ascending");
      expect(
        priority?.querySelector(".sort-header")?.getAttribute("aria-label"),
      ).toBe("Priority, ascending");

      const client = container.querySelector("th.col-client");
      expect(client?.getAttribute("aria-sort")).toBe("none");
    });

    it("reports descending aria-sort when direction is desc", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        sortField: "client",
        sortDirection: "desc" as const,
      });

      const client = container.querySelector("th.col-client");
      expect(client?.getAttribute("aria-sort")).toBe("descending");
    });
  });

  // --- Row interactions ---

  describe("row interactions", () => {
    it("calls ontap with ticketId on row click", async () => {
      const { container } = render(TicketTable, defaults);
      const rows = container.querySelectorAll(".table-row");
      await fireEvent.click(rows[0]!);
      expect(ontap).toHaveBeenCalledWith("t-001");
    });

    it("calls onselect instead of ontap when multiSelectActive", async () => {
      const { container } = render(TicketTable, {
        ...defaults,
        multiSelectActive: true,
        selectedIds: new Set<string>(),
      });
      const rows = container.querySelectorAll(".table-row");
      await fireEvent.click(rows[0]!);
      expect(onselect).toHaveBeenCalledWith("t-001");
      expect(ontap).not.toHaveBeenCalled();
    });

    it("applies row-selected class to selected rows", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        multiSelectActive: true,
        selectedIds: new Set(["t-001"]),
      });
      const rows = container.querySelectorAll(".table-row");
      expect(rows[0]?.classList.contains("row-selected")).toBe(true);
      expect(rows[1]?.classList.contains("row-selected")).toBe(false);
    });

    it("labels the checkbox column with the tickets select-mode copy", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        multiSelectActive: true,
        selectedIds: new Set<string>(),
      });
      const srLabel = container.querySelector("th.col-checkbox .sr-only");
      expect(srLabel?.textContent).toBe("Select");
    });
  });

  // --- Unread styling ---

  describe("unread indicator", () => {
    it("applies row-unread class for rows with unread messages", () => {
      const { container } = render(TicketTable, defaults);
      const rows = container.querySelectorAll(".table-row");
      expect(rows[0]?.classList.contains("row-unread")).toBe(true);
      expect(rows[1]?.classList.contains("row-unread")).toBe(false);
    });

    it("renders NewPill for unread count > 0", () => {
      const { container } = render(TicketTable, defaults);
      const pills = container.querySelectorAll(".col-msgs");
      const firstRowMsgs = pills[pills.length - 2];
      expect(firstRowMsgs?.textContent.trim()).toBeTruthy();
    });
  });

  // --- Loading state ---

  describe("loading", () => {
    it("renders 4 skeleton rows when loading", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        rows: [],
        loading: true,
      });
      const skeletonRows = container.querySelectorAll("tr.skeleton-pulse");
      expect(skeletonRows.length).toBe(4);
    });
  });

  // --- Partial sort hint ---

  describe("partial sort hint", () => {
    it("shows partial sort text when partialSort is true", () => {
      const { getByText } = render(TicketTable, {
        ...defaults,
        sortField: "priority",
        partialSort: true,
      });
      expect(getByText(/2 loaded/)).toBeTruthy();
    });

    it("hides partial sort hint when partialSort is false", () => {
      const { queryByText } = render(TicketTable, {
        ...defaults,
        sortField: "priority",
        partialSort: false,
      });
      expect(queryByText(/loaded/)).toBeNull();
    });

    it("shows load-all button when onloadall is provided", () => {
      const onloadall = vi.fn();
      const { getByText } = render(TicketTable, {
        ...defaults,
        sortField: "client",
        partialSort: true,
        onloadall,
      });
      expect(getByText(/Load all/)).toBeTruthy();
    });

    it("calls onloadall when load-all button clicked", async () => {
      const onloadall = vi.fn();
      const { container } = render(TicketTable, {
        ...defaults,
        sortField: "client",
        partialSort: true,
        onloadall,
      });
      const loadBtn = container.querySelector(".load-all-btn");
      await fireEvent.click(loadBtn!);
      expect(onloadall).toHaveBeenCalledOnce();
    });

    it("hides load-all button when onloadall is undefined", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        sortField: "priority",
        partialSort: true,
      });
      expect(container.querySelector(".load-all-btn")).toBeNull();
    });
  });

  // --- Infinite scroll sentinel ---

  describe("infinite scroll", () => {
    it("renders sentinel when onloadmore is provided", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        onloadmore: vi.fn(),
      });
      expect(container.querySelector(".load-sentinel")).toBeTruthy();
    });

    it("hides sentinel when onloadmore is undefined", () => {
      const { container } = render(TicketTable, defaults);
      expect(container.querySelector(".load-sentinel")).toBeNull();
    });
  });

  // --- Priority display ---

  describe("priority display", () => {
    it("renders PriorityStamp for non-normal priorities", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        rows: [row1],
      });
      const priorityCells = container.querySelectorAll(".col-priority");
      const dataCell = priorityCells[priorityCells.length - 1];
      expect(dataCell?.children.length).toBeGreaterThan(0);
    });

    it("renders empty priority cell for normal priority", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        rows: [row2],
      });
      const priorityCells = container.querySelectorAll(".col-priority");
      const dataCell = priorityCells[priorityCells.length - 1];
      expect(dataCell?.children.length).toBe(0);
    });
  });

  // --- Windowed rendering ---

  describe("windowed rendering", () => {
    interface WindowTestRow {
      ticketId: string;
      displayStatus: "active";
      priority: "normal";
      clientAlias: string;
      titleResult: { status: "ready"; value: string };
      queueName: string;
      assignedName: null;
      assignedIsSelf: boolean;
      lastActivityAt: null;
      createdAt: Date;
      followUpCount: number;
      unreadCount: number;
    }

    function makeWindowRows(count: number): WindowTestRow[] {
      return Array.from({ length: count }, (_, i) => ({
        ticketId: `t-${String(i).padStart(3, "0")}`,
        displayStatus: "active" as const,
        priority: "normal" as const,
        clientAlias: `alias-${String(i)}`,
        titleResult: { status: "ready" as const, value: `Ticket ${String(i)}` },
        queueName: "General",
        assignedName: null,
        assignedIsSelf: false,
        lastActivityAt: null,
        createdAt: new Date("2026-04-10T08:00:00Z"),
        followUpCount: 0,
        unreadCount: 0,
      }));
    }

    // jsdom reports zero rects, so the component falls back to its estimated
    // 44px row pitch; the window math then runs off the stubbed scrollTop
    // and clientHeight (the VirtualList test recipe).
    const PITCH = 44;

    let scrollContainer: HTMLDivElement;

    beforeEach(() => {
      vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });
      vi.stubGlobal("cancelAnimationFrame", vi.fn());
      vi.stubGlobal(
        "ResizeObserver",
        vi.fn(function (this: {
          observe: () => void;
          disconnect: () => void;
          unobserve: () => void;
        }) {
          this.observe = vi.fn();
          this.disconnect = vi.fn();
          this.unobserve = vi.fn();
        }),
      );

      scrollContainer = document.createElement("div");
      Object.defineProperty(scrollContainer, "clientHeight", { value: 300 });
      Object.defineProperty(scrollContainer, "scrollTop", {
        value: 0,
        writable: true,
      });
      document.body.appendChild(scrollContainer);
    });

    afterEach(() => {
      cleanup();
      scrollContainer.remove();
    });

    function scrollTo(top: number): void {
      Object.defineProperty(scrollContainer, "scrollTop", { value: top });
      scrollContainer.dispatchEvent(new Event("scroll"));
    }

    it("renders only the rows near the viewport when past the threshold", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        rows: makeWindowRows(100),
        scrollContainer,
        virtualizeThreshold: 20,
      });

      expect(container.querySelector("#ticket-t-000")).toBeTruthy();
      expect(container.querySelector("#ticket-t-050")).toBeNull();
      expect(container.querySelector("#ticket-t-099")).toBeNull();

      const rendered = container.querySelectorAll("tr.table-row").length;
      expect(rendered).toBeGreaterThan(0);
      expect(rendered).toBeLessThan(30);

      // The gap rows carry exactly the off-window height, so the table
      // keeps its full scroll geometry.
      const gapRows = Array.from(
        container.querySelectorAll<HTMLTableRowElement>("tr.virtual-gap"),
      );
      expect(gapRows.length).toBeGreaterThan(0);
      const gapTotal = gapRows.reduce(
        (sum, tr) => sum + parseFloat(tr.style.height),
        0,
      );
      expect(gapTotal).toBe((100 - rendered) * PITCH);
    });

    it("restores off-window rows when scrolled to them", async () => {
      const { container } = render(TicketTable, {
        ...defaults,
        rows: makeWindowRows(100),
        scrollContainer,
        virtualizeThreshold: 20,
      });
      expect(container.querySelector("#ticket-t-050")).toBeNull();

      scrollTo(50 * PITCH);
      await tick();

      expect(container.querySelector("#ticket-t-050")).toBeTruthy();
      expect(container.querySelector("#ticket-t-000")).toBeNull();
    });

    it("keeps a focused row rendered when it scrolls out of the window", async () => {
      const { container } = render(TicketTable, {
        ...defaults,
        rows: makeWindowRows(100),
        scrollContainer,
        virtualizeThreshold: 20,
      });

      const firstRow = container.querySelector("#ticket-t-000");
      expect(firstRow).toBeTruthy();
      await fireEvent.focusIn(firstRow!);

      scrollTo(50 * PITCH);
      await tick();

      // The focused row survives outside the window; the window rows render
      // alongside it, so tab order never falls back to body.
      expect(container.querySelector("#ticket-t-000")).toBeTruthy();
      expect(container.querySelector("#ticket-t-050")).toBeTruthy();

      await fireEvent.focusOut(container.querySelector("#ticket-t-000")!, {
        relatedTarget: null,
      });
      expect(container.querySelector("#ticket-t-000")).toBeNull();
    });

    it("renders flat below the threshold even with a scroll container", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        rows: makeWindowRows(10),
        scrollContainer,
        virtualizeThreshold: 20,
      });

      expect(container.querySelectorAll("tr.table-row").length).toBe(10);
      expect(container.querySelector("tr.virtual-gap")).toBeNull();
      expect(
        container.querySelector("table")?.getAttribute("aria-rowcount"),
      ).toBeNull();
    });

    it("renders flat without a scroll container regardless of row count", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        rows: makeWindowRows(100),
        virtualizeThreshold: 20,
      });

      expect(container.querySelectorAll("tr.table-row").length).toBe(100);
      expect(container.querySelector("tr.virtual-gap")).toBeNull();
    });

    it("describes the full table to assistive tech while windowed", () => {
      const { container } = render(TicketTable, {
        ...defaults,
        rows: makeWindowRows(100),
        scrollContainer,
        virtualizeThreshold: 20,
      });

      expect(
        container.querySelector("table")?.getAttribute("aria-rowcount"),
      ).toBe("101");
      expect(
        container.querySelector("thead tr")?.getAttribute("aria-rowindex"),
      ).toBe("1");
      expect(
        container.querySelector("#ticket-t-000")?.getAttribute("aria-rowindex"),
      ).toBe("2");

      const flat = render(TicketTable, {
        ...defaults,
        rows: [row1, row2],
      });
      expect(
        flat.container
          .querySelector(".table-row")
          ?.getAttribute("aria-rowindex"),
      ).toBeNull();
    });
  });
});
