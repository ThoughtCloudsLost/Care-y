import { describe, it, expect, vi } from "vitest";
import {
  createConversationSearchProvider,
  type ConversationSearchProviderDeps,
} from "./conversation.js";
import { DECRYPT_ERROR_SENTINEL } from "$lib/crypto/async-decrypt-cache.js";

// Mock paraglide messages
vi.mock("$lib/paraglide/messages.js", () => ({
  search_section_conversation: () => "Conversation",
}));

// Mock the ConversationSearchResult component (not used in unit tests)
vi.mock("$lib/components/search/ConversationSearchResult.svelte", () => ({
  default: {} as never,
}));

interface MockFollowUp {
  readonly id: string;
  readonly source: string;
  readonly type: string;
  readonly encryptedContent: unknown;
  readonly createdBy: string | null;
  readonly createdAt: string;
}

function makeFollowUp(
  overrides: Partial<MockFollowUp> & { id: string },
): MockFollowUp {
  return {
    source: "client",
    type: "reply",
    encryptedContent: new Uint8Array([1, 2, 3]),
    createdBy: "user-1",
    createdAt: "2026-03-15T12:00:00Z",
    ...overrides,
  };
}

const testFollowUps: MockFollowUp[] = [
  makeFollowUp({ id: "fu-1", createdAt: "2026-03-15T10:00:00Z" }),
  makeFollowUp({
    id: "fu-2",
    source: "system",
    type: "system_event",
    createdAt: "2026-03-15T11:00:00Z",
  }),
  makeFollowUp({
    id: "fu-3",
    type: "internal_note",
    createdBy: "vol-1",
    createdAt: "2026-03-15T12:00:00Z",
  }),
  makeFollowUp({ id: "fu-4", createdAt: "2026-03-15T13:00:00Z" }),
  makeFollowUp({ id: "fu-5", createdAt: "2026-03-15T14:00:00Z" }),
];

const plaintextMap: Record<string, string> = {
  "fu-1": "I need help with my housing situation",
  "fu-2": "Ticket assigned to volunteer team",
  "fu-3": "Client seems distressed, follow up tomorrow",
  "fu-4": "We can connect you with housing resources",
  "fu-5": "Thank you for the help with housing",
};

function createDeps(
  followUps: readonly MockFollowUp[] = testFollowUps,
  decryptMap: Record<string, string> = plaintextMap,
): ConversationSearchProviderDeps {
  return {
    getFollowUps: () => followUps,
    getDecryptedContent: (id: string) => decryptMap[id],
    resolveAuthorName: (source, createdBy) => {
      if (source === "system") return undefined;
      return createdBy === "vol-1" ? "Test Volunteer" : "Test Client";
    },
    getTotalFollowUpCount: () => followUps.length,
    getTicketId: () => "ticket-abc",
    onviewall: vi.fn(),
    onresulttap: vi.fn(),
  };
}

describe("createConversationSearchProvider", () => {
  it("has correct provider metadata", () => {
    const provider = createConversationSearchProvider(createDeps());
    expect(provider.id).toBe("conversation");
    expect(provider.label()).toBe("Conversation");
    expect(provider.renderMode).toBe("list");
  });

  it("showAllHref uses the ticket ID from deps", () => {
    const provider = createConversationSearchProvider(createDeps());
    expect(provider.showAllHref("housing")).toBe("/tickets/ticket-abc");
  });

  it("getResultHref returns anchor link to follow-up", () => {
    const provider = createConversationSearchProvider(createDeps());
    expect(provider.getResultHref("fu-1")).toBe("/tickets/ticket-abc#fu-fu-1");
  });

  it("delegates onviewall and onresulttap to deps", () => {
    const deps = createDeps();
    const provider = createConversationSearchProvider(deps);

    provider.onviewall!("housing");
    expect(deps.onviewall).toHaveBeenCalledWith("housing");

    provider.onresulttap!("fu-1", "housing");
    expect(deps.onresulttap).toHaveBeenCalledWith("fu-1", "housing");
  });
});

