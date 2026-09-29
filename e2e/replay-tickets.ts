/**
 * The tickets the e2e seed replay creates, derived from the stories the
 * replay writes.
 *
 * seed-data.setup.ts runs the dev Settings seed, which replays
 * buildSeedStories(DEV_SEED_STORY_COUNT) and the handbook story ticket
 * through the product's own endpoints. The stories are hash-based, with no
 * randomness and no clock, so the same titles land in the same states on
 * every run. Specs pick the tickets they need by property through this
 * module instead of naming generated titles, so a change to the story
 * generator moves the specs with it.
 */

import {
  buildSeedStories,
  DEV_SEED_STORY_COUNT,
  type SeedQueue,
  type SeedStory,
} from "../packages/shared/src/dev/seed-stories.js";
import { SEED_HANDBOOK_TICKET } from "../packages/shared/src/dev/seed-handbook-ticket.js";
import { E2eError } from "./helpers";

/**
 * Where a story leaves its ticket. "mine" is assigned to the account that
 * ran the seed, which in e2e is the admin every spec logs in as.
 */
export type ReplayTicketState =
  "closed" | "on_hold" | "mine" | "others" | "unassigned";

export interface ReplayTicket {
  readonly title: string;
  readonly queue: SeedQueue;
  /** Priority after the story's last priority change. */
  readonly priority: SeedStory["initialPriority"];
  readonly state: ReplayTicketState;
  /** Minutes before the seed ran that the ticket's last event landed. */
  readonly lastActivityMinutesAgo: number;
}

function stateOf(story: SeedStory): ReplayTicketState {
  let state: ReplayTicketState = "unassigned";
  for (const step of story.steps) {
    if (step.kind === "assign") state = step.to === "me" ? "mine" : "others";
    else if (step.kind === "hold") state = "on_hold";
    else if (step.kind === "close") state = "closed";
  }
  return state;
}

function priorityOf(story: SeedStory): SeedStory["initialPriority"] {
  let priority = story.initialPriority;
  for (const step of story.steps) {
    if (step.kind === "priority") priority = step.to;
  }
  return priority;
}

/** Every generated ticket the replay creates, without the handbook story ticket. */
export const REPLAY_TICKETS: readonly ReplayTicket[] = buildSeedStories(
  DEV_SEED_STORY_COUNT,
).map((story) => ({
  title: story.title,
  queue: story.queue,
  priority: priorityOf(story),
  state: stateOf(story),
  lastActivityMinutesAgo:
    story.steps.at(-1)?.agoMinutes ?? story.origin.agoMinutes,
}));

/** Title of the handbook story ticket the replay also creates. */
export const HANDBOOK_TITLE = SEED_HANDBOOK_TICKET.title;

const SEEDED_TITLES: readonly string[] = [
  HANDBOOK_TITLE,
  ...REPLAY_TICKETS.map((t) => t.title),
].map((title) => title.toLowerCase());

/**
 * Whether a title picks out exactly one seeded ticket. Playwright's text
 * matching is a case-insensitive substring match, so no other seeded title
 * may equal or contain it.
 */
function isDistinct(title: string): boolean {
  const needle = title.toLowerCase();
  return SEEDED_TITLES.filter((t) => t.includes(needle)).length === 1;
}

/**
 * The title of the matching replayed ticket with the most recent activity,
 * among tickets whose title no other seeded ticket shares. The ticket list
 * sorts by last activity and loads 50 rows a page, so the pick is on the
 * first page.
 */
export function replayTitle(
  description: string,
  matches: (ticket: ReplayTicket) => boolean,
): string {
  const pick = REPLAY_TICKETS.filter((t) => matches(t) && isDistinct(t.title))
    .sort((a, b) => a.lastActivityMinutesAgo - b.lastActivityMinutesAgo)
    .at(0);
  if (pick === undefined) {
    throw new E2eError(
      `The seed replay creates no ticket with a distinct title that is ${description}`,
    );
  }
  return pick.title;
}

const QUEUE_NAMES: readonly SeedQueue[] = ["Intake", "Crisis", "Housing"];

/**
 * The longest word of a seeded title that no other seeded title and no
 * queue name contains, for specs that search by part of a title.
 */
export function distinctWord(title: string): string {
  const own = title.toLowerCase();
  const others = [
    ...SEEDED_TITLES.filter((t) => t !== own),
    ...QUEUE_NAMES.map((q) => q.toLowerCase()),
  ];
  const word = own
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z]/g, ""))
    .filter((w) => w.length > 0 && !others.some((o) => o.includes(w)))
    .sort((a, b) => b.length - a.length)
    .at(0);
  if (word === undefined) {
    throw new E2eError(`"${title}" has no word that other seeded titles lack`);
  }
  return word;
}

/**
 * Ticket whose client portal.spec and portal-upgrade.spec upgrade to
 * Secure Link. Both specs reset communication tiers in beforeAll, so they
 * can share it.
 */
export const PORTAL_TICKET_TITLE = replayTitle(
  "assigned to the seeding admin",
  (t) => t.state === "mine",
);

/**
 * Ticket whose client account-portal.spec upgrades and portal-upgrade.spec
 * gives a bare link. A different client from PORTAL_TICKET_TITLE's, so the
 * two upgrade flows never share one client's tier.
 */
export const UPGRADE_TICKET_TITLE = replayTitle(
  "assigned to the seeding admin, other than the portal ticket",
  (t) => t.state === "mine" && t.title !== PORTAL_TICKET_TITLE,
);

/**
 * Title of the one ticket seed-data.setup.ts adds after the replay. A
 * seed volunteer creates it in the Crisis queue while the e2e admin is out
 * of that queue, so only the volunteer holds its key. The admin rejoins
 * the queue afterwards and sees the ticket as a "Locked ticket"
 * placeholder, never this title.
 */
export const LOCKED_TICKET_TITLE = "Queue volunteer handover note";
