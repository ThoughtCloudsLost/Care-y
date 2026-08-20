/**
 * Merged effect map for the story walk. Each surface file owns its
 * topics; the merge fails loud on duplicate keys so two files can
 * never silently disagree about a topic's expected effect.
 */

import type { DemoTopic } from "../../packages/demo/src/lib/bridge.js";
import type { EffectMap, EffectSpec } from "./types.js";
import { EFFECTS as LOGIN_EFFECTS } from "./login.js";
import { EFFECTS as DASHBOARD_EFFECTS } from "./dashboard.js";
import { EFFECTS as TICKETS_EFFECTS } from "./tickets.js";
import { EFFECTS as TICKET_DETAIL_EFFECTS } from "./ticket-detail.js";
import { EFFECTS as LIBRARY_EFFECTS } from "./library.js";
import { EFFECTS as ADMIN_EFFECTS } from "./admin.js";
import { EFFECTS as SETTINGS_EFFECTS } from "./settings.js";

class DuplicateEffectTopicError extends Error {
  override readonly name = "DuplicateEffectTopicError";
}

function merge(maps: readonly EffectMap[]): EffectMap {
  const merged = new Map<DemoTopic, EffectSpec>();
  for (const map of maps) {
    for (const [topic, spec] of map) {
      if (merged.has(topic)) {
        throw new DuplicateEffectTopicError(
          `Topic "${topic}" is defined in more than one effects file`,
        );
      }
      merged.set(topic, spec);
    }
  }
  return merged;
}

export const EFFECTS: EffectMap = merge([
  LOGIN_EFFECTS,
  DASHBOARD_EFFECTS,
  TICKETS_EFFECTS,
  TICKET_DETAIL_EFFECTS,
  LIBRARY_EFFECTS,
  ADMIN_EFFECTS,
  SETTINGS_EFFECTS,
]);

export type { EffectMap, EffectSpec } from "./types.js";
