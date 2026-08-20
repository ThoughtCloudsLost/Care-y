/**
 * Admin effect specs.
 *
 * The admin surface spans three sub-pages (people, communications,
 * organization) plus the manager page, with 18 pulse topics. Four
 * produce assertable state changes: admin-roster-edit (opens the
 * user-edit sheet), admin-roster-tools (opens the sort popover),
 * admin-queues (switches to the queues tab panel), and admin-clients
 * (switches to the clients tab panel).
 *
 * The people page tabs use IconTabToggle with semantics="tabs", which
 * renders a div[role="tablist"] wrapper (IconTabToggle.svelte line 79).
 * Content-level tablists are excluded from isStrictShellNav
 * (tap-pulse.ts line 1186), so tab-tap topics on the people page
 * (admin-queues, admin-clients) now fire and switch the active tab.
 * Their specs assert the tab's PANEL content after the switch.
 *
 * The communications and organization pages use CollapsibleSectionPage,
 * which renders each section heading as a .section-toggle button inside
 * CollapsibleSection (CollapsibleSection.svelte line 57). The
 * isSectionToggle guard (tap-pulse.ts line 1091) downgrades these taps
 * to mark-only. The subnavbar SectionScrollNav also wraps its buttons
 * in a <nav> element (SectionScrollNav.svelte line 20), making those
 * nav chrome as well.
 *
 * admin-roster-edit opens the edit sheet (real tap). admin-queues,
 * admin-clients, and admin-roster-tools now fire real taps (tab switch
 * and sort popover respectively). The remaining 13 mark-only /
 * tap-downgraded topics carry PRESENCE specs that verify the narrated
 * panel or naming element is visible in the phone frame, independent
 * of the demo's self-reported pulse log.
 *
 * Tab-gated panels (people page): the default tab is "users" (the admin
 * has MANAGE_USERS; people-utils.ts line 55). Tab-tap topics
 * (admin-queues, admin-clients) now fire because isStrictShellNav
 * excludes content-level tablists. The tap switches the active tab,
 * mounting the target panel. Specs assert the panel element that
 * renders after the tab switch.
 *
 * CollapsibleSectionPage (communications, organization): all sections
 * start expanded (CollapsibleSectionPage.svelte line 21 initializes
 * collapsedSections as empty SvelteSet; line 74 passes
 * expanded={!collapsedSections.has(section.id)}). Section-toggle taps
 * are downgraded, but the body IS on screen. Specs assert the inner
 * component class (the section's content root).
 *
 * Omitted topic:
 *
 * admin-client-merge: allowlisted pulse gap (pulse-allowlist.ts
 *   line 107). No pulse fires, and the merge action sheet is not
 *   visible at page level. The walk's convergence already proves the
 *   people page.
 */

import type { EffectMap } from "./types.js";

