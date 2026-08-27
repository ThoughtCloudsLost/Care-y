import type { Component } from "svelte";
import type { ScrollSection } from "$lib/components/useSectionScroll.svelte.js";
import type { Permission } from "@care-y/shared";

/**
 * Navigation a section can request from its route.
 *
 * Sections are content components and must not navigate themselves, so the
 * ones that need to move the user take a callback and let the route own the
 * `goto`. Every entry is optional, which is what lets a section declaring
 * these still satisfy the registry's `Component` type alongside sections that
 * take no props at all.
 */
export interface SectionProps {
  /** Open the editor for an existing intake form. */
  readonly onopenform?: (formId: string) => void;
  /** Open the responses viewer for an intake form. */
  readonly onopenresponses?: (formId: string) => void;
  /** Open the editor for a new intake form. */
  readonly oncreateform?: () => void;
}

export interface SectionDef extends ScrollSection {
  readonly permission: Permission;
  readonly component: Component;
  /** Forwarded to the section component. Omit for sections that take none. */
  readonly props?: SectionProps;
}
