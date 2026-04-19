import type { Component } from "svelte";
import { Permission } from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";
import {
  Users,
  Layers,
  Phone,
  Ban,
  Mic,
  MessageSquare,
  Palette,
  Key,
  Shredder,
  ChartColumn,
} from "@lucide/svelte";

export type AdminGroup = "people" | "communications" | "organization";

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
    label: m.panel_queues,
    subtitle: m.hub_queues_subtitle,
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
    path: "/admin/telephony",
    permission: Permission.MANAGE_INFRASTRUCTURE,
    implemented: false,
  },
  {
    id: "blacklist",
    group: "communications",
    icon: Ban,
    label: m.panel_blacklist,
    subtitle: m.hub_blacklist_subtitle,
    path: "/admin/telephony?tab=blacklist",
    permission: Permission.MANAGE_INFRASTRUCTURE,
    implemented: false,
  },
  {
    id: "greetings",
    group: "communications",
    icon: Mic,
    label: m.panel_greetings,
    subtitle: m.hub_greetings_subtitle,
    path: "/admin/messages?tab=greetings",
    permission: Permission.MANAGE_INFRASTRUCTURE,
    implemented: false,
  },
  {
    id: "sms-templates",
    group: "communications",
    icon: MessageSquare,
    label: m.panel_sms_templates,
    subtitle: m.hub_sms_templates_subtitle,
    path: "/admin/messages?tab=templates",
    permission: Permission.MANAGE_INFRASTRUCTURE,
    implemented: false,
  },

  // ORGANIZATION
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
    id: "reports",
    group: "organization",
    icon: ChartColumn,
    label: m.panel_reports,
    subtitle: m.hub_reports_subtitle,
    path: "/admin/organization?tab=reports",
    permission: Permission.VIEW_REPORTS,
    implemented: true,
  },
];

export const GROUP_ORDER: readonly AdminGroup[] = [
  "people",
  "communications",
  "organization",
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
