// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import LoadMore from "./LoadMore.svelte";

afterEach(cleanup);

describe("LoadMore", () => {
  it("renders nothing when hasMore is false", () => {
    const { container } = render(LoadMore, {
      props: { hasMore: false, loading: false, onloadmore: vi.fn() },
    });
    expect(container.querySelector(".load-more-container")).toBeNull();
  });

  it("renders button when hasMore is true", () => {
    render(LoadMore, {
      props: { hasMore: true, loading: false, onloadmore: vi.fn() },
    });
    const button = screen.getByRole("button");
    expect(button).toBeTruthy();
    expect(button.getAttribute("disabled")).toBeNull();
  });

  it("button is disabled when loading is true", () => {
    render(LoadMore, {
      props: { hasMore: true, loading: true, onloadmore: vi.fn() },
    });
    const button = screen.getByRole("button");
    expect(button.hasAttribute("disabled")).toBe(true);
  });
});
