import { browser } from "$app/environment";
import { readInjectedOrgName } from "$lib/branding/injected-branding.js";

function getInitialTitle(): string {
  if (!browser) return "CARE-Y";
  return readInjectedOrgName() ?? "CARE-Y";
}

let brandingTitle = $state(getInitialTitle());

export function setBrandingTitle(title: string): void {
  // An org without a configured name keeps the current title. A blank
  // tab title fails WCAG 2.4.2 and several writers pass the org name
  // through unchecked.
  if (title === "") return;
  brandingTitle = title;
}

export function getBrandingTitle(): string {
  return brandingTitle;
}
