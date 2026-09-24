import type { Component } from "svelte";
import { Permission } from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import type { ScrollSection } from "$lib/components/useSectionScroll.svelte.js";
import {
  Users,
  UsersRound,
  Layers,
  HeartHandshake,
  Phone,
  Ban,
  Mic,
  MessageSquare,
  MessageSquareDashed,
  BuildingComplex,
  Palette,
  Languages,
  Key,
  Shredder,
  ClipboardPenLine,
  LayoutDashboard,
  ChartBar,
  ChartColumn,
  Search,
  PhoneMissed,
  PhoneCall,
  RadioTower,
  ScrollText,
  ClipboardList,
} from "@lucide/svelte";

export type AdminGroup =
  "people" | "communications" | "organization" | "analytics";

export interface AdminDestination {
  readonly id: string;
  readonly group: AdminGroup;
  readonly icon: Component;
  readonly label: () => string;
  readonly subtitle: () => string;
  readonly path: string;
  readonly permission: Permission;
  readonly implemented: boolean;
  /**
   * Declares admission only; renders no hub tile. Lets a surface without
   * a tile (the manager page, the roles tab) keep its admission rule in
   * this registry so canEnterAdminRoute remains the single source.
   */
  readonly hidden?: true;
}

export const ADMIN_DESTINATIONS: readonly AdminDestination[] = [
  // PEOPLE
  {
    id: "users",
    group: "people",
    icon: Users,
    label: m.panel_users,
    subtitle: m.hub_users_subtitle,
    path: "/admin/people?tab=users",
    permission: Permission.MANAGE_USERS,
    implemented: true,
  },
  {
    id: "queues",
    group: "people",
    icon: Layers,
    label: () => m.panel_queues(withTerms()),
    subtitle: () => m.hub_queues_subtitle(withTerms()),
    path: "/admin/people?tab=queues",
    permission: Permission.MANAGE_QUEUES,
    implemented: true,
  },

  {
    id: "clients",
    group: "people",
    icon: HeartHandshake,
    label: () => m.admin_clients_title(withTerms()),
    subtitle: () => m.admin_clients_subtitle(withTerms()),
    path: "/admin/people?tab=clients",
    permission: Permission.VIEW_CLIENTS,
    implemented: true,
  },

  // COMMUNICATIONS
  {
    id: "telephony",
    group: "communications",
    icon: Phone,
    label: m.panel_telephony,
    subtitle: m.hub_telephony_subtitle,
    path: "/admin/communications?tab=telephony",
    permission: Permission.MANAGE_INFRASTRUCTURE,
    implemented: true,
  },
  {
    id: "greetings",
    group: "communications",
    icon: Mic,
    label: m.panel_greetings,
    subtitle: m.hub_greetings_subtitle,
    path: "/admin/communications?tab=greetings",
    permission: Permission.WRITE_CALL_GREETINGS,
    implemented: true,
  },
  {
    id: "sms-templates",
    group: "communications",
    icon: MessageSquare,
    label: m.panel_sms_templates,
    subtitle: m.hub_sms_templates_subtitle,
    path: "/admin/communications?tab=templates",
    permission: Permission.WRITE_AUTOMATIC_REPLIES,
    implemented: true,
  },
  {
    id: "blocklist",
    group: "communications",
    icon: Ban,
    label: m.panel_blocklist,
    subtitle: m.hub_blocklist_subtitle,
    path: "/admin/communications?tab=blocklist",
    permission: Permission.MANAGE_INFRASTRUCTURE,
    implemented: true,
  },
  {
    id: "quarantine",
    group: "communications",
    icon: PhoneMissed,
    label: m.panel_quarantine,
    subtitle: m.hub_quarantine_subtitle,
    path: "/admin/communications?tab=quarantine",
    permission: Permission.MANAGE_VOICEMAIL_QUARANTINE,
    implemented: true,
  },
  {
    id: "presets",
    group: "communications",
    icon: MessageSquareDashed,
    label: m.panel_presets,
    subtitle: m.hub_presets_subtitle,
    path: "/admin/communications?tab=presets",
    permission: Permission.MANAGE_PRESETS,
    implemented: true,
  },

  // ORGANIZATION
  {
    id: "general",
    group: "organization",
    icon: BuildingComplex,
    label: m.panel_general,
    subtitle: m.hub_general_subtitle,
    path: "/admin/organization?tab=general",
    permission: Permission.MANAGE_ORG_IDENTITY,
    implemented: true,
  },
  {
    id: "branding",
    group: "organization",
    icon: Palette,
    label: m.panel_branding,
    subtitle: m.hub_branding_subtitle,
    path: "/admin/organization?tab=branding",
    permission: Permission.MANAGE_ORG_IDENTITY,
    implemented: true,
  },
  {
    id: "terminology",
    group: "organization",
    icon: Languages,
    label: m.panel_terminology,
    subtitle: m.hub_terminology_subtitle,
    path: "/admin/organization?tab=terminology",
    permission: Permission.MANAGE_ORG_IDENTITY,
    implemented: true,
  },
  {
    id: "keys",
    group: "organization",
    icon: Key,
    label: m.panel_keys,
    subtitle: m.hub_keys_subtitle,
    path: "/admin/organization?tab=keys",
    permission: Permission.MANAGE_KEYS,
    implemented: true,
  },
  {
    id: "retention",
    group: "organization",
    icon: Shredder,
    label: m.panel_retention,
    subtitle: m.hub_retention_subtitle,
    path: "/admin/organization?tab=retention",
    permission: Permission.MANAGE_RETENTION,
    implemented: true,
  },
  {
    id: "note-types",
    group: "organization",
    icon: ClipboardPenLine,
    label: m.panel_note_types,
    subtitle: m.hub_note_types_subtitle,
    path: "/admin/organization?tab=note-types",
    permission: Permission.MANAGE_NOTE_TYPES,
    implemented: true,
  },
  {
    id: "intake-forms",
    group: "organization",
    icon: ClipboardList,
    label: m.intake_forms_title,
    subtitle: m.hub_intake_forms_subtitle,
    path: "/admin/organization?tab=intake-forms",
    permission: Permission.MANAGE_INTAKE_FORMS,
    implemented: true,
  },

  // ANALYTICS
  {
    id: "analytics-overview",
    group: "analytics",
    icon: LayoutDashboard,
    label: m.panel_analytics_overview,
    subtitle: m.hub_analytics_overview_subtitle,
    path: "/admin/analytics?tab=dash-1",
    permission: Permission.VIEW_REPORTS,
    implemented: false,
  },
  {
    id: "analytics-operations",
    group: "analytics",
    icon: ChartBar,
    label: m.panel_analytics_operations,
    subtitle: m.hub_analytics_operations_subtitle,
    path: "/admin/analytics?tab=dash-2",
    permission: Permission.VIEW_REPORTS,
    implemented: false,
  },
  {
    id: "analytics-deep",
    group: "analytics",
    icon: Search,
    label: m.panel_analytics_deep,
    subtitle: m.hub_analytics_deep_subtitle,
    path: "/admin/analytics?tab=dash-3",
    permission: Permission.VIEW_REPORTS,
    implemented: false,
  },
  {
    id: "call-log",
    group: "analytics",
    icon: PhoneCall,
    label: m.panel_call_log,
    subtitle: () => m.hub_call_log_subtitle(withTerms()),
    path: "/admin/logs?tab=calls",
    permission: Permission.VIEW_REPORTS,
    implemented: true,
  },
  {
    id: "audit-log",
    group: "analytics",
    icon: ScrollText,
    label: m.panel_audit_log,
    subtitle: m.hub_audit_log_subtitle,
    path: "/admin/logs?tab=audit",
    permission: Permission.VIEW_AUDIT_LOG,
    implemented: true,
  },

  // HIDDEN (admission declarations without hub tiles)
  {
    id: "roles",
    group: "people",
    icon: Users,
    label: m.admin_tab_roles,
    subtitle: m.admin_tab_roles,
    path: "/admin/people?tab=roles",
    permission: Permission.MANAGE_ROLES,
    implemented: true,
    hidden: true,
  },
  {
    id: "manager-hub",
    group: "people",
    icon: Users,
    label: () => m.mgr_page_title(withTerms()),
    subtitle: () => m.mgr_page_title(withTerms()),
    path: "/admin/manager",
    permission: Permission.MANAGE_USERS,
    implemented: true,
    hidden: true,
  },
];

