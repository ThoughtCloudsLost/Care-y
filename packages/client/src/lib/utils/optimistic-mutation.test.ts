import { describe, it, expect, vi } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import { optimisticMutation } from "./optimistic-mutation.js";

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

const KEY = ["test", "items"];

interface Item {
  id: string;
  active: boolean;
}

describe("optimisticMutation", () => {
  it("applies optimistic update and calls onSuccess on success", async () => {
    const qc = makeClient();
    const initial: Item[] = [
      { id: "a", active: false },
      { id: "b", active: true },
    ];
    qc.setQueryData(KEY, initial);

    const onSuccess = vi.fn();

    await optimisticMutation<Item[]>({
      queryClient: qc,
      queryKey: KEY,
      update: (old) =>
        old.map((i) => (i.id === "a" ? { ...i, active: true } : i)),
      mutate: () => Promise.resolve(),
      onSuccess,
    });

    const result = qc.getQueryData<Item[]>(KEY);
    expect(result).toEqual([
      { id: "a", active: true },
      { id: "b", active: true },
    ]);
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("rolls back to snapshot on mutation failure", async () => {
    const qc = makeClient();
    const initial: Item[] = [{ id: "a", active: false }];
    qc.setQueryData(KEY, initial);

    const onError = vi.fn();
    const err = new Error("network");

    await optimisticMutation<Item[]>({
      queryClient: qc,
      queryKey: KEY,
      update: (old) => old.map((i) => ({ ...i, active: true })),
      mutate: () => Promise.reject(err),
      onError,
    });

    const result = qc.getQueryData<Item[]>(KEY);
    expect(result).toEqual([{ id: "a", active: false }]);
    expect(onError).toHaveBeenCalledWith(err);
  });

  it("preserves undefined cache without crashing", async () => {
    const qc = makeClient();

    await optimisticMutation<Item[]>({
      queryClient: qc,
      queryKey: KEY,
      update: (old) => [...old, { id: "x", active: true }],
      mutate: () => Promise.resolve(),
    });

    expect(qc.getQueryData(KEY)).toBeUndefined();
  });

  it("works with paginated data shapes", async () => {
    const qc = makeClient();
    interface Paginated {
      pages: Item[][];
      pageParams: unknown[];
    }
    const initial: Paginated = {
      pages: [[{ id: "a", active: false }], [{ id: "b", active: true }]],
      pageParams: [null, "cursor-1"],
    };
    qc.setQueryData(KEY, initial);

    await optimisticMutation<Paginated>({
      queryClient: qc,
      queryKey: KEY,
      update: (old) => ({
        ...old,
        pages: old.pages.map((pg) =>
          pg.map((t) => (t.id === "a" ? { ...t, active: true } : t)),
        ),
      }),
      mutate: () => Promise.resolve(),
    });

    const result = qc.getQueryData<Paginated>(KEY);
    expect(result?.pages[0]?.[0]?.active).toBe(true);
    expect(result?.pages[1]?.[0]?.active).toBe(true);
  });

  it("does not roll back when onSuccess throws", async () => {
    const qc = makeClient();
    const initial: Item[] = [{ id: "a", active: false }];
    qc.setQueryData(KEY, initial);

    await expect(
      optimisticMutation<Item[]>({
        queryClient: qc,
        queryKey: KEY,
        update: (old) => old.map((i) => ({ ...i, active: true })),
        mutate: () => Promise.resolve(),
        onSuccess: () => {
          throw new Error("toast crash");
        },
      }),
    ).rejects.toThrow("toast crash");

    const result = qc.getQueryData<Item[]>(KEY);
    expect(result).toEqual([{ id: "a", active: true }]);
  });
});
