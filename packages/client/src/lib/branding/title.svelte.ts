import { browser } from "$app/environment";
import { readInjectedOrgName } from "$lib/branding/injected-branding.js";

function getInitialTitle(): string {
  if (!browser) return "CARE-Y";
  return readInjectedOrgName() ?? "CARE-Y";
}

let brandingTitle = $state(getInitialTitle());

export function setBrandingTitle(title: string): void {
  brandingTitle = title;
}

export function getBrandingTitle(): string {
  return brandingTitle;
}
