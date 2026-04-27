import { browser } from "$app/environment";

function getInitialLogoUrl(): string | null {
  if (!browser) return null;
  try {
    const slug = localStorage.getItem("care-y-brand-slug");
    const hasIcons = localStorage.getItem("care-y-brand-has-icons");
    if (slug !== null && slug !== "" && hasIcons !== null) {
      const v = localStorage.getItem("care-y-brand-icon-v");
      const base = `/api/branding/${slug}/icon-192.png`;
      return v !== null ? `${base}?v=${v}` : base;
    }
  } catch {
    // localStorage unavailable
  }
  return null;
}

let logoUrl = $state<string | null>(getInitialLogoUrl());

export function setOrgLogoUrl(url: string | null): void {
  logoUrl = url;
}

export function getOrgLogoUrl(): string | null {
  return logoUrl;
}
