import type { Component } from "svelte";
import { Permission } from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import {
  Users,
  Layers,
  Phone,
  Ban,
  Mic,
  MessageSquare,
  Building2,
  Palette,
  Languages,
  Key,
  Shredder,
  ClipboardPenLine,
  LayoutDashboard,
  ChartBar,
  Search,
} from "@lucide/svelte";

export type AdminGroup =
  | "people"
  | "communications"
  | "organization"
  | "analytics";

export interface AdminDestination {
  readonly id: string;
  readonly group: AdminGroup;
  readonly icon: Component;
  readonly label: () => string;
  readonly subtitle: () => string;
  readonly path: string;
  readonly permission: Permission;
  readonly implemented: boolean;
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
    permission: Permission.MANAGE_INFRASTRUCTURE,
    implemented: true,
  },
  {
    id: "sms-templates",
    group: "communications",
    icon: MessageSquare,
    label: m.panel_sms_templates,
    subtitle: m.hub_sms_templates_subtitle,
    path: "/admin/communications?tab=templates",
    permission: Permission.MANAGE_INFRASTRUCTURE,
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

  // ORGANIZATION
  {
    id: "general",
    group: "organization",
    icon: Building2,
    label: m.panel_general,
    subtitle: m.hub_general_subtitle,
    path: "/admin/organization?tab=general",
    permission: Permission.MANAGE_ORG_CONFIG,
    implemented: true,
  },
  {
    id: "branding",
    group: "organization",
    icon: Palette,
    label: m.panel_branding,
    subtitle: m.hub_branding_subtitle,
    path: "/admin/organization?tab=branding",
    permission: Permission.MANAGE_ORG_CONFIG,
    implemented: true,
  },
  {
    id: "terminology",
    group: "organization",
    icon: Languages,
    label: m.panel_terminology,
    subtitle: m.hub_terminology_subtitle,
    path: "/admin/organization?tab=terminology",
    permission: Permission.MANAGE_ORG_CONFIG,
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
    permission: Permission.MANAGE_ORG_CONFIG,
    implemented: true,
  },
  {
    id: "note-types",
    group: "organization",
    icon: ClipboardPenLine,
    label: m.panel_note_types,
    subtitle: m.hub_note_types_subtitle,
    path: "/admin/organization?tab=note-types",
    permission: Permission.MANAGE_ORG_CONFIG,
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
  return ADMIN_DESTINATIONS.filter((d) => permissions.has(d.permission));
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
