import { describe, it, expect, vi } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import type { ReactionSummary } from "@care-y/shared";
import {
  sortedNoteIds,
  fetchAllReactions,
  writeReactionToCache,
} from "./create-reactions-query.svelte.ts";
import { reactionKeys } from "$lib/query/keys.js";

function summaries(...userIds: string[]): ReactionSummary[] {
  return [{ reaction: "acknowledge", userIds }];
}

function ids(count: number, prefix = "id"): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix}-${String(i)}`);
}

describe("sortedNoteIds", () => {
  it("produces one key for the same set regardless of collection order", () => {
    const shuffled = ["b", "c", "a"];
    const ordered = ["a", "b", "c"];
    expect(reactionKeys.byIds(sortedNoteIds(shuffled))).toEqual(
      reactionKeys.byIds(sortedNoteIds(ordered)),
    );
  });

  it("copies instead of mutating the input", () => {
    const input = ["b", "a"];
    const sorted = sortedNoteIds(input);
    expect(sorted).toEqual(["a", "b"]);
    expect(input).toEqual(["b", "a"]);
  });
});

describe("fetchAllReactions", () => {
  it("pages requests in chunks of 100 and merges the records", async () => {
    const allIds = ids(250);
    const fetchReactions = vi.fn(
      (
        followUpIds: string[],
        _signal: AbortSignal,
      ): Promise<Record<string, ReactionSummary[]>> =>
        Promise.resolve({
          [followUpIds[0] ?? "none"]: summaries("u1"),
        }),
    );

    const merged = await fetchAllReactions(
      allIds,
      fetchReactions,
      new AbortController().signal,
    );

    expect(fetchReactions).toHaveBeenCalledTimes(3);
    const sizes = fetchReactions.mock.calls.map(([chunk]) => chunk.length);
    expect(sizes).toEqual([100, 100, 50]);
    expect(Object.keys(merged)).toEqual(["id-0", "id-100", "id-200"]);
  });

  it("drops ids the server reports with no reactions", async () => {
    const merged = await fetchAllReactions(
      ["a", "b"],
      () => Promise.resolve({ a: summaries("u1"), b: [] }),
      new AbortController().signal,
    );
    expect(merged).toEqual({ a: summaries("u1") });
  });

  it("rejects the whole run when a chunk fails", async () => {
    const boom = new Error("chunk failed");
    const fetchReactions = vi
      .fn<
        (
          followUpIds: string[],
          signal: AbortSignal,
        ) => Promise<Record<string, ReactionSummary[]>>
      >()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(boom);

    await expect(
      fetchAllReactions(ids(150), fetchReactions, new AbortController().signal),
    ).rejects.toThrow("chunk failed");
    expect(fetchReactions).toHaveBeenCalledTimes(2);
  });

  it("stops between chunks once the signal aborts", async () => {
    const controller = new AbortController();
    const fetchReactions = vi.fn(
      (
        followUpIds: string[],
        _signal: AbortSignal,
      ): Promise<Record<string, ReactionSummary[]>> => {
        controller.abort();
        return Promise.resolve({
          [followUpIds[0] ?? "none"]: summaries("u1"),
        });
      },
    );

    await fetchAllReactions(ids(250), fetchReactions, controller.signal);

    expect(fetchReactions).toHaveBeenCalledTimes(1);
  });
});

describe("writeReactionToCache", () => {
  it("updates every cached reactions record and nothing else", () => {
    const queryClient = new QueryClient();
    const keyA = reactionKeys.byIds(["a", "b"]);
    const keyB = reactionKeys.byIds(["b", "c"]);
    queryClient.setQueryData(keyA, { a: summaries("u1") });
    queryClient.setQueryData(keyB, { c: summaries("u2") });
    queryClient.setQueryData(["tickets", "list"], { untouched: true });

    writeReactionToCache(queryClient, "b", summaries("u1", "u2"));

    expect(queryClient.getQueryData(keyA)).toEqual({
      a: summaries("u1"),
      b: summaries("u1", "u2"),
    });
    expect(queryClient.getQueryData(keyB)).toEqual({
      c: summaries("u2"),
      b: summaries("u1", "u2"),
    });
    expect(queryClient.getQueryData(["tickets", "list"])).toEqual({
      untouched: true,
    });
  });

  it("leaves empty cache entries alone", () => {
    const queryClient = new QueryClient();
    writeReactionToCache(queryClient, "b", summaries("u1"));
    expect(queryClient.getQueriesData({ queryKey: reactionKeys.all })).toEqual(
      [],
    );
  });
});
