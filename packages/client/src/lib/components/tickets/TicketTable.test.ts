// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
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
      const { getByText } = render(TicketTable, defaults);
      expect(getByText("3")).toBeTruthy();
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
      expect(sortButtons.length).toBe(7);
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
      const skeletonRows = container.querySelectorAll(".skeleton-pulse");
      expect(skeletonRows.length).toBe(4);
    });
  });

  // --- Partial sort hint ---

  describe("partial sort hint", () => {
    it("shows partial sort text when hasMore and sortField are set", () => {
      const { getByText } = render(TicketTable, {
        ...defaults,
        sortField: "priority",
        hasMore: true,
      });
      expect(getByText(/2 loaded/)).toBeTruthy();
    });

    it("hides partial sort hint when hasMore is false", () => {
      const { queryByText } = render(TicketTable, {
        ...defaults,
        sortField: "priority",
        hasMore: false,
      });
      expect(queryByText(/loaded/)).toBeNull();
    });

    it("shows load-all button when onloadall is provided", () => {
      const onloadall = vi.fn();
      const { getByText } = render(TicketTable, {
        ...defaults,
        sortField: "client",
        hasMore: true,
        onloadall,
      });
      expect(getByText(/Load all/)).toBeTruthy();
    });

    it("calls onloadall when load-all button clicked", async () => {
      const onloadall = vi.fn();
      const { container } = render(TicketTable, {
        ...defaults,
        sortField: "client",
        hasMore: true,
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
        hasMore: true,
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
});
