import { browser } from "$app/environment";

function getInitialTitle(): string {
  if (!browser) return "CARE-Y";
  try {
    return localStorage.getItem("care-y-brand-name") ?? "CARE-Y";
  } catch {
    return "CARE-Y";
  }
}

let brandingTitle = $state(getInitialTitle());

export function setBrandingTitle(title: string): void {
  brandingTitle = title;
}

export function getBrandingTitle(): string {
  return brandingTitle;
}
