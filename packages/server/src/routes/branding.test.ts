/**
 * Unit tests for the branding tRPC router.
 *
 * Tests router structure and procedure wiring.
 * Full DB integration tests run inside Docker via pnpm test:server:db.
 */

import { describe, it, expect, vi } from "vitest";
import { createBrandingRouter, type BrandingRouterDeps } from "./branding.js";

function buildDeps(): BrandingRouterDeps {
  return {
    blobStore: {
      put: vi.fn(async () => "blob-key"),
      get: vi.fn(async () => null),
      delete: vi.fn(async () => undefined),
      exists: vi.fn(async () => false),
    },
  };
}

describe("createBrandingRouter", () => {
  it("creates a router without errors", () => {
    const routerInstance = createBrandingRouter(buildDeps());
    expect(routerInstance).toBeDefined();
  });

  it("router exposes all expected procedures", () => {
    const routerInstance = createBrandingRouter(buildDeps());
    const keys = Object.keys(routerInstance._def.procedures);
    expect(keys).toContain("getBranding");
    expect(keys).toContain("saveBrandingField");
    expect(keys).toContain("uploadIcons");
  });
});
