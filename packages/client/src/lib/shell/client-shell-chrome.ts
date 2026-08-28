/**
 * What the client portal does with every chrome slot.
 *
 * Inclusion is decided per element by asking whether it makes sense for
 * someone whose entire surface is one conversation, and anything that
 * passes appears in the same position the org app puts it, which is what
 * `position` records and the contract test compares.
 *
 * Lives beside ClientShell for the same reason its org counterpart does.
 */

import type { ShellChromeSlots } from "./chrome-contract.js";

export const clientShellChrome: ShellChromeSlots = {
  identity: { fill: { position: "navbar-leading", rendersByDefault: true } },

  language: { fill: { position: "navbar-center", rendersByDefault: true } },

  globalSearch: {
    omitted:
      "A client has one conversation and nothing to search across, so a control offering to search the product would be offering nothing.",
  },

  threadSearch: {
    omitted:
      "Decided in, and lands with the client thread capabilities. Until that row exists a client has no search of any kind.",
  },

  quickExit: { fill: { position: "navbar-trailing", rendersByDefault: true } },

  toasts: {
    fill: {
      position: "overlay",
      rendersByDefault: true,
      note: "Mounted by the shell itself, unlike the org app, because the client group has no pre-shell gate for a toast to appear above.",
    },
  },

  tabbar: {
    omitted:
      "A client has one destination. A bar naming it would be a bar with one entry.",
  },

  desktopRail: {
    omitted:
      "Three or four entries in a permanently open rail beside a chat column would read as empty scaffolding. The drawer is a drawer at every viewport.",
  },

  callIndicator: {
    omitted: "Volunteer tooling. A client places no calls from this surface.",
  },

  pullToRefresh: {
    omitted:
      "The thread locks scroll, so a pull at the top never arms, and the other client pages are static documents. Nothing here goes stale behind the person reading it.",
  },

  sectionRail: {
    omitted:
      "Client pages are one flow rather than a page of sections, and the 720px reading measure leaves no gutter for a rail to sit in.",
  },
};
