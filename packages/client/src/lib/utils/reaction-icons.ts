import {
  ThumbsUp,
  CircleCheck,
  CircleX,
  Flag,
  CheckCheck,
  type LucideIcon,
} from "@lucide/svelte";
import type { ReactionType } from "@care-y/shared";
import * as m from "$lib/paraglide/messages.js";

export interface ReactionEntry {
  readonly type: ReactionType;
  readonly icon: LucideIcon;
  readonly label: () => string;
}

export const REACTION_ENTRIES: readonly ReactionEntry[] = [
  { type: "acknowledge", icon: ThumbsUp, label: m.reaction_acknowledge },
  { type: "approve", icon: CircleCheck, label: m.reaction_approve },
  { type: "disagree", icon: CircleX, label: m.reaction_disagree },
  { type: "flag", icon: Flag, label: m.reaction_flag },
  { type: "complete", icon: CheckCheck, label: m.reaction_complete },
];

const ICON_MAP = new Map<string, LucideIcon>(
  REACTION_ENTRIES.map((e) => [e.type, e.icon]),
);

const LABEL_MAP = new Map<string, () => string>(
  REACTION_ENTRIES.map((e) => [e.type, e.label]),
);

export function reactionIcon(type: string): LucideIcon {
  return ICON_MAP.get(type) ?? ThumbsUp;
}

export function reactionLabel(type: string): string {
  return LABEL_MAP.get(type)?.() ?? type;
}
