/**
 * Unit tests for org resolution utilities.
 *
 * Covers: extractSubdomain (subdomain extraction, port stripping, bare
 * domains, empty/missing host) and readDevSlugHeader (present, empty, absent).
 *
 * These are pure functions with no SvelteKit dependencies, tested directly.
 * The Handle wiring in hooks.server.ts is thin glue covered by E2E tests.
 */

import { describe, it, expect } from "vitest";
import { extractSubdomain, readDevSlugHeader } from "./org-resolution.js";

// ─── extractSubdomain ──────────────────────────────────────────────

describe("extractSubdomain", () => {
  it("extracts subdomain from a three-part hostname", () => {
    expect(extractSubdomain("testorg.care-y.app")).toBe("testorg");
  });

  it("strips port before extracting subdomain", () => {
    expect(extractSubdomain("testorg.care-y.app:443")).toBe("testorg");
  });

  it("handles deeply nested subdomains (takes the first part)", () => {
    expect(extractSubdomain("deep.sub.care-y.app")).toBe("deep");
  });

  it("returns null for a bare domain (two parts)", () => {
    expect(extractSubdomain("care-y.app")).toBeNull();
  });

  it("returns null for localhost (single part)", () => {
    expect(extractSubdomain("localhost")).toBeNull();
  });

  it("returns null for localhost with port", () => {
    expect(extractSubdomain("localhost:5173")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(extractSubdomain("")).toBeNull();
  });

  it("returns null when port-stripping leaves an empty hostname", () => {
    expect(extractSubdomain(":443")).toBeNull();
  });
});

// ─── readDevSlugHeader ─────────────────────────────────────────────

describe("readDevSlugHeader", () => {
  it("returns the header value when present and non-empty", () => {
    const headers = new Headers({ "x-org-slug": "testorg" });
    expect(readDevSlugHeader(headers)).toBe("testorg");
  });

  it("returns null when the header is absent", () => {
    const headers = new Headers();
    expect(readDevSlugHeader(headers)).toBeNull();
  });

  it("returns null when the header is an empty string", () => {
    const headers = new Headers({ "x-org-slug": "" });
    expect(readDevSlugHeader(headers)).toBeNull();
  });
});
