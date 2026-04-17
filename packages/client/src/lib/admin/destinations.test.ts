import { describe, it, expect } from "vitest";
import { Permission } from "@care-y/shared";
import {
  ADMIN_DESTINATIONS,
  GROUP_ORDER,
  GROUP_LABEL_KEYS,
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

  it("GROUP_LABEL_KEYS has an entry for each group in GROUP_ORDER", () => {
    for (const group of GROUP_ORDER) {
      expect(GROUP_LABEL_KEYS[group]).toBeDefined();
      expect(GROUP_LABEL_KEYS[group].length).toBeGreaterThan(0);
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

  it("people group contains users and queues", () => {
    const grouped = groupDestinations(ADMIN_DESTINATIONS);
    const people = grouped.get("people") ?? [];

    expect(people.map((d) => d.id)).toEqual(["users", "queues"]);
  });

  it("returns empty map for empty input", () => {
    const grouped = groupDestinations([]);

    expect(grouped.size).toBe(0);
  });

  it("preserves insertion order within groups", () => {
    const grouped = groupDestinations(ADMIN_DESTINATIONS);
    const org = grouped.get("organization") ?? [];
    const ids = org.map((d) => d.id);

    expect(ids).toEqual(["branding", "keys", "retention", "reports"]);
  });
});
