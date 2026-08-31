/**
 * Server-side branding injection for SvelteKit.
 *
 * Substitutes org branding into the HTML template before first paint, so a
 * client sees the org's name, colours and icon without anything being written
 * to their device.
 *
 * Branding fields are plaintext (ADR-094). Safety rests on per-context
 * escaping and validation at the injection point, not on encryption. Each
 * injected value is escaped for the position it lands in, and substitution
 * runs in a single pass so injected content cannot be re-substituted.
 */

import { orgSlugSchema, safeExitUrlSchema } from "@care-y/shared";
import { brandingIconUrl, sanitizeOrgName } from "$lib/branding/index.js";
import { isValidHexColor } from "$lib/branding/color-utils.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface InjectedBranding {
  readonly orgName: string | null;
  readonly primaryColor: string | null;
  readonly accentColor: string | null;
  readonly iconUrl: string | null;
  readonly safeExitUrl: string | null;
}

export interface LoadBrandingOptions {
  readonly slug: string;
  readonly origin: string;
  readonly isDev: boolean;
  readonly fetchImpl?: typeof fetch;
  readonly now?: () => number;
}

/** The `getPublicBranding` fields this module consumes (plaintext). */
export interface PublicBrandingResponse {
  readonly name: string | null;
  readonly primaryColor: string | null;
  readonly accentColor: string | null;
  readonly supportLabel: string | null;
  readonly hasIcons: boolean;
  readonly iconVersion: string | null;
  readonly safeExitUrl: string | null;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/**
 * A reachable server that answered is a result, even when the body turns
 * out to be unusable. Only an unreachable or erroring server is a failure,
 * and only a failure is worth retrying rather than caching.
 */
type FetchOutcome =
  | { readonly ok: true; readonly value: InjectedBranding }
  | { readonly ok: false };

interface CacheEntry {
  readonly payload: InjectedBranding | null;
  readonly fetchedAt: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const BRANDING_CACHE_TTL_MS = 60_000;

/**
 * In dev, requests go directly to the API server, mirroring the Vite proxy
 * in packages/client/vite.config.ts (same target, same rewrite, same header).
 */
const DEV_API_ORIGIN = "http://localhost:3000";

// ---------------------------------------------------------------------------
// Module-scope cache
// ---------------------------------------------------------------------------

const cache = new Map<string, CacheEntry>();
const inFlightRevalidations = new Map<string, Promise<void>>();

/**
 * Clear both the entry cache and the in-flight revalidation map.
 * @internal Test-only. Not part of the public API.
 */
export function _resetBrandingCacheForTesting(): void {
  cache.clear();
  inFlightRevalidations.clear();
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Escape characters meaningful in HTML attributes and text nodes. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Returns true when the slug passes the org slug schema. */
export function isInjectableSlug(slug: string | null): slug is string {
  return slug !== null && orgSlugSchema.safeParse(slug).success;
}

/**
 * Pick the slug used for branding injection.
 *
 * In dev the browser's document request carries no org header and the dev
 * host has no real org subdomain, so the configured dev slug is the only
 * correct source. In production the locals slug comes from the Host header.
 */
export function resolveInjectionSlug(
  localsSlug: string | null,
  isDev: boolean,
  devSlug: string,
): string | null {
  const candidate = isDev ? devSlug : localsSlug;
  return isInjectableSlug(candidate) ? candidate : null;
}

/**
 * Build a CSS `style` attribute value from validated branding colours.
 *
 * Konsta needs its primary as `rgb(r g b)` on `--k-color-primary`,
 * so both custom properties are emitted for a valid primary.
 */
export function buildBrandStyle(
  primary: string | null,
  accent: string | null,
): string {
  const parts: string[] = [];

  if (primary !== null && isValidHexColor(primary)) {
    const r = parseInt(primary.slice(1, 3), 16);
    const g = parseInt(primary.slice(3, 5), 16);
    const b = parseInt(primary.slice(5, 7), 16);
    parts.push(`--brand-primary:${primary}`);
    parts.push(`--k-color-primary:rgb(${String(r)} ${String(g)} ${String(b)})`);
  }

  if (accent !== null && isValidHexColor(accent)) {
    parts.push(`--brand-accent:${accent}`);
  }

  return parts.join(";");
}

// ---------------------------------------------------------------------------
// Wire parsing
// ---------------------------------------------------------------------------

/**
 * Read one property off an unknown object without narrowing what it is.
 *
 * Reflect.get takes an `object` and hands back something the caller still
 * has to check, which is what a wire boundary wants: no assertion claiming
 * a shape the bytes have not earned, and no computed index into a type we
 * invented for the occasion.
 */
function readProp(source: object, key: string): unknown {
  const value: unknown = Reflect.get(source, key);
  return value;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/**
 * Narrow the raw tRPC envelope into a typed response.
 *
 * The server has no superjson transformer, so the wire shape is
 * `{ result: { data: {...} } }`.
 */
export function parseBrandingEnvelope(
  body: unknown,
): PublicBrandingResponse | null {
  if (typeof body !== "object" || body === null) return null;

  const result = readProp(body, "result");
  if (typeof result !== "object" || result === null) return null;

  const data = readProp(result, "data");
  if (typeof data !== "object" || data === null) return null;

  const hasIcons = readProp(data, "hasIcons");
  if (typeof hasIcons !== "boolean") return null;

  return {
    name: asString(readProp(data, "name")),
    primaryColor: asString(readProp(data, "primaryColor")),
    accentColor: asString(readProp(data, "accentColor")),
    supportLabel: asString(readProp(data, "supportLabel")),
    hasIcons,
    iconVersion: asString(readProp(data, "iconVersion")),
    safeExitUrl: asString(readProp(data, "safeExitUrl")),
  };
}

// ---------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------

/**
 * Combine the server response and resolved slug into the final injection
 * values. Each field is independently validated so a single bad value does
 * not collapse the entire injection.
 */
export function buildInjectedBranding(
  response: PublicBrandingResponse,
  slug: string,
): InjectedBranding {
  const sanitized = sanitizeOrgName(response.name ?? "");
  const orgName = sanitized.length > 0 ? sanitized : null;

  const primaryColor =
    response.primaryColor !== null && isValidHexColor(response.primaryColor)
      ? response.primaryColor
      : null;

  const accentColor =
    response.accentColor !== null && isValidHexColor(response.accentColor)
      ? response.accentColor
      : null;

  const iconUrl = response.hasIcons
    ? brandingIconUrl(slug, "192", response.iconVersion)
    : null;

  const safeExitUrl =
    response.safeExitUrl !== null &&
    safeExitUrlSchema.safeParse(response.safeExitUrl).success
      ? response.safeExitUrl
      : null;

  return { orgName, primaryColor, accentColor, iconUrl, safeExitUrl };
}

// ---------------------------------------------------------------------------
// HTML replacement
// ---------------------------------------------------------------------------

const PLACEHOLDER_RE = /%carey\.\w+%/g;

/**
 * Replace all `%carey.*%` placeholders in the HTML template.
 *
 * Uses a single regex pass with a lookup so that injected content (e.g. an
 * org name containing a literal `%carey.splashName%` token) is never
 * re-substituted.
 */
export function applyBrandingToHtml(
  html: string,
  values: InjectedBranding | null,
): string {
  const orgName = values?.orgName ?? null;
  const iconUrl = values?.iconUrl ?? null;
  const safeExitUrl = values?.safeExitUrl ?? null;

  const escapedIcon = iconUrl === null ? null : escapeHtml(iconUrl);

  const replacements = new Map<string, string>([
    [
      "%carey.brandStyle%",
      values === null
        ? ""
        : buildBrandStyle(values.primaryColor, values.accentColor),
    ],
    ["%carey.orgName%", orgName === null ? "" : escapeHtml(orgName)],
    [
      "%carey.safeExitUrl%",
      safeExitUrl === null ? "" : escapeHtml(safeExitUrl),
    ],
    [
      "%carey.touchIcon%",
      escapedIcon === null
        ? ""
        : `<link rel="apple-touch-icon" sizes="180x180" href="${escapedIcon}" />`,
    ],
    [
      "%carey.splashLogoSrc%",
      escapedIcon === null ? "" : `src="${escapedIcon}"`,
    ],
    ["%carey.splashName%", orgName === null ? "" : escapeHtml(orgName)],
  ]);

  return html.replace(
    PLACEHOLDER_RE,
    (match) => replacements.get(match) ?? match,
  );
}

// ---------------------------------------------------------------------------
// Fetch + cache
// ---------------------------------------------------------------------------

/** Branding for an org that answered but told us nothing usable. */
const NO_BRANDING: InjectedBranding = {
  orgName: null,
  primaryColor: null,
  accentColor: null,
  iconUrl: null,
  safeExitUrl: null,
};

async function fetchBranding(
  slug: string,
  origin: string,
  isDev: boolean,
  fetchImpl: typeof fetch,
): Promise<FetchOutcome> {
  try {
    // In dev, go directly to the API server. This mirrors the Vite proxy in
    // vite.config.ts (same target, same /trpc prefix strip, same header).
    // In production, the request goes back through the reverse proxy on the
    // app's own origin so the Host header carries the org subdomain the API
    // resolves from. The header is ignored there by design, and Host is a
    // forbidden header for fetch to set.
    //
    // Do NOT use SvelteKit's event.fetch: for a same-origin path with no
    // matching SvelteKit route it resolves inside the app's own router and
    // returns a 404 without ever reaching the proxy.
    const url = isDev
      ? `${DEV_API_ORIGIN}/branding.getPublicBranding`
      : `${origin}/trpc/branding.getPublicBranding`;

    const headers: Record<string, string> = isDev ? { "x-org-slug": slug } : {};

    const res = await fetchImpl(url, { headers });
    if (!res.ok) {
      console.warn("[branding-inject] non-ok response");
      return { ok: false };
    }

    const rawBody: unknown = await res.json();
    const envelope = parseBrandingEnvelope(rawBody);
    // The server answered. An unusable body degrades to no injection and
    // is cached as such, rather than becoming a request on every page load
    // against a server that is going to keep saying the same thing.
    if (envelope === null) return { ok: true, value: NO_BRANDING };

    return { ok: true, value: buildInjectedBranding(envelope, slug) };
  } catch {
    console.warn("[branding-inject] fetch failed");
    return { ok: false };
  }
}

/**
 * Load branding for injection into the HTML template.
 *
 * Uses stale-while-revalidate caching: a stale entry is returned immediately
 * while a background fetch refreshes the cache. A failed refresh preserves
 * the previous value. A cold miss awaits the fetch.
 */
export async function loadInjectedBranding(
  options: LoadBrandingOptions,
): Promise<InjectedBranding | null> {
  const { slug, origin, isDev } = options;
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;

  const existing = cache.get(slug);

  if (existing !== undefined) {
    const age = now() - existing.fetchedAt;

    if (age < BRANDING_CACHE_TTL_MS) {
      return existing.payload;
    }

    // Stale: return immediately, kick off a background revalidation if one
    // is not already in flight for this slug.
    if (!inFlightRevalidations.has(slug)) {
      const revalidation = fetchBranding(slug, origin, isDev, fetchImpl)
        .then((outcome) => {
          // A failure keeps the previous value and still stamps the entry,
          // so a server that is down is retried once per interval rather
          // than once per page load.
          cache.set(slug, {
            payload: outcome.ok ? outcome.value : existing.payload,
            fetchedAt: now(),
          });
        })
        .catch(() => {
          // Leave the previous entry in place on failure.
        })
        .finally(() => {
          inFlightRevalidations.delete(slug);
        });

      inFlightRevalidations.set(slug, revalidation);
    }

    return existing.payload;
  }

  // Cold miss: await the fetch. A failure here is not cached, because
  // pinning "this org has no branding" for a full interval on one dropped
  // request would blind every visitor who arrives during it.
  const outcome = await fetchBranding(slug, origin, isDev, fetchImpl);
  if (!outcome.ok) return null;

  cache.set(slug, { payload: outcome.value, fetchedAt: now() });
  return outcome.value;
}
