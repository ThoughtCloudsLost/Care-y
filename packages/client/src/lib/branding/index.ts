import type { BrandingData, CachedBranding } from "./types.js";
import { isValidHexColor } from "./color-utils.js";
import {
  applyKonstaPalette,
  resetKonstaPalette,
} from "$lib/branding/konsta-palette.js";

const BRANDING_CACHE_KEY = "care-y-branding";
const DEFAULT_PRIMARY = "#10b981";
const DEFAULT_ACCENT = "#f59e0b";

let previousLogoBlobUrl: string | null = null;

/** Fetch encrypted branding from server, decrypt with org key, cache in SW. */
export async function loadBranding(
  fetchDecrypted: () => Promise<BrandingData>,
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
    if (!isCachedBranding(data)) return null;
    return data;
  } catch {
    return null;
  }
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
  const cache = await caches.open(BRANDING_CACHE_KEY);
  const json = JSON.stringify({
    orgName: data.orgName,
    primaryColor: data.primaryColor,
    accentColor: data.accentColor,
    logoBlobUrl: null,
  });
  await cache.put(
    "/branding-data",
    new Response(json, {
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function isCachedBranding(data: unknown): data is CachedBranding {
  if (typeof data !== "object" || data === null) return false;
  return (
    "orgName" in data &&
    typeof data.orgName === "string" &&
    "primaryColor" in data &&
    typeof data.primaryColor === "string"
  );
}

function createLogoBlobUrl(logoBlob: BlobPart): string {
  if (previousLogoBlobUrl !== null) {
    URL.revokeObjectURL(previousLogoBlobUrl);
  }
  previousLogoBlobUrl = URL.createObjectURL(new Blob([logoBlob]));
  return previousLogoBlobUrl;
}

/** Strip HTML tags from org name. DOM-free for SW compatibility. */
export function sanitizeOrgName(name: string): string {
  return name.replace(/<[^>]*>/g, "").trim();
}
