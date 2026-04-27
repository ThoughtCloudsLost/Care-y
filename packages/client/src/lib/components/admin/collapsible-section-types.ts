import type { Component } from "svelte";
import type { ScrollSection } from "$lib/components/useSectionScroll.svelte.js";
import type { Permission } from "@care-y/shared";

export interface SectionDef extends ScrollSection {
  readonly permission: Permission;
  readonly component: Component;
}
