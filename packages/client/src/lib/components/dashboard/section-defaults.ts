/**
 * Dashboard sections that start collapsed. Factored out of +page.svelte
 * so the demo can substitute its own default set (the handbook narrates
 * the dashboard to first-time readers, where the setup checklist starts
 * collapsed); the app itself keeps the checklist expanded for a freshly
 * onboarded admin.
 */
export const DEFAULT_COLLAPSED_SECTIONS: readonly string[] = [
  "unassigned",
  "on-hold",
];
