// @vitest-environment jsdom
/**
 * MentionAutocomplete component tests.
 *
 * Verifies dropdown visibility based on @-query in draft text,
 * prefix filtering of volunteer display names, and onselect callback.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import MentionAutocomplete from "./MentionAutocomplete.svelte";

// --- Mock i18n ---
vi.mock("$lib/paraglide/messages.js", () => ({
  ticket_mention_volunteers: () => "Mention a volunteer",
}));

// --- Mock crypto context ---
vi.mock("$lib/crypto/context.js", () => ({
  getOrgDecryptCache: () => ({
    decrypt: vi.fn((_id: string, _data: unknown) => {
      // Return display names based on the cache key pattern
      if (_id === "volunteer:vol-1") return "Alice";
      if (_id === "volunteer:vol-2") return "Bob";
      if (_id === "volunteer:vol-3") return "Alicia";
      return null;
    }),
  }),
}));

// --- Mock TanStack Query ---
vi.mock("@tanstack/svelte-query", () => ({
  createQuery: () => ({
    isLoading: false,
    isError: false,
    data: [
      { id: "vol-1", encryptedDisplayName: { type: "Buffer", data: [1] } },
      { id: "vol-2", encryptedDisplayName: { type: "Buffer", data: [2] } },
      { id: "vol-3", encryptedDisplayName: { type: "Buffer", data: [3] } },
    ],
  }),
}));

// --- Mock tRPC ---
vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      listVolunteers: {
        query: vi.fn().mockResolvedValue([]),
      },
    },
  },
}));

// --- Mock errors ---
vi.mock("$lib/errors.js", () => ({
  RouterNotAvailableError: class extends Error {},
  requireRouter: <T>(r: T) => r,
}));

afterEach(() => {
  cleanup();
});

describe("MentionAutocomplete", () => {
  const baseProps = {
    draftText: "",
    cursorPosition: 0,
    onselect: vi.fn(),
  };

  it("does not render when draft has no @-query", () => {
    const { container } = render(MentionAutocomplete, {
      props: { ...baseProps, draftText: "hello world", cursorPosition: 11 },
    });
    expect(container.querySelector("[role='listbox']")).toBeNull();
  });

  it("renders dropdown when draft contains @ at cursor", () => {
    const { container } = render(MentionAutocomplete, {
      props: { ...baseProps, draftText: "@", cursorPosition: 1 },
    });
    const listbox = container.querySelector("[role='listbox']");
    expect(listbox).not.toBeNull();
    // All three volunteers should appear (empty query = show all up to 5)
    expect(container.textContent).toContain("Alice");
    expect(container.textContent).toContain("Bob");
    expect(container.textContent).toContain("Alicia");
  });

  it("filters volunteers by prefix (case-insensitive)", () => {
    const { container } = render(MentionAutocomplete, {
      props: { ...baseProps, draftText: "@al", cursorPosition: 3 },
    });
    expect(container.textContent).toContain("Alice");
    expect(container.textContent).toContain("Alicia");
    expect(container.textContent).not.toContain("Bob");
  });

  it("does not render when no volunteers match the prefix", () => {
    const { container } = render(MentionAutocomplete, {
      props: { ...baseProps, draftText: "@zzz", cursorPosition: 4 },
    });
    expect(container.querySelector("[role='listbox']")).toBeNull();
  });

  it("detects @-query after whitespace", () => {
    const { container } = render(MentionAutocomplete, {
      props: {
        ...baseProps,
        draftText: "hey @bo",
        cursorPosition: 7,
      },
    });
    expect(container.textContent).toContain("Bob");
    expect(container.textContent).not.toContain("Alice");
  });

  it("does not trigger when @ is inside a word", () => {
    const { container } = render(MentionAutocomplete, {
      props: {
        ...baseProps,
        draftText: "email@bo",
        cursorPosition: 8,
      },
    });
    // "email@bo" has @ preceded by non-whitespace, should not trigger
    expect(container.querySelector("[role='listbox']")).toBeNull();
  });

  it("has role='listbox' with aria-label", () => {
    const { container } = render(MentionAutocomplete, {
      props: { ...baseProps, draftText: "@a", cursorPosition: 2 },
    });
    const listbox = container.querySelector("[role='listbox']");
    expect(listbox).not.toBeNull();
    expect(listbox?.getAttribute("aria-label")).toBe("Mention a volunteer");
  });

  it("renders ListItem elements with role='option'", () => {
    const { container } = render(MentionAutocomplete, {
      props: { ...baseProps, draftText: "@", cursorPosition: 1 },
    });
    const options = container.querySelectorAll("[role='option']");
    expect(options.length).toBe(3);
  });
});
