import { describe, it, expect } from "vitest";
import {
  buildRecipientList,
  resolveEscalationTargets,
  type RecipientBuilderDeps,
  type EscalationResolverDeps,
} from "./notification-recipients.js";
import { DEFAULT_NOTE_TYPES } from "./note-type-service.js";
import type { EscalationTarget } from "@care-y/shared";

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

  it("escalation users added after mentions", async () => {
    const deps = createMockDeps({
      ticketWatchers: ["watcher-1"],
    });

    const result = await buildRecipientList(deps, baseTicket, [], "actor-999", [
      "escalation-1",
      "escalation-2",
    ]);

    expect(result.recipients).toEqual([
      { userId: "owner-1", source: "owner" },
      { userId: "watcher-1", source: "cc" },
      { userId: "escalation-1", source: "note_escalation" },
      { userId: "escalation-2", source: "note_escalation" },
    ]);
  });

  it("escalation user already in owner is not duplicated", async () => {
    const deps = createMockDeps();

    const result = await buildRecipientList(deps, baseTicket, [], "actor-999", [
      "owner-1",
    ]);

    expect(result.recipients).toEqual([{ userId: "owner-1", source: "owner" }]);
  });

  it("acting user excluded from escalation recipients", async () => {
    const deps = createMockDeps();

    const result = await buildRecipientList(deps, baseTicket, [], "actor-999", [
      "actor-999",
    ]);

    expect(
      result.recipients.find((r) => r.userId === "actor-999"),
    ).toBeUndefined();
  });

  it("undefined escalationUserIds does not affect existing behavior", async () => {
    const deps = createMockDeps({
      ticketWatchers: ["watcher-1"],
    });

    const result = await buildRecipientList(
      deps,
      baseTicket,
      [],
      "actor-999",
      undefined,
    );

    expect(result.recipients).toEqual([
      { userId: "owner-1", source: "owner" },
      { userId: "watcher-1", source: "cc" },
    ]);
  });
});

function createMockEscalationDeps(overrides?: {
  adminUsers?: string[];
  managerUsers?: string[];
  permissionUsers?: Record<string, string[]>;
  queueMembers?: Record<string, string[]>;
  ticketKeyWrapHolders?: Record<string, string[]>;
}): EscalationResolverDeps {
  return {
    getUsersByRole: async (role) => {
      if (role === "admin") return overrides?.adminUsers ?? [];
      return overrides?.managerUsers ?? [];
    },
    getUsersByPermission: async (permission) =>
      overrides?.permissionUsers?.[permission] ?? [],
    getQueueMembers: async (queueId) =>
      overrides?.queueMembers?.[queueId] ?? [],
    getTicketKeyWrapHolders: async (ticketId) =>
      overrides?.ticketKeyWrapHolders?.[ticketId] ?? [],
  };
}

