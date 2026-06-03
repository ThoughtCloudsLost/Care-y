import { describe, it, expect } from "vitest";
import { Permission } from "@care-y/shared";
import {
  ADMIN_DESTINATIONS,
  GROUP_ORDER,
  getVisibleDestinations,
  groupDestinations,
  type AdminGroup,
} from "./destinations";

describe("ADMIN_DESTINATIONS", () => {
  it("all destinations have callable label and subtitle functions", () => {
    for (const dest of ADMIN_DESTINATIONS) {
      expect(typeof dest.label).toBe("function");
      expect(typeof dest.subtitle).toBe("function");
      expect(dest.label().length).toBeGreaterThan(0);
      expect(dest.subtitle().length).toBeGreaterThan(0);
    }
  });

  it("all paths start with /admin/", () => {
    for (const dest of ADMIN_DESTINATIONS) {
      expect(dest.path.startsWith("/admin/")).toBe(true);
    }
  });

  it("all destinations have unique ids", () => {
    const ids = ADMIN_DESTINATIONS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all destination groups are in GROUP_ORDER", () => {
    const groups = new Set<AdminGroup>(ADMIN_DESTINATIONS.map((d) => d.group));
    for (const group of groups) {
      expect(GROUP_ORDER).toContain(group);
    }
  });
});

describe("getVisibleDestinations", () => {
  it("returns only destinations matching the permission set", () => {
    const permissions = new Set([Permission.MANAGE_USERS]);
    const visible = getVisibleDestinations(permissions);

    expect(visible.length).toBe(1);
    expect(visible[0]!.id).toBe("users");
  });

  it("returns multiple destinations for overlapping permissions", () => {
    const permissions = new Set([
      Permission.MANAGE_USERS,
      Permission.MANAGE_QUEUES,
    ]);
    const visible = getVisibleDestinations(permissions);

    expect(visible.length).toBe(2);
    expect(visible.map((d) => d.id)).toEqual(["users", "queues"]);
  });

  it("returns empty array when no permissions match", () => {
    const permissions = new Set([Permission.VIEW_TICKETS]);
    const visible = getVisibleDestinations(permissions);

    expect(visible).toEqual([]);
  });

  it("returns all destinations for a full admin permission set", () => {
    const permissions = new Set([
      Permission.MANAGE_USERS,
      Permission.MANAGE_QUEUES,
      Permission.MANAGE_INFRASTRUCTURE,
      Permission.MANAGE_ORG_CONFIG,
      Permission.MANAGE_KEYS,
      Permission.VIEW_REPORTS,
    ]);
    const visible = getVisibleDestinations(permissions);

    expect(visible.length).toBe(ADMIN_DESTINATIONS.length);
  });
});

describe("groupDestinations", () => {
  it("groups destinations by their group field", () => {
    const grouped = groupDestinations(ADMIN_DESTINATIONS);

    expect(grouped.has("people")).toBe(true);
    expect(grouped.has("communications")).toBe(true);
    expect(grouped.has("organization")).toBe(true);
  });

  // Render order within groups is user-facing (admin hub lists items top-to-bottom).
  it("people group contains users and queues in render order", () => {
    const grouped = groupDestinations(ADMIN_DESTINATIONS);
    const people = grouped.get("people") ?? [];

    expect(people.map((d) => d.id)).toEqual(["users", "queues"]);
  });

  it("returns empty map for empty input", () => {
    const grouped = groupDestinations([]);

    expect(grouped.size).toBe(0);
  });

  // Render order within groups is user-facing (admin hub lists items top-to-bottom).
  it("preserves insertion order within groups", () => {
    const grouped = groupDestinations(ADMIN_DESTINATIONS);
    const org = grouped.get("organization") ?? [];
    const ids = org.map((d) => d.id);

    expect(ids).toEqual([
      "general",
      "branding",
      "terminology",
      "keys",
      "retention",
      "note-types",
    ]);
  });
});

describe("communications destinations", () => {
  const commsIds = ["telephony", "blocklist", "greetings", "sms-templates"];
  const commsDests = ADMIN_DESTINATIONS.filter((d) => commsIds.includes(d.id));

  it("all communications destinations are implemented", () => {
    for (const dest of commsDests) {
      expect(dest.implemented).toBe(true);
    }
  });

  it("all communications paths point to /admin/communications?tab=...", () => {
    for (const dest of commsDests) {
      expect(dest.path).toMatch(/^\/admin\/communications\?tab=/);
    }
  });

  it("telephony path targets the telephony tab", () => {
    const telephony = commsDests.find((d) => d.id === "telephony");
    expect(telephony?.path).toBe("/admin/communications?tab=telephony");
  });

  it("blocklist path targets the blocklist tab", () => {
    const blocklist = commsDests.find((d) => d.id === "blocklist");
    expect(blocklist?.path).toBe("/admin/communications?tab=blocklist");
  });

  it("greetings path targets the greetings tab", () => {
    const greetings = commsDests.find((d) => d.id === "greetings");
    expect(greetings?.path).toBe("/admin/communications?tab=greetings");
  });

  it("sms-templates path targets the templates tab", () => {
    const templates = commsDests.find((d) => d.id === "sms-templates");
    expect(templates?.path).toBe("/admin/communications?tab=templates");
  });

  it("all communications destinations require MANAGE_INFRASTRUCTURE", () => {
    for (const dest of commsDests) {
      expect(dest.permission).toBe(Permission.MANAGE_INFRASTRUCTURE);
    }
  });
});
