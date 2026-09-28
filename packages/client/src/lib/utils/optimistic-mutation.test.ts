import { describe, it, expect, vi } from "vitest";
import { QueryClient } from "@tanstack/svelte-query";
import {
  isPagedRows,
  optimisticListsMutation,
  patchPagedRow,
  type PagedRows,
} from "./optimistic-mutation.js";
import { ticketsKeys } from "$lib/query/keys.js";

function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

interface Item {
  id: string;
  active: boolean;
}

describe("isPagedRows", () => {
  it("accepts pages of rows carrying string ids", () => {
    expect(
      isPagedRows({ pages: [[{ id: "a" }], []], pageParams: [null, "c1"] }),
    ).toBe(true);
  });

  it("rejects a plain array of rows", () => {
    expect(isPagedRows([{ id: "a" }])).toBe(false);
  });

  it("rejects pages without pageParams", () => {
    expect(isPagedRows({ pages: [[{ id: "a" }]] })).toBe(false);
  });

  it("rejects a row without a string id", () => {
    expect(isPagedRows({ pages: [[{ id: 1 }]], pageParams: [null] })).toBe(
      false,
    );
  });

  it("rejects undefined data", () => {
    expect(isPagedRows(undefined)).toBe(false);
  });
});

describe("patchPagedRow", () => {
  it("patches only the matching row on every page", () => {
    const data = {
      pages: [
        [
          { id: "a", onHold: false },
          { id: "b", onHold: false },
        ],
        [{ id: "a", onHold: false }],
      ],
      pageParams: [null, "c1"],
    };
    expect(patchPagedRow(data, "a", { onHold: true })).toEqual({
      pages: [
        [
          { id: "a", onHold: true },
          { id: "b", onHold: false },
        ],
        [{ id: "a", onHold: true }],
      ],
      pageParams: [null, "c1"],
    });
  });

  it("never rewrites the row id", () => {
    const data = { pages: [[{ id: "a" }]], pageParams: [null] };
    expect(patchPagedRow(data, "a", { id: "z" }).pages[0]?.[0]?.id).toBe("a");
  });
});

describe("optimisticListsMutation", () => {
  interface Paged {
    pages: Item[][];
    pageParams: unknown[];
  }

  const activateA = (old: PagedRows): PagedRows =>
    patchPagedRow(old, "a", { active: true });

  const LANE_ONE = ticketsKeys.list({ lane: "one" });
  const LANE_TWO = ticketsKeys.list({ lane: "two" });

  function seed(qc: QueryClient): void {
    qc.setQueryData<Paged>(LANE_ONE, {
      pages: [[{ id: "a", active: false }]],
      pageParams: [null],
    });
    qc.setQueryData<Paged>(LANE_TWO, {
      pages: [[{ id: "b", active: false }], [{ id: "a", active: false }]],
      pageParams: [null, "cursor-1"],
    });
  }

  it("applies the update to every list query under the key", async () => {
    const qc = makeClient();
    seed(qc);
    const onSuccess = vi.fn();

    await optimisticListsMutation<PagedRows>({
      queryClient: qc,
      queryKey: ticketsKeys.lists(),
      isData: isPagedRows,
      update: activateA,
      mutate: () => Promise.resolve(),
      onSuccess,
    });

    expect(qc.getQueryData<Paged>(LANE_ONE)?.pages).toEqual([
      [{ id: "a", active: true }],
    ]);
    expect(qc.getQueryData<Paged>(LANE_TWO)?.pages).toEqual([
      [{ id: "b", active: false }],
      [{ id: "a", active: true }],
    ]);
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("rolls every list query back on mutation failure", async () => {
    const qc = makeClient();
    seed(qc);
    const onError = vi.fn();
    const err = new Error("network");

    await optimisticListsMutation<PagedRows>({
      queryClient: qc,
      queryKey: ticketsKeys.lists(),
      isData: isPagedRows,
      update: activateA,
      mutate: () => Promise.reject(err),
      onError,
    });

    expect(qc.getQueryData<Paged>(LANE_ONE)?.pages).toEqual([
      [{ id: "a", active: false }],
    ]);
    expect(qc.getQueryData<Paged>(LANE_TWO)?.pages).toEqual([
      [{ id: "b", active: false }],
      [{ id: "a", active: false }],
    ]);
    expect(onError).toHaveBeenCalledWith(err);
  });

  it("leaves queries outside the key untouched", async () => {
    const qc = makeClient();
    seed(qc);
    const facetKey = ticketsKeys.facetIndex();
    const facetData: Paged = {
      pages: [[{ id: "a", active: false }]],
      pageParams: [null],
    };
    qc.setQueryData<Paged>(facetKey, facetData);

    await optimisticListsMutation<PagedRows>({
      queryClient: qc,
      queryKey: ticketsKeys.lists(),
      isData: isPagedRows,
      update: activateA,
      mutate: () => Promise.resolve(),
    });

    expect(qc.getQueryData(facetKey)).toBe(facetData);
  });

  it("leaves a list query of another shape untouched", async () => {
    const qc = makeClient();
    seed(qc);
    const flatKey = ticketsKeys.list({ source: "fullSearch" });
    const flatData: Item[] = [{ id: "a", active: false }];
    qc.setQueryData(flatKey, flatData);
    const before = qc.getQueryState(flatKey)?.dataUpdatedAt;

    await optimisticListsMutation<PagedRows>({
      queryClient: qc,
      queryKey: ticketsKeys.lists(),
      isData: isPagedRows,
      update: activateA,
      mutate: () => Promise.resolve(),
    });

    expect(qc.getQueryData(flatKey)).toBe(flatData);
    expect(qc.getQueryState(flatKey)?.dataUpdatedAt).toBe(before);
  });

  it("does not roll back when onSuccess throws", async () => {
    const qc = makeClient();
    seed(qc);

    await expect(
      optimisticListsMutation<PagedRows>({
        queryClient: qc,
        queryKey: ticketsKeys.lists(),
        isData: isPagedRows,
        update: activateA,
        mutate: () => Promise.resolve(),
        onSuccess: () => {
          throw new Error("toast crash");
        },
      }),
    ).rejects.toThrow("toast crash");

    expect(qc.getQueryData<Paged>(LANE_ONE)?.pages).toEqual([
      [{ id: "a", active: true }],
    ]);
  });
});