describe("conversation search", () => {
  it("returns empty results for empty query", () => {
    const provider = createConversationSearchProvider(createDeps());
    const { results } = provider.search("");
    expect(results).toHaveLength(0);
  });

  it("returns matching results with correct data shape", () => {
    const provider = createConversationSearchProvider(createDeps());
    const { results } = provider.search("housing");

    expect(results.length).toBeGreaterThan(0);
    const first = results[0]!;
    expect(first.id).toBeDefined();
    expect(first.data.followUpId).toBe(first.id);
    expect(first.data.searchTerm).toBe("housing");
    expect(first.data.plaintext).toBeDefined();
  });

  it("matches case-insensitively", () => {
    const provider = createConversationSearchProvider(createDeps());

    const lower = provider.search("housing");
    const upper = provider.search("HOUSING");

    expect(lower.results.length).toBe(upper.results.length);
    expect(lower.results.map((r) => r.id)).toEqual(
      upper.results.map((r) => r.id),
    );
  });

  it("caps preview results at 3 items", () => {
    // All 5 follow-ups contain generic searchable text
    const allMatch: Record<string, string> = {
      "fu-1": "topic alpha",
      "fu-2": "topic bravo",
      "fu-3": "topic charlie",
      "fu-4": "topic delta",
      "fu-5": "topic echo",
    };
    const provider = createConversationSearchProvider(
      createDeps(testFollowUps, allMatch),
    );
    const { results, totalResults } = provider.search("topic");

    expect(results).toHaveLength(3);
    // totalResults reflects all matches, not just the preview slice
    expect(totalResults).toBe(5);
  });

  it("takes the last 3 (most recent) when slicing to max results", () => {
    const allMatch: Record<string, string> = {
      "fu-1": "alpha topic",
      "fu-2": "bravo topic",
      "fu-3": "charlie topic",
      "fu-4": "delta topic",
      "fu-5": "echo topic",
    };
    const provider = createConversationSearchProvider(
      createDeps(testFollowUps, allMatch),
    );
    const { results } = provider.search("topic");

    // After sorting by originalIndex, slice(-3) takes the last 3
    const ids = results.map((r) => r.id);
    expect(ids).toEqual(["fu-3", "fu-4", "fu-5"]);
  });

  it("excludes follow-ups with undefined decrypted content", () => {
    const partialDecrypt: Record<string, string> = {
      "fu-1": "housing help needed",
      // fu-2 through fu-5 return undefined from getDecryptedContent
    };
    const provider = createConversationSearchProvider(
      createDeps(testFollowUps, partialDecrypt),
    );
    const { results, totalCached } = provider.search("housing");

    expect(totalCached).toBe(1);
    expect(results).toHaveLength(1);
    expect(results[0]!.id).toBe("fu-1");
  });

  it("excludes follow-ups with DECRYPT_ERROR_SENTINEL", () => {
    const withErrors: Record<string, string> = {
      "fu-1": "housing help needed",
      "fu-2": DECRYPT_ERROR_SENTINEL,
      "fu-3": "housing resources available",
      "fu-4": DECRYPT_ERROR_SENTINEL,
      "fu-5": "housing follow-up scheduled",
    };
    const provider = createConversationSearchProvider(
      createDeps(testFollowUps, withErrors),
    );
    const { results, totalCached } = provider.search("housing");

    // Only fu-1, fu-3, fu-5 are searchable (fu-2 and fu-4 have decrypt errors)
    expect(totalCached).toBe(3);
    // All 3 match "housing"
    expect(results).toHaveLength(3);
    const ids = results.map((r) => r.id);
    expect(ids).not.toContain("fu-2");
    expect(ids).not.toContain("fu-4");
  });

  it("reports totalCached as the number of successfully decrypted items", () => {
    const provider = createConversationSearchProvider(createDeps());
    const { totalCached, totalItems } = provider.search("xyz");

    expect(totalCached).toBe(5);
    expect(totalItems).toBe(5);
  });

  it("reports totalItems from getTotalFollowUpCount (may differ from cached)", () => {
    // Override to simulate more follow-ups on the server than locally decrypted
    const deps: ConversationSearchProviderDeps = {
      ...createDeps(),
      getTotalFollowUpCount: () => 20,
    };
    const provider = createConversationSearchProvider(deps);
    const { totalCached, totalItems } = provider.search("housing");

    expect(totalCached).toBe(5);
    expect(totalItems).toBe(20);
  });
});

