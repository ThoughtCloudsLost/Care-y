/**
 * Plain Map constructors for FlowStory's hot-path lookups.
 *
 * Lives in a plain .ts file (not .svelte.ts) so the eslint
 * svelte/prefer-svelte-reactivity rule does not flag `new Map`.
 * FlowStory swaps these maps wholesale into $state.raw or rebuilds
 * them inside $derived.by, so per-key reactivity (SvelteMap) is pure
 * overhead. Plain Maps avoid version-bump churn on a hot layout path.
 */

import type { DemoTopic } from "./bridge.js";
import type { Section } from "./scroll-sections.js";

/**
 * Build the sub-topic lookup map keyed by "sectionId--subSlug".
 * Subs with no topic are excluded.
 */
export function buildSubTopicLookup(
  sections: readonly Section[],
): ReadonlyMap<string, DemoTopic> {
  const map = new Map<string, DemoTopic>();
  for (const section of sections) {
    for (const sub of section.subs) {
      if (sub.topic !== null) {
        map.set(`${section.id}--${sub.slug}`, sub.topic);
      }
    }
  }
  return map;
}
