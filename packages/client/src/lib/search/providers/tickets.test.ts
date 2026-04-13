import { describe, it, expect, vi } from "vitest";
import type { RawCachedTicket } from "./tickets.js";
import { createTicketSearchProvider } from "./tickets.js";

// Mock paraglide messages
vi.mock("$lib/paraglide/messages.js", () => ({
  search_section_tickets: () => "Tickets",
}));

// Mock the TicketSearchResult component (not needed for unit tests)
vi.mock("$lib/components/search/TicketSearchResult.svelte", () => ({
  default: {} as never,
}));

function makeRawTicket(
  overrides: Partial<RawCachedTicket> & { id: string },
): RawCachedTicket {
  return {
    queueId: "q1",
    encryptedQueueName: null,
    status: "open",
    onHold: false,
    priority: "normal",
    encryptedTitle: "encrypted-blob",
    keyWrap: { ephemeralPoint: "ep", nonce: "n", wrappedKey: "wk" },
    clientAlias: "Anonymous",
    assignedTo: null,
    assignedDisplayName: null,
    createdAt: "2026-01-01T00:00:00Z",
    lastActivityAt: null,
    followUpCount: 0,
    ...overrides,
  };
}

describe("createTicketSearchProvider", () => {
  const rawTickets: RawCachedTicket[] = [
    makeRawTicket({ id: "t1", clientAlias: "Maria" }),
    makeRawTicket({ id: "t2", clientAlias: "Carlos" }),
    makeRawTicket({ id: "t3", clientAlias: "Ana" }),
  ];

  // Simulate decrypted titles: t1 and t2 have titles, t3 does not.
  const decryptedTitles: Record<string, string> = {
    t1: "Housing assistance request",
    t2: "Artículo sobre transporte",
  };

  function createProvider(): ReturnType<typeof createTicketSearchProvider> {
    return createTicketSearchProvider({
      getAllCachedTickets: () => rawTickets,
      decryptTitle: (id: string) => decryptedTitles[id],
      decryptQueueName: () => "General",
      resolveAssignedName: () => null,
      getPreviewFollowUps: () => undefined,
      deriveDisplayStatus: () => "open" as never,
    });
  }

  it("matches on decrypted title substring", () => {
    const provider = createProvider();
    const { results } = provider.search("housing");
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe("t1");
  });

  it("returns empty results for non-matching query", () => {
    const provider = createProvider();
    const { results } = provider.search("nonexistent query term");
    expect(results).toHaveLength(0);
  });

  it("matches on client alias", () => {
    const provider = createProvider();
    const { results } = provider.search("Maria");
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe("t1");
  });

  it("excludes tickets with undecrypted titles", () => {
    const provider = createProvider();
    const { results } = provider.search("Ana");
    expect(results).toHaveLength(0);
  });

  it("performs accent-folded matching", () => {
    const provider = createProvider();
    const { results } = provider.search("articulo");
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe("t2");
  });

  it("reports totalCached as the count of all tickets (not just decrypted)", () => {
    const provider = createProvider();
    const { totalCached } = provider.search("housing");
    expect(totalCached).toBe(3);
  });

  it("never reports loading as true for instant search", () => {
    const provider = createProvider();
    const { loading } = provider.search("housing");
    expect(loading).toBe(false);
  });

  it("has correct provider metadata", () => {
    const provider = createProvider();
    expect(provider.id).toBe("tickets");
    expect(provider.label()).toBe("Tickets");
    expect(provider.renderMode).toBe("card-strip");
    expect(provider.showAllHref("test")).toBe("/tickets");
    expect(provider.getResultHref("t1")).toBe("/tickets/t1");
  });

  it("maps display fields from decrypt functions", () => {
    const provider = createProvider();
    const { results } = provider.search("housing");
    const data = results[0]!.data;
    expect(data.ticketId).toBe("t1");
    expect(data.clientAlias).toBe("Maria");
    expect(data.queueName).toBe("General");
    expect(data.title).toBe("Housing assistance request");
  });
});
