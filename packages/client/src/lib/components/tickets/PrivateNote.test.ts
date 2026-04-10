// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import PrivateNote from "./PrivateNote.svelte";

afterEach(() => {
  cleanup();
});

describe("PrivateNote", () => {
  const baseProps = {
    content: "Client seems distressed about the timeline",
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

  it("renders the team-only label", () => {
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

  it("renders shimmer when content is undefined (pending)", () => {
    const { container } = render(PrivateNote, {
      props: { ...baseProps, content: undefined },
    });
    const shimmer = container.querySelector("[aria-busy='true']");
    expect(shimmer).not.toBeNull();
  });

  it("renders error text for DECRYPT_ERROR_SENTINEL", () => {
    const { container } = render(PrivateNote, {
      props: { ...baseProps, content: "\0DECRYPT_FAILED" },
    });
    expect(container.textContent).toContain(
      "This content could not be decrypted.",
    );
  });

  it("hides author name when authorName is undefined", () => {
    const { container } = render(PrivateNote, {
      props: { ...baseProps, authorName: undefined },
    });
    const authorEl = container.querySelector(".note-author");
    expect(authorEl).toBeNull();
  });

  it("renders a <time> element with datetime attribute", () => {
    const { container } = render(PrivateNote, { props: baseProps });
    const timeEl = container.querySelector("time");
    expect(timeEl).not.toBeNull();
    expect(timeEl?.getAttribute("datetime")).toBe("2026-04-05T10:40:00Z");
  });
});
