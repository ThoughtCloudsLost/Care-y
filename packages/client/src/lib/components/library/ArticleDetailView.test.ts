// @vitest-environment jsdom
/**
 * ArticleDetailView query error states and author line.
 *
 * vi.mock() is required for:
 *   - @tanstack/svelte-query: controlled query state
 *   - $lib/trpc/index.js: no live server
 *   - $lib/crypto/context.js: decrypt cache and key manager stubs
 *   - $lib/errors.js: requireRouter passthrough
 *   - $lib/shell/context.js: navbar override container
 *   - $lib/terminology/with-terms.js: no terminology context
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import type * as ErrorsModule from "$lib/errors.js";
import type * as CryptoContextModule from "$lib/crypto/context.js";
import type * as SvelteQueryModule from "@tanstack/svelte-query";
import type * as TrpcModule from "$lib/trpc/index.js";
import type * as ShellContextModule from "$lib/shell/context.js";
import type * as WithTermsNS from "$lib/terminology/with-terms.js";
import { getMockPermissions } from "$mocks/permissions.js";

let articleQueryState: Record<string, unknown> = {};
let authorsQueryState: Record<string, unknown> = {};
let lastAuthorsEnabled: unknown;
let cachedNames = new Map<string, string>();
let failedIds = new Set<string>();
let decryptResults = new Map<string, string>();
const decryptSpy = vi.fn((id: string, data: string | null): string | null =>
  data === null ? null : (decryptResults.get(id) ?? null),
);

vi.mock("@tanstack/svelte-query", async (importOriginal) => {
  return {
    ...(await importOriginal<typeof SvelteQueryModule>()),
    createQuery: (optsFn: () => Record<string, unknown>) => {
      const opts = optsFn();
      const key = (opts.queryKey as string[] | undefined) ?? [];
      if (key[1] === "item") return articleQueryState;
      if (key[1] === "categories") {
        return { isLoading: false, isError: false, error: null, data: [] };
      }
      if (key[1] === "vote") {
        return { isLoading: false, isError: false, error: null, data: null };
      }
      if (key[1] === "authors") {
        lastAuthorsEnabled = opts.enabled;
        return authorsQueryState;
      }
      return { isLoading: false, isError: false, error: null, data: undefined };
    },
    createMutation: () => ({ mutate: vi.fn(), isPending: false }),
    useQueryClient: () => ({
      getQueriesData: () => [],
      getQueryData: vi.fn(),
      setQueryData: vi.fn(),
      cancelQueries: vi.fn(),
      invalidateQueries: vi.fn(),
    }),
  };
});

vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcModule>()),
  trpc: {
    kb: {
      getItem: { query: vi.fn() },
      listCategories: { query: vi.fn() },
      listAuthors: { query: vi.fn() },
      listAttachments: { query: vi.fn() },
      getUserVote: { query: vi.fn() },
      castVote: { mutate: vi.fn() },
      removeVote: { mutate: vi.fn() },
    },
  },
}));

vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContextModule>()),
  getOrgDecryptCache: () => ({
    decrypt: decryptSpy,
    get: (id: string) => cachedNames.get(id),
    has: (id: string) => cachedNames.has(id) || failedIds.has(id),
    isFailed: (id: string) => failedIds.has(id),
  }),
  getOrgKeyManager: () => ({ isLoaded: false, decrypt: vi.fn() }),
  getCurrentPermissions: () => getMockPermissions,
}));

vi.mock("$lib/errors.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ErrorsModule>()),
  requireRouter: <T>(r: T) => r,
}));

vi.mock("$lib/shell/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof ShellContextModule>()),
  getNavbarOverrideCtx: () => ({ current: undefined }),
}));

vi.mock("$lib/terminology/with-terms.js", async (importOriginal) =>
  (await import("$mocks/with-terms.js")).withTermsMock(
    await importOriginal<typeof WithTermsNS>(),
  ),
);

// jsdom lacks Web Animations API (used by Konsta transitions).
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

// jsdom lacks IntersectionObserver.
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

const baseArticle = {
  id: "article-001",
  categoryId: "cat-001",
  encryptedTitle: "enc-title",
  encryptedBody: "enc-body",
  createdBy: "user-001",
  voteUpCount: 0,
  voteDownCount: 0,
  rating: 0,
  attachmentCount: 0,
  createdAt: "2026-04-05T09:00:00Z",
  updatedAt: "2026-04-05T09:00:00Z",
};

beforeEach(() => {
  articleQueryState = {
    isLoading: false,
    isError: false,
    error: null,
    data: baseArticle,
    refetch: vi.fn().mockResolvedValue(undefined),
  };
  authorsQueryState = {
    isLoading: true,
    isError: false,
    error: null,
    data: undefined,
  };
  lastAuthorsEnabled = undefined;
  cachedNames = new Map();
  failedIds = new Set();
  decryptResults = new Map();
  decryptSpy.mockClear();
});

afterEach(cleanup);

const ArticleDetailView = (await import("./ArticleDetailView.svelte")).default;

function renderView(onback = vi.fn()) {
  return {
    onback,
    ...render(ArticleDetailView, {
      props: { articleId: "article-001", onback, onedit: vi.fn() },
    }),
  };
}

describe("ArticleDetailView query errors", () => {
  it("shows the not-found message and a way back when the article is gone", async () => {
    articleQueryState = {
      ...articleQueryState,
      isError: true,
      error: new Error("KB_ARTICLE_NOT_FOUND"),
      data: undefined,
    };
    const { onback, container } = renderView();

    expect(screen.getByText("Article not found.")).toBeTruthy();
    expect(screen.queryByText("Try again")).toBeNull();
    expect(screen.queryByText("This article could not be loaded.")).toBeNull();
    expect(container.querySelector(".article-detail")).toBeNull();

    await fireEvent.click(screen.getByRole("button", { name: /^Back to/ }));
    expect(onback).toHaveBeenCalledOnce();
  });

  it("shows the load-failed message and retries on any other failure", async () => {
    articleQueryState = {
      ...articleQueryState,
      isError: true,
      error: new Error("Network failure"),
      data: undefined,
    };
    renderView();

    expect(screen.getByText("This article could not be loaded.")).toBeTruthy();
    expect(
      screen.queryByText("Something went wrong. Please try again."),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: /^Back to/ })).toBeNull();

    await fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      articleQueryState.refetch as ReturnType<typeof vi.fn>,
    ).toHaveBeenCalledOnce();
  });

  it("shows the error over cached article data when a refetch fails", () => {
    articleQueryState = {
      ...articleQueryState,
      isError: true,
      error: new Error("Network failure"),
      data: baseArticle,
    };
    const { container } = renderView();

    expect(screen.getByText("This article could not be loaded.")).toBeTruthy();
    expect(container.querySelector(".article-detail")).toBeNull();
  });

  it("keeps the article layout while the article is loading", () => {
    articleQueryState = {
      ...articleQueryState,
      isLoading: true,
      isError: false,
      error: null,
      data: undefined,
    };
    const { container } = renderView();

    expect(container.querySelector(".article-detail")).not.toBeNull();
    expect(screen.queryByText("This article could not be loaded.")).toBeNull();
    expect(screen.queryByText("Article not found.")).toBeNull();
  });
});

describe("ArticleDetailView author line", () => {
  it("shows the cached author name without asking for the author list", () => {
    cachedNames.set("volunteer:user-001", "Ada");
    renderView();

    expect(screen.getByText("By Ada")).toBeTruthy();
    expect(lastAuthorsEnabled).toBe(false);
  });

  it("fills the name from the author list when it is not cached", () => {
    authorsQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: [{ id: "user-001", encryptedDisplayName: "enc-name" }],
    };
    decryptResults.set("volunteer:user-001", "Ada");
    renderView();

    expect(lastAuthorsEnabled).toBe(true);
    expect(decryptSpy).toHaveBeenCalledWith("volunteer:user-001", "enc-name", {
      table: "users",
      id: "user-001",
    });
    expect(screen.getByText("By Ada")).toBeTruthy();
  });

  it("shows a skeleton while the author list is loading", () => {
    const { container } = renderView();

    expect(
      container.querySelector(".article-meta [data-skeleton]"),
    ).not.toBeNull();
    expect(screen.queryByText("Author unknown")).toBeNull();
  });

  it("says the author is unknown when the author is not in the list", () => {
    authorsQueryState = {
      isLoading: false,
      isError: false,
      error: null,
      data: [{ id: "user-999", encryptedDisplayName: "enc-other" }],
    };
    renderView();

    expect(screen.getByText("Author unknown")).toBeTruthy();
  });

  it("says the author is unknown when the author list fails to load", () => {
    authorsQueryState = {
      isLoading: false,
      isError: true,
      error: new Error("Network failure"),
      data: undefined,
    };
    renderView();

    expect(screen.getByText("Author unknown")).toBeTruthy();
  });

  it("shows the decrypt error when the author name cannot be unlocked", () => {
    failedIds.add("volunteer:user-001");
    const { container } = renderView();

    expect(
      container.querySelector(".article-meta .decrypt-error")?.textContent,
    ).toBe("Could not unlock this content.");
    expect(screen.queryByText("Author unknown")).toBeNull();
  });
});
