/**
 * Effect specs for ticket-detail demo topics. Each entry describes the
 * visible response the phone must show after the pulse fires. Selectors
 * are Playwright locator strings evaluated inside the phone iframe.
 *
 * Tap topics: timeline, conversation, thread-filters, deep-search,
 *   notes, case-fold, case-panel, compose-actions, message-select.
 * Choreographed topics: message-actions (Shift+F10 on bubble),
 *   exposure-hints (two-stage click), reply (three-stage compose),
 *   close-reopen (panel open + mark).
 * Mark-only PRESENCE: case-header, thread-anatomy.
 */

import type { EffectMap } from "./types.js";

export const EFFECTS: EffectMap = new Map([
  // ── Tap topics (pulse taps a real control, assert the response) ──

  [
    "timeline",
    {
      description: "Timeline tab is pressed and the timeline view renders",
      visible: [
        // IconTabToggle button with aria-pressed when active
        // TicketDetailOrchestrator.svelte line 786 (detailViewToggle snippet)
        '[aria-pressed="true"][aria-label]',
        // FollowUpTimeline.svelte line 431
        ".timeline-view",
      ],
    },
  ],

  [
    "conversation",
    {
      description: "Messages tab is pressed and the chat thread renders",
      visible: [
        // IconTabToggle button for messages tab, active
        // TicketDetailOrchestrator.svelte line 786 (detailViewToggle snippet)
        '[aria-pressed="true"][aria-label]',
        // TicketDetail.svelte renders .fu-wrapper for each follow-up bubble
        // TicketDetail.svelte line 1260
        ".fu-wrapper",
      ],
    },
  ],

  [
    "thread-filters",
    {
      description: "Filter pill bar appears after tapping the type filter",
      visible: [
        // FilterPillBar.svelte line 191
        '.filter-pill-bar[role="toolbar"]',
      ],
    },
  ],

  [
    "deep-search",
    {
      description: "In-thread search overlay opens with close button",
      visible: [
        // SearchNavigator.svelte line 96 (the close control that
        // closeModeToggle in tap-pulse.ts clicks to exit)
        ".search-close-btn",
      ],
    },
  ],

  [
    "notes",
    {
      description: "Internal note sheet opens",
      visible: [
        // InternalNoteSheet.svelte line 231
        ".note-sheet-body",
      ],
    },
  ],

  [
    "case-fold",
    {
      description: "Case details fold toggles (handle visible in either state)",
      visible: [
        // CaseHeader.svelte line 240 (the drag handle that toggles)
        ".case-handle",
      ],
    },
  ],

  [
    "case-panel",
    {
      description: "More-actions popup opens with ticket panel content",
      visible: [
        // ShellPopup.svelte line 51, wraps TicketPanelContent
        '[data-testid="popup-dialog"]',
      ],
    },
  ],

  [
    "compose-actions",
    {
      description: "Compose actions popover opens",
      visible: [
        // ShellPopover wraps ComposeActions with role="dialog"
        // ShellPopover.svelte line 49
        '[role="dialog"]',
      ],
    },
  ],

  [
    "message-select",
    {
      description: "Select mode activates and the cancel bar appears",
      visible: [
        // BulkActionBar.svelte line 23 (exit button)
        ".bulk-close-btn",
        // BulkActionBar.svelte line 17
        '.bulk-action-bar[role="toolbar"]',
      ],
    },
  ],

  // ── Special-case topics ──

  [
    "message-actions",
    {
      description: "Context action sheet opens after Shift+F10 on a bubble",
      visible: [
        // ShellActionSheet.svelte line 46 (the dialog wrapper rendered by
        // TicketDetailOverlays.svelte line 211, ariaLabel set at line 214)
        '[data-testid="actions-sheet"]',
      ],
      // The keyboard event dispatch + sheet animation needs settling time
      timeout: 12_000,
    },
  ],

  [
    "exposure-hints",
    {
      description: "Exposure toast appears after compose-actions then SMS tap",
      visible: [
        // ExposureHint.svelte line 34, .exposure-content with role="status"
        '.exposure-content[role="status"]',
      ],
      // Two-stage click (compose-actions popover, then SMS entry) needs
      // extra settling time for both surfaces to animate
      timeout: 15_000,
    },
  ],

  // ── Mark-only topics: PRESENCE specs ──

  // case-header: mark-only. Presence asserts the CaseHeader root element
  // is visible on the detail page. Always renders for any loaded ticket.
  [
    "case-header",
    {
      description: "Case header section is visible on the detail page",
      visible: [
        // CaseHeader.svelte line 166: .case-header
        ".case-header",
      ],
    },
  ],

  // thread-anatomy: mark-only. Presence asserts at least one date
  // separator is visible in the thread. Seed dependency: the first
  // seed ticket (seed-tickets.ts ticketDefs[0]) has follow-ups spanning
  // 3 days (4320, 1440, 720, 360 minutes ago), so needsDateSeparator
  // (time.ts line 81) produces multiple separators. The .unread-divider
  // is NOT asserted because seed-tickets.ts inserts no read cursors;
  // TicketDetail.svelte line 883 returns null for firstUnreadId when
  // readUpTo is null, so no unread divider renders.
  [
    "thread-anatomy",
    {
      description: "At least one date separator is visible in the thread",
      visible: [
        // TicketDetail.svelte line 1253: .date-separator role="separator"
        ".date-separator",
      ],
    },
  ],

  // ── Choreographed topics ──
  //
  // The following topics run multi-stage choreographies in handlePulse
  // (PhoneApp.svelte) that open overlays and populate UI before the
  // assertion fires.

  // reply: three-stage choreography (PhoneApp.svelte:1166-1226).
  // Stage 1: clicks the compose-actions button. Stage 2: clicks the
  // Reply entry in the popover (ComposeActions.svelte:98-106,
  // ticket_reply_to_client), which activates reply compose mode and
  // expands the messagebar. Stage 3: sets sample text in the textarea
  // so the send button is enabled. Assert the expanded messagebar and
  // the send button.
  [
    "reply",
    {
      description:
        "Reply compose mode is active with expanded messagebar and send button",
      visible: [
        // ShellMessagebar.svelte:157-161 - the anchor div loses the
        // shell-messagebar-collapsed class when expanded. The textarea
        // inside it (line 164-168, Konsta Messagebar) is populated by
        // the choreography's stage 3 (PhoneApp.svelte:1189-1207).
        ".shell-messagebar-anchor:not(.shell-messagebar-collapsed) textarea",
        // ShellMessagebar.svelte:184-193 - the send Link (role="button")
        // with aria-label={sendLabel}. The choreography types sample
        // text, so the send button is not disabled.
        '.shell-messagebar-anchor [role="button"][aria-label]',
      ],
      // Three async stages (click, waitForElement, setTimeout 300ms)
      // need extra settling time.
      timeout: 12_000,
    },
  ],

  // close-reopen: choreography (PhoneApp.svelte:1229-1261). Opens
  // the more-actions panel (clicks the same button as case-panel), then
  // finds the close/reopen ListItem inside TicketPanelContent and marks
  // it with a pulse marker. The panel stays open until the next pulse's
  // dismissOpenOverlays call. Assert the panel content with the
  // close/reopen action visible.
  [
    "close-reopen",
    {
      description:
        "More-actions panel is open with close/reopen action visible",
      visible: [
        // ShellPopup.svelte:51 - the popup dialog wrapper rendered
        // around TicketPanelContent.
        '[data-testid="popup-dialog"]',
        // TicketPanelContent.svelte:165 - the panel content root div.
        ".panel-content",
        // TicketPanelContent.svelte:298-303 - the .destructive-text span
        // inside the close/reopen ListItem. Renders the action label in
        // red; present for both open and closed tickets (line 291-305).
        ".destructive-text",
      ],
      // The choreography clicks more-actions and waits for the panel
      // content to mount via waitForElement.
      timeout: 12_000,
    },
  ],
]);