export const EFFECTS: EffectMap = new Map([
  // -----------------------------------------------------------------------
  // admin-roster-edit: pulse taps the pencil edit button on a UserCard
  // (UserCard.svelte line 162: aria-label={m.admin_user_edit_actions()}).
  // The button is NOT inside nav chrome or a section toggle; the tap
  // fires and opens the user-edit ShellSheet (UsersSection.svelte
  // line 667: <ShellSheet opened={sheetState !== null}>).
  // -----------------------------------------------------------------------
  [
    "admin-roster-edit",
    {
      description: "User edit sheet opens with edit form",
      visible: [
        // ShellSheet.svelte line 115: .shell-sheet-content
        ".shell-sheet-content",
        // UsersSection.svelte line 689: .edit-user-content
        ".edit-user-content",
      ],
    },
  ],

  // -----------------------------------------------------------------------
  // TAP: people page, users tab (default-active)
  // -----------------------------------------------------------------------

  // admin-roster-tools: activation candidates now include the composed
  // sort_button_label (tap-pulse.ts:791-810), which matches the sort
  // button's aria-label (SubNavbarFilterLayout.svelte:136, composed at
  // line 71-79). The tap fires and opens the sort popover (a
  // ShellPopover with role="dialog", SubNavbarFilterLayout.svelte:237).
  // Asserts the popover dialog content alongside the subnavbar filter
  // section.
  [
    "admin-roster-tools",
    {
      description: "Sort popover opens from the users subnavbar",
      visible: [
        // SubNavbarFilterLayout.svelte line 101: the content section
        // that holds the sort/filter controls.
        ".subnavbar-filter-content",
        // ShellPopover.svelte line 49: the popover renders a div with
        // role="dialog". SubNavbarFilterLayout.svelte line 237-244
        // wraps the sort option list in this popover.
        '[role="dialog"]',
      ],
    },
  ],

  // -----------------------------------------------------------------------
  // TAP: people page, tab switch (non-default tabs)
  // -----------------------------------------------------------------------

  // admin-queues: activation candidate m.admin_tab_queues() resolves to
  // the tab button inside IconTabToggle's div[role="tablist"]
  // (IconTabToggle.svelte line 79, people/+page.svelte line 622).
  // isStrictShellNav (tap-pulse.ts:1186) excludes content-level
  // tablists, so the tap fires and switches activeTab to "queues".
  // The queues panel mounts (people/+page.svelte:788-791).
  [
    "admin-queues",
    {
      description: "Queues tab is active and its panel content is visible",
      visible: [
        // IconTabToggle.svelte line 88: id={"tab-" + tab.id}
        // people/+page.svelte line 607: tab id "queues"
        "#tab-queues",
        // people/+page.svelte line 789: the panel div rendered when
        // activeTab === "queues". id="panel-queues" matches
        // aria-controls on the tab button (IconTabToggle.svelte:89).
        "#panel-queues",
      ],
    },
  ],

  // admin-clients: activation candidate m.admin_clients_title() resolves
  // to the tab button inside role="tablist" (people/+page.svelte
  // line 616). isStrictShellNav excludes content-level tablists, so
  // the tap fires and switches activeTab to "clients". The clients
  // panel mounts (people/+page.svelte:792-804).
  [
    "admin-clients",
    {
      description: "Clients tab is active and its panel content is visible",
      visible: [
        // IconTabToggle.svelte line 88: id={"tab-" + tab.id}
        // people/+page.svelte line 614: tab id "clients"
        "#tab-clients",
        // people/+page.svelte line 793: the panel div rendered when
        // activeTab === "clients". id="panel-clients" matches
        // aria-controls on the tab button (IconTabToggle.svelte:89).
        "#panel-clients",
      ],
    },
  ],

  // -----------------------------------------------------------------------
  // PRESENCE: manager page (all sections directly rendered, no collapse)
  // -----------------------------------------------------------------------

  // admin-roles: not in TAP_TOPICS. Mark-only. The manager page renders
  // role/ops/queue/protected section divs directly (no tabs, no
  // collapsible sections). All four are always visible. Asserts the
  // role section content container.
  [
    "admin-roles",
    {
      description: "Role section visible on the manager page",
      visible: [
        // manager/+page.svelte line 113: <div id="section-role" class="mgr-section">
        "#section-role",
      ],
    },
  ],

  // -----------------------------------------------------------------------
  // PRESENCE: communications page (CollapsibleSectionPage, all expanded)
  // -----------------------------------------------------------------------

  // admin-telephony-provider: not in TAP_TOPICS. Mark-only. The
  // telephony section is expanded by default (CollapsibleSectionPage.svelte
  // line 21: empty collapsedSections). Asserts the inner component content.
  [
    "admin-telephony-provider",
    {
      description: "Telephony config section content visible",
      visible: [
        // TelephonyConfigSection.svelte line 272: <div class="telephony-section">
        ".telephony-section",
      ],
    },
  ],

  // admin-phone-lines: activation candidate m.admin_tab_telephony()
  // resolves to the CollapsibleSection .section-toggle heading
  // (CollapsibleSection.svelte line 57); isSectionToggle downgrades.
  // The telephony section is expanded by default; phone lines content
  // lives inside TelephonyConfigSection. Asserts the section wrapper
  // (distinct from admin-telephony-provider's inner class to avoid
  // duplicating the same selector, while still proving the section is
  // on screen).
  [
    "admin-phone-lines",
    {
      description: "Telephony section expanded on communications page",
      visible: [
        // CollapsibleSectionPage.svelte line 69: <div id="section-{section.id}">
        // communications/+page.svelte line 20: section id "telephony"
        "#section-telephony",
      ],
    },
  ],

  // admin-greetings: not in TAP_TOPICS. Mark-only. The greetings section
  // is expanded by default. Asserts the inner component content.
  [
    "admin-greetings",
    {
      description: "Greetings section content visible",
      visible: [
        // GreetingsSection.svelte line 429: <div class="greetings-section">
        ".greetings-section",
      ],
    },
  ],

  // admin-sms-templates: tap-downgraded (isSectionToggle). The templates
  // section is expanded by default. Asserts the inner component content.
  [
    "admin-sms-templates",
    {
      description: "SMS templates section content visible",
      visible: [
        // SmsTemplatesSection.svelte line 233: <div class="templates-section">
        ".templates-section",
      ],
    },
  ],

  // admin-blocklist: tap-downgraded (isSectionToggle). The blocklist
  // section is expanded by default. Asserts the inner component content.
  [
    "admin-blocklist",
    {
      description: "Blocklist section content visible",
      visible: [
        // BlocklistSection.svelte line 156: <div class="blocklist-section">
        ".blocklist-section",
      ],
    },
  ],

  // admin-quarantine: not in TAP_TOPICS. Mark-only. The quarantine
  // section is expanded by default. Asserts the inner component content.
  [
    "admin-quarantine",
    {
      description: "Quarantine section content visible",
      visible: [
        // QuarantineSection.svelte line 200: <div class="quarantine-section">
        ".quarantine-section",
      ],
    },
  ],

  // -----------------------------------------------------------------------
  // PRESENCE: organization page (CollapsibleSectionPage, all expanded)
  // -----------------------------------------------------------------------

  // admin-general: tap-downgraded (isSectionToggle). The general section
  // is expanded by default. Asserts the inner component content.
  [
    "admin-general",
    {
      description: "Organization general section content visible",
      visible: [
        // OrgGeneralSection.svelte line 189: <div class="org-general-section">
        ".org-general-section",
      ],
    },
  ],

  // admin-branding: tap-downgraded (isSectionToggle). The branding
  // section is expanded by default. Asserts the inner component content.
  [
    "admin-branding",
    {
      description: "Branding section content visible",
      visible: [
        // BrandingSection.svelte line 490: <div class="branding-section">
        ".branding-section",
      ],
    },
  ],

  // admin-terminology: tap-downgraded (isSectionToggle). The terminology
  // section is expanded by default. Asserts the inner component content.
  [
    "admin-terminology",
    {
      description: "Terminology section content visible",
      visible: [
        // TerminologySection.svelte line 315: <div class="terminology-section">
        ".terminology-section",
      ],
    },
  ],

  // admin-note-types: tap-downgraded (isSectionToggle). The note-types
  // section is expanded by default. NoteTypesSection has no single root
  // wrapper class; it renders conditionally into Card elements. Asserts
  // the CollapsibleSectionPage wrapper div.
  [
    "admin-note-types",
    {
      description: "Note types section visible on organization page",
      visible: [
        // CollapsibleSectionPage.svelte line 69: <div id="section-{section.id}">
        // organization/+page.svelte line 69: section id "note-types"
        "#section-note-types",
      ],
    },
  ],

  // admin-keys: tap-downgraded (isSectionToggle). The keys section is
  // expanded by default. Asserts the inner component content.
  [
    "admin-keys",
    {
      description: "Keys section content visible",
      visible: [
        // KeysSection.svelte line 18: <div class="keys-section">
        ".keys-section",
      ],
    },
  ],

  // admin-retention: tap-downgraded (isSectionToggle). The retention
  // section is expanded by default. Asserts the inner component content.
  [
    "admin-retention",
    {
      description: "Retention section content visible",
      visible: [
        // RetentionSection.svelte line 134: <div class="retention-section">
        ".retention-section",
      ],
    },
  ],
]);