describe("resolveEscalationTargets", () => {
  it("resolves role targets to admin user IDs", async () => {
    const deps = createMockEscalationDeps({ adminUsers: ["admin-1"] });
    const targets: EscalationTarget[] = [{ type: "role", value: "admin" }];

    const result = await resolveEscalationTargets(targets, deps);

    expect(result).toEqual(["admin-1"]);
  });

  it("resolves role targets to manager user IDs", async () => {
    const deps = createMockEscalationDeps({ managerUsers: ["mgr-1", "mgr-2"] });
    const targets: EscalationTarget[] = [{ type: "role", value: "manager" }];

    const result = await resolveEscalationTargets(targets, deps);

    expect(result).toEqual(["mgr-1", "mgr-2"]);
  });

  it("resolves permission targets to matching user IDs", async () => {
    const deps = createMockEscalationDeps({
      permissionUsers: { manage_queues: ["perm-1"] },
    });
    const targets: EscalationTarget[] = [
      { type: "permission", value: "manage_queues" },
    ];

    const result = await resolveEscalationTargets(targets, deps);

    expect(result).toEqual(["perm-1"]);
  });

  it("resolves queue targets to queue members", async () => {
    const deps = createMockEscalationDeps({
      queueMembers: { "queue-uuid": ["q-1", "q-2"] },
    });
    const targets: EscalationTarget[] = [
      { type: "queue", value: "queue-uuid" },
    ];

    const result = await resolveEscalationTargets(targets, deps);

    expect(result).toEqual(["q-1", "q-2"]);
  });

  it("merges and deduplicates multiple targets", async () => {
    const deps = createMockEscalationDeps({
      adminUsers: ["shared-user", "admin-only"],
      managerUsers: ["shared-user", "mgr-only"],
    });
    const targets: EscalationTarget[] = [
      { type: "role", value: "admin" },
      { type: "role", value: "manager" },
    ];

    const result = await resolveEscalationTargets(targets, deps);

    expect(result).toHaveLength(3);
    expect(result).toContain("shared-user");
    expect(result).toContain("admin-only");
    expect(result).toContain("mgr-only");
  });

  it("empty targets array returns empty array", async () => {
    const deps = createMockEscalationDeps();
    const result = await resolveEscalationTargets([], deps);

    expect(result).toEqual([]);
  });

  it("resolves ticket_access targets to key wrap holders when ticketId provided", async () => {
    const deps = createMockEscalationDeps({
      ticketKeyWrapHolders: { "ticket-42": ["vol-1", "vol-2"] },
    });
    const targets: EscalationTarget[] = [{ type: "ticket_access" }];

    const result = await resolveEscalationTargets(targets, deps, "ticket-42");

    expect(result).toEqual(["vol-1", "vol-2"]);
  });

  it("ticket_access with no ticketId returns empty (no-op)", async () => {
    const deps = createMockEscalationDeps({
      ticketKeyWrapHolders: { "ticket-42": ["vol-1"] },
    });
    const targets: EscalationTarget[] = [{ type: "ticket_access" }];

    const result = await resolveEscalationTargets(targets, deps);

    expect(result).toEqual([]);
  });

  it("ticket_access deduplicates with role targets", async () => {
    const deps = createMockEscalationDeps({
      adminUsers: ["shared-user", "admin-only"],
      ticketKeyWrapHolders: { "ticket-1": ["shared-user", "vol-only"] },
    });
    const targets: EscalationTarget[] = [
      { type: "role", value: "admin" },
      { type: "ticket_access" },
    ];

    const result = await resolveEscalationTargets(targets, deps, "ticket-1");

    expect(result).toHaveLength(3);
    expect(result).toContain("shared-user");
    expect(result).toContain("admin-only");
    expect(result).toContain("vol-only");
  });

  it("ticket_access with unknown ticketId returns empty", async () => {
    const deps = createMockEscalationDeps({
      ticketKeyWrapHolders: { "ticket-42": ["vol-1"] },
    });
    const targets: EscalationTarget[] = [{ type: "ticket_access" }];

    const result = await resolveEscalationTargets(
      targets,
      deps,
      "nonexistent-ticket",
    );

    expect(result).toEqual([]);
  });
});

describe("DEFAULT_NOTE_TYPES seed validation", () => {
  it("all 4 defaults include ticket_access escalation target", () => {
    expect(DEFAULT_NOTE_TYPES).toHaveLength(4);
    for (const def of DEFAULT_NOTE_TYPES) {
      const hasTicketAccess = def.escalationTargets.some(
        (t) => t.type === "ticket_access",
      );
      expect(hasTicketAccess, `${def.name} should include ticket_access`).toBe(
        true,
      );
    }
  });

  it("Safety Concern and Request also include admin + manager targets", () => {
    const safety = DEFAULT_NOTE_TYPES.find((d) => d.name === "Safety Concern");
    const request = DEFAULT_NOTE_TYPES.find((d) => d.name === "Request");

    for (const def of [safety, request]) {
      expect(def).toBeDefined();
      expect(def!.escalationTargets).toContainEqual({
        type: "role",
        value: "admin",
      });
      expect(def!.escalationTargets).toContainEqual({
        type: "role",
        value: "manager",
      });
    }
  });
});
