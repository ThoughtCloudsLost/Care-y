// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import type { Snippet } from "svelte";
import QueryLoader from "./QueryLoader.svelte";

afterEach(cleanup);

describe("QueryLoader", () => {
  it("renders skeleton when query is loading", () => {
    render(QueryLoader, {
      props: {
        query: {
          isLoading: true,
          isError: false,
          error: null,
          data: undefined,
        },
        children: snippetOf("Content"),
      },
    });
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.queryByText("Content")).toBeNull();
  });

  it("renders error when query has error", () => {
    render(QueryLoader, {
      props: {
        query: {
          isLoading: false,
          isError: true,
          error: new Error("UNKNOWN"),
          data: undefined,
        },
        children: snippetOf("Content"),
      },
    });
    expect(
      screen.getByText("Something went wrong. Please try again."),
    ).toBeTruthy();
    expect(screen.queryByText("Content")).toBeNull();
  });

  it("renders children with data when query succeeds", () => {
    render(QueryLoader, {
      props: {
        query: {
          isLoading: false,
          isError: false,
          error: null,
          data: "test-data",
        },
        children: snippetOf("Loaded"),
      },
    });
    expect(screen.getByText("Loaded")).toBeTruthy();
  });

  it("uses custom skeletonLines count", () => {
    const { container } = render(QueryLoader, {
      props: {
        query: {
          isLoading: true,
          isError: false,
          error: null,
          data: undefined,
        },
        skeletonLines: 5,
        children: snippetOf("Content"),
      },
    });
    const bars = container.querySelectorAll("[data-skeleton]");
    expect(bars.length).toBe(5);
  });
});

function snippetOf(text: string): Snippet<[unknown]> {
  return ((node: HTMLElement) => {
    node.textContent = text;
  }) as unknown as Snippet<[unknown]>;
}
