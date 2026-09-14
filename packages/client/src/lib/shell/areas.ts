import type { Component } from "svelte";
import {
  BuildingComplex,
  Settings,
  CalendarDays,
  Users,
  MessageSquare,
  ShieldCheck,
  CircleUser,
} from "@lucide/svelte";
import * as m from "$lib/paraglide/messages.js";
import type { AreaId } from "./types";

export interface AreaDef {
  readonly id: AreaId;
  readonly label: () => string;
  readonly icon: Component;
}

export const allAreas: readonly AreaDef[] = [
  { id: "admin", label: () => m.admin_hub_title(), icon: BuildingComplex },
  { id: "admin-people", label: () => m.panel_group_people(), icon: Users },
  {
    id: "admin-communications",
    label: () => m.panel_group_communications(),
    icon: MessageSquare,
  },
  {
    id: "admin-organization",
    label: () => m.panel_group_organization(),
    icon: BuildingComplex,
  },
  { id: "admin-manager", label: () => m.admin_hub_title(), icon: ShieldCheck },
  {
    id: "admin-volunteer",
    label: () => m.admin_hub_title(),
    icon: CircleUser,
  },
  { id: "settings", label: () => m.panel_settings(), icon: Settings },
  { id: "schedule", label: () => m.nav_schedule(), icon: CalendarDays },
];

export function getAreaDef(id: AreaId): AreaDef | undefined {
  return allAreas.find((a) => a.id === id);
}
