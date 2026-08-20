/**
 * Effect specs for the tickets-list demo surface.
 *
 * Each entry asserts the visible state change a tap-topic pulse
 * produces after the PhoneApp clicks the topic's activation target.
 * Selectors are evaluated inside the phone iframe.
 */

import type { EffectMap } from "./types.js";

export const EFFECTS: EffectMap = new Map([
  // -----------------------------------------------------------------------
  // sort: pulse taps the sort button (.sort-btn) which opens a ShellPopover
  // containing the sort option list.
  // SubNavbarFilterLayout.svelte line 237: <ShellPopover> wraps a <KList>
  // ShellPopover.svelte line 49: role="dialog"
  // SubNavbarFilterLayout.svelte line 246: <KList nested aria-label={sort.label}>
  // -----------------------------------------------------------------------
  [
    "sort",
    {
      description: "Sort popover opens with sort option list",
      visible: [
        // ShellPopover.svelte line 54: .shell-popover-content
        ".shell-popover-content",
        // SubNavbarFilterLayout.svelte line 270: .sort-toggle-item
        ".sort-toggle-item",
      ],
    },
  ],

  // -----------------------------------------------------------------------
  // filters: pulse taps the status filter pill, which opens a ShellPopover
  // with filter options inside FilterPillBar.
  // FilterPillBar.svelte line 229: <ShellPopover> with aria-label
  // ShellPopover.svelte line 49: role="dialog"
  // FilterPillBar.svelte line 264: <List nested role="group">
  // FilterPillBar.svelte line 257/267: .filter-pill-all (the "All" reset item)
  // -----------------------------------------------------------------------
  [
    "filters",
    {
      description: "Status filter popover opens with filter options",
      visible: [
        // ShellPopover.svelte line 54: .shell-popover-content
        ".shell-popover-content",
        // FilterPillBar.svelte line 257/267: the "All" reset list item
        ".filter-pill-all",
      ],
    },
  ],

  // -----------------------------------------------------------------------
  // view-modes: pulse taps the "Cards" button in the ViewSwitcher.
  // ViewSwitcher.svelte line 58: <IconTabToggle> with semantics="toggle"
  // IconTabToggle.svelte line 102: role="group" with aria-pressed buttons
  // The cards button becomes aria-pressed="true" after tap.
  // -----------------------------------------------------------------------
  [
    "view-modes",
    {
      description: "Cards view mode button shows as pressed",
      visible: [
        // IconTabToggle.svelte line 102: .icon-tab-toggle container
        ".icon-tab-toggle",
        // IconTabToggle.svelte line 106: aria-pressed="true" on the tapped button
        '.icon-tab-toggle [aria-pressed="true"]',
      ],
    },
  ],

  // -----------------------------------------------------------------------
  // select-mode: pulse taps the select button (.select-btn) which toggles
  // on multiSelect.active, rendering the BulkActionBar.
  // BulkActionBar.svelte line 17: role="toolbar" .bulk-action-bar
  // BulkActionBar.svelte line 23: .bulk-close-btn (cancel/exit button)
  // -----------------------------------------------------------------------
  [
    "select-mode",
    {
      description: "Selection toolbar appears with cancel button",
      visible: [
        // BulkActionBar.svelte line 17: .bulk-action-bar
        ".bulk-action-bar",
        // BulkActionBar.svelte line 23: .bulk-close-btn exit button
        ".bulk-close-btn",
      ],
    },
  ],

  // -----------------------------------------------------------------------
  // page-search: pulse taps the search trigger (.filter-search-btn) which
  // enters overlay.active, rendering the SearchNavigator row.
  // SearchNavigator.svelte line 87: .search-navigator role="toolbar"
  // SearchNavigator.svelte line 96: .search-close-btn (exit button,
  //   also used by closeModeToggle in tap-pulse.ts line 879)
  // -----------------------------------------------------------------------
  [
    "page-search",
    {
      description: "Search navigator toolbar appears with close button",
      visible: [
        // SearchNavigator.svelte line 87: .search-navigator
        ".search-navigator",
        // SearchNavigator.svelte line 96: .search-close-btn
        ".search-close-btn",
      ],
    },
  ],

  // -----------------------------------------------------------------------
  // new-ticket: pulse taps the navbar "New ticket" action which opens
  // the NewTicketController's ShellSheet.
  // NewTicketController.svelte line 164: <ShellSheet> with title
  // ShellSheet.svelte line 115: .shell-sheet-content
  // ShellSheet.svelte line 124: .sheet-header-title (h3 with the title)
  // -----------------------------------------------------------------------
  [
    "new-ticket",
    {
      description: "New ticket sheet opens",
      visible: [
        // ShellSheet.svelte line 115: .shell-sheet-content
        ".shell-sheet-content",
        // ShellSheet.svelte line 124: .sheet-header-title
        ".sheet-header-title",
      ],
    },
  ],

  // -----------------------------------------------------------------------
  // Mark-only topics: PRESENCE specs
  // -----------------------------------------------------------------------

  // saved-filters: mark-only. Presence asserts the saved-filter chip row
  // is rendered with at least one chip. Seed dependency: the demo stub
  // (packages/demo/src/stubs/saved-filters.svelte.ts) seeds two presets,
  // so count > 0 and the list renders.
  [
    "saved-filters",
    {
      description: "Saved filter chip row is visible with at least one chip",
      visible: [
        // SavedFilterList.svelte line 94: .saved-filter-list (role="list")
        ".saved-filter-list",
        // SavedFilterList.svelte line 105: .saved-filter-chip (each chip button)
        ".saved-filter-chip",
      ],
    },
  ],

  // quick-actions: mark-only. Presence asserts at least one ticket card
  // is rendered. Seed dependency: seed-tickets.ts seeds 10+ ticket defs,
  // all with withKeyWrap: true, so at least one card renders.
  [
    "quick-actions",
    {
      description: "At least one ticket card is visible in the list",
      visible: [
        // SwipeableCard.svelte line 339: data-testid="ticket-card"
        '[data-testid="ticket-card"]',
      ],
    },
  ],

  // unread-badges: mark-only. Presence asserts the new-pill badge is
  // visible on at least one ticket. Seed dependency: seed-tickets.ts
  // creates tickets with client follow-ups but seeds no read cursors,
  // so every ticket with a client message shows an unread badge.
  [
    "unread-badges",
    {
      description: "At least one new-pill unread badge is visible",
      visible: [
        // NewPill.svelte line 20: .new-pill
        ".new-pill",
      ],
    },
  ],

  // list-stats: mark-only. Presence asserts the stats counts row is
  // rendered. The .stats-counts container and its .count-item children
  // render unconditionally when the stats snippet is passed (which the
  // ticket page always does). The data-testid="count-new-replies" span
  // is gated by sweepSettled() and may not appear within the timeout;
  // assert only the always-present container and count items.
  [
    "list-stats",
    {
      description: "Stats counts row is visible with count items",
      visible: [
        // SubNavbarFilterLayout.svelte line 122: .stats-counts
        ".stats-counts",
        // tickets/+page.svelte line 1281: .count-item (new/active/hold)
        ".count-item",
      ],
    },
  ],

  // decryption: the pulse replays the descramble (PhoneApp handlePulse
  // special case: replayDescramble + resetQueries, marker on a busy
  // placeholder or a ticket card). The transient scramble is timing
  // sensitive, so this asserts the settled outcome: the list decrypted
  // back to visible ticket cards. The replay itself is proven by the
  // outcome layer, which requires a "selector" entry now that the
  // topic is no longer allowlisted.
  [
    "decryption",
    {
      description: "Ticket list settles decrypted after the descramble replay",
      visible: [
        // SwipeableCard.svelte line 339: data-testid="ticket-card"
        '[data-testid="ticket-card"]',
      ],
      // The replay resets queries and re-decrypts every visible title;
      // give the staggered reveal room beyond the default budget.
      timeout: 15_000,
    },
  ],
]);

// -----------------------------------------------------------------------
// Mark-only topics still omitted
// -----------------------------------------------------------------------

// split-view: mark-only and desktop-only. SplitView.svelte line 146 has
// data-testid="split-view", but the pulse only marks the resize divider
// (aria-label from split_view_resize_label); no tap occurs, so no
// assertable state change beyond marker visibility. Omitted.
