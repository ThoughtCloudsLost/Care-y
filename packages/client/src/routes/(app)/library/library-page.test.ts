// @vitest-environment jsdom
/**
 * Covers the library page's article count, the category filter it sends
 * and the per-category counts it hands the category management sheet.
 *
 * The page hands its subnavbar (title, stats, filters) to the shell as a
 * snippet on the navbar override context, so the stats row is read by
 * rendering that snippet through SnippetHost, with SubNavbarFilterLayout
 * stubbed down to its stats slot.
 *
 * vi.mock() is required for:
 *   - @tanstack/svelte-query: controlled infinite query and category state
 *   - $app/state: the URL that opens the category management sheet
 *   - $lib/trpc/index.js: live HTTP connection module
 *   - $lib/crypto/context.js: org decrypt cache, user and permissions
 *   - $lib/shell/context.js: createContext getters throw outside a layout
 *   - ./library-layout-ctx.js: set by the library layout
 *   - $lib/shell/SubNavbarFilterLayout.svelte: stats-only stub
 *   - $lib/shell/ShellSheet.svelte: passthrough so the open sheet renders
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import type * as ShellContextNS from "$lib/shell/context.js";
import type * as CryptoContextNS from "$lib/crypto/context.js";
import type * as TrpcNS from "$lib/trpc/index.js";
import type * as SvelteQueryNS from "@tanstack/svelte-query";
import type * as SubNavbarNS from "$lib/shell/SubNavbarFilterLayout.svelte";
import type * as LibraryLayoutCtxNS from "./library-layout-ctx.js";
import type * as AppStateNS from "$app/state";
import type * as ShellSheetNS from "$lib/shell/ShellSheet.svelte";
import { Permission } from "@care-y/shared";
import {
  getMockPermissions,
  resetPermissions,
  setPermissions,
} from "$mocks/permissions.js";
import { mockNavbarCtx } from "$mocks/shell-context.js";
import SnippetHost from "$lib/shell/test-helpers/SnippetHost.svelte";
import { kbFilterStore } from "$lib/stores/kb-filters.svelte.js";

// --- Mocks ---

/** The part of the page's infinite query options these tests call. */
interface ArticleQueryOptions {
  readonly queryFn: (ctx: {
    pageParam: string | undefined;
  }) => Promise<unknown>;
}

/** The part of the page's plain query options the mock reads. */
interface QueryOptions {
  readonly queryKey: readonly unknown[];
}

const mocks = vi.hoisted(() => ({
  infiniteQueryState: {} as Record<string, unknown>,
  infiniteQueryOpts: undefined as ArticleQueryOptions | undefined,
  listItems: vi.fn(),
  categories: [] as Record<string, unknown>[],
  pageUrl: new URL("http://localhost/library"),
}));

vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQueryNS>()),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  createInfiniteQuery: (optsFn: () => ArticleQueryOptions) => {
    mocks.infiniteQueryOpts = optsFn();
    return mocks.infiniteQueryState;
  },
  // Only the category list has data; every other query stays empty.
  createQuery: (optsFn: () => QueryOptions) => ({
    isLoading: false,
    isError: false,
    error: null,
    data: optsFn().queryKey[1] === "categories" ? mocks.categories : undefined,
  }),
}));

vi.mock("$app/state", async (importOriginal) => ({
  ...(await importOriginal<typeof AppStateNS>()),
  page: {
    get url(): URL {
      return mocks.pageUrl;
    },
  },
}));

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcNS>()),
  trpc: {
    kb: {
      listItems: { query: mocks.listItems },
      listCategories: { query: vi.fn().mockResolvedValue([]) },
      listAuthors: { query: vi.fn().mockResolvedValue([]) },
      updateItem: { mutate: vi.fn() },
      deleteItem: { mutate: vi.fn() },
    },
  },
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContextNS>()),
  getOrgDecryptCache: () => ({
    decrypt: vi.fn().mockReturnValue(null),
    isFailed: vi.fn().mockReturnValue(false),
  }),
  getOrgKeyManager: () => ({
    encryptText: vi.fn().mockResolvedValue("encrypted-text"),
    isLoaded: true,
  }),
  getCurrentUserId: () => () => "user-001",
  getCurrentPermissions: () => getMockPermissions,
}));

vi.mock(
  "$lib/shell/context.js",
  async () =>
    (
      await import("$mocks/shell-context.js")
    ).shellContextMock() satisfies typeof ShellContextNS,
);

vi.mock("./library-layout-ctx.js", async (importOriginal) => ({
  ...(await importOriginal<typeof LibraryLayoutCtxNS>()),
  getLibraryLayoutCtx: () => ({
    openArticle: vi.fn(),
    openArticleFull: vi.fn(),
    selectedArticleId: () => undefined,
  }),
}));

vi.mock(
  "$lib/shell/SubNavbarFilterLayout.svelte",
  async () =>
    ({
      default: (
        await import("$lib/shell/test-helpers/StubSubNavbarFilterLayout.svelte")
      ).default as unknown as (typeof SubNavbarNS)["default"],
    }) satisfies typeof SubNavbarNS,
);

