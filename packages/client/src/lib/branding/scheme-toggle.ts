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
  const primary =
    localStorage.getItem("care-y-brand-primary") ?? DEFAULT_PRIMARY;
  const accent = localStorage.getItem("care-y-brand-accent") ?? undefined;
  queueMicrotask(() => void applyKonstaPalette({ primary, accent }));
}
