import { describe, it, expect, vi } from "vitest";
import {
  createClientSelectSearch,
  type ClientSearchRow,
  type ClientSelectSearchDeps,
} from "./client-select-search.js";

const ROWS: readonly ClientSearchRow[] = [
  {
    id: "11111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    encryptedAlias: "sealed-maple",
    maskedPhone: "***1234",
  },
  {
    id: "22222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    encryptedAlias: "sealed-harbor",
    maskedPhone: null,
  },
  {
    id: "33333333-cccc-4ccc-8ccc-cccccccccccc",
    encryptedAlias: "sealed-undecryptable",
    maskedPhone: null,
  },
];

const ALIASES: Readonly<Record<string, string>> = {
  "sealed-maple": "Maple Fox",
  "sealed-harbor": "Harbor Owl",
};

// Return type inferred so `query` keeps its typed Mock signature.
function setup() {
  const query = vi.fn(
    (_input: { query: string; limit: number }): Promise<ClientSearchRow[]> =>
      Promise.resolve([...ROWS]),
  );
  const deps: ClientSelectSearchDeps = {
    ticketRouter: { searchClients: { query } },
    orgCache: {
      decrypt: (_id: string, data: string | null): string | null =>
        data === null ? null : (ALIASES[data] ?? null),
      decryptAsync: (
        _id: string,
        data: string | null,
      ): Promise<string | null> =>
        Promise.resolve(data === null ? null : (ALIASES[data] ?? null)),
    },
    orgKeyManager: {
      phoneMatchHash: (): Promise<string | null> => Promise.resolve(null),
    },
  };
  return { deps, query };
}

describe("createClientSelectSearch", () => {
  it("loads one unfiltered page and reuses it for later searches", async () => {
    const { deps, query } = setup();
    const search = createClientSelectSearch(deps);

    await search.search("");
    await search.search("maple");
    await search.search("owl");

    expect(query).toHaveBeenCalledTimes(1);
    // Typed text never reaches the server: aliases are sealed, so the
    // server could only compare it against blind indexes.
    expect(query).toHaveBeenCalledWith({ query: "", limit: 50 });
  });

  it("returns every client for an empty or blank query", async () => {
    const { deps } = setup();
    const search = createClientSelectSearch(deps);

    expect(await search.search("")).toHaveLength(3);
    expect(await search.search("   ")).toHaveLength(3);
  });

  it("filters decrypted aliases by case-insensitive substring", async () => {
    const { deps } = setup();
    const search = createClientSelectSearch(deps);

    const results = await search.search("  HARB ");
    expect(results.map((r) => r.alias)).toEqual(["Harbor Owl"]);
    expect(results[0]?.maskedPhone).toBeNull();

    expect(await search.search("zebra")).toEqual([]);
  });

  it("falls back to the first eight characters of the id when an alias does not decrypt", async () => {
    const { deps } = setup();
    const search = createClientSelectSearch(deps);

    const results = await search.search("");
    const fallback = results.find((r) => r.id === ROWS[2]?.id);
    expect(fallback?.alias).toBe("33333333");
  });

  it("reloads the page after reset", async () => {
    const { deps, query } = setup();
    const search = createClientSelectSearch(deps);

    await search.search("");
    search.reset();
    await search.search("");

    expect(query).toHaveBeenCalledTimes(2);
  });
});
