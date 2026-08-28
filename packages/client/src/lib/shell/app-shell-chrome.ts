/**
 * What the org app does with every chrome slot.
 *
 * Lives beside AppShell rather than inside it, because the reasons here are
 * paragraphs of developer prose and the i18n rule that guards Svelte
 * templates reads any string there as untranslated interface copy.
 *
 * Adding a slot to CHROME_SLOTS fails to compile here and in the client
 * declaration until each surface says what it does with it.
 */

import type { ShellChromeSlots } from "./chrome-contract.js";

export const appShellChrome: ShellChromeSlots = {
  identity: {
    fill: {
      position: "navbar-leading",
      rendersByDefault: true,
      gatedBy: "Dropped on desktop, where the sidebar carries identity.",
    },
  },

  language: { fill: { position: "navbar-center", rendersByDefault: true } },

  globalSearch: {
    fill: { position: "navbar-trailing", rendersByDefault: true },
  },

  threadSearch: {
    fill: {
      position: "navbar-subrow",
      rendersByDefault: false,
      gatedBy:
        "A route publishes the search row through the navbar override subrow.",
    },
  },

  quickExit: {
    omitted:
      "A volunteer is not hiding this app from someone standing behind them, and a control that wipes the session on a stray Escape would cost them work in progress.",
  },

  toasts: {
    fill: {
      position: "overlay",
      rendersByDefault: false,
      gatedBy:
        "Mounted by the (app) layout above the crypto gate, so toasts still reach a volunteer during the loading and timeout states, where this shell has not rendered yet.",
    },
  },

  tabbar: { fill: { position: "bottom-bar", rendersByDefault: true } },

  desktopRail: {
    fill: {
      position: "side-rail",
      rendersByDefault: false,
      gatedBy: "Desktop viewports only.",
    },
  },

  callIndicator: {
    fill: {
      position: "navbar-trailing",
      rendersByDefault: false,
      gatedBy: "Renders only while a call is active.",
    },
  },

  pullToRefresh: {
    fill: {
      position: "overlay",
      rendersByDefault: false,
      gatedBy: "The indicator exists only while a pull is in progress.",
    },
  },

  sectionRail: {
    fill: {
      position: "side-rail",
      rendersByDefault: false,
      gatedBy: "Desktop, and only once a page publishes scroll sections.",
    },
  },
};
