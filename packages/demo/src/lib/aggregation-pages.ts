/**
 * Aggregation page definitions: curated cross-section reference views.
 *
 * Each page names the seam labels whose carrying entries it collects,
 * plus optional provisional prose keys written by the prose track
 * later. Pages render as synthetic sections through the normal story
 * pipeline (see excursion-sections.ts): whole entries, as the handbook
 * shows them, not plucked stretch fragments.
 *
 * This module must not import the excursion store (circular risk).
 * The type is defined here and re-exported from excursion.svelte.ts.
 */

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

export type AggregationPageId =
  "encryption" | "server-holds" | "who-sees" | "cannot-prove" | "searching";

export interface AggPageDef {
  readonly id: AggregationPageId;
  readonly titleKey: string;
  readonly introKey: string;
  /** Entries carrying any of these labels compose the page. */
  readonly labels: readonly string[];
  /** Provisional prose keys (Track P); unresolved keys are skipped. */
  readonly proseKeys: readonly string[];
}

// -----------------------------------------------------------------------
// Page definitions
//
// The test contract: every page with labels returns non-empty entries
// in EN. The per-permission reference for who-sees arrives as prose
// keys when the prose track writes them; the embedded permission
// matrix was dropped when pages became story-rendered entries.
// -----------------------------------------------------------------------

const PAGES: readonly AggPageDef[] = [
  {
    id: "encryption",
    titleKey: "demo_agg_encryption_title",
    introKey: "demo_agg_encryption_intro",
    labels: ["Encryption."],
    proseKeys: [],
  },
  {
    id: "server-holds",
    titleKey: "demo_agg_server_holds_title",
    introKey: "demo_agg_server_holds_intro",
    labels: ["What the server holds.", "Privacy."],
    proseKeys: [],
  },
  {
    id: "who-sees",
    titleKey: "demo_agg_who_sees_title",
    introKey: "demo_agg_who_sees_intro",
    labels: ["Permissions.", "Visibility."],
    proseKeys: [],
  },
  {
    id: "cannot-prove",
    titleKey: "demo_agg_cannot_prove_title",
    introKey: "demo_agg_cannot_prove_intro",
    labels: [],
    proseKeys: [
      "demo_agg_cannot_prove_section1",
      "demo_agg_cannot_prove_section2",
      "demo_agg_cannot_prove_section3",
    ],
  },
  {
    id: "searching",
    titleKey: "demo_agg_searching_title",
    introKey: "demo_agg_searching_intro",
    labels: [
      "Before typing.",
      "Result groups.",
      "Navigation.",
      "Instant results.",
      "Full deep search.",
      "Coverage indicator.",
      "Tickets.",
      "Knowledge base articles.",
      "Volunteers.",
      "Deep search.",
      "Relationship to global search.",
      "Full search.",
      "Privacy.",
    ],
    proseKeys: [],
  },
];

// -----------------------------------------------------------------------
// Lookup
// -----------------------------------------------------------------------

const pageIndex = new Map<AggregationPageId, AggPageDef>(
  PAGES.map((p) => [p.id, p]),
);

export { PAGES };

export function getAggPage(id: AggregationPageId): AggPageDef | undefined {
  return pageIndex.get(id);
}
