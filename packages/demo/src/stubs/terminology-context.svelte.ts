/**
 * Stub for $lib/terminology/context.
 *
 * The real module uses Svelte's createContext(), which requires a
 * live component tree. This stub backs the labels with $state so
 * they are reactive without a parent provider. Default values match
 * the English defaults from @care-y/shared's TERMINOLOGY_DEFAULTS_EN.
 */

import type { TerminologyLabels } from "@care-y/shared";

const defaults: TerminologyLabels = {
  volunteer: "volunteer",
  volunteers: "volunteers",
  client: "client",
  clients: "clients",
  ticket: "ticket",
  tickets: "tickets",
  manager: "coordinator",
  managers: "coordinators",
  queue: "queue",
  queues: "queues",
  knowledgeBase: "library",
};

let labels: TerminologyLabels = $state({ ...defaults });

function resolver(): TerminologyLabels {
  return labels;
}

export function getTerminology(): () => TerminologyLabels {
  return resolver;
}

export function setTerminology(_value: () => TerminologyLabels): void {
  // No-op: the demo does not wire real context providers.
  // Use setDemoTerminology() to change labels at runtime.
}

/** Override one or more terminology labels at runtime. */
export function setDemoTerminology(partial: Partial<TerminologyLabels>): void {
  labels = { ...labels, ...partial };
}

/** Reset labels to their English defaults. */
export function resetDemoTerminology(): void {
  labels = { ...defaults };
}
