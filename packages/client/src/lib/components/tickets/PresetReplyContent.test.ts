// @vitest-environment jsdom
/**
 * PresetReplyContent component tests.
 *
 * Verifies rendering of preset reply list with decrypted titles and
 * subtitles. Uses a single mock state (presets loaded) since vi.mock
 * is hoisted and cannot vary per describe block.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import PresetReplyContent from "./PresetReplyContent.svelte";

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

// --- Mock i18n ---
vi.mock("$lib/paraglide/messages.js", () => ({
  ticket_preset_replies: () => "Preset replies",
  common_loading: () => "Loading",
  empty_no_data: () => "Nothing here yet.",
}));

// --- Mock crypto context ---
vi.mock("$lib/crypto/context.js", () => ({
  getOrgDecryptCache: () => ({
    decrypt: vi.fn((_id: string, _data: unknown) => {
      if (_id === "preset:p-1:title") return "Greeting";
      if (_id === "preset:p-1:body") return "Hello, how can I help you today?";
      if (_id === "preset:p-2:title") return "Follow-up";
      if (_id === "preset:p-2:body")
        return "I wanted to check in on your situation.";
      return null;
    }),
  }),
}));

// --- Mock TanStack Query (presets loaded) ---
vi.mock("@tanstack/svelte-query", () => ({
  createQuery: () => ({
    isLoading: false,
    isError: false,
    data: [
      {
        id: "p-1",
        encryptedTitle: { type: "Buffer", data: [1] },
        encryptedBody: { type: "Buffer", data: [2] },
        queueId: null,
        createdBy: "u-1",
        createdAt: "2026-04-01T00:00:00Z",
      },
      {
        id: "p-2",
        encryptedTitle: { type: "Buffer", data: [3] },
        encryptedBody: { type: "Buffer", data: [4] },
        queueId: null,
        createdBy: "u-1",
        createdAt: "2026-04-01T00:00:00Z",
      },
    ],
  }),
}));

// --- Mock tRPC ---
vi.mock("$lib/trpc/index.js", () => ({
  trpc: {
    tickets: {
      listPresets: {
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

describe("PresetReplyContent", () => {
  it("renders no heading of its own (the hosting sheet's header carries it)", () => {
    const { container } = render(PresetReplyContent, {
      props: { onselect: vi.fn() },
    });
    expect(container.textContent).not.toContain("Preset replies");
  });

  it("renders preset titles from decrypted data", () => {
    const { container } = render(PresetReplyContent, {
      props: { onselect: vi.fn() },
    });
    expect(container.textContent).toContain("Greeting");
    expect(container.textContent).toContain("Follow-up");
  });

  it("renders truncated body as subtitle", () => {
    const { container } = render(PresetReplyContent, {
      props: { onselect: vi.fn() },
    });
    expect(container.textContent).toContain("Hello, how can I help");
    expect(container.textContent).toContain("I wanted to check in");
  });

  it("renders all preset entries", () => {
    const { container } = render(PresetReplyContent, {
      props: { onselect: vi.fn() },
    });
    // Both presets from mock data should render with their titles.
    expect(container.textContent).toContain("Greeting");
    expect(container.textContent).toContain("Follow-up");
  });
});
