// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import type { Snippet } from "svelte";
import QueryLoader from "./QueryLoader.svelte";

// Konsta Button (used in EmptyState) uses Web Animations API
if (typeof Element.prototype.animate !== "function") {
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    onfinish: null,
  }) as unknown as Element["animate"];
}

afterEach(cleanup);

function snippetOf(text: string): Snippet<[unknown]> {
  return ((node: HTMLElement) => {
    node.textContent = text;
  }) as unknown as Snippet<[unknown]>;
}

function noArgSnippet(text: string): Snippet {
  return ((node: HTMLElement) => {
    node.textContent = text;
  }) as unknown as Snippet;
}

const loadingQuery = {
  isLoading: true,
  isError: false,
  error: null,
  data: undefined,
};

const errorQuery = {
  isLoading: false,
  isError: true,
  error: new Error("UNKNOWN"),
  data: undefined,
};

const successQuery = {
  isLoading: false,
  isError: false,
  error: null,
  data: "test-data",
};

describe("QueryLoader", () => {
  describe("loading state", () => {
    it("renders default skeleton when query is loading", () => {
      render(QueryLoader, {
        props: { query: loadingQuery, children: snippetOf("Content") },
      });
      expect(screen.getByRole("status")).toBeTruthy();
      expect(screen.queryByText("Content")).toBeNull();
    });

    it("renders custom loading snippet when provided", () => {
      render(QueryLoader, {
        props: {
          query: loadingQuery,
          loading: noArgSnippet("Custom Loading"),
          children: snippetOf("Content"),
        },
      });
      expect(screen.getByText("Custom Loading")).toBeTruthy();
    });

    it("uses custom skeletonLines count", () => {
      const { container } = render(QueryLoader, {
        props: {
          query: loadingQuery,
          skeletonLines: 5,
          children: snippetOf("Content"),
        },
      });
      const bars = container.querySelectorAll("[data-skeleton]");
      expect(bars.length).toBe(5);
    });
  });

  describe("error state", () => {
    it("renders QueryError when query has error", () => {
      render(QueryLoader, {
        props: { query: errorQuery, children: snippetOf("Content") },
      });
      expect(
        screen.getByText("Something went wrong. Please try again."),
      ).toBeTruthy();
      expect(screen.queryByText("Content")).toBeNull();
    });

    it("renders custom error snippet when provided", () => {
      render(QueryLoader, {
        props: {
          query: errorQuery,
          error: snippetOf("Custom Error"),
          children: snippetOf("Content"),
        },
      });
      expect(screen.getByText("Custom Error")).toBeTruthy();
    });
  });

  describe("empty state", () => {
    it("renders default EmptyState when isEmpty is true", () => {
      render(QueryLoader, {
        props: {
          query: successQuery,
          isEmpty: true,
          children: snippetOf("Content"),
        },
      });
      expect(screen.getByText("Nothing here yet.")).toBeTruthy();
      expect(screen.queryByText("Content")).toBeNull();
    });

    it("renders custom empty snippet when provided", () => {
      render(QueryLoader, {
        props: {
          query: successQuery,
          isEmpty: true,
          empty: noArgSnippet("No results found"),
          children: snippetOf("Content"),
        },
      });
      expect(screen.getByText("No results found")).toBeTruthy();
    });

    it("renders children when isEmpty is false", () => {
      render(QueryLoader, {
        props: {
          query: successQuery,
          isEmpty: false,
          children: snippetOf("Loaded"),
        },
      });
      expect(screen.getByText("Loaded")).toBeTruthy();
    });
  });

  describe("success state", () => {
    it("renders children with data when query succeeds", () => {
      render(QueryLoader, {
        props: { query: successQuery, children: snippetOf("Loaded") },
      });
      expect(screen.getByText("Loaded")).toBeTruthy();
    });
  });
});
