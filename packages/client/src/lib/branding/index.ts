import type { BrandingData, CachedBranding } from "./types.js";
import { isValidHexColor } from "./color-utils.js";
import {
  applyKonstaPalette,
  resetKonstaPalette,
} from "$lib/branding/konsta-palette.js";

const BRANDING_CACHE_KEY = "care-y-branding";
export const DEFAULT_PRIMARY = "#636366";
export const DEFAULT_ACCENT = "#8e8e93";

let previousLogoBlobUrl: string | null = null;

export interface OrgContext {
  readonly orgSlug: string;
  readonly hasIcons: boolean;
  readonly iconVersion: string | null;
}

/** Fetch plaintext branding from the server and cache it in the SW cache. */
export async function loadBranding(
  fetchDecrypted: () => Promise<BrandingData>,
  orgContext: OrgContext,
): Promise<CachedBranding> {
  const data = await fetchDecrypted();

  const primaryColor = isValidHexColor(data.primaryColor)
    ? data.primaryColor
    : DEFAULT_PRIMARY;

  const cached: CachedBranding = {
    orgName: sanitizeOrgName(data.orgName),
    primaryColor,
    accentColor:
      data.accentColor !== null &&
      data.accentColor !== "" &&
      isValidHexColor(data.accentColor)
        ? data.accentColor
        : DEFAULT_ACCENT,
    logoBlobUrl: data.logoBlob ? createLogoBlobUrl(data.logoBlob) : null,
    orgSlug: orgContext.orgSlug,
    hasIcons: orgContext.hasIcons,
    iconVersion: orgContext.iconVersion,
  };

  await cacheBranding(cached);
  await applyBranding(cached);

  return cached;
}

/** Read cached branding from SW cache (for pre-login display). */
export async function getCachedBranding(): Promise<CachedBranding | null> {
  try {
    const cache = await caches.open(BRANDING_CACHE_KEY);
    const response = await cache.match("/branding-data");
    if (!response) return null;
    const data: unknown = await response.json();
    if (!isRawCachedBranding(data)) return null;
    return normalizeCachedBranding(data);
  } catch {
    return null;
  }
}

/**
 * Merge a partial update into the existing SW branding cache.
 * Writes are serialized: concurrent calls chain sequentially via pendingWrite.
 */
let pendingWrite: Promise<void> = Promise.resolve();

export async function updateBrandingCache(
  patch: Partial<CachedBranding>,
): Promise<void> {
  pendingWrite = pendingWrite.then(async () => doUpdateBrandingCache(patch));
  await pendingWrite;
}

async function doUpdateBrandingCache(
  patch: Partial<CachedBranding>,
): Promise<void> {
  const existing = await getCachedBranding();
  const merged: CachedBranding = {
    orgName: patch.orgName ?? existing?.orgName ?? "CARE-Y",
    primaryColor:
      patch.primaryColor ?? existing?.primaryColor ?? DEFAULT_PRIMARY,
    accentColor: patch.accentColor ?? existing?.accentColor ?? null,
    logoBlobUrl: null,
    orgSlug: patch.orgSlug ?? existing?.orgSlug ?? null,
    hasIcons: patch.hasIcons ?? existing?.hasIcons ?? false,
    iconVersion: patch.iconVersion ?? existing?.iconVersion ?? null,
  };
  await cacheBranding(merged);
}

/** Apply branding visuals to the DOM (color palette + document title). */
export async function applyBranding(branding: CachedBranding): Promise<void> {
  await applyKonstaPalette({
    primary: branding.primaryColor,
    accent: branding.accentColor ?? undefined,
  });
  document.title = branding.orgName;
}

/** Clear branding cache and reset palette (called on logout). */
export async function clearBrandingCache(): Promise<void> {
  await caches.delete(BRANDING_CACHE_KEY);
  resetKonstaPalette();
}

async function cacheBranding(data: CachedBranding): Promise<void> {
  // The service worker's dynamic manifest reads from this Cache API entry.
  // No localStorage writes: a client device must not record which org was
  // contacted (ADR-094). Injected values from the server are the only
  // pre-paint branding source.
  const cache = await caches.open(BRANDING_CACHE_KEY);
  const json = JSON.stringify({
    orgName: data.orgName,
    primaryColor: data.primaryColor,
    accentColor: data.accentColor,
    orgSlug: data.orgSlug,
    hasIcons: data.hasIcons,
    iconVersion: data.iconVersion,
    logoBlobUrl: null,
  });
  await cache.put(
    "/branding-data",
    new Response(json, {
      headers: { "Content-Type": "application/json" },
    }),
  );
}

interface RawCachedData {
  orgName: string;
  primaryColor: string;
  accentColor?: string | null;
  logoBlobUrl?: string | null;
  orgSlug?: string | null;
  hasIcons?: boolean;
  iconVersion?: string | null;
}

function isRawCachedBranding(data: unknown): data is RawCachedData {
  if (typeof data !== "object" || data === null) return false;
  if (!("orgName" in data) || !("primaryColor" in data)) return false;
  // After `in` narrowing, TS knows properties exist on the object
  return (
    typeof data.orgName === "string" && typeof data.primaryColor === "string"
  );
}

function normalizeCachedBranding(raw: RawCachedData): CachedBranding {
  return {
    orgName: raw.orgName,
    primaryColor: raw.primaryColor,
    accentColor: raw.accentColor ?? null,
    logoBlobUrl: null,
    orgSlug: raw.orgSlug ?? null,
    hasIcons: raw.hasIcons ?? false,
    iconVersion: raw.iconVersion ?? null,
  };
}

function createLogoBlobUrl(logoBlob: BlobPart): string {
  if (previousLogoBlobUrl !== null) {
    URL.revokeObjectURL(previousLogoBlobUrl);
  }
  previousLogoBlobUrl = URL.createObjectURL(new Blob([logoBlob]));
  return previousLogoBlobUrl;
}

export function brandingIconUrl(
  slug: string,
  size: "192" | "512" | "maskable",
  version: string | null,
): string {
  const base = `/api/branding/${slug}/icon-${size}.png`;
  return version !== null ? `${base}?v=${version}` : base;
}

/** Strip HTML tags from org name. DOM-free for SW compatibility. */
export function sanitizeOrgName(name: string): string {
  return name.replace(/<[^>]*>/g, "").trim();
}
