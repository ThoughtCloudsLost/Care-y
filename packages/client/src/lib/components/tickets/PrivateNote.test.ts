// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import PrivateNote from "./PrivateNote.svelte";

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

afterEach(() => {
  cleanup();
});

describe("PrivateNote", () => {
  const baseProps = {
    result: {
      status: "ready" as const,
      value: "Client seems distressed about the timeline",
    },
    authorName: "Alice",
    timestamp: "2026-04-05T10:40:00Z",
    isOwn: true,
  };

  it("renders content text when decrypted", () => {
    const { container } = render(PrivateNote, { props: baseProps });
    expect(container.textContent).toContain(
      "Client seems distressed about the timeline",
    );
  });

  it("renders author name in the header", () => {
    const { container } = render(PrivateNote, { props: baseProps });
    expect(container.textContent).toContain("Alice");
  });

  it("renders the internal note visibility label", () => {
    const { container } = render(PrivateNote, { props: baseProps });
    expect(container.textContent).toContain("Only your team can see this");
  });

  it("has role='article' with aria-label containing author", () => {
    const { container } = render(PrivateNote, { props: baseProps });
    const article = container.querySelector("[role='article']");
    expect(article).not.toBeNull();
    const label = article?.getAttribute("aria-label");
    expect(label).toContain("Alice");
  });

  it("renders shimmer when result is loading", () => {
    const { container } = render(PrivateNote, {
      props: { ...baseProps, result: { status: "loading" as const } },
    });
    // DecryptPlaceholder container (.dp) renders immediately; the scramble
    // (aria-busy) is delayed by 150ms, so check the container only.
    const shimmer = container.querySelector(".dp");
    expect(shimmer).not.toBeNull();
  });

  it("renders error text for error result", () => {
    const { container } = render(PrivateNote, {
      props: { ...baseProps, result: { status: "error" as const } },
    });
    expect(container.textContent).toContain(
      "This content could not be decrypted.",
    );
  });

  it("hides author name when authorName is undefined", () => {
    const { container } = render(PrivateNote, {
      props: { ...baseProps, authorName: undefined },
    });
    const authorEl = container.querySelector("[data-author]");
    expect(authorEl).toBeNull();
  });

  it("renders a <time> element with datetime attribute", () => {
    const { container } = render(PrivateNote, { props: baseProps });
    const timeEl = container.querySelector("time");
    expect(timeEl).not.toBeNull();
    expect(timeEl?.getAttribute("datetime")).toBe("2026-04-05T10:40:00Z");
  });
});
