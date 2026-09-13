import { themeStore } from "$lib/stores/theme.svelte.js";
import { applyKonstaPalette } from "./konsta-palette.js";
import { DEFAULT_PRIMARY } from "./index.js";

/**
 * Flip the color scheme, then re-derive the Konsta palette for the new
 * scheme from the current brand colors on the document element. The
 * microtask defers the palette pass until the scheme class swap has
 * landed on <html>.
 *
 * Shared home for the settings scheme row and the dev theme panel pill.
 */
export function toggleSchemeWithPalette(): void {
  themeStore.toggleColorScheme();
  let primary = DEFAULT_PRIMARY;
  let accent: string | undefined;
  try {
    const style = document.documentElement.style;
    const injected = style.getPropertyValue("--brand-primary").trim();
    if (injected) primary = injected;
    const injectedAccent = style.getPropertyValue("--brand-accent").trim();
    if (injectedAccent) accent = injectedAccent;
  } catch (err: unknown) {
    console.warn(
      "could not read brand colors from document style, using defaults",
      err,
    );
  }
  queueMicrotask(() => void applyKonstaPalette({ primary, accent }));
}
