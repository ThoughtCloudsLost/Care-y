// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import ErrorBoundary from "./ErrorBoundary.svelte";

afterEach(cleanup);

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(ErrorBoundary, {
      props: { children: snippetOf("Safe content") },
    });
    expect(screen.getByText("Safe content")).toBeTruthy();
  });

  it("renders default fallback with generic message and retry on error", () => {
    render(ErrorBoundary, {
      props: { children: throwingSnippet("Test error") },
    });
    expect(
      screen.getByText("Something went wrong. Please try again."),
    ).toBeTruthy();
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Try again")).toBeTruthy();
  });
});

function snippetOf(text: string): unknown {
  return (node: HTMLElement) => {
    node.textContent = text;
  };
}

function throwingSnippet(message: string): unknown {
  return (_node: HTMLElement) => {
    throw new Error(message);
  };
}
