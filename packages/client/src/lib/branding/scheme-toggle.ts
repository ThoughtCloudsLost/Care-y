import { themeStore } from "$lib/stores/theme.svelte.js";
import { applyKonstaPalette } from "./konsta-palette.js";
import { DEFAULT_PRIMARY } from "./index.js";

/**
 * Flip the color scheme, then re-derive the Konsta palette for the new
 * scheme from the persisted org brand colors. The microtask defers the
 * palette pass until the scheme class swap has landed on <html>.
 *
 * Shared home for the settings scheme row and the dev theme panel pill.
 */
export function toggleSchemeWithPalette(): void {
  themeStore.toggleColorScheme();
  let primary = DEFAULT_PRIMARY;
  let accent: string | undefined;
  try {
    primary = localStorage.getItem("care-y-brand-primary") ?? DEFAULT_PRIMARY;
    accent = localStorage.getItem("care-y-brand-accent") ?? undefined;
  } catch (err: unknown) {
    console.warn(
      "localStorage unavailable for brand colors, using defaults",
      err,
    );
  }
  queueMicrotask(() => void applyKonstaPalette({ primary, accent }));
}
