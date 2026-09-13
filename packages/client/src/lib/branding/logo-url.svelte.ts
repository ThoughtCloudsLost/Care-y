import { browser } from "$app/environment";

function getInitialLogoUrl(): string | null {
  if (!browser) return null;
  // The server injects the apple-touch-icon link element via the
  // %carey.touchIcon% placeholder. If present, extract its href for
  // the reactive logo URL used by shell components.
  try {
    const link = document.querySelector('link[rel="apple-touch-icon"]');
    if (link instanceof HTMLLinkElement && link.href) {
      return link.href;
    }
  } catch {
    // DOM unavailable
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
