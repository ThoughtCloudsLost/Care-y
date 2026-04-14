// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import ArticleCard from "./ArticleCard.svelte";

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

describe("ArticleCard", () => {
  const now = new Date("2026-04-13T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const ontap = vi.fn();
  const onselect = vi.fn();
  const onlongpress = vi.fn();

  const defaults = {
    articleId: "art-001",
    titleResult: { status: "ready" as const, value: "Test Article Title" },
    excerptResult: {
      status: "ready" as const,
      value: "This is the article excerpt text.",
    },
    categoryName: "Protocols",
    authorName: "Volunteer A",
    rating: 0.75,
    voteUpCount: 5,
    voteTotalCount: 7,
    createdAt: new Date("2026-04-10T08:00:00Z"),
    updatedAt: new Date("2026-04-12T10:00:00Z"),
    viewMode: "list" as const,
    ontap,
    onselect,
    onlongpress,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---

  it("renders title and category in grid mode", () => {
    const { getByText } = render(ArticleCard, {
      ...defaults,
      viewMode: "grid",
    });

    expect(getByText("Test Article Title")).toBeTruthy();
    expect(getByText("Protocols")).toBeTruthy();
  });

  it("renders title, excerpt, and category in list mode", () => {
    const { getByText } = render(ArticleCard, defaults);

    expect(getByText("Test Article Title")).toBeTruthy();
    expect(getByText("This is the article excerpt text.")).toBeTruthy();
    expect(getByText("Protocols")).toBeTruthy();
  });

  it("renders author name", () => {
    const { getByText } = render(ArticleCard, defaults);
    expect(getByText("By Volunteer A")).toBeTruthy();
  });

  it("renders vote count", () => {
    const { getByText } = render(ArticleCard, defaults);
    expect(getByText("5 of 7 found helpful")).toBeTruthy();
  });

  it("hides vote info when no votes", () => {
    const { queryByText } = render(ArticleCard, {
      ...defaults,
      voteUpCount: 0,
      voteTotalCount: 0,
    });
    expect(queryByText(/found helpful/)).toBeNull();
  });

  // --- Loading state ---

  it("renders skeleton when loading", () => {
    const { container } = render(ArticleCard, {
      ...defaults,
      loading: true,
    });

    expect(container.querySelector(".skeleton-pulse")).toBeTruthy();
    expect(container.querySelector("[aria-hidden='true']")).toBeTruthy();
  });

  // --- Interactions ---

  it("calls ontap with articleId on click", async () => {
    const { container } = render(ArticleCard, defaults);
    const inner = container.querySelector(".card-inner");
    await fireEvent.click(inner!);
    expect(ontap).toHaveBeenCalledWith("art-001");
  });

  it("calls onselect instead of ontap when multiSelectActive", async () => {
    const { container } = render(ArticleCard, {
      ...defaults,
      multiSelectActive: true,
    });
    const inner = container.querySelector(".card-inner");
    await fireEvent.click(inner!);
    expect(onselect).toHaveBeenCalledWith("art-001");
    expect(ontap).not.toHaveBeenCalled();
  });

  it("shows checkbox when multiSelectActive", () => {
    const { container } = render(ArticleCard, {
      ...defaults,
      multiSelectActive: true,
      selected: true,
    });
    expect(container.querySelector(".checkbox-wrap")).toBeTruthy();
  });

  it("hides checkbox when not in multi-select", () => {
    const { container } = render(ArticleCard, defaults);
    expect(container.querySelector(".checkbox-wrap")).toBeNull();
  });

  // --- View modes ---

  it("applies grid mode class", () => {
    const { container } = render(ArticleCard, {
      ...defaults,
      viewMode: "grid",
    });
    expect(container.querySelector(".card-inner--grid")).toBeTruthy();
    expect(container.querySelector(".card-inner--list")).toBeNull();
  });

  it("applies list mode class", () => {
    const { container } = render(ArticleCard, {
      ...defaults,
      viewMode: "list",
    });
    expect(container.querySelector(".card-inner--list")).toBeTruthy();
    expect(container.querySelector(".card-inner--grid")).toBeNull();
  });

  it("hides excerpt in grid mode", () => {
    const { queryByText } = render(ArticleCard, {
      ...defaults,
      viewMode: "grid",
    });
    expect(queryByText("This is the article excerpt text.")).toBeNull();
  });

  // --- Decrypt states ---

  it("shows placeholder when title is loading", () => {
    const { container } = render(ArticleCard, {
      ...defaults,
      titleResult: { status: "loading" as const },
    });
    // DecryptPlaceholder renders scramble spans, not the title text
    expect(container.querySelector(".title-text")).toBeNull();
  });
});
