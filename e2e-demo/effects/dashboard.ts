/**
 * Dashboard effect specs.
 *
 * The dashboard surface has 11 pulse topics. Most resolve to
 * CollapsibleSection toggle buttons, which handlePulse downgrades
 * to mark-only (isSectionToggle returns true for .section-toggle
 * ancestors). The nav-chrome create button is similarly downgraded.
 * Only the view switcher produces a real state change.
 *
 * Mark-only topics carry PRESENCE specs that independently verify
 * the narrated section is visible in the phone frame, rather than
 * trusting the demo's self-reported pulse log.
 *
 * CollapsibleSection renders .section-content only when expanded
 * (CollapsibleSection.svelte line 100). The heading container
 * (.collapsible-section with the .section-toggle button) is always
 * visible. Sections collapsed by default (unassigned, on-hold) are
 * EXPANDED by the pulse tap (isSectionToggleCollapsing returns false
 * for collapsed toggles, so the tap fires). Their specs assert both
 * the heading toggle and the expanded .section-content region.
 * Sections expanded by default assert a distinctive child inside
 * the body.
 */

import type { EffectMap } from "./types.js";

export const EFFECTS: EffectMap = new Map([
  // dashboard-view-switcher: taps the "Cards" button inside the
  // IconTabToggle rendered by ViewSwitcher in the dashboard subnavbar
  // (overview-subnavbar section, outside <nav>; isNavChrome is false).
  // The button carries aria-pressed="true" when active. Dashboard
  // default is "cards" (view-mode.svelte.ts line 69), so the tap
  // confirms the default state.
  [
    "dashboard-view-switcher",
    {
      description: "Cards view mode is active in the dashboard view switcher",
      visible: [
        // IconTabToggle.svelte line 108: toggle-mode buttons carry
        // aria-pressed on the active segment.
        'button[aria-pressed="true"].active',
      ],
    },
  ],

  // dashboard-queues: mark-only. QueueCards renders a .queue-grid
  // containing .queue-tile buttons when queues are loaded. The seed
  // creates 3 queues (seed-structure.ts line 250-276), so at least
  // one tile is always present. Expanded by default (not in the
  // collapsedSections set, +page.svelte line 507). Asserts the tile
  // inside the body rather than the heading because expanded is the
  // default state.
  [
    "dashboard-queues",
    {
      description: "Queues section tile grid visible",
      visible: [
        // +page.svelte line 652: scroll target container.
        "#section-queues",
        // QueueCards.svelte line 79: each queue renders a .queue-tile
        // button inside .queue-grid.
        "#section-queues .queue-tile",
      ],
    },
  ],

  // dashboard-activity: mark-only. ActivitySection renders
  // .activity-surface with .activity-row items when activity data
  // loads. The engine seeds 10 activity events (engine.ts line 363).
  // Expanded by default.
  [
    "dashboard-activity",
    {
      description: "Activity section event rows visible",
      visible: [
        // +page.svelte line 661: scroll target container.
        "#section-activity",
        // ActivitySection.svelte line 105: .activity-surface wraps
        // the row list (rendered when activity.length > 0).
        "#section-activity .activity-surface",
      ],
    },
  ],

  // dashboard-kb: mark-only. KBSection renders .kb-surface with
  // .kb-row items when KB articles are loaded. The engine seeds
  // articles via seed-kb.js (engine.ts line 351). Expanded by
  // default.
  [
    "dashboard-kb",
    {
      description: "Knowledge base section article rows visible",
      visible: [
        // +page.svelte line 671: scroll target container.
        "#section-kb",
        // KBSection.svelte line 71: .kb-surface wraps the row list
        // (rendered when kbItems.length > 0).
        "#section-kb .kb-surface",
      ],
    },
  ],

  // dashboard-needs-attention: mark-only. Renders conditionally on
  // showNeedsAttention (+page.svelte line 363): true when tickets
  // are loading OR needsAttention.length > 0. The seed creates
  // urgent/high-priority unassigned tickets (seed-tickets.ts lines
  // 184, 245, 306), which satisfy isNeedsAttention (filters.ts
  // line 39: unassigned + urgent/high = needs attention). Expanded
  // by default. Asserts the heading toggle, which is visible even
  // if the list is still loading.
  [
    "dashboard-needs-attention",
    {
      description: "Needs attention section heading visible",
      visible: [
        // +page.svelte line 682: scroll target container. Rendered
        // only when showNeedsAttention is true; demo seed satisfies
        // this via unassigned urgent tickets.
        "#section-needs-attention",
        // CollapsibleSection.svelte line 55-58: the .section-toggle
        // button carries aria-expanded and is always rendered.
        "#section-needs-attention .section-toggle",
      ],
    },
  ],

  // dashboard-my-tickets: mark-only. CollapsibleSection with
  // id="my-tickets". Always rendered (not conditional). Expanded
  // by default. Seed assigns ~40% of tickets to the admin user
  // (seed-tickets.ts line 652).
  [
    "dashboard-my-tickets",
    {
      description: "My tickets section heading visible",
      visible: [
        // +page.svelte line 705: scroll target container.
        "#section-my-tickets",
        // CollapsibleSection.svelte line 55-58: always-visible
        // toggle button inside the section header.
        "#section-my-tickets .section-toggle",
      ],
    },
  ],

  // dashboard-unassigned: mark-only. Always rendered. Starts COLLAPSED
  // (collapsedSections initial set includes "unassigned", +page.svelte
  // line 507). The pulse tap EXPANDS it: isSectionToggleCollapsing
  // (tap-pulse.ts:1204) returns false when aria-expanded="false", so
  // the tap fires (PhoneApp.svelte:1289-1291). After expansion,
  // .section-content renders (CollapsibleSection.svelte:100-111).
  // Asserts both the heading toggle and the expanded body content.
  [
    "dashboard-unassigned",
    {
      description: "Unassigned section expanded with content visible",
      visible: [
        // +page.svelte line 727: scroll target container.
        "#section-unassigned",
        // CollapsibleSection.svelte line 55-58: toggle button, now
        // aria-expanded="true" after the pulse tap expands it.
        "#section-unassigned .section-toggle",
        // CollapsibleSection.svelte line 101-103: .section-content
        // region, rendered only when expanded. Contains the
        // TicketPreviewList (line 740-748).
        "#section-unassigned .section-content",
      ],
    },
  ],

  // dashboard-on-hold: mark-only. Renders conditionally on
  // showOnHold (+page.svelte line 358): true when tickets are
  // loading OR on-hold count > 0. The seed creates 2 on-hold
  // tickets (seed-tickets.ts lines 384, 427). Starts COLLAPSED
  // (collapsedSections initial set includes "on-hold", +page.svelte
  // line 507). The pulse tap EXPANDS it: isSectionToggleCollapsing
  // returns false for a collapsed toggle, so the tap fires. After
  // expansion, .section-content renders.
  [
    "dashboard-on-hold",
    {
      description: "On-hold section expanded with content visible",
      visible: [
        // +page.svelte line 753: scroll target container. Rendered
        // only when showOnHold is true; demo seed satisfies this
        // via 2 on-hold tickets.
        "#section-on-hold",
        // CollapsibleSection.svelte line 55-58: toggle button, now
        // aria-expanded="true" after the pulse tap expands it.
        "#section-on-hold .section-toggle",
        // CollapsibleSection.svelte line 101-103: .section-content
        // region, rendered only when expanded. Contains the
        // TicketPreviewList (line 766-773).
        "#section-on-hold .section-content",
      ],
    },
  ],

  // dashboard-shift: mark-only. ShiftSection renders a <section>
  // with class .shift (ShiftSection.svelte line 105) containing
  // the shift status line, open-with-you count, and end-shift
  // button. Always rendered (not conditional, not collapsible).
  [
    "dashboard-shift",
    {
      description: "Shift status band visible",
      visible: [
        // +page.svelte line 644: scroll target container.
        "#section-shift",
        // ShiftSection.svelte line 105: the <section class="shift">
        // element with aria-label.
        "#section-shift .shift",
      ],
    },
  ],

  // dashboard-getting-started: mark-only. GettingStartedCard
  // renders inside CollapsibleSection, gated by showGettingStarted
  // (+page.svelte line 350): true when the checklist query succeeds,
  // is not dismissed, and has items. The seed sets
  // getting_started_dismissed_at to null (seed-structure.ts line
  // 146) and the admin has MANAGE_ROLES, so the checklist query
  // runs and the card renders. Expanded by default.
  [
    "dashboard-getting-started",
    {
      description: "Getting started checklist card visible",
      visible: [
        // +page.svelte line 632: scroll target container. Rendered
        // only when showGettingStarted is true; demo seed satisfies
        // this (checklist not dismissed).
        "#section-getting-started",
        // GettingStartedCard.svelte line 150: the outer
        // CollapsibleSection renders .collapsible-section.
        "#section-getting-started .collapsible-section",
      ],
    },
  ],

  // dashboard-create: mark-only. The navbar "+" action is a Konsta
  // Link rendered in AppShell's right snippet with
  // aria-label={action.label} where action.label is m.nav_create_new()
  // ("Create new", en.json line 110). The Link sits inside the
  // Konsta Navbar's right slot. Always visible when on the dashboard.
  [
    "dashboard-create",
    {
      description: "Create-new action button visible in navbar",
      visible: [
        // AppShell.svelte line 1249-1260: navbar action Link with
        // role="button" and aria-label from the action config.
        // +page.svelte line 188: the action label is m.nav_create_new().
        'a[role="button"][aria-label="Create new"]',
      ],
    },
  ],
]);
