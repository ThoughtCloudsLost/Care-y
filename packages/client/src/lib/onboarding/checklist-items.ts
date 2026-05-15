import * as m from "$lib/paraglide/messages.js";
import { withTerms } from "$lib/terminology/with-terms.js";

export interface ChecklistItemBase {
  readonly id: string;
  readonly label: () => string;
  readonly desc: () => string;
}

export const CHECKLIST_ITEMS: readonly ChecklistItemBase[] = [
  {
    id: "invite",
    label: m.getting_started_invite,
    desc: m.getting_started_invite_desc,
  },
  {
    id: "branding",
    label: m.getting_started_branding,
    desc: m.getting_started_branding_desc,
  },
  {
    id: "greetings",
    label: m.getting_started_greetings,
    desc: m.getting_started_greetings_desc,
  },
  {
    id: "sms",
    label: m.getting_started_sms,
    desc: m.getting_started_sms_desc,
  },
  {
    id: "presets",
    label: m.getting_started_presets,
    desc: () => m.getting_started_presets_desc(withTerms()),
  },
  {
    id: "kb",
    label: () => m.getting_started_kb(withTerms()),
    desc: () => m.getting_started_kb_desc(withTerms()),
  },
  {
    id: "queues",
    label: () => m.getting_started_queues(withTerms()),
    desc: () => m.getting_started_queues_desc(withTerms()),
  },
  {
    id: "retention",
    label: m.getting_started_retention,
    desc: m.getting_started_retention_desc,
  },
];