describe("conversation search - result ordering", () => {
  it("returns results sorted by conversation order, not match quality", () => {
    const provider = createConversationSearchProvider(createDeps());
    const { results } = provider.search("housing");

    // "housing" appears in fu-1, fu-4, fu-5
    const ids = results.map((r) => r.id);
    expect(ids).toEqual(["fu-1", "fu-4", "fu-5"]);
  });

  it("preserves conversation order when all items match", () => {
    const allMatch: Record<string, string> = {
      "fu-1": "topic one",
      "fu-2": "topic two",
      "fu-3": "topic three",
    };
    const threeItems = testFollowUps.slice(0, 3);
    const provider = createConversationSearchProvider(
      createDeps(threeItems, allMatch),
    );
    const { results } = provider.search("topic");

    const ids = results.map((r) => r.id);
    expect(ids).toEqual(["fu-1", "fu-2", "fu-3"]);
  });
});

describe("conversation search - gap calculation", () => {
  it("calculates gapBefore as non-matching messages between consecutive results", () => {
    // fu-1 matches (index 0), fu-2 does not, fu-3 does not, fu-4 matches (index 3)
    const gapDecrypt: Record<string, string> = {
      "fu-1": "housing help",
      "fu-2": "unrelated system event",
      "fu-3": "unrelated internal note",
      "fu-4": "housing resources",
      "fu-5": "unrelated goodbye",
    };
    const provider = createConversationSearchProvider(
      createDeps(testFollowUps, gapDecrypt),
    );
    const { results } = provider.search("housing");

    expect(results).toHaveLength(2);
    // First result has no gap (it is the first in the slice)
    expect(results[0]!.data.gapBefore).toBe(0);
    // Second result (index 3) is 2 positions after first result (index 0)
    // gap = 3 - 0 - 1 = 2
    expect(results[1]!.data.gapBefore).toBe(2);
  });

  it("sets gapBefore to 0 for the first result in the slice", () => {
    const provider = createConversationSearchProvider(createDeps());
    const { results } = provider.search("housing");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.data.gapBefore).toBe(0);
  });

  it("sets gapBefore to 0 for consecutive matching messages", () => {
    const consecutive: Record<string, string> = {
      "fu-1": "alpha topic",
      "fu-2": "bravo topic",
      "fu-3": "charlie other",
    };
    const threeItems = testFollowUps.slice(0, 3);
    const provider = createConversationSearchProvider(
      createDeps(threeItems, consecutive),
    );
    const { results } = provider.search("topic");

    expect(results).toHaveLength(2);
    expect(results[0]!.data.gapBefore).toBe(0);
    // fu-2 (index 1) directly follows fu-1 (index 0): gap = 1 - 0 - 1 = 0
    expect(results[1]!.data.gapBefore).toBe(0);
  });
});

describe("conversation search - follow-up kind", () => {
  it("classifies system source as system kind", () => {
    const provider = createConversationSearchProvider(createDeps());
    const { results } = provider.search("assigned");

    expect(results).toHaveLength(1);
    expect(results[0]!.data.kind).toBe("system");
  });

  it("classifies internal_note type as note kind", () => {
    const provider = createConversationSearchProvider(createDeps());
    const { results } = provider.search("distressed");

    expect(results).toHaveLength(1);
    expect(results[0]!.data.kind).toBe("note");
  });

  it("classifies regular follow-ups as message kind", () => {
    const provider = createConversationSearchProvider(createDeps());
    const { results } = provider.search("housing");

    for (const result of results) {
      expect(result.data.kind).toBe("message");
    }
  });
});

describe("conversation search - author resolution", () => {
  it("resolves author name via deps", () => {
    const provider = createConversationSearchProvider(createDeps());
    const { results } = provider.search("distressed");

    expect(results).toHaveLength(1);
    // fu-3 has createdBy "vol-1", source "client"
    expect(results[0]!.data.authorName).toBe("Test Volunteer");
  });

  it("returns undefined author for system messages", () => {
    const provider = createConversationSearchProvider(createDeps());
    const { results } = provider.search("assigned");

    expect(results).toHaveLength(1);
    expect(results[0]!.data.authorName).toBeUndefined();
  });
});
