/**
 * Static and derived section metadata for each route that publishes
 * scroll sections. Used by the hover-reveal on DesktopSidebar to show
 * a page's sections before navigating to it.
 *
 * Static pages (organization, communications, manager, volunteer)
 * export their SECTIONS arrays and are imported here.
 *
 * Dynamic pages:
 *  - Admin hub: buildAdminHubSections in destinations.ts (shared by
 *    the page and the registry).
 *  - Dashboard: buildDashboardSections (pure function taking boolean
 *    flags). The page calls it with live reactive values; the registry
 *    calls it with flags derived from the TanStack query cache.
 */

import type { QueryClient } from "@tanstack/svelte-query";
import type { ScrollSection } from "$lib/components/useSectionScroll.svelte.js";
import { Permission } from "@care-y/shared";
import { buildAdminHubSections } from "$lib/admin/destinations.js";
import {
  CalendarDays,
  Activity,
  BookOpen,
  Layers,
  Rocket,
} from "@lucide/svelte";
import TicketIcon from "$lib/components/icons/Ticket.svelte";
import TicketMinus from "$lib/components/icons/TicketMinus.svelte";
import TicketAlert from "$lib/components/icons/TicketAlert.svelte";
import TicketPause from "$lib/components/icons/TicketPause.svelte";
import { GitMerge } from "@lucide/svelte";
import { ticketsKeys } from "$lib/query/keys.js";
import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";

// Icons for the static section arrays below.
import {
  Phone,
  Ban,
  Mic,
  MessageSquare,
  PhoneMissed,
  Building2 as Building2Org,
  Palette,
  Languages,
  Key,
  Shredder,
  ClipboardPenLine,
  ClipboardList,
  ChartColumn,
  KeyRound,
  Layers as LayersVol,
  ShieldUser,
  HeartHandshake,
} from "@lucide/svelte";

// ── Static section arrays ──────────────────────────────────────────

export const ORGANIZATION_SECTIONS: readonly ScrollSection[] = [
  { id: "general", label: m.admin_tab_org_general, icon: Building2Org },
  { id: "branding", label: m.admin_tab_branding, icon: Palette },
  { id: "terminology", label: m.admin_tab_terminology, icon: Languages },
  { id: "keys", label: m.admin_tab_keys, icon: Key },
  { id: "retention", label: m.admin_tab_retention, icon: Shredder },
  { id: "note-types", label: m.admin_tab_note_types, icon: ClipboardPenLine },
  { id: "intake-forms", label: m.intake_forms_title, icon: ClipboardList },
];

const ORGANIZATION_PERMISSIONS: ReadonlyMap<string, Permission> = new Map([
  ["general", Permission.MANAGE_ORG_CONFIG],
  ["branding", Permission.MANAGE_ORG_CONFIG],
  ["terminology", Permission.MANAGE_ORG_CONFIG],
  ["keys", Permission.MANAGE_KEYS],
  ["retention", Permission.MANAGE_ORG_CONFIG],
  ["note-types", Permission.MANAGE_ORG_CONFIG],
  ["intake-forms", Permission.MANAGE_QUEUES],
]);

export const COMMUNICATIONS_SECTIONS: readonly ScrollSection[] = [
  { id: "telephony", label: m.admin_tab_telephony, icon: Phone },
  { id: "greetings", label: m.admin_tab_greetings, icon: Mic },
  { id: "templates", label: m.admin_tab_sms_templates, icon: MessageSquare },
  { id: "blocklist", label: m.admin_tab_blocklist, icon: Ban },
  { id: "quarantine", label: m.admin_tab_quarantine, icon: PhoneMissed },
];

export const MANAGER_SECTIONS: readonly ScrollSection[] = [
  { id: "role", label: m.mgr_section_role, icon: ClipboardList },
  { id: "ops", label: m.mgr_section_ops, icon: ChartColumn },
  { id: "queues", label: m.mgr_section_queues, icon: LayersVol },
  { id: "protected", label: m.mgr_section_protected, icon: ShieldUser },
];

export const VOLUNTEER_SECTIONS: readonly ScrollSection[] = [
  { id: "access", label: m.vol_section_access, icon: KeyRound },
  { id: "queues", label: m.vol_section_queues, icon: LayersVol },
  { id: "protected", label: m.vol_section_protected, icon: ShieldUser },
  { id: "clients", label: m.vol_section_clients, icon: HeartHandshake },
];

// ── Dashboard section builder (single derivation) ─────────────────

/**
 * Inputs that drive the dashboard's conditional sections.
 * Both the dashboard page (from live reactive queries) and the
 * registry (from the TanStack cache) supply these flags.
 */
export interface DashboardSectionFlags {
  readonly showGettingStarted: boolean;
  readonly showMergeCandidates: boolean;
  readonly showNeedsAttention: boolean;
  readonly showOnHold: boolean;
}

/**
 * Build the dashboard section list from boolean flags. Which sections
 * exist and their order is defined here and nowhere else; the dashboard
 * page's $derived.by and the registry's hover-reveal both call this
 * function.
 */
