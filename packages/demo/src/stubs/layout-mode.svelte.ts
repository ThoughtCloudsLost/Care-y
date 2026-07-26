/**
 * Stub for $lib/stores/layout-mode.svelte.
 *
 * The real store binds window.matchMedia("(min-width: 1024px)") at
 * module scope, so a desktop browser would activate the desktop sidebar
 * layout inside the phone frame. This stub forces mobile layout:
 * isDesktop and isTablet are always false.
 */

export interface LayoutMode {
  readonly isDesktop: boolean;
  readonly isTablet: boolean;
}

export const layoutMode: LayoutMode = {
  get isDesktop(): boolean {
    return false;
  },
  get isTablet(): boolean {
    return false;
  },
};
