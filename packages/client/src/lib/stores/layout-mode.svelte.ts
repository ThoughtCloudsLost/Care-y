export interface LayoutMode {
  readonly isDesktop: boolean;
  readonly isTablet: boolean;
}

const DESKTOP_QUERY = "(min-width: 1024px)";
const TABLET_QUERY = "(min-width: 768px)";

function createLayoutMode(): LayoutMode {
  const state = $state({
    desktop: false,
    tablet: false,
  });

  if (typeof window !== "undefined") {
    const dq = window.matchMedia(DESKTOP_QUERY);
    const tq = window.matchMedia(TABLET_QUERY);

    state.desktop = dq.matches;
    state.tablet = tq.matches;

    dq.addEventListener("change", (e) => {
      state.desktop = e.matches;
    });
    tq.addEventListener("change", (e) => {
      state.tablet = e.matches;
    });
  }

  return {
    get isDesktop(): boolean {
      return state.desktop;
    },
    get isTablet(): boolean {
      return state.tablet;
    },
  };
}

export const layoutMode = createLayoutMode();