export const GROUP_ORDER: readonly AdminGroup[] = [
  "people",
  "communications",
  "organization",
  "analytics",
];

export function getVisibleDestinations(
  permissions: ReadonlySet<Permission>,
): readonly AdminDestination[] {
  return ADMIN_DESTINATIONS.filter(
    (d) => d.hidden !== true && permissions.has(d.permission),
  );
}

/**
 * Whether the permissions set can enter an admin route whose path starts
 * with routePrefix. Admission and tile visibility must agree by
 * construction: the admin hub already derives visibility from these
 * entries, so a page that hand-rolls a different admission rule can
 * bounce a user the hub invited (which is the defect this helper
 * removes).
 */
export function canEnterAdminRoute(
  permissions: ReadonlySet<Permission>,
  routePrefix: string,
): boolean {
  return ADMIN_DESTINATIONS.some(
    (d) => routeMatches(d.path, routePrefix) && permissions.has(d.permission),
  );
}

/**
 * Boundary-aware prefix match: "/admin/logs" matches "/admin/logs" and
 * "/admin/logs?tab=calls" but never "/admin/logs-x". A bare startsWith
 * would fail open when a future entry shares a textual prefix.
 */
function routeMatches(destinationPath: string, routePrefix: string): boolean {
  if (destinationPath === routePrefix) return true;
  if (!destinationPath.startsWith(routePrefix)) return false;
  const next = destinationPath.charAt(routePrefix.length);
  return next === "?" || next === "/";
}

export function groupDestinations(
  destinations: readonly AdminDestination[],
): Map<AdminGroup, readonly AdminDestination[]> {
  const grouped = new Map<AdminGroup, AdminDestination[]>();
  for (const dest of destinations) {
    const list = grouped.get(dest.group) ?? [];
    list.push(dest);
    grouped.set(dest.group, list);
  }
  return grouped;
}

// ── Admin hub section helpers (shared by the page and registry) ────

export function groupIcon(group: AdminGroup): Component {
  switch (group) {
    case "people":
      return UsersRound;
    case "communications":
      return RadioTower;
    case "organization":
      return BuildingComplex;
    case "analytics":
      return ChartColumn;
  }
}

export function groupLabel(group: AdminGroup): string {
  switch (group) {
    case "people":
      return m.panel_group_people();
    case "communications":
      return m.panel_group_communications();
    case "organization":
      return m.panel_group_organization();
    case "analytics":
      return m.panel_group_analytics();
  }
}

/**
 * Build the scroll sections for the admin hub from permission-filtered
 * destinations. Single derivation used by both the hub page and the
 * section registry.
 */
export function buildAdminHubSections(
  permissions: ReadonlySet<Permission>,
): readonly ScrollSection[] {
  const visible = getVisibleDestinations(permissions);
  const groupSet = new Set(visible.map((d) => d.group));
  const visibleGroups = GROUP_ORDER.filter((g) => groupSet.has(g));
  return visibleGroups.map((g) => ({
    id: g,
    label: () => groupLabel(g),
    icon: groupIcon(g),
  }));
}
