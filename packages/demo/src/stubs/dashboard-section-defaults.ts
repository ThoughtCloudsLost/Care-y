/**
 * Demo override of $lib/components/dashboard/section-defaults.js.
 *
 * The handbook narrates the dashboard to a first-time reader, and the
 * Getting Started checklist is an admin-only setup surface that reads
 * as noise at the top of that first screen. It starts collapsed here
 * (the product keeps it expanded for a freshly onboarded admin); the
 * narration's scroll-nav tap expands it when its sub-section is read.
 */
export const DEFAULT_COLLAPSED_SECTIONS: readonly string[] = [
  "unassigned",
  "on-hold",
  "getting-started",
];
