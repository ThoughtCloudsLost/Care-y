import { describe, it, expect, vi } from "vitest";
import {
  buildVolunteerMap,
  resolveVolunteerName,
  type VolunteerRecord,
} from "./resolve-volunteer.js";

const vol1: VolunteerRecord = {
  id: "v1",
  encryptedDisplayName: new Uint8Array([1, 2, 3]),
};
const vol2: VolunteerRecord = { id: "v2", encryptedDisplayName: null };

function mockOrgCache(result: string | null) {
  return { decrypt: vi.fn(() => result) } as unknown as Parameters<
    typeof resolveVolunteerName
  >[2];
}

describe("buildVolunteerMap", () => {
  it("builds a Map keyed by volunteer id", () => {
    const map = buildVolunteerMap([vol1, vol2]);
    expect(map.size).toBe(2);
    expect(map.get("v1")).toBe(vol1);
    expect(map.get("v2")).toBe(vol2);
  });

  it("returns empty Map for null input", () => {
    expect(buildVolunteerMap(null).size).toBe(0);
  });

  it("returns empty Map for undefined input", () => {
    expect(buildVolunteerMap(undefined).size).toBe(0);
  });

  it("returns empty Map for empty array", () => {
    expect(buildVolunteerMap([]).size).toBe(0);
  });
});

describe("resolveVolunteerName", () => {
  it("returns decrypted name for a known volunteer", () => {
    const map = buildVolunteerMap([vol1]);
    expect(resolveVolunteerName("v1", map, mockOrgCache("Alice"))).toBe(
      "Alice",
    );
  });

  it("returns undefined for null userId", () => {
    const map = buildVolunteerMap([vol1]);
    expect(
      resolveVolunteerName(null, map, mockOrgCache("Alice")),
    ).toBeUndefined();
  });

  it("returns undefined for unknown userId", () => {
    const map = buildVolunteerMap([vol1]);
    expect(
      resolveVolunteerName("unknown", map, mockOrgCache("Alice")),
    ).toBeUndefined();
  });

  it("returns undefined when cache decrypt returns null", () => {
    const map = buildVolunteerMap([vol1]);
    expect(resolveVolunteerName("v1", map, mockOrgCache(null))).toBeUndefined();
  });

  it("passes volunteer:id as the cache key", () => {
    // The cache key format "volunteer:{id}" is shared across OrgDecryptCache
    // consumers. Changing it would break cross-caller cache dedup.
    const map = buildVolunteerMap([vol1]);
    const cache = mockOrgCache("Alice");
    resolveVolunteerName("v1", map, cache);
    expect(cache.decrypt).toHaveBeenCalledWith(
      "volunteer:v1",
      vol1.encryptedDisplayName,
    );
  });
});
