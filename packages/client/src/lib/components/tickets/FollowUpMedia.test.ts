// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import type * as SvelteQuery from "@tanstack/svelte-query";
import type * as TrpcClient from "$lib/trpc/index.js";
import type * as CryptoContext from "$lib/crypto/context.js";
import { render, cleanup } from "@testing-library/svelte";
import FollowUpMedia from "./FollowUpMedia.svelte";

// Mock TanStack Query - capture the options passed to createQuery
const createQueryCalls: Array<{ queryKey: string[]; enabled: boolean }> = [];

// vi.mock required: @tanstack/svelte-query uses Svelte context
// internals that fail outside a real component tree.
vi.mock("@tanstack/svelte-query", async (importOriginal) => ({
  ...(await importOriginal<typeof SvelteQuery>()),
  createQuery: (optsFn: () => { queryKey: string[]; enabled: boolean }) => {
    const opts = optsFn();
    createQueryCalls.push({ queryKey: opts.queryKey, enabled: opts.enabled });
    return { data: undefined, isLoading: false, isError: false };
  },
}));

// vi.mock required: tRPC client module creates a live HTTP connection
// on import via httpBatchLink.
vi.mock("$lib/trpc/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof TrpcClient>()),
  trpc: {
    tickets: {
      listRecordings: { query: vi.fn() },
      listAttachments: { query: vi.fn() },
    },
  },
}));

// vi.mock required: getCryptoBridge uses Svelte 5 createContext which
// throws "missing_context" outside a component tree with CryptoProvider.
vi.mock("$lib/crypto/context.js", async (importOriginal) => ({
  ...(await importOriginal<typeof CryptoContext>()),
  getCryptoBridge: () => ({
    decryptBlob: vi.fn(),
    decryptAttachment: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  createQueryCalls.length = 0;
});

describe("FollowUpMedia", () => {
  const baseProps = {
    followupId: "fu-001",
    ticketId: "ticket-001",
    keyWrap: {
      ephemeralPoint: "ep",
      nonce: "n",
      wrappedKey: "wk",
    },
    hasRecording: false,
    hasImage: false,
    hasFile: false,
  };

  it("renders no media elements when all flags are false", () => {
    const { container } = render(FollowUpMedia, { props: baseProps });
    // No meaningful media elements rendered (only Svelte comment nodes)
    expect(container.querySelector("audio")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
  });

  // queryKey values ("recordings", "attachments") must match the keys used in
  // the detail view's recording/attachment queries so TanStack Query shares
  // cache entries across FollowUpMedia and the ticket detail panel.

  it("creates recording query only when hasRecording is true", () => {
    render(FollowUpMedia, {
      props: { ...baseProps, hasRecording: true },
    });

    const recQuery = createQueryCalls.find(
      (c) => c.queryKey.includes("recordings") && c.enabled,
    );
    const attQuery = createQueryCalls.find(
      (c) => c.queryKey.includes("attachments") && c.enabled,
    );

    expect(recQuery).toBeDefined();
    expect(attQuery).toBeUndefined();
  });

  it("creates attachment query only when hasImage or hasFile is true", () => {
    render(FollowUpMedia, {
      props: { ...baseProps, hasImage: true },
    });

    const recQuery = createQueryCalls.find(
      (c) => c.queryKey.includes("recordings") && c.enabled,
    );
    const attQuery = createQueryCalls.find(
      (c) => c.queryKey.includes("attachments") && c.enabled,
    );

    expect(recQuery).toBeUndefined();
    expect(attQuery).toBeDefined();
  });

  it("enables both queries when all flags are true", () => {
    render(FollowUpMedia, {
      props: {
        ...baseProps,
        hasRecording: true,
        hasImage: true,
        hasFile: true,
      },
    });

    const recQuery = createQueryCalls.find(
      (c) => c.queryKey.includes("recordings") && c.enabled,
    );
    const attQuery = createQueryCalls.find(
      (c) => c.queryKey.includes("attachments") && c.enabled,
    );

    expect(recQuery).toBeDefined();
    expect(attQuery).toBeDefined();
  });
});
