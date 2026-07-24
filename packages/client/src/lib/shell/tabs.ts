import type { Component } from "svelte";
import { House, BookOpen } from "@lucide/svelte";
import Ticket from "$lib/components/icons/Ticket.svelte";
import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";
import type { TabId } from "./types";

export interface TabDef {
  readonly id: TabId;
  readonly label: () => string;
  readonly icon: Component;
}

export const allTabs: readonly TabDef[] = [
  { id: "home", label: () => m.nav_home(), icon: House },
  { id: "tickets", label: () => m.nav_tickets(withTerms()), icon: Ticket },
  { id: "library", label: () => m.tab_library(withTerms()), icon: BookOpen },
];
