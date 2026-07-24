import { describe, it, expect } from "vitest";
import { extractSubdomain } from "./subdomain.js";

describe("extractSubdomain", () => {
  it("returns the first subdomain from a standard three-part host", () => {
    expect(extractSubdomain("acme.care-y.app")).toBe("acme");
  });

  it("returns null for a bare two-part domain (no subdomain)", () => {
    expect(extractSubdomain("care-y.app")).toBeNull();
  });

  it("returns null for localhost", () => {
    expect(extractSubdomain("localhost")).toBeNull();
  });

  it("returns null for localhost with port", () => {
    expect(extractSubdomain("localhost:5173")).toBeNull();
  });

  it("returns the first label from a deep multi-part host", () => {
    expect(extractSubdomain("a.b.c.d")).toBe("a");
  });

  it("returns null for an empty host string", () => {
    expect(extractSubdomain("")).toBeNull();
  });

  it("strips port before extracting the subdomain", () => {
    expect(extractSubdomain("acme.care-y.app:443")).toBe("acme");
  });

  it("returns null when host is only a port", () => {
    expect(extractSubdomain(":443")).toBeNull();
  });
});
