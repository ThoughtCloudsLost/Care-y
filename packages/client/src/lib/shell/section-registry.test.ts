import { describe, it, expect, vi } from "vitest";
import { Permission } from "@care-y/shared";
import {
  buildDashboardSections,
  getHoverSections,
  findRegistryEntry,
  ORGANIZATION_SECTIONS,
  COMMUNICATIONS_SECTIONS,
  MANAGER_SECTIONS,
  VOLUNTEER_SECTIONS,
} from "./section-registry.js";
import { buildAdminHubSections } from "$lib/admin/destinations.js";
import type { QueryClient } from "@tanstack/svelte-query";

// Minimal mock QueryClient: only getQueryData is needed.
function createMockQueryClient(cache?: Record<string, unknown>): QueryClient {
  return {
    getQueryData: vi.fn((key: readonly unknown[]) => {
      if (cache == null) return undefined;
      const stringKey = JSON.stringify(key);
      return cache[stringKey];
    }),
  } as unknown as QueryClient;
}

describe("section-registry", () => {
  describe("static section arrays", () => {
    it("ORGANIZATION_SECTIONS has 8 entries", () => {
      expect(ORGANIZATION_SECTIONS).toHaveLength(8);
      expect(ORGANIZATION_SECTIONS.map((s) => s.id)).toEqual([
        "general",
        "branding",
        "terminology",
        "keys",
        "retention",
        "org-deletion",
        "note-types",
        "intake-forms",
        "funds",
      ]);
    });

    it("COMMUNICATIONS_SECTIONS has 5 entries", () => {
      expect(COMMUNICATIONS_SECTIONS).toHaveLength(5);
    });

    it("MANAGER_SECTIONS has 4 entries", () => {
      expect(MANAGER_SECTIONS).toHaveLength(4);
    });

    it("VOLUNTEER_SECTIONS has 4 entries", () => {
      expect(VOLUNTEER_SECTIONS).toHaveLength(4);
    });
  });

  describe("buildAdminHubSections (from destinations.ts)", () => {
    it("returns groups matching visible destinations", () => {
      const perms = new Set([
        Permission.MANAGE_USERS,
        Permission.MANAGE_QUEUES,
        Permission.VIEW_CLIENTS,
      ]);
      const sections = buildAdminHubSections(perms);
      expect(sections.some((s) => s.id === "people")).toBe(true);
    });

    it("returns empty for no permissions", () => {
      const sections = buildAdminHubSections(new Set());
      expect(sections).toHaveLength(0);
    });

    it("filters out groups with no visible destinations", () => {
      const perms = new Set([Permission.MANAGE_INFRASTRUCTURE]);
      const sections = buildAdminHubSections(perms);
      expect(sections.every((s) => s.id === "communications")).toBe(true);
    });
  });

  describe("buildDashboardSections", () => {
    it("includes core sections with all flags false", () => {
      const sections = buildDashboardSections({
        showGettingStarted: false,
        showKb: true,
        showMergeCandidates: false,
        showNeedsAttention: false,
        showOnHold: false,
      });
      const ids = sections.map((s) => s.id);
      expect(ids).toContain("shift");
      expect(ids).toContain("queues");
      expect(ids).toContain("activity");
      expect(ids).toContain("kb");
      expect(ids).toContain("my-tickets");
      expect(ids).toContain("unassigned");
    });

    it("omits conditional sections when all flags false", () => {
      const sections = buildDashboardSections({
        showGettingStarted: false,
        showKb: true,
        showMergeCandidates: false,
        showNeedsAttention: false,
        showOnHold: false,
      });
      const ids = sections.map((s) => s.id);
      expect(ids).not.toContain("getting-started");
      expect(ids).not.toContain("merge-candidates");
      expect(ids).not.toContain("needs-attention");
      expect(ids).not.toContain("on-hold");
    });

    it("includes getting-started when flag is true", () => {
      const sections = buildDashboardSections({
        showGettingStarted: true,
        showKb: true,
        showMergeCandidates: false,
        showNeedsAttention: false,
        showOnHold: false,
      });
      expect(sections[0]?.id).toBe("getting-started");
    });

    it("includes merge-candidates when flag is true", () => {
      const sections = buildDashboardSections({
        showGettingStarted: false,
        showKb: true,
        showMergeCandidates: true,
        showNeedsAttention: false,
        showOnHold: false,
      });
      expect(sections.some((s) => s.id === "merge-candidates")).toBe(true);
    });

    it("includes needs-attention when flag is true", () => {
      const sections = buildDashboardSections({
        showGettingStarted: false,
        showKb: true,
        showMergeCandidates: false,
        showNeedsAttention: true,
        showOnHold: false,
      });
      expect(sections.some((s) => s.id === "needs-attention")).toBe(true);
    });

    it("includes on-hold when flag is true", () => {
      const sections = buildDashboardSections({
        showGettingStarted: false,
        showKb: true,
        showMergeCandidates: false,
        showNeedsAttention: false,
        showOnHold: true,
      });
      expect(sections.some((s) => s.id === "on-hold")).toBe(true);
    });

    it("includes all conditional sections when all flags true", () => {
      const sections = buildDashboardSections({
        showGettingStarted: true,
        showKb: true,
        showMergeCandidates: true,
        showNeedsAttention: true,
        showOnHold: true,
      });
      const ids = sections.map((s) => s.id);
      expect(ids).toContain("getting-started");
      expect(ids).toContain("kb");
      expect(ids).toContain("merge-candidates");
      expect(ids).toContain("needs-attention");
      expect(ids).toContain("on-hold");
    });

    it("includes kb when showKb is true", () => {
      const sections = buildDashboardSections({
        showGettingStarted: false,
        showKb: true,
        showMergeCandidates: false,
        showNeedsAttention: false,
        showOnHold: false,
      });
      expect(sections.some((s) => s.id === "kb")).toBe(true);
    });

    it("omits kb when showKb is false", () => {
      const sections = buildDashboardSections({
        showGettingStarted: false,
        showKb: false,
        showMergeCandidates: false,
        showNeedsAttention: false,
        showOnHold: false,
      });
      expect(sections.some((s) => s.id === "kb")).toBe(false);
    });
  });

  describe("findRegistryEntry", () => {
    it("finds the dashboard entry for '/'", () => {
      const entry = findRegistryEntry("/");
      expect(entry).toBeDefined();
      expect(entry?.route).toBe("/");
    });

    it("finds the organization entry", () => {
      const entry = findRegistryEntry("/admin/organization");
      expect(entry).toBeDefined();
    });

    it("returns undefined for unknown routes", () => {
      const entry = findRegistryEntry("/tickets");
      expect(entry).toBeUndefined();
    });
  });

  describe("getHoverSections", () => {
    it("returns sections for the organization page", () => {
      const perms = new Set([
        Permission.MANAGE_ORG_IDENTITY,
        Permission.MANAGE_KEYS,
        Permission.MANAGE_QUEUES,
      ]);
      const qc = createMockQueryClient();
      const sections = getHoverSections("/admin/organization", perms, qc);
      expect(sections.length).toBeGreaterThan(0);
    });

    it("filters organization sections by per-section permissions", () => {
      const perms = new Set([Permission.MANAGE_ORG_IDENTITY]);
      const qc = createMockQueryClient();
      const sections = getHoverSections("/admin/organization", perms, qc);
      const ids = sections.map((s) => s.id);
      expect(ids).not.toContain("keys");
      expect(ids).not.toContain("intake-forms");
      expect(ids).not.toContain("org-deletion");
      expect(ids).toContain("general");
      expect(ids).toContain("branding");
    });

    it("lists the deletion section only for REQUEST_ORG_DELETION", () => {
      const perms = new Set([Permission.REQUEST_ORG_DELETION]);
      const qc = createMockQueryClient();
      const sections = getHoverSections("/admin/organization", perms, qc);
      expect(sections.map((s) => s.id)).toEqual(["org-deletion"]);
    });

    it("returns empty for routes not in the registry", () => {
      const perms = new Set([Permission.MANAGE_ORG_IDENTITY]);
      const qc = createMockQueryClient();
      const sections = getHoverSections("/tickets", perms, qc);
      expect(sections).toHaveLength(0);
    });

    it("returns empty when caller holds none of the section permissions", () => {
      const perms = new Set<Permission>();
      const qc = createMockQueryClient();
      const sections = getHoverSections("/admin/organization", perms, qc);
      expect(sections).toHaveLength(0);
    });

    it("returns dashboard sections for '/' (cache-derived flags)", () => {
      const perms = new Set<Permission>();
      const qc = createMockQueryClient();
      const sections = getHoverSections("/", perms, qc);
      expect(sections.some((s) => s.id === "shift")).toBe(true);
    });

    it("includes getting-started in hover when cache has checklist and user has MANAGE_ORG_IDENTITY", () => {
      const cache = {
        [JSON.stringify(["dashboard", "setupChecklist"])]: {
          dismissed: false,
          items: [{ id: "1" }],
        },
      };
      const qc = createMockQueryClient(cache);
      const perms = new Set([Permission.MANAGE_ORG_IDENTITY]);
      const sections = getHoverSections("/", perms, qc);
      expect(sections.some((s) => s.id === "getting-started")).toBe(true);
    });

    it("omits getting-started in hover when checklist is dismissed", () => {
      const cache = {
        [JSON.stringify(["dashboard", "setupChecklist"])]: {
          dismissed: true,
          items: [{ id: "1" }],
        },
      };
      const qc = createMockQueryClient(cache);
      const perms = new Set([Permission.MANAGE_ROLES]);
      const sections = getHoverSections("/", perms, qc);
      expect(sections.some((s) => s.id === "getting-started")).toBe(false);
    });

    it("lists all four ticket lanes on hover with nothing cached", () => {
      const qc = createMockQueryClient();
      const sections = getHoverSections("/", new Set<Permission>(), qc);
      const ids = sections.map((s) => s.id);
      expect(ids).toEqual(
        expect.arrayContaining([
          "needs-attention",
          "my-tickets",
          "unassigned",
          "on-hold",
        ]),
      );
    });

    it("includes merge-candidates in hover when the scan found an undismissed pair", () => {
      const cache = {
        [JSON.stringify(["clients", "mergeCandidates"])]: {
          candidates: [
            { clientIdA: "a", clientIdB: "b" },
            { clientIdA: "c", clientIdB: "d" },
          ],
          truncated: false,
        },
        [JSON.stringify(["clients", "dismissals"])]: new Set(["a:b"]),
      };
      const qc = createMockQueryClient(cache);
      const perms = new Set([Permission.VIEW_CLIENTS]);
      const sections = getHoverSections("/", perms, qc);
      expect(sections.some((s) => s.id === "merge-candidates")).toBe(true);
    });

    it("omits merge-candidates in hover when every pair is dismissed", () => {
      const cache = {
        [JSON.stringify(["clients", "mergeCandidates"])]: {
          candidates: [{ clientIdA: "a", clientIdB: "b" }],
          truncated: false,
        },
        [JSON.stringify(["clients", "dismissals"])]: new Set(["a:b"]),
      };
      const qc = createMockQueryClient(cache);
      const perms = new Set([Permission.VIEW_CLIENTS]);
      const sections = getHoverSections("/", perms, qc);
      expect(sections.some((s) => s.id === "merge-candidates")).toBe(false);
    });

    it("omits merge-candidates in hover without the view-clients permission", () => {
      const cache = {
        [JSON.stringify(["clients", "mergeCandidates"])]: {
          candidates: [{ clientIdA: "a", clientIdB: "b" }],
          truncated: false,
        },
      };
      const qc = createMockQueryClient(cache);
      const sections = getHoverSections("/", new Set<Permission>(), qc);
      expect(sections.some((s) => s.id === "merge-candidates")).toBe(false);
    });
  });
});
