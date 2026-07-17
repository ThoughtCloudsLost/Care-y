import type { Component } from "svelte";
import { Building2, Settings, CalendarDays } from "@lucide/svelte";
import * as m from "$lib/paraglide/messages.js";
import type { AreaId } from "./types";

export interface AreaDef {
  readonly id: AreaId;
  readonly label: () => string;
  readonly icon: Component;
}

export const allAreas: readonly AreaDef[] = [
  { id: "admin", label: () => m.admin_hub_title(), icon: Building2 },
  { id: "settings", label: () => m.panel_settings(), icon: Settings },
  { id: "schedule", label: () => m.nav_schedule(), icon: CalendarDays },
];

export function getAreaDef(id: AreaId): AreaDef | undefined {
  return allAreas.find((a) => a.id === id);
}
