/**
 * Demo override of $lib/components/dashboard/section-defaults.js.
 *
 * The handbook narrates the dashboard to a first-time reader, and the
 * Getting Started checklist is an admin-only setup surface that reads
 * as noise at the top of that first screen. It starts collapsed here
 * (the product keeps it expanded for a freshly onboarded admin); the
 * narration's scroll-nav tap expands it when its sub-section is read.
 */

import type * as ThisStub from "./dashboard-section-defaults.js";
import type * as Real from "../../../client/src/lib/components/dashboard/section-defaults.js";
import type { NoStubDrift, StubDrift } from "./stub-contract.js";

// Fails typecheck when an export drifts from the real module.
type _Contract = NoStubDrift<StubDrift<typeof ThisStub, typeof Real>>;

export const DEFAULT_COLLAPSED_SECTIONS: readonly string[] = [
  "unassigned",
  "on-hold",
  "getting-started",
];