export function buildDashboardSections(
  flags: DashboardSectionFlags,
): readonly ScrollSection[] {
  const sections: ScrollSection[] = [];

  if (flags.showGettingStarted) {
    sections.push({
      id: "getting-started",
      label: m.getting_started_heading,
      icon: Rocket,
    });
  }

  sections.push({
    id: "shift",
    label: m.dashboard_shift_heading,
    icon: CalendarDays,
  });
  sections.push({
    id: "queues",
    label: () => m.dashboard_queues_heading(withTerms()),
    icon: Layers,
  });
  sections.push({
    id: "activity",
    label: m.dashboard_activity_heading,
    icon: Activity,
  });
  sections.push({
    id: "kb",
    label: () => m.dashboard_kb_heading(withTerms()),
    icon: BookOpen,
  });

  if (flags.showMergeCandidates) {
    sections.push({
      id: "merge-candidates",
      label: m.mergeCandidates_heading,
      icon: GitMerge,
    });
  }

  if (flags.showNeedsAttention) {
    sections.push({
      id: "needs-attention",
      label: m.dashboard_section_needs_attention,
      icon: TicketAlert,
    });
  }

  sections.push({
    id: "my-tickets",
    label: () => m.dashboard_section_my_tickets(withTerms()),
    icon: TicketIcon,
  });
  sections.push({
    id: "unassigned",
    label: m.dashboard_section_unassigned,
    icon: TicketMinus,
  });

  if (flags.showOnHold) {
    sections.push({
      id: "on-hold",
      label: m.dashboard_section_on_hold,
      icon: TicketPause,
    });
  }

  return sections;
}

/**
 * Derive dashboard section flags from the TanStack query cache.
 * Used by the hover-reveal path when the dashboard is not the active
 * page. If data is not cached, conditional sections are omitted.
 */
function getDashboardFlagsFromCache(
  permissions: ReadonlySet<Permission>,
  queryClient: QueryClient,
): DashboardSectionFlags {
  let showGettingStarted = false;
  if (permissions.has(Permission.MANAGE_ROLES)) {
    const checklistData = queryClient.getQueryData<{
      dismissed: boolean;
      items: readonly unknown[];
    }>(["dashboard", "setupChecklist"]);
    showGettingStarted =
      checklistData != null &&
      !checklistData.dismissed &&
      checklistData.items.length > 0;
  }

  let showMergeCandidates = false;
  if (permissions.has(Permission.VIEW_CLIENTS)) {
    const ticketData = queryClient.getQueryData(
      ticketsKeys.list({ statuses: ["open"] }),
    );
    showMergeCandidates = ticketData != null;
  }

  const ticketPages = queryClient.getQueryData<{
    pages: readonly { id: string }[][];
  }>(ticketsKeys.list({ statuses: ["open"] }));
  const showNeedsAttention = (ticketPages?.pages.flat().length ?? 0) > 0;

  const countsData = queryClient.getQueryData<{ onHold?: number }>(
    ticketsKeys.counts(),
  );
  const showOnHold = countsData != null && (countsData.onHold ?? 0) > 0;

  return {
    showGettingStarted,
    showMergeCandidates,
    showNeedsAttention,
    showOnHold,
  };
}

// ── Route-to-section mapping ───────────────────────────────────────

export interface RouteSectionEntry {
  readonly route: string;
  readonly pageLabel: () => string;
  readonly getSections: (
    permissions: ReadonlySet<Permission>,
    queryClient: QueryClient,
  ) => readonly ScrollSection[];
  /** Per-section permission filter for static pages. */
  readonly sectionPermissions?: ReadonlyMap<string, Permission>;
  /** Page-level permission gate. */
  readonly pagePermission?: Permission;
}

export const SECTION_REGISTRY: readonly RouteSectionEntry[] = [
  {
    route: "/",
    pageLabel: m.nav_home,
    getSections: (permissions, queryClient) =>
      buildDashboardSections(
        getDashboardFlagsFromCache(permissions, queryClient),
      ),
  },
  {
    route: "/admin",
    pageLabel: m.admin_hub_title,
    getSections: (permissions) => buildAdminHubSections(permissions),
  },
  {
    route: "/admin/organization",
    pageLabel: m.admin_org_title,
    getSections: () => ORGANIZATION_SECTIONS,
    sectionPermissions: ORGANIZATION_PERMISSIONS,
    pagePermission: Permission.MANAGE_ORG_CONFIG,
  },
  {
    route: "/admin/communications",
    pageLabel: m.admin_comms_title,
    getSections: () => COMMUNICATIONS_SECTIONS,
    pagePermission: Permission.MANAGE_INFRASTRUCTURE,
  },
  {
    route: "/admin/manager",
    pageLabel: () => m.mgr_page_title(withTerms()),
    getSections: () => MANAGER_SECTIONS,
  },
  {
    route: "/admin/volunteer",
    pageLabel: m.vol_page_title,
    getSections: () => VOLUNTEER_SECTIONS,
  },
];

/**
 * Look up the registry entry for a route. Exact match only.
 */
export function findRegistryEntry(
  pathname: string,
): RouteSectionEntry | undefined {
  return SECTION_REGISTRY.find((e) => e.route === pathname);
}

/**
 * Get permission-filtered sections for a route at hover time.
 * Returns an empty array if no entry exists or the page-level
 * permission check fails.
 */
export function getHoverSections(
  pathname: string,
  permissions: ReadonlySet<Permission>,
  queryClient: QueryClient,
): readonly ScrollSection[] {
  const entry = findRegistryEntry(pathname);
  if (entry == null) return [];

  // Page-level gate
  if (entry.pagePermission != null && !permissions.has(entry.pagePermission)) {
    return [];
  }

  const sections = entry.getSections(permissions, queryClient);

  // Per-section permission filtering (organization page)
  if (entry.sectionPermissions != null) {
    return sections.filter((s) => {
      const perm = entry.sectionPermissions?.get(s.id);
      return perm == null || permissions.has(perm);
    });
  }

  return sections;
}
