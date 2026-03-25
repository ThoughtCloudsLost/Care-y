import { describe, it, expect } from "vitest";
import {
  buildRecipientList,
  type RecipientBuilderDeps,
} from "./notification-recipients.js";

function createMockDeps(overrides?: {
  ticketWatchers?: string[];
  queueWatchers?: string[];
  validMentions?: string[];
}): RecipientBuilderDeps {
  return {
    getTicketWatchers: async () => overrides?.ticketWatchers ?? [],
    getQueueWatchers: async () => overrides?.queueWatchers ?? [],
    resolveValidMentions: async (ids) =>
      (overrides?.validMentions ?? []).filter((m) => ids.includes(m)),
  };
}

const baseTicket = {
  id: "ticket-1",
  queueId: "queue-1",
  assignedTo: "owner-1",
};

describe("buildRecipientList", () => {
  it("owner is first in list", async () => {
    const deps = createMockDeps({
      ticketWatchers: ["watcher-1"],
    });

    const result = await buildRecipientList(deps, baseTicket, [], "actor-999");

    expect(result.recipients[0]).toEqual({
      userId: "owner-1",
      source: "owner",
    });
  });

  it("CC watchers added after owner", async () => {
    const deps = createMockDeps({
      ticketWatchers: ["watcher-1", "watcher-2"],
    });

    const result = await buildRecipientList(deps, baseTicket, [], "actor-999");

    expect(result.recipients).toEqual([
      { userId: "owner-1", source: "owner" },
      { userId: "watcher-1", source: "cc" },
      { userId: "watcher-2", source: "cc" },
    ]);
  });

  it("queue watchers added after CC", async () => {
    const deps = createMockDeps({
      ticketWatchers: ["watcher-1"],
      queueWatchers: ["qw-1"],
    });

    const result = await buildRecipientList(deps, baseTicket, [], "actor-999");

    expect(result.recipients).toEqual([
      { userId: "owner-1", source: "owner" },
      { userId: "watcher-1", source: "cc" },
      { userId: "qw-1", source: "queue_watcher" },
    ]);
  });

  it("mentions added last", async () => {
    const deps = createMockDeps({
      ticketWatchers: ["watcher-1"],
      queueWatchers: ["qw-1"],
      validMentions: ["mentioned-1"],
    });

    const result = await buildRecipientList(
      deps,
      baseTicket,
      ["mentioned-1"],
      "actor-999",
    );

    expect(result.recipients[result.recipients.length - 1]).toEqual({
      userId: "mentioned-1",
      source: "mention",
    });
  });

  it("acting user excluded from all sources", async () => {
    const deps = createMockDeps({
      ticketWatchers: ["actor-1"],
      queueWatchers: ["actor-1"],
      validMentions: ["actor-1"],
    });

    const ticket = { ...baseTicket, assignedTo: "actor-1" };

    const result = await buildRecipientList(
      deps,
      ticket,
      ["actor-1"],
      "actor-1",
    );

    expect(result.recipients).toEqual([]);
  });

  it("duplicate user appears once with first source (owner wins over CC)", async () => {
    const deps = createMockDeps({
      ticketWatchers: ["owner-1"],
      queueWatchers: ["owner-1"],
      validMentions: ["owner-1"],
    });

    const result = await buildRecipientList(
      deps,
      baseTicket,
      ["owner-1"],
      "actor-999",
    );

    expect(result.recipients).toEqual([{ userId: "owner-1", source: "owner" }]);
  });

  it("all empty inputs produces empty list", async () => {
    const deps = createMockDeps();
    const ticket = { ...baseTicket, assignedTo: null };

    const result = await buildRecipientList(deps, ticket, [], "actor-999");

    expect(result.recipients).toEqual([]);
  });

  it("unassigned ticket still includes CC, queue watchers, mentions", async () => {
    const deps = createMockDeps({
      ticketWatchers: ["watcher-1"],
      queueWatchers: ["qw-1"],
      validMentions: ["mentioned-1"],
    });

    const ticket = { ...baseTicket, assignedTo: null };

    const result = await buildRecipientList(
      deps,
      ticket,
      ["mentioned-1"],
      "actor-999",
    );

    expect(result.recipients).toEqual([
      { userId: "watcher-1", source: "cc" },
      { userId: "qw-1", source: "queue_watcher" },
      { userId: "mentioned-1", source: "mention" },
    ]);
  });
});