vi.mock(
  "$lib/shell/ShellSheet.svelte",
  async () =>
    ({
      default: (
        await import("$lib/components/tickets/test-helpers/PassthroughShell.svelte")
      ).default as unknown as (typeof ShellSheetNS)["default"],
    }) satisfies typeof ShellSheetNS,
);

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

// jsdom lacks ResizeObserver and IntersectionObserver (used by VirtualList).
if (typeof globalThis.ResizeObserver === "undefined") {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
}
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

// --- Helpers ---

const CATEGORY_A = "550e8400-e29b-41d4-a716-446655440000";
const CATEGORY_B = "660e8400-e29b-41d4-a716-446655440001";

function makeArticle(id: string): Record<string, unknown> {
  const at = new Date("2026-09-01T00:00:00.000Z");
  return {
    id,
    categoryId: CATEGORY_A,
    encryptedTitle: "dGl0bGU=",
    encryptedExcerpt: null,
    createdBy: "user-002",
    voteUpCount: 0,
    voteDownCount: 0,
    rating: 0,
    createdAt: at,
    updatedAt: at,
  };
}

/** Category fields other than its id and article count. */
function makeCategory(sortOrder: number): Record<string, unknown> {
  const at = new Date("2026-09-01T00:00:00.000Z");
  return {
    encryptedName: "bmFtZQ==",
    encryptedDescription: null,
    sortOrder,
    createdAt: at,
    updatedAt: at,
  };
}

/** One loaded page of `loaded` articles out of `total` matches. */
function setLoadedPage(loaded: number, total: number): void {
  mocks.infiniteQueryState = {
    isLoading: false,
    isError: false,
    error: null,
    data: {
      pages: [
        {
          items: Array.from({ length: loaded }, (_, i) =>
            makeArticle(`article-${String(i)}`),
          ),
          nextCursor: loaded < total ? "cursor-1" : null,
          total,
        },
      ],
      pageParams: [undefined],
    },
    hasNextPage: loaded < total,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
  };
}

/** Renders the page, then the subnavbar it published to the shell. */
function renderPageStats(): HTMLElement {
  render(PageModule.default);
  const subnavbar = mockNavbarCtx.current?.subnavbar;
  if (subnavbar === undefined) {
    throw new TypeError("library page published no subnavbar");
  }
  render(SnippetHost, { props: { snippet: subnavbar } });
  return screen.getByTestId("subnavbar-stats");
}

// --- Setup ---

beforeEach(() => {
  kbFilterStore.clearAll();
  resetPermissions();
  mocks.categories = [];
  mocks.pageUrl = new URL("http://localhost/library");
  mocks.infiniteQueryOpts = undefined;
  mocks.listItems.mockReset();
  mocks.listItems.mockResolvedValue({ items: [], nextCursor: null, total: 0 });
});

afterEach(() => {
  cleanup();
  mockNavbarCtx.current = undefined;
});

const PageModule = await import("./+page.svelte");

// --- Tests ---

describe("Library page", () => {
  it("counts every matching article, not only the loaded page", () => {
    setLoadedPage(2, 37);

    const stats = renderPageStats();

    expect(stats.textContent).toContain("37 articles");
  });

  it("shows no count before the first page arrives", () => {
    mocks.infiniteQueryState = {
      isLoading: true,
      isError: false,
      error: null,
      data: undefined,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
    };

    const stats = renderPageStats();

    expect(stats.textContent.trim()).toBe("");
  });

  it("asks the server for every selected category", async () => {
    setLoadedPage(0, 0);
    kbFilterStore.toggleCategory(CATEGORY_A);
    kbFilterStore.toggleCategory(CATEGORY_B);

    render(PageModule.default);
    const opts = mocks.infiniteQueryOpts;
    if (opts === undefined) {
      throw new TypeError("library page created no article query");
    }
    await opts.queryFn({ pageParam: undefined });

    expect(mocks.listItems).toHaveBeenCalledWith(
      expect.objectContaining({ categoryIds: [CATEGORY_A, CATEGORY_B] }),
    );
  });

  it("shows each category's article count from the server", async () => {
    // Two articles loaded, both in category A, out of many more on the server.
    setLoadedPage(2, 37);
    mocks.categories = [
      { id: CATEGORY_A, ...makeCategory(1), articleCount: 30 },
      { id: CATEGORY_B, ...makeCategory(2), articleCount: 7 },
    ];
    setPermissions(Permission.MANAGE_KNOWLEDGE_BASE_CATEGORIES);
    mocks.pageUrl = new URL(
      "http://localhost/library?action=manage-categories",
    );

    render(PageModule.default);

    // The sheet opens from an effect, so wait for it rather than assume
    // the first flush rendered it.
    expect(await screen.findByText("30 articles")).toBeTruthy();
    expect(screen.getByText("7 articles")).toBeTruthy();
    expect(screen.queryByText("2 articles")).toBeNull();
  });
});
