/**
 * Route-to-section mapping for the demo scroll story.
 *
 * This file is consumed two ways. TypeScript consumers import it normally.
 * A plain Node guard script regex-scans it to extract every quoted string
 * that starts with "/(". To satisfy both consumers, this file contains
 * ONLY plain string-array literals, no computed values, no template
 * literals, and no imports other than type-only imports. Do not add
 * runtime imports, helper calls, or spread expressions.
 */

import type { SectionId } from "./bridge.js";

/**
 * Maps each story section to the (app) route IDs it narrates. Every
 * route ID uses the exact SvelteKit-style path that route-manifest
 * derives from the filesystem (group segments included, filename
 * stripped).
 */
export const SECTION_ROUTES: Record<
  Exclude<SectionId, "coming-soon">,
  readonly string[]
> = {
  login: [],
  dashboard: ["/(app)"],
  tickets: ["/(app)/tickets"],
  "ticket-detail": ["/(app)/tickets/[id]"],
  search: [],
  library: [
    "/(app)/library",
    "/(app)/library/[articleId]",
    "/(app)/library/[articleId]/edit",
    "/(app)/library/new",
  ],
  admin: [
    "/(app)/admin",
    "/(app)/admin/communications",
    "/(app)/admin/manager",
    "/(app)/admin/organization",
    "/(app)/admin/people",
    "/(app)/admin/volunteer",
  ],
  schedule: ["/(app)/more/schedule"],
  settings: ["/(app)/more/settings"],
};

/**
 * Sub-section route overrides, keyed as "sectionId/subSlug". Only
 * sub-sections whose narration corresponds to a distinct route appear
 * here. Each value must be a subset of the parent section's routes
 * in SECTION_ROUTES.
 */
export const SUB_ROUTES: Readonly<Record<string, readonly string[]>> = {
  "admin/people-queues": ["/(app)/admin/people"],
  "admin/org-config-keys": ["/(app)/admin/organization"],
  "admin/communications": ["/(app)/admin/communications"],
  "library/vote": ["/(app)/library/[articleId]"],
  "library/editor": ["/(app)/library/new", "/(app)/library/[articleId]/edit"],
};

/**
 * Routes that exist in the (app) group but are deliberately outside
 * the narration promise. The catch-all not-found page does not belong
 * to any story section because it only renders for invalid paths.
 */
export const UNNARRATED_ROUTES: readonly string[] = ["/(app)/[...path]"];
