// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import ArticleTable from "./ArticleTable.svelte";

// IntersectionObserver stub for DecryptPlaceholder
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

describe("ArticleTable", () => {
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
  const onlongpress = vi.fn();

  const row1 = {
    id: "art-001",
    titleResult: { status: "ready" as const, value: "First Article" },
    categoryName: "Protocols",
    authorName: "Volunteer A",
    voteUpCount: 5,
    voteTotalCount: 7,
    updatedAt: new Date("2026-04-12T10:00:00Z"),
  };

  const row2 = {
    id: "art-002",
    titleResult: { status: "ready" as const, value: "Second Article" },
    categoryName: "Safety",
    authorName: "Volunteer B",
    voteUpCount: 0,
    voteTotalCount: 0,
    updatedAt: new Date("2026-04-11T08:00:00Z"),
  };

  const defaults = {
    rows: [row1, row2],
    sortField: "created_at" as const,
    sortDirection: "desc" as const,
    onsortchange,
    ontap,
    onselect,
    onlongpress,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---

  it("renders table with headers and rows", () => {
    const { getByText, container } = render(ArticleTable, defaults);

    expect(container.querySelector("table")).toBeTruthy();
    expect(container.querySelector("thead")).toBeTruthy();
    expect(getByText("First Article")).toBeTruthy();
    expect(getByText("Second Article")).toBeTruthy();
    expect(getByText("Protocols")).toBeTruthy();
    expect(getByText("Safety")).toBeTruthy();
  });

  it("renders author names in rows", () => {
    const { getByText } = render(ArticleTable, defaults);

    expect(getByText("Volunteer A")).toBeTruthy();
    expect(getByText("Volunteer B")).toBeTruthy();
  });

  it("renders compact vote count for rows with votes", () => {
    const { getByText } = render(ArticleTable, defaults);
    expect(getByText("5/7")).toBeTruthy();
  });

  it("hides vote cell for rows with no votes", () => {
    const { container } = render(ArticleTable, {
      ...defaults,
      rows: [row2],
    });
    const voteCells = container.querySelectorAll(".col-votes");
    const dataCell = voteCells[voteCells.length - 1];
    expect(dataCell?.querySelector(".vote-cell")).toBeNull();
  });

  // --- Infinite scroll ---

  it("renders sentinel when onloadmore is provided", () => {
    const { container } = render(ArticleTable, {
      ...defaults,
      onloadmore: vi.fn(),
    });
    expect(container.querySelector(".load-sentinel")).toBeTruthy();
  });

  it("hides sentinel when onloadmore is undefined", () => {
    const { container } = render(ArticleTable, defaults);
    expect(container.querySelector(".load-sentinel")).toBeNull();
  });

  // --- Sort direction toggle for all sortable columns ---

  it("toggles rating sort from desc to asc", async () => {
    const { container } = render(ArticleTable, {
      ...defaults,
      sortField: "rating" as const,
      sortDirection: "desc" as const,
    });
    const sortButtons = container.querySelectorAll(".sort-header");
    await fireEvent.click(sortButtons[0]!);
    expect(onsortchange).toHaveBeenCalledWith("rating", "asc");
  });

  it("toggles updated_at sort from asc to desc", async () => {
    const { container } = render(ArticleTable, {
      ...defaults,
      sortField: "updated_at" as const,
      sortDirection: "asc" as const,
    });
    const sortButtons = container.querySelectorAll(".sort-header");
    await fireEvent.click(sortButtons[1]!);
    expect(onsortchange).toHaveBeenCalledWith("updated_at", "desc");
  });

  // --- Loading state ---

  it("renders skeleton rows when loading", () => {
    const { container } = render(ArticleTable, {
      ...defaults,
      rows: [],
      loading: true,
    });

    const skeletonRows = container.querySelectorAll("tr.skeleton-pulse");
    expect(skeletonRows.length).toBe(4);
  });

  // --- Sort headers ---

  it("calls onsortchange with rating when votes header clicked", async () => {
    const { container } = render(ArticleTable, defaults);

    const sortButtons = container.querySelectorAll(".sort-header");
    await fireEvent.click(sortButtons[0]!);

    expect(onsortchange).toHaveBeenCalledWith("rating", "desc");
  });

  it("calls onsortchange with updated_at when updated header clicked", async () => {
    const { container } = render(ArticleTable, defaults);

    const sortButtons = container.querySelectorAll(".sort-header");
    await fireEvent.click(sortButtons[1]!);

    expect(onsortchange).toHaveBeenCalledWith("updated_at", "desc");
  });

  it("toggles direction when active sort header clicked again", async () => {
    const { container } = render(ArticleTable, {
      ...defaults,
      sortField: "updated_at" as const,
      sortDirection: "desc" as const,
    });

    const sortButtons = container.querySelectorAll(".sort-header");
    await fireEvent.click(sortButtons[1]!);

    expect(onsortchange).toHaveBeenCalledWith("updated_at", "asc");
  });

  it("shows sort indicator on active sort column", () => {
    const { container } = render(ArticleTable, {
      ...defaults,
      sortField: "updated_at" as const,
      sortDirection: "desc" as const,
    });

    const activeSortHeader = container.querySelector(".sort-active");
    expect(activeSortHeader).toBeTruthy();
    expect(activeSortHeader?.textContent).toContain("Updated");
  });

  // --- Header semantics ---

  it("renders a plain table without the grid role", () => {
    const { container } = render(ArticleTable, defaults);
    expect(container.querySelector("table")?.getAttribute("role")).toBeNull();
  });

  it("sets aria-sort on the active column, none on inactive sortable, absent on plain headers", () => {
    const { container } = render(ArticleTable, {
      ...defaults,
      sortField: "updated_at" as const,
      sortDirection: "desc" as const,
    });

    const updated = container.querySelector("th.col-updated");
    expect(updated?.getAttribute("aria-sort")).toBe("descending");

    const votes = container.querySelector("th.col-votes");
    expect(votes?.getAttribute("aria-sort")).toBe("none");

    const title = container.querySelector("th.col-title");
    expect(title?.getAttribute("aria-sort")).toBeNull();
  });

  it("reports ascending aria-sort and a state-suffixed button label", () => {
    const { container } = render(ArticleTable, {
      ...defaults,
      sortField: "rating" as const,
      sortDirection: "asc" as const,
    });

    const votes = container.querySelector("th.col-votes");
    expect(votes?.getAttribute("aria-sort")).toBe("ascending");
    expect(
      votes?.querySelector(".sort-header")?.getAttribute("aria-label"),
    ).toBe("Votes, ascending");
  });

  // --- Row interactions ---

  it("calls ontap with articleId on row click", async () => {
    const { container } = render(ArticleTable, defaults);

    const rows = container.querySelectorAll(".table-row");
    await fireEvent.click(rows[0]!);

    expect(ontap).toHaveBeenCalledWith("art-001");
  });

  it("calls onselect instead of ontap when multiSelectActive", async () => {
    const { container } = render(ArticleTable, {
      ...defaults,
      multiSelectActive: true,
      selectedIds: new Set<string>(),
    });

    const rows = container.querySelectorAll(".table-row");
    await fireEvent.click(rows[0]!);

    expect(onselect).toHaveBeenCalledWith("art-001");
    expect(ontap).not.toHaveBeenCalled();
  });

  // --- Selection state ---

  it("applies selected class to selected rows", () => {
    const { container } = render(ArticleTable, {
      ...defaults,
      multiSelectActive: true,
      selectedIds: new Set(["art-001"]),
    });

    const rows = container.querySelectorAll(".table-row");
    expect(rows[0]?.classList.contains("row-selected")).toBe(true);
    expect(rows[1]?.classList.contains("row-selected")).toBe(false);
  });

  // --- Active highlight ---

  it("applies the current-row class to the active article row", () => {
    const { container } = render(ArticleTable, {
      ...defaults,
      activeId: "art-002",
    });

    const rows = container.querySelectorAll(".table-row");
    expect(rows[0]?.classList.contains("row-current")).toBe(false);
    expect(rows[1]?.classList.contains("row-current")).toBe(true);
  });

  // --- Decrypt states ---

  it("handles loading title gracefully", () => {
    const { container } = render(ArticleTable, {
      ...defaults,
      rows: [{ ...row1, titleResult: { status: "loading" as const } }],
    });

    const rows = container.querySelectorAll(".table-row");
    expect(rows.length).toBe(1);
  });
});
