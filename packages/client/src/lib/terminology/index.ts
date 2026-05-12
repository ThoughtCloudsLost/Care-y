import {
  TERMINOLOGY_DEFAULTS,
  TERMINOLOGY_DEFAULTS_EN,
  terminologyConfigSchema,
  type TerminologyLabels,
  type TerminologyConfig,
} from "@care-y/shared";

const CACHE_KEY = "care-y-terminology";

export function resolveLabels(
  config: TerminologyConfig | null,
  lang: string,
): TerminologyLabels {
  if (config !== null) {
    const match = Object.entries(config).find(([k]) => k === lang);
    if (match) return match[1];
  }
  const defaultMatch = Object.entries(TERMINOLOGY_DEFAULTS).find(
    ([k]) => k === lang,
  );
  return defaultMatch ? defaultMatch[1] : TERMINOLOGY_DEFAULTS_EN;
}

export function cacheTerminology(config: TerminologyConfig): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(config));
  } catch {
    // localStorage unavailable
  }
}

export function readCachedTerminology(): TerminologyConfig | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    const result = terminologyConfigSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export { getTerminology } from "./context.js";
export { withTerms } from "./with-terms.js";
