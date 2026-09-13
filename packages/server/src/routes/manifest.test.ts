/**
 * Tests for the dynamic PWA manifest handler.
 *
 * Pure unit suite: org resolution and branding reads are injected, so no
 * DB is needed. The org slug reaches the handler through the x-org-slug
 * header (non-production path of extractOrgSlug).
 */

import { describe, it, expect, vi } from "vitest";
import type { IncomingMessage, ServerResponse } from "node:http";
import type {
  OrgId,
  OrgSlug,
  OrgSchema,
  PublicBrandingData,
} from "@care-y/shared";
import { createManifestHandler, type ManifestHandlerDeps } from "./manifest.js";

function mockReq(
  method: string,
  headers: Record<string, string> = {},
): IncomingMessage {
  return {
    method,
    url: "/manifest.webmanifest",
    headers,
  } as unknown as IncomingMessage;
}

function mockRes(): ServerResponse & {
  statusCode: number;
  headers: Record<string, string>;
  body: string | null;
} {
  const res = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    body: null as string | null,
    writeHead(code: number, headers?: Record<string, string>) {
      res.statusCode = code;
      if (headers) res.headers = headers;
    },
    end(data?: string) {
      if (typeof data === "string") res.body = data;
    },
  };
  return res as unknown as ReturnType<typeof mockRes>;
}

const NO_BRANDING: PublicBrandingData = {
  orgPublicKey: null,
  name: null,
  primaryColor: null,
  accentColor: null,
  clientText: null,
  supportLabel: null,
  hasIcons: false,
  iconVersion: null,
  safeExitUrl: null,
};

function buildDeps(
  branding: PublicBrandingData,
  overrides?: Partial<ManifestHandlerDeps>,
): ManifestHandlerDeps {
  return {
    orgService: {
      findBySlug: vi.fn(async () => ({
        id: "org-id" as OrgId,
        slug: "test" as OrgSlug,
        schemaName: "org_test" as OrgSchema,
        isActive: true,
      })),
      findById: vi.fn(async () => null),
      createOrg: vi.fn(async () => ({
        id: "org-id" as OrgId,
        slug: "test" as OrgSlug,
        schemaName: "org_test" as OrgSchema,
        isActive: true,
        setupToken: "token",
      })),
      validateSetupToken: vi.fn(async () => false),
      consumeSetupToken: vi.fn(async () => undefined),
    },
    createBrandingSvc: vi.fn(() => ({
      getPublicBranding: vi.fn(async () => branding),
    })),
    ...overrides,
  };
}

interface ParsedManifest {
  name: string;
  short_name: string;
  theme_color: string;
  icons: { src: string; purpose?: string }[];
}

function parseManifest(res: ReturnType<typeof mockRes>): ParsedManifest {
  if (res.body === null) throw new Error("no manifest body");
  // care-y-ignore-next-line no-unsafe-type-assertion -- test-local narrowing of the handler's own JSON output
  return JSON.parse(res.body) as ParsedManifest;
}

describe("createManifestHandler", () => {
  it("returns 405 for non-GET methods", async () => {
    const handler = createManifestHandler(buildDeps(NO_BRANDING));
    const res = mockRes();
    await handler(mockReq("POST"), res);
    expect(res.statusCode).toBe(405);
  });

  it("serves the default manifest when no org slug resolves", async () => {
    const deps = buildDeps(NO_BRANDING, {
      orgService: {
        findBySlug: vi.fn(async () => null),
        findById: vi.fn(async () => null),
        createOrg: vi.fn(async () => ({
          id: "org-id" as OrgId,
          slug: "test" as OrgSlug,
          schemaName: "org_test" as OrgSchema,
          isActive: true,
          setupToken: "token",
        })),
        validateSetupToken: vi.fn(async () => false),
        consumeSetupToken: vi.fn(async () => undefined),
      },
    });
    const handler = createManifestHandler(deps);
    const res = mockRes();
    await handler(mockReq("GET", { "x-org-slug": "missing" }), res);

    const manifest = parseManifest(res);
    expect(res.statusCode).toBe(200);
    expect(manifest.name).toBe("CARE-Y");
    expect(manifest.icons.map((i) => i.src)).toEqual([
      "/icon-192.png",
      "/icon-512.png",
    ]);
  });

  it("serves the org name and theme color from public branding", async () => {
    const handler = createManifestHandler(
      buildDeps({
        ...NO_BRANDING,
        name: "Harbor Support",
        primaryColor: "#4A90D9",
      }),
    );
    const res = mockRes();
    await handler(mockReq("GET", { "x-org-slug": "test" }), res);

    const manifest = parseManifest(res);
    expect(manifest.name).toBe("Harbor Support");
    expect(manifest.short_name).toBe("Harbor Support");
    expect(manifest.theme_color).toBe("#4A90D9");
  });

  it("emits versioned per-org icon URLs when icons exist", async () => {
    const handler = createManifestHandler(
      buildDeps({ ...NO_BRANDING, hasIcons: true, iconVersion: "abcd1234" }),
    );
    const res = mockRes();
    await handler(mockReq("GET", { "x-org-slug": "test" }), res);

    const manifest = parseManifest(res);
    expect(manifest.icons.map((i) => i.src)).toEqual([
      "/api/branding/test/icon-192.png?v=abcd1234",
      "/api/branding/test/icon-512.png?v=abcd1234",
      "/api/branding/test/icon-maskable.png?v=abcd1234",
    ]);
    expect(manifest.icons[2]?.purpose).toBe("maskable");
  });

  it("falls back to defaults when the branding read throws", async () => {
    const handler = createManifestHandler(
      buildDeps(NO_BRANDING, {
        createBrandingSvc: vi.fn(() => ({
          getPublicBranding: vi.fn(async () => {
            throw new Error("db down");
          }),
        })),
      }),
    );
    const res = mockRes();
    await handler(mockReq("GET", { "x-org-slug": "test" }), res);

    const manifest = parseManifest(res);
    expect(res.statusCode).toBe(200);
    expect(manifest.name).toBe("CARE-Y");
  });
});
