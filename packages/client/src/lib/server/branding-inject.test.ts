/**
 * Unit tests for server-side branding injection.
 *
 * Every exported function has a block here. The escaping, slug validation,
 * and exit URL cases are the load-bearing ones, since each guards a value
 * that admin-authored text reaches the browser through.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  escapeHtml,
  isInjectableSlug,
  resolveInjectionSlug,
  buildBrandStyle,
  parseBrandingEnvelope,
  buildInjectedBranding,
  applyBrandingToHtml,
  loadInjectedBranding,
  _resetBrandingCacheForTesting,
  BRANDING_CACHE_TTL_MS,
  type InjectedBranding,
} from "./branding-inject.js";

// ---------------------------------------------------------------------------
// escapeHtml
// ---------------------------------------------------------------------------

describe("escapeHtml", () => {
  it("escapes ampersand", () => {
    expect(escapeHtml("a&b")).toBe("a&amp;b");
  });

  it("escapes less-than", () => {
    expect(escapeHtml("a<b")).toBe("a&lt;b");
  });

  it("escapes greater-than", () => {
    expect(escapeHtml("a>b")).toBe("a&gt;b");
  });

  it("escapes double quote", () => {
    expect(escapeHtml('a"b')).toBe("a&quot;b");
  });

  it("escapes single quote", () => {
    expect(escapeHtml("a'b")).toBe("a&#39;b");
  });

  it("does not double-escape an existing entity", () => {
    expect(escapeHtml("&amp;")).toBe("&amp;amp;");
  });
});

// ---------------------------------------------------------------------------
// isInjectableSlug
// ---------------------------------------------------------------------------

describe("isInjectableSlug", () => {
  it("accepts a normal slug", () => {
    expect(isInjectableSlug("test-org")).toBe(true);
  });

  it("rejects null", () => {
    expect(isInjectableSlug(null)).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isInjectableSlug("")).toBe(false);
  });

  it("rejects uppercase letters", () => {
    expect(isInjectableSlug("TestOrg")).toBe(false);
  });

  it("rejects a leading hyphen", () => {
    expect(isInjectableSlug("-bad")).toBe(false);
  });

  it("rejects a path traversal attempt", () => {
    expect(isInjectableSlug("a/b")).toBe(false);
  });

  it("rejects a reserved slug", () => {
    expect(isInjectableSlug("admin")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// resolveInjectionSlug
// ---------------------------------------------------------------------------

describe("resolveInjectionSlug", () => {
  it("in dev, takes the dev slug and ignores the locals slug", () => {
    expect(resolveInjectionSlug("locals-org", true, "dev-org")).toBe("dev-org");
  });

  it("in production, takes the locals slug", () => {
    expect(resolveInjectionSlug("prod-org", false, "dev-org")).toBe("prod-org");
  });

  it("returns null when the dev slug is invalid", () => {
    expect(resolveInjectionSlug("locals-org", true, "INVALID")).toBeNull();
  });

  it("returns null when the production locals slug is invalid", () => {
    expect(resolveInjectionSlug("a/b", false, "dev-org")).toBeNull();
  });

  it("returns null when the production locals slug is null", () => {
    expect(resolveInjectionSlug(null, false, "dev-org")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// buildBrandStyle
// ---------------------------------------------------------------------------

describe("buildBrandStyle", () => {
  it("emits both custom properties for a valid primary", () => {
    const style = buildBrandStyle("#1a2b3c", null);
    expect(style).toContain("--brand-primary:#1a2b3c");
    expect(style).toContain("--k-color-primary:rgb(26 43 60)");
  });

  it("drops an invalid hex (3-digit)", () => {
    expect(buildBrandStyle("#abc", null)).toBe("");
  });

  it("drops an invalid hex (no hash)", () => {
    expect(buildBrandStyle("1a2b3c", null)).toBe("");
  });

  it("includes a valid accent", () => {
    const style = buildBrandStyle(null, "#ff0000");
    expect(style).toBe("--brand-accent:#ff0000");
  });

  it("emits both primary and accent when both are valid", () => {
    const style = buildBrandStyle("#000000", "#ffffff");
    expect(style).toContain("--brand-primary:#000000");
    expect(style).toContain("--brand-accent:#ffffff");
  });

  it("returns empty string when nothing is valid", () => {
    expect(buildBrandStyle(null, null)).toBe("");
  });
});

// ---------------------------------------------------------------------------
// parseBrandingEnvelope
// ---------------------------------------------------------------------------

describe("parseBrandingEnvelope", () => {
  const wellFormed = {
    result: {
      data: {
        name: "Test Org",
        primaryColor: "#112233",
        accentColor: "#445566",
        supportLabel: "Our team",
        hasIcons: true,
        iconVersion: "v1",
        safeExitUrl: "https://example.com",
      },
    },
  };

  it("parses a well-formed envelope", () => {
    const parsed = parseBrandingEnvelope(wellFormed);
    expect(parsed).toEqual({
      name: "Test Org",
      primaryColor: "#112233",
      accentColor: "#445566",
      supportLabel: "Our team",
      hasIcons: true,
      iconVersion: "v1",
      safeExitUrl: "https://example.com",
    });
  });

  it("returns null for a missing result", () => {
    expect(parseBrandingEnvelope({ data: {} })).toBeNull();
  });

  it("returns null for a missing data", () => {
    expect(parseBrandingEnvelope({ result: {} })).toBeNull();
  });

  it("returns null when hasIcons is not a boolean", () => {
    expect(
      parseBrandingEnvelope({
        result: { data: { hasIcons: "yes" } },
      }),
    ).toBeNull();
  });

  it("returns null for a non-object input", () => {
    expect(parseBrandingEnvelope("not an object")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(parseBrandingEnvelope(null)).toBeNull();
  });

  it("treats non-string name as null", () => {
    const body = {
      result: {
        data: {
          name: 42,
          primaryColor: "#aabbcc",
          hasIcons: false,
        },
      },
    };
    const parsed = parseBrandingEnvelope(body);
    expect(parsed?.name).toBeNull();
  });

  it("treats non-string primaryColor as null", () => {
    const body = {
      result: {
        data: {
          name: "Org",
          primaryColor: 999,
          hasIcons: false,
        },
      },
    };
    const parsed = parseBrandingEnvelope(body);
    expect(parsed?.primaryColor).toBeNull();
  });

  it("handles script tag in name (wire-level, not yet escaped)", () => {
    const body = {
      result: {
        data: {
          name: '<script>alert("xss")</script>',
          hasIcons: false,
        },
      },
    };
    const parsed = parseBrandingEnvelope(body);
    expect(parsed?.name).toBe('<script>alert("xss")</script>');
  });

  it("handles url(evil) in color fields by returning the string as-is", () => {
    const body = {
      result: {
        data: {
          primaryColor: "url(evil)",
          accentColor: "url(data:image/svg)",
          hasIcons: false,
        },
      },
    };
    const parsed = parseBrandingEnvelope(body);
    // parseBrandingEnvelope reads strings without validating; buildInjectedBranding
    // is where isValidHexColor gates them.
    expect(parsed?.primaryColor).toBe("url(evil)");
    expect(parsed?.accentColor).toBe("url(data:image/svg)");
  });
});

// ---------------------------------------------------------------------------
// buildInjectedBranding
// ---------------------------------------------------------------------------

describe("buildInjectedBranding", () => {
  const baseResponse = {
    name: null,
    primaryColor: null,
    accentColor: null,
    supportLabel: null,
    hasIcons: false,
    iconVersion: null,
    safeExitUrl: null,
  };

  it("sanitises the org name", () => {
    const b = buildInjectedBranding(
      { ...baseResponse, name: "Good <script>bad</script> Org" },
      "test-org",
    );
    expect(b.orgName).toBe("Good bad Org");
  });

  it("returns null orgName when name is empty after sanitisation", () => {
    const b = buildInjectedBranding({ ...baseResponse, name: "" }, "test-org");
    expect(b.orgName).toBeNull();
  });

  it("returns null orgName when name is null", () => {
    const b = buildInjectedBranding(baseResponse, "test-org");
    expect(b.orgName).toBeNull();
  });

  it("returns valid primary colour", () => {
    const b = buildInjectedBranding(
      { ...baseResponse, primaryColor: "#aabbcc" },
      "test-org",
    );
    expect(b.primaryColor).toBe("#aabbcc");
  });

  it("returns null for an invalid primary colour", () => {
    const b = buildInjectedBranding(
      { ...baseResponse, primaryColor: "red" },
      "test-org",
    );
    expect(b.primaryColor).toBeNull();
  });

  it("rejects url(evil) as a primary colour", () => {
    const b = buildInjectedBranding(
      { ...baseResponse, primaryColor: "url(evil)" },
      "test-org",
    );
    expect(b.primaryColor).toBeNull();
  });

  it("returns null for an invalid accent colour", () => {
    const b = buildInjectedBranding(
      { ...baseResponse, accentColor: "#abc" },
      "test-org",
    );
    expect(b.accentColor).toBeNull();
  });

  it("builds iconUrl when hasIcons is true", () => {
    const b = buildInjectedBranding(
      { ...baseResponse, hasIcons: true, iconVersion: "v2" },
      "test-org",
    );
    expect(b.iconUrl).toBe("/api/branding/test-org/icon-192.png?v=v2");
  });

  it("returns null iconUrl when hasIcons is false", () => {
    const b = buildInjectedBranding(baseResponse, "test-org");
    expect(b.iconUrl).toBeNull();
  });

  it("accepts a valid safe exit URL", () => {
    const b = buildInjectedBranding(
      { ...baseResponse, safeExitUrl: "https://weather.com" },
      "test-org",
    );
    expect(b.safeExitUrl).toBe("https://weather.com");
  });

  it("rejects a non-https exit URL", () => {
    const b = buildInjectedBranding(
      { ...baseResponse, safeExitUrl: "http://weather.com" },
      "test-org",
    );
    expect(b.safeExitUrl).toBeNull();
  });

  it("rejects a malformed exit URL", () => {
    const b = buildInjectedBranding(
      { ...baseResponse, safeExitUrl: "not-a-url" },
      "test-org",
    );
    expect(b.safeExitUrl).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// applyBrandingToHtml
// ---------------------------------------------------------------------------

describe("applyBrandingToHtml", () => {
  const template = [
    '<html style="%carey.brandStyle%" data-org-name="%carey.orgName%" data-safe-exit-url="%carey.safeExitUrl%">',
    "<head>%carey.touchIcon%</head>",
    '<body><img id="splash-logo" %carey.splashLogoSrc% />',
    '<span id="splash-name">%carey.splashName%</span></body></html>',
  ].join("");

  it("replaces every placeholder when values are present", () => {
    const values: InjectedBranding = {
      orgName: "Test Org",
      primaryColor: "#112233",
      accentColor: "#445566",
      iconUrl: "/api/branding/test-org/icon-192.png",
      safeExitUrl: "https://weather.com",
    };

    const html = applyBrandingToHtml(template, values);

    expect(html).toContain("--brand-primary:#112233");
    expect(html).toContain('data-org-name="Test Org"');
    expect(html).toContain('data-safe-exit-url="https://weather.com"');
    expect(html).toContain('rel="apple-touch-icon"');
    expect(html).toContain('src="/api/branding/test-org/icon-192.png"');
    expect(html).toContain(">Test Org</span>");
    expect(html).not.toContain("%carey.");
  });

  it("replaces every placeholder when values is null", () => {
    const html = applyBrandingToHtml(template, null);
    expect(html).not.toContain("%carey.");
    // Null branding leaves an empty splash name, not the product name.
    // A client surface should not advertise "CARE-Y" when the org is unknown.
    expect(html).toContain("></span>");
    expect(html).not.toContain(">CARE-Y</span>");
    expect(html).toContain('data-org-name=""');
  });

  it("uses the org name for splashName when orgName is present", () => {
    const values: InjectedBranding = {
      orgName: "Harbor House",
      primaryColor: null,
      accentColor: null,
      iconUrl: null,
      safeExitUrl: null,
    };

    const html = applyBrandingToHtml(template, values);
    expect(html).toContain(">Harbor House</span>");
  });

  it("leaves splashName empty when orgName is null (not the product name)", () => {
    const values: InjectedBranding = {
      orgName: null,
      primaryColor: null,
      accentColor: null,
      iconUrl: null,
      safeExitUrl: null,
    };

    const html = applyBrandingToHtml(template, values);
    expect(html).toContain("></span>");
    expect(html).not.toContain("CARE-Y");
  });

  it("escapes script tags and quotes in the org name", () => {
    const values: InjectedBranding = {
      orgName: "<script>\"xss'</script>",
      primaryColor: null,
      accentColor: null,
      iconUrl: null,
      safeExitUrl: null,
    };

    const html = applyBrandingToHtml(template, values);

    // Attribute context
    expect(html).toContain(
      'data-org-name="&lt;script&gt;&quot;xss&#39;&lt;/script&gt;"',
    );
    // Text node context
    expect(html).toContain(
      "&lt;script&gt;&quot;xss&#39;&lt;/script&gt;</span>",
    );
    expect(html).not.toContain("<script>");
  });

  it("does not re-substitute an org name containing a placeholder token", () => {
    const values: InjectedBranding = {
      orgName: "%carey.splashName%",
      primaryColor: null,
      accentColor: null,
      iconUrl: null,
      safeExitUrl: null,
    };

    const html = applyBrandingToHtml(template, values);

    // The text node should contain the literal escaped token, not "CARE-Y"
    expect(html).toContain("%carey.splashName%</span>");
    // The attribute should also have the escaped token
    expect(html).toContain('data-org-name="%carey.splashName%"');
  });
});

// ---------------------------------------------------------------------------
// loadInjectedBranding
// ---------------------------------------------------------------------------

describe("loadInjectedBranding", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    _resetBrandingCacheForTesting();
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  function makeFetchOk(body: unknown): typeof fetch {
    return vi.fn(
      async () => new Response(JSON.stringify(body), { status: 200 }),
    ) as unknown as typeof fetch;
  }

  function makeFetchFail(): typeof fetch {
    return vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
  }

  function makeFetchNotOk(): typeof fetch {
    return vi.fn(
      async () => new Response("error", { status: 500 }),
    ) as unknown as typeof fetch;
  }

  const goodEnvelope = {
    result: {
      data: {
        name: "Test Org",
        primaryColor: "#aabbcc",
        accentColor: null,
        supportLabel: null,
        hasIcons: true,
        iconVersion: "v1",
        safeExitUrl: "https://weather.com",
      },
    },
  };

  const baseOptions = {
    slug: "test-org",
    origin: "https://test-org.care-y.app",
    isDev: false,
  };

  it("awaits and caches on a cold cache", async () => {
    const fetchImpl = makeFetchOk(goodEnvelope);
    const time = 1000;
    const result = await loadInjectedBranding({
      ...baseOptions,
      fetchImpl,
      now: () => time,
    });

    expect(result).not.toBeNull();
    expect(result?.orgName).toBe("Test Org");
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("does not call fetch again within the TTL", async () => {
    const fetchImpl = makeFetchOk(goodEnvelope);
    let time = 1000;
    const opts = { ...baseOptions, fetchImpl, now: () => time };

    await loadInjectedBranding(opts);
    time += BRANDING_CACHE_TTL_MS - 1;
    const second = await loadInjectedBranding(opts);

    expect(second?.orgName).toBe("Test Org");
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("returns stale value and refreshes in background past TTL", async () => {
    let time = 1000;
    const firstFetch = makeFetchOk(goodEnvelope);

    await loadInjectedBranding({
      ...baseOptions,
      fetchImpl: firstFetch,
      now: () => time,
    });

    time += BRANDING_CACHE_TTL_MS + 1;

    const updatedEnvelope = {
      result: {
        data: {
          name: "Updated Org",
          primaryColor: "#aabbcc",
          accentColor: null,
          supportLabel: null,
          hasIcons: true,
          iconVersion: "v1",
          safeExitUrl: "https://weather.com",
        },
      },
    };

    const secondFetch = makeFetchOk(updatedEnvelope);
    const staleResult = await loadInjectedBranding({
      ...baseOptions,
      fetchImpl: secondFetch,
      now: () => time,
    });

    // Returns the stale value synchronously
    expect(staleResult?.orgName).toBe("Test Org");

    // Wait for background revalidation to complete
    await vi.waitFor(() => {
      expect(secondFetch).toHaveBeenCalledOnce();
    });
  });

  it("returns null on a cold cache fetch failure", async () => {
    const fetchImpl = makeFetchFail();
    const result = await loadInjectedBranding({
      ...baseOptions,
      fetchImpl,
      now: () => 1000,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  // Caching a failure would pin "this org has no branding" for a full
  // interval, blinding every visitor who arrives during it, on the
  // strength of one dropped request.
  it("retries after a cold cache failure instead of caching it", async () => {
    const failing = makeFetchFail();
    await loadInjectedBranding({
      ...baseOptions,
      fetchImpl: failing,
      now: () => 1000,
    });

    const recovered = makeFetchOk(goodEnvelope);
    const second = await loadInjectedBranding({
      ...baseOptions,
      fetchImpl: recovered,
      now: () => 1001,
    });

    expect(recovered).toHaveBeenCalledOnce();
    expect(second?.orgName).toBe("Test Org");
  });

  // A reachable server that answered is a result even when the body is
  // unusable, so it is cached rather than re-asked on every page load.
  it("caches an unusable body rather than re-requesting it", async () => {
    const fetchImpl = makeFetchOk({ nonsense: true });
    let time = 1000;
    const opts = { ...baseOptions, fetchImpl, now: () => time };

    const first = await loadInjectedBranding(opts);
    time += BRANDING_CACHE_TTL_MS - 1;
    const second = await loadInjectedBranding(opts);

    expect(first?.orgName).toBeNull();
    expect(second?.orgName).toBeNull();
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("preserves the previous value on a failing background revalidation", async () => {
    let time = 1000;
    const firstFetch = makeFetchOk(goodEnvelope);

    await loadInjectedBranding({
      ...baseOptions,
      fetchImpl: firstFetch,
      now: () => time,
    });

    time += BRANDING_CACHE_TTL_MS + 1;

    const failingFetch = makeFetchFail();
    const staleResult = await loadInjectedBranding({
      ...baseOptions,
      fetchImpl: failingFetch,
      now: () => time,
    });

    expect(staleResult?.orgName).toBe("Test Org");

    // Wait for the background revalidation to settle
    await vi.waitFor(() => {
      expect(failingFetch).toHaveBeenCalledOnce();
    });

    // Third call should still return the original value
    time += 1;
    const afterFail = await loadInjectedBranding({
      ...baseOptions,
      fetchImpl: makeFetchOk(goodEnvelope),
      now: () => time,
    });
    expect(afterFail?.orgName).toBe("Test Org");
  });

  it("treats a non-ok response as a failure", async () => {
    const fetchImpl = makeFetchNotOk();
    const result = await loadInjectedBranding({
      ...baseOptions,
      fetchImpl,
      now: () => 1000,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("does not share cache entries between different slugs", async () => {
    const firstEnvelope = goodEnvelope;
    const secondEnvelope = {
      result: {
        data: {
          ...goodEnvelope.result.data,
          name: "Beta Org",
        },
      },
    };

    const time = 1000;

    const fetchAlpha = makeFetchOk(firstEnvelope);
    await loadInjectedBranding({
      ...baseOptions,
      slug: "org-alpha",
      fetchImpl: fetchAlpha,
      now: () => time,
    });

    const fetchBeta = makeFetchOk(secondEnvelope);
    const resultB = await loadInjectedBranding({
      ...baseOptions,
      slug: "org-beta",
      fetchImpl: fetchBeta,
      now: () => time,
    });

    expect(resultB?.orgName).toBe("Beta Org");
    expect(fetchAlpha).toHaveBeenCalledOnce();
    expect(fetchBeta).toHaveBeenCalledOnce();
  });

  // Contract tests: the exact URL and header set are the routing contract
  // (branding-inject.ts fetchBranding). Dev goes straight to the API server,
  // mirroring the Vite proxy (same target, same /trpc strip, same x-org-slug
  // header). Prod round-trips the app's own origin so the Host header carries
  // the org subdomain the API resolves from; no slug header is sent there.
  it("sends x-org-slug header in dev mode", async () => {
    const fetchImpl = makeFetchOk(goodEnvelope);
    await loadInjectedBranding({
      ...baseOptions,
      isDev: true,
      fetchImpl,
      now: () => 1000,
    });

    const calledUrl = vi.mocked(fetchImpl).mock.calls[0]?.[0] as string;
    const calledInit = vi.mocked(fetchImpl).mock.calls[0]?.[1] as RequestInit;

    expect(calledUrl).toBe("http://localhost:3000/branding.getPublicBranding");
    expect((calledInit.headers as Record<string, string>)["x-org-slug"]).toBe(
      "test-org",
    );
  });

  it("does not send x-org-slug header in production", async () => {
    const fetchImpl = makeFetchOk(goodEnvelope);
    await loadInjectedBranding({
      ...baseOptions,
      isDev: false,
      fetchImpl,
      now: () => 1000,
    });

    const calledUrl = vi.mocked(fetchImpl).mock.calls[0]?.[0] as string;
    const calledInit = vi.mocked(fetchImpl).mock.calls[0]?.[1] as RequestInit;

    expect(calledUrl).toBe(
      "https://test-org.care-y.app/trpc/branding.getPublicBranding",
    );
    expect(calledInit.headers).toEqual({});
  });
});
