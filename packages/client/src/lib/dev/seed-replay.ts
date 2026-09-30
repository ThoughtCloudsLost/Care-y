/* eslint-disable security/detect-object-injection -- seed data uses known-key object lookups throughout */
/**
 * Seed data replay through the product's own endpoints.
 *
 * Creates users, queues, branding, KB categories, note types, KB articles,
 * clients and tickets, presets and telephony config with the same tRPC
 * mutations the production UI uses, then fixes timing with the dev-only
 * procedures. Doubles as an integration test for the create pipelines.
 *
 * Every environment dependency (the tRPC client, the crypto bridge, the
 * phone lookup and the voicemail audio) comes in through
 * {@link SeedReplayDeps}. Environment gating belongs to the caller: the
 * dev Settings seed builds the deps in the browser, and other callers
 * build them wherever they run.
 */
import type { TRPCClient } from "@trpc/client";
import type { AppRouter } from "@care-y/server";
import {
  sealForOrgKey,
  encode,
  followupSlot,
  cursorSlot,
} from "@care-y/crypto";
import { SeedReplayError } from "$lib/errors.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";
import {
  RoleId,
  newTicketId,
  newFollowupId,
  newAttachmentId,
  portalContentTypeSchema,
  type EscalationTarget,
  type FollowUpSource,
  type FollowUpType,
  type RoleIdValue,
  type TicketPriority,
} from "@care-y/shared";
import {
  buildSeedStories,
  DEV_SEED_STORY_COUNT,
  originFollowUps,
  messageFollowUp,
  messageStepContent,
  SEED_VOICEMAIL_DURATION_S,
  type SeedTimelinePoint,
} from "@care-y/shared/dev/seed-stories.js";
import {
  SEED_HANDBOOK_TICKET,
  generateSeedPng,
  generateSeedTextFile,
  type SeedHandbookFollowUp,
} from "@care-y/shared/dev/seed-handbook-ticket.js";

// ── Dependencies ─────────────────────────────────────────────────────

type AppClient = TRPCClient<AppRouter>;
type TicketsClient = NonNullable<AppClient["tickets"]>;
type KbClient = NonNullable<AppClient["kb"]>;
type BrandingClient = NonNullable<AppClient["branding"]>;
type QuarantineClient = NonNullable<AppClient["voicemailQuarantine"]>;
type DevClient = NonNullable<AppClient["dev"]>;
type TelephonyAdminClient = NonNullable<AppClient["telephonyAdmin"]>;

/**
 * The tRPC procedures the replay calls, and no others, typed from the app
 * router. The router mounts most of these routers conditionally, so the
 * full client types them as possibly absent; this type requires each one,
 * and whoever builds the client proves they exist.
 */
export interface SeedReplayClient {
  readonly auth: Pick<AppClient["auth"], "listUsers" | "register" | "me">;
  readonly org: Pick<AppClient["org"], "setIntakeQueue">;
  readonly branding: Pick<BrandingClient, "saveBrandingField">;
  readonly kb: Pick<
    KbClient,
    "createCategory" | "listCategories" | "createItem" | "castVote"
  >;
  readonly tickets: Pick<
    TicketsClient,
    | "createQueue"
    | "listQueues"
    | "updateQueue"
    | "addQueueMember"
    | "listQueueMemberPublicKeys"
    | "create"
    | "get"
    | "update"
    | "updateContent"
    | "take"
    | "assignTo"
    | "createFollowUp"
    | "listFollowUps"
    | "getReadCursor"
    | "updateReadCursor"
    | "uploadAttachment"
    | "toggleReaction"
    | "createPreset"
  > & {
    /**
     * The tickets router mounts note types only when the server wires a
     * note type service. Where it is absent the replay creates none.
     */
    readonly noteTypes?: Pick<
      NonNullable<TicketsClient["noteTypes"]>,
      "create" | "update"
    >;
  };
  readonly voicemailQuarantine: Pick<QuarantineClient, "route">;
  readonly dev: Pick<
    DevClient,
    | "resetSeedData"
    | "seedQuarantine"
    | "seedVoicemail"
    | "reopenAsClient"
    | "applySeedTimeline"
    | "backdateOrgSetup"
  >;
  /**
   * The server mounts devSeedTelephony only in development. Where it is
   * absent the replay leaves telephony config alone.
   */
  readonly telephonyAdmin: Partial<
    Pick<TelephonyAdminClient, "devSeedTelephony">
  >;
}

/** The crypto bridge operations the replay uses. */
export type SeedReplayBridge = Pick<
  CryptoBridge,
  | "orgDecryptBatch"
  | "createTicketEncryption"
  | "unwrapTk"
  | "encrypt"
  | "encryptAttachment"
>;

/**
 * What a phone lookup found: the client that owns the number, or a
 * one-time token that creates the client with the first ticket.
 */
export type SeedPhoneLookup =
  | { readonly found: true; readonly clientId: string }
  | { readonly found: false; readonly token: string };

export type SeedProgressCallback = (message: string) => void;

/** The ids the replay created, for callers that build on its data. */
export interface SeedReplayResult {
  /**
   * Every ticket the replay opened: the handbook story ticket first, then
   * the generated stories in replay order.
   */
  readonly ticketIds: readonly string[];
  /** KB articles, in creation order. */
  readonly articleIds: readonly string[];
  /**
   * Note types, in creation order (Comment first). Empty when the server
   * mounts no note type router.
   */
  readonly noteTypeIds: readonly string[];
  /** Tickets the replay wrote a read cursor on for the seeding account. */
  readonly readCursorTicketIds: readonly string[];
}

/**
 * A person the replay hands tickets to. The replay matches each one to an
 * existing account by decrypted identifier and registers only the ones it
 * does not find, so a caller can pass people who already exist.
 */
export interface SeedReplayUser {
  readonly identifier: string;
  readonly displayName: string;
  /** Used only when the replay registers the account. */
  readonly roleId: RoleIdValue;
  /** Queues to add the person to, by index into the replay's queues. */
  readonly queueIndices: readonly number[];
}

export interface SeedReplayDeps {
  readonly client: SeedReplayClient;
  readonly bridge: SeedReplayBridge;
  readonly orgKeyManager: Pick<OrgKeyManager, "getPublicKey">;
  /** Resolves a phone number the way the new-ticket screen does. */
  readonly phoneLookup: (phone: string) => Promise<SeedPhoneLookup>;
  /** The seed voicemail clip's bytes. */
  readonly loadVoicemail: () => Promise<Uint8Array>;
  /**
   * How many generated stories to replay, on top of the handbook story
   * ticket. The last generated story is the last ticket the replay opens.
   */
  readonly storyCount: number;
  /**
   * The people tickets are assigned to, in the order the replay draws
   * them. The first one also works the handbook story ticket's first
   * shift. Every one must be active, because the product refuses to
   * assign a ticket to a deactivated account. Defaults to the dev seed's
   * own five.
   */
  readonly users?: readonly SeedReplayUser[];
  readonly onProgress?: SeedProgressCallback;
}

// ── ProseMirror JSON helpers ─────────────────────────────────────────
// Build doc.toJSON()-compatible nodes for KB article bodies.

interface PmMark {
  type: string;
  attrs?: Record<string, unknown>;
}
interface PmNode {
  type: string;
  attrs?: Record<string, unknown>;
  marks?: PmMark[];
  content?: PmNode[];
  text?: string;
}

function pmDoc(...content: PmNode[]): string {
  return JSON.stringify({ type: "doc", content });
}

function p(...children: PmNode[]): PmNode {
  return { type: "paragraph", content: children };
}

function t(text: string, ...marks: PmMark[]): PmNode {
  const node: PmNode = { type: "text", text };
  if (marks.length > 0) node.marks = marks;
  return node;
}

function h(level: number, ...children: PmNode[]): PmNode {
  return { type: "heading", attrs: { level }, content: children };
}

function ul(...items: PmNode[]): PmNode {
  return { type: "bullet_list", content: items };
}

function ol(...items: PmNode[]): PmNode {
  return { type: "ordered_list", content: items };
}

function li(...content: PmNode[]): PmNode {
  return { type: "list_item", content };
}

function bq(...content: PmNode[]): PmNode {
  return { type: "blockquote", content };
}

function codeBlock(text: string): PmNode {
  return { type: "code_block", content: [{ type: "text", text }] };
}

function br(): PmNode {
  return { type: "hard_break" };
}

function table(...rows: PmNode[]): PmNode {
  return { type: "table", content: rows };
}

function tr(...cells: PmNode[]): PmNode {
  return { type: "table_row", content: cells };
}

function th(...children: PmNode[]): PmNode {
  return { type: "table_header", content: [p(...children)] };
}

function td(...children: PmNode[]): PmNode {
  return { type: "table_cell", content: [p(...children)] };
}

function hr(): PmNode {
  return { type: "horizontal_rule" };
}

function img(src: string, alt?: string): PmNode {
  const attrs: Record<string, unknown> = { src };
  if (alt !== undefined) attrs.alt = alt;
  return { type: "image", attrs };
}

const bold: PmMark = { type: "strong" };
const italic: PmMark = { type: "em" };
const strike: PmMark = { type: "strikethrough" };
const code: PmMark = { type: "code" };
function link(href: string): PmMark {
  return { type: "link", attrs: { href } };
}

// ── Seed data definitions ────────────────────────────────────────────

/** Generated stories the dev Settings seed and e2e replay. */
export { DEV_SEED_STORY_COUNT };

/** The seeded org's name and colors, as in the README screenshots. */
const SEED_ORG_NAME = "CARE-Y";
const SEED_BRAND_PRIMARY = "#016782";
const SEED_BRAND_ACCENT = "#FFA57D";

/** Handbook ticket client's phone, outside the story range (+1555001NNNN). */
const HANDBOOK_CLIENT_PHONE = "+15550029999";
/**
 * Name for the handbook's client photo. An MMS carries none, but the
 * upload requires one.
 */
const HANDBOOK_PHOTO_FILENAME = "photo.jpg";

// Escalation is off (0 days). Seeded tickets are backdated up to 30 days,
// so any threshold would have the recurring escalation job raise dozens of
// them at once on its next run, all stamped "now".
const QUEUES = [
  { name: "Intake", escalateDays: 0, color: "blue", icon: "phone" },
  { name: "Crisis", escalateDays: 0, color: "red", icon: "triangle-alert" },
  { name: "Housing", escalateDays: 0, color: "green", icon: "house" },
] as const;

const KB_CATEGORIES = ["Procedures", "Resources", "Safety"] as const;

interface NoteTypeDef {
  name: string;
  icon: string;
  escalationTargets: EscalationTarget[];
  requiresOnClose?: boolean;
}

const NOTE_TYPES: readonly NoteTypeDef[] = [
  {
    name: "Comment",
    icon: "message-square-dashed",
    escalationTargets: [{ type: "ticket_access" }],
  },
  {
    name: "Resolution",
    icon: "clipboard-check",
    escalationTargets: [{ type: "ticket_access" }],
    requiresOnClose: true,
  },
  {
    name: "Safety Concern",
    icon: "life-buoy",
    escalationTargets: [
      { type: "role", value: "admin" },
      { type: "role", value: "manager" },
      { type: "ticket_access" },
    ],
  },
  {
    name: "Request",
    icon: "heart-handshake",
    escalationTargets: [
      { type: "role", value: "admin" },
      { type: "role", value: "manager" },
      { type: "ticket_access" },
    ],
  },
];

// ── User definitions ────────────────────────────────────────────────

/** The dev seed's own people, used when the caller passes none. */
const SEED_USERS: readonly SeedReplayUser[] = [
  {
    identifier: "vol.intake",
    displayName: "Jordan Rivera",
    roleId: RoleId.VOLUNTEER,
    queueIndices: [0],
  },
  {
    identifier: "vol.crisis",
    displayName: "Morgan Patel",
    roleId: RoleId.VOLUNTEER,
    queueIndices: [1],
  },
  {
    identifier: "vol.housing",
    displayName: "Avery Chen",
    roleId: RoleId.VOLUNTEER,
    queueIndices: [0, 2],
  },
  {
    identifier: "vol.all",
    displayName: "Riley Thompson",
    roleId: RoleId.VOLUNTEER,
    queueIndices: [0, 1, 2],
  },
  {
    identifier: "mgr.ops",
    displayName: "Casey Okafor",
    roleId: RoleId.MANAGER,
    queueIndices: [0, 1, 2],
  },
];

const SEED_PASSWORD = "dev-password-1234!";

// ── Preset replies ──────────────────────────────────────────────────

const PRESET_REPLIES = [
  {
    title: "Acknowledgment",
    body: "Thank you for calling. We are reviewing your case and will follow up shortly.",
  },
  {
    title: "Specialist assigned",
    body: "Your case has been assigned to a specialist. Please call back if your situation changes before we contact you.",
  },
  {
    title: "Resource referral",
    body: "We have connected you with the appropriate resource. Please let us know if you need anything else.",
  },
  {
    title: "Callback scheduled",
    body: "We have scheduled a callback. If you need to reach us before then, please call our main line.",
  },
];

const KB_ARTICLES: readonly {
  category: string;
  title: string;
  body: string;
  excerpt: string;
}[] = [
  {
    category: "Procedures",
    title: "Intake call checklist",
    excerpt:
      "Step-by-step checklist for receiving and documenting intake calls from new callers.",
    body: pmDoc(
      h(2, t("Before the call")),
      p(
        t(
          "Confirm your workstation is ready. Your headset should be connected, ",
        ),
        t("the ticketing system open", bold),
        t(", and any reference materials within reach."),
      ),
      ul(
        li(
          p(t("Check that your session is active and crypto keys are loaded")),
        ),
        li(p(t("Open the new ticket form so you can type during the call"))),
        li(p(t("Review any prior tickets if the caller ID is recognized"))),
      ),
      h(2, t("During the call")),
      h(3, t("Opening the conversation")),
      ol(
        li(
          p(
            t("Greet the caller calmly. Use a neutral opening: "),
            t('"Thank you for calling, how can I help you today?"', italic),
          ),
        ),
        li(
          p(
            t(
              "Ask for their preferred name or alias. Do not require legal names.",
            ),
          ),
        ),
        li(
          p(
            t(
              "Document the reason for the call in the ticket body. Use their words where possible.",
            ),
          ),
        ),
      ),
      h(3, t("Routing the call")),
      ol(
        li(
          p(
            t("If the caller describes an "),
            t("immediate safety concern", bold),
            t(", follow the "),
            t("Escalation Protocol", link("#escalation-protocol")),
            t(" instead of continuing standard intake."),
          ),
        ),
        li(
          p(
            t("Set the ticket "),
            t("Status", code),
            t(" field to "),
            t("In Progress", code),
            t(" and assign the appropriate "),
            t("Queue", code),
            t("."),
          ),
        ),
        li(
          p(
            t(
              "Confirm the next step with the caller before ending: referral, callback, or case assignment.",
            ),
          ),
        ),
      ),
      h(2, t("After the call")),
      p(
        t(
          "Complete all required ticket fields before moving to the next call. ",
        ),
        t(
          "Incomplete tickets create gaps in the case record that are difficult to fill later.",
        ),
      ),
      ul(
        li(p(t("Assign the ticket to the appropriate queue"))),
        li(p(t("Add any follow-up tasks with due dates"))),
        li(
          p(
            t(
              "If the caller requested a callback, set the reminder for the agreed time",
            ),
          ),
        ),
      ),
      bq(
        p(
          t("Remember: "),
          t("you are often the first point of contact", bold),
          t(
            ". A calm, patient interaction makes a real difference, even if the call feels routine to you.",
          ),
        ),
      ),
    ),
  },
  {
    category: "Procedures",
    title: "Escalation protocol",
    excerpt:
      "When and how to escalate a call involving immediate safety concerns or crisis situations.",
    body: pmDoc(
      p(
        t("This protocol applies when a caller reports an "),
        t("immediate threat to their safety", bold),
        t(
          " or the safety of someone in their household. Escalation is not punitive. It connects the caller with resources faster.",
        ),
      ),
      h(2, t("Recognizing escalation triggers")),
      p(
        t(
          "Not every distressed caller needs escalation. Look for these specific indicators:",
        ),
      ),
      ul(
        li(p(t("The caller states they are in physical danger right now"))),
        li(p(t("The caller describes an active threat from a known person"))),
        li(p(t("The caller mentions self-harm or suicidal ideation"))),
        li(
          p(t("A child or dependent is described as being in immediate risk")),
        ),
      ),
      p(
        t("If you are unsure whether a situation qualifies, "),
        t("escalate anyway", bold),
        t(". False escalations are far less costly than missed ones."),
      ),
      h(2, t("Escalation steps")),
      ol(
        li(
          p(
            t(
              "Stay on the line with the caller. Do not ask them to call back.",
            ),
          ),
        ),
        li(
          p(
            t("Use the "),
            t("crisis flag", bold),
            t(
              " on the ticket form. This moves the ticket to the Crisis queue and pages the on-call supervisor.",
            ),
          ),
        ),
        li(
          p(
            t(
              "If the caller consents, collect their current location. This may be needed if emergency services are involved.",
            ),
          ),
        ),
        li(
          p(
            t(
              "Transfer the call to the crisis volunteer when they join. Brief them on what you know so the caller does not have to repeat themselves.",
            ),
          ),
        ),
        li(
          p(
            t(
              "Document the transfer in the ticket timeline. Note who took over and when.",
            ),
          ),
        ),
      ),
      h(2, t("Transfer documentation")),
      p(
        t(
          "When transferring a crisis call, paste the following template into the ticket timeline:",
        ),
      ),
      codeBlock(
        "ESCALATION HANDOFF\n" +
          "Time: [HH:MM]\n" +
          "Transferred to: [volunteer name]\n" +
          "Reason: [brief trigger description]\n" +
          "Caller on line: [yes/no]\n" +
          "Location disclosed: [yes/no]",
      ),
      p(
        t("Previously, escalation calls were routed through an "),
        t("automated phone tree", strike),
        t(
          ". That system was retired because callers in crisis could not navigate menu prompts reliably. All escalations now go directly to a live crisis volunteer.",
        ),
      ),
      hr(),
      h(2, t("After an escalation")),
      p(
        t(
          "Escalation calls can be emotionally difficult. Take a few minutes before your next call if you need to. Debrief with your supervisor if the situation was particularly intense.",
        ),
      ),
      p(
        t(
          "All escalation calls are reviewed within 48 hours as part of quality assurance. This is ",
        ),
        t("not", italic),
        t(
          " a performance review. The goal is to improve the protocol over time.",
        ),
      ),
    ),
  },
  {
    category: "Resources",
    title: "Housing referral contacts",
    excerpt:
      "Regional housing assistance contacts and referral procedures for callers facing housing instability.",
    body: pmDoc(
      p(
        t(
          "This directory covers the primary housing assistance contacts for our service area. Verify availability before giving a caller any specific contact, as capacity changes frequently.",
        ),
      ),
      h(2, t("Emergency shelter")),
      p(
        t("For callers who need "),
        t("same-day shelter placement", bold),
        t(
          ", start with the regional shelter coordinating office. They maintain a real-time bed availability list that individual shelters do not publish.",
        ),
      ),
      p(
        t("Regional Shelter Coordinating Office", bold),
        br(),
        t("Hours: Monday through Friday, 8 AM to 6 PM"),
        br(),
        t("After-hours line available for emergencies"),
        br(),
        t("See the "),
        t(
          "HUD resource locator",
          link("https://www.hud.gov/program_offices/comm_planning/coc"),
        ),
        t(" for the full national directory."),
      ),
      ul(
        li(
          p(
            t(
              "Ask the caller about any access needs (wheelchair, pets, children) before calling the coordinator",
            ),
          ),
        ),
        li(
          p(
            t(
              "Some shelters have gender-specific or age-specific restrictions",
            ),
          ),
        ),
        li(
          p(
            t(
              "Wait times vary. Let the caller know this may take more than one call to resolve.",
            ),
          ),
        ),
      ),
      h(2, t("Transitional housing")),
      p(
        t(
          "Transitional programs typically require an application and may have waiting lists measured in weeks. They are appropriate for callers who have temporary shelter but need longer-term stability.",
        ),
      ),
      ol(
        li(
          p(
            t(
              "Confirm the caller has valid identification or can obtain it. Most programs require ID within 30 days of intake.",
            ),
          ),
        ),
        li(
          p(
            t(
              "Gather their preferred contact method for follow-up. Some callers cannot safely receive phone calls at certain times.",
            ),
          ),
        ),
        li(
          p(
            t(
              "Submit the referral through the housing queue. The housing coordinator will follow up within two business days.",
            ),
          ),
        ),
      ),
      h(2, t("What not to promise")),
      bq(
        p(
          t("Never guarantee placement timelines. "),
          t("Say ", italic),
          t('"I will connect you with the people who can help" ', italic),
          t("rather than ", italic),
          t('"We will find you a place."', italic),
          t(" Promises that cannot be kept damage trust."),
        ),
      ),
    ),
  },
  {
    category: "Resources",
    title: "Legal aid directory",
    excerpt:
      "Legal assistance organizations for civil, family, and immigration matters relevant to our callers.",
    body: pmDoc(
      h(1, t("Legal Aid Directory")),
      p(
        t("Legal referrals require care. We are "),
        t("not lawyers", bold),
        t(
          " and cannot give legal advice. Our role is to connect callers with organizations that can.",
        ),
      ),
      h(2, t("When to offer a legal referral")),
      p(
        t(
          "A legal referral is appropriate when the caller describes a situation that involves:",
        ),
      ),
      ul(
        li(
          p(
            t(
              "A protection or restraining order (obtaining, modifying, or responding to one)",
            ),
          ),
        ),
        li(p(t("Custody or family court proceedings"))),
        li(
          p(t("Immigration status concerns that affect their safety options")),
        ),
        li(p(t("Eviction or landlord disputes connected to their situation"))),
        li(p(t("Criminal proceedings where they are a witness or victim"))),
      ),
      h(2, t("Organization types")),
      p(
        t(
          "Use this table to match the caller's issue to the right kind of organization:",
        ),
      ),
      table(
        tr(
          th(t("Issue type")),
          th(t("Organization category")),
          th(t("Typical wait")),
        ),
        tr(
          td(t("Protection orders")),
          td(t("Domestic violence legal clinic")),
          td(t("1 to 3 days")),
        ),
        tr(
          td(t("Custody / family court")),
          td(t("Family law legal aid")),
          td(t("1 to 2 weeks")),
        ),
        tr(
          td(t("Immigration")),
          td(t("Immigration legal services")),
          td(t("2 to 4 weeks")),
        ),
        tr(
          td(t("Eviction / housing")),
          td(t("Tenant rights organization")),
          td(t("3 to 5 days")),
        ),
        tr(
          td(t("Criminal (victim/witness)")),
          td(t("Victim advocacy program")),
          td(t("Same day to 1 week")),
        ),
      ),
      p(
        t(
          "Wait times are estimates. Actual availability depends on the organization's current caseload.",
        ),
      ),
      h(2, t("Referral process")),
      ol(
        li(
          p(
            t(
              "Ask the caller what type of legal help they need. Use plain language: ",
            ),
            t(
              '"Are you dealing with a court case, a landlord issue, or something with immigration?"',
              italic,
            ),
          ),
        ),
        li(
          p(
            t(
              "Check whether the caller has previously worked with an attorney. If so, reconnecting with that attorney may be faster than starting over.",
            ),
          ),
        ),
        li(
          p(
            t(
              "Match the caller to the appropriate organization based on issue type and their location.",
            ),
          ),
        ),
        li(
          p(
            t(
              "Provide the organization name and phone number. Offer to note it in a follow-up callback if the caller cannot write it down safely.",
            ),
          ),
        ),
      ),
      h(2, t("Important boundaries")),
      p(
        t(
          "Do not interpret legal documents for callers, speculate about case outcomes, or recommend specific legal strategies. If a caller asks for your opinion on a legal matter, redirect with something like:",
        ),
      ),
      bq(
        p(
          t(
            '"I am not able to give legal advice, but the folks at [organization] handle exactly this kind of situation. They can walk you through your options."',
            italic,
          ),
        ),
      ),
    ),
  },
  {
    category: "Safety",
    title: "Safety planning template",
    excerpt:
      "Structured template for helping callers identify warning signs, coping strategies, and safe contacts.",
    body: pmDoc(
      p(
        t("A safety plan is a "),
        t("personalized, practical document", bold),
        t(
          " that helps someone recognize danger signs and take protective steps. It is not a contract or a commitment. It is a tool the caller creates for themselves, with your support.",
        ),
      ),
      h(2, t("When to offer a safety plan")),
      p(t("Safety planning is appropriate when a caller:")),
      ul(
        li(
          p(t("Describes a pattern of escalating conflict in their household")),
        ),
        li(
          p(
            t(
              "Is considering leaving a dangerous situation but has not yet done so",
            ),
          ),
        ),
        li(
          p(
            t(
              "Has left a dangerous situation but is concerned about continued contact or retaliation",
            ),
          ),
        ),
        li(
          p(
            t(
              "Expresses thoughts of self-harm (use this alongside a crisis referral, not instead of one)",
            ),
          ),
        ),
      ),
      h(2, t("Plan sections")),
      p(
        t("Walk through each section with the caller. "),
        t("Do not rush this.", bold),
        t(
          " Let them lead. Some callers will have clear answers for every section. Others will need time to think.",
        ),
      ),
      ol(
        li(
          p(
            t("Warning signs", bold),
            t(
              ": What situations, feelings, or behaviors tell you that things are becoming unsafe?",
            ),
          ),
        ),
        li(
          p(
            t("Coping strategies", bold),
            t(
              ": What can you do on your own to manage stress or fear in the moment? (e.g., breathing exercises, going for a walk, calling a friend)",
            ),
          ),
        ),
        li(
          p(
            t("People who can help", bold),
            t(
              ": Who are the people you trust that you can contact when you need support? List names and how to reach them.",
            ),
          ),
        ),
        li(
          p(
            t("Places to go", bold),
            t(
              ": If you need to leave quickly, where can you go? Think about more than one option.",
            ),
          ),
        ),
        li(
          p(
            t("Emergency contacts", bold),
            t(
              ": Numbers for local emergency services, crisis hotlines, and any case workers already involved.",
            ),
          ),
        ),
        li(
          p(
            t("Making the environment safer", bold),
            t(
              ": Are there steps you can take now to reduce risk? (e.g., keeping important documents in a bag you can grab, telling a neighbor your situation)",
            ),
          ),
        ),
      ),
      hr(),
      h(2, t("After completing the plan")),
      h(3, t("Storage")),
      p(
        t(
          "Ask the caller where they will keep the plan. It should be somewhere they can access quickly but that is not visible to the person who poses the risk. A phone note, a trusted friend, or a sealed envelope at work are common choices.",
        ),
      ),
      h(3, t("Documentation")),
      h(4, t("What to record")),
      p(
        t(
          "Record in the ticket that a safety plan was discussed. Note the date it was created.",
        ),
      ),
      h(4, t("What not to record")),
      p(
        t("Do not copy the plan contents into the ticket.", bold),
        t(
          " The plan belongs to the caller. It contains names, addresses, and strategies that could put them at greater risk if disclosed. The ticket should only confirm that a plan exists.",
        ),
      ),
    ),
  },
  {
    category: "Resources",
    title: "Accessibility issues example",
    excerpt:
      "Reference article with intentional accessibility violations. Each section demonstrates a common mistake and explains why it fails.",
    body: pmDoc(
      h(2, t("About this article")),
      p(
        t(
          "This article is intentionally written with accessibility violations. Each section below demonstrates a common authoring mistake and explains why it creates a barrier for people who use assistive technology. The accessibility checker should flag every issue listed here.",
        ),
      ),
      hr(),
      h(2, t("Skipped heading levels")),
      p(
        t(
          "Headings form an outline that screen reader users navigate to jump between sections. When a level is skipped (for example, jumping from H2 to H4), the outline has a gap. A screen reader user cannot tell whether they missed a section or the author used the wrong level for visual styling. Always step headings down one level at a time.",
        ),
      ),
      h(4, t("This heading skips from H2 to H4")),
      p(
        t(
          "The heading above should be H3, not H4. The checker flags this as a heading level skip.",
        ),
      ),
      h(2, t("Empty headings")),
      p(
        t(
          'An empty heading is announced by screen readers as a heading with no label. The user hears something like "heading level 3, blank" and has no way to know what section they entered. Empty headings are often left behind after deleting text or pasting from another document. Delete the heading node entirely if it has no content.',
        ),
      ),
      h(3),
      p(
        t(
          "The empty heading above has no text at all. The checker flags it as an empty heading.",
        ),
      ),
      h(3, t(" ")),
      p(
        t(
          "The heading above contains only a space character, which is treated the same as empty. Whitespace-only headings are equally invisible to assistive technology.",
        ),
      ),
      h(2, t("Images without alt text")),
      p(
        t(
          'When an image has no alt text, screen readers either skip it entirely or read the raw file URL, which sounds like "image, https colon slash slash example dot com slash photos slash workstation dash layout dot jpg." Neither outcome tells the user what the image shows. Every image should have alt text that conveys the same information a sighted user gets from looking at it.',
        ),
      ),
      img("https://example.com/photos/workstation-layout.jpg"),
      p(
        t(
          "The image above has no alt attribute. The checker flags it as missing alt text.",
        ),
      ),
      p(t("For comparison, here is the same image with proper alt text:")),
      p(
        img(
          "https://example.com/photos/workstation-layout.jpg",
          "Recommended desk layout showing monitor, keyboard, phone, and headset positions",
        ),
      ),
      img("https://example.com/photos/headset-comparison.jpg"),
      p(
        t(
          "This second image also lacks alt text. The checker should flag each instance independently.",
        ),
      ),
      h(2, t("Generic link text")),
      p(
        t(
          'Screen reader users often navigate by pulling up a list of all links on the page. When every link says "click here" or "read more," the list is useless. Link text should describe where the link goes or what it does, so it makes sense out of context.',
        ),
      ),
      h(4, t("Examples of generic link text")),
      p(
        t("Bad: "),
        t("click here", link("https://example.com/extension")),
        t(" to install the browser extension."),
      ),
      p(
        t("Better: Install the "),
        t(
          "encrypted clipboard browser extension",
          link("https://example.com/extension"),
        ),
        t("."),
      ),
      p(
        t("Bad: "),
        t("Read more", link("https://example.com/password-managers")),
        t(" about password managers."),
      ),
      p(
        t("Better: See our "),
        t(
          "list of supported password managers",
          link("https://example.com/password-managers"),
        ),
        t("."),
      ),
      p(
        t("Bad: The microphone test instructions are "),
        t("here", link("https://example.com/mic-test")),
        t("."),
      ),
      p(
        t("Better: Follow the "),
        t("microphone test instructions", link("https://example.com/mic-test")),
        t(" before your first call."),
      ),
      p(
        t("Bad: "),
        t("Learn more", link("https://example.com/handbook")),
        t(" about multi-line call handling."),
      ),
      p(
        t("Better: The "),
        t(
          "volunteer handbook chapter on multi-line calls",
          link("https://example.com/handbook"),
        ),
        t(" covers hold, transfer, and conference features."),
      ),
    ),
  },
];

// ── Helpers ──────────────────────────────────────────────────────────

function seal(plaintext: string, orgPublicKey: Uint8Array): string {
  const encoder = new TextEncoder();
  return encode(sealForOrgKey(encoder.encode(plaintext), orgPublicKey));
}

// ── Entry point ──────────────────────────────────────────────────────

/**
 * Replays the shared seed data through the product's endpoints.
 *
 * Resolves only once every step has run, with the ids it created. Any
 * failure rejects with a
 * {@link SeedReplayError} naming the step it stopped at, with the
 * underlying failure as its cause. Rows written before the failure stay
 * in place; the next run resets them first.
 */
export async function seedReplay(
  deps: SeedReplayDeps,
): Promise<SeedReplayResult> {
  let step = "Starting...";
  const progress: SeedProgressCallback = (message) => {
    step = message;
    deps.onProgress?.(message);
  };
  try {
    return await runReplay(deps, progress);
  } catch (err: unknown) {
    if (err instanceof SeedReplayError) throw err;
    // The underlying message stays in the text so the Settings page,
    // which shows only the message, still says why.
    const reason = err instanceof Error ? err.message : String(err);
    throw new SeedReplayError(
      `Seed replay failed at "${step}": ${reason}`,
      err,
    );
  }
}

async function runReplay(
  deps: SeedReplayDeps,
  progress: SeedProgressCallback,
): Promise<SeedReplayResult> {
  const { client, bridge } = deps;
  const orgPublicKey = deps.orgKeyManager.getPublicKey();
  if (!orgPublicKey) {
    throw new SeedReplayError(
      "Org public key not loaded. Complete onboarding first.",
    );
  }
  if (!Number.isInteger(deps.storyCount) || deps.storyCount < 1) {
    throw new SeedReplayError(
      `Story count must be a positive integer, got ${String(deps.storyCount)}`,
    );
  }
  const seedUsers = deps.users ?? SEED_USERS;
  if (seedUsers.length === 0) {
    throw new SeedReplayError("The replay needs at least one user");
  }

  const ticketRouter = client.tickets;
  const kbRouter = client.kb;
  const authRouter = client.auth;
  const devRouter = client.dev;

  // ── Step 0: Reset existing seed data ────────────────────────────────
  progress("Resetting existing data...");
  await devRouter.resetSeedData.mutate();
  console.log("[dev-seed] Reset complete");

  // ── Step 1: Users + queue assignments ───────────────────────────────
  progress("Creating users...");
  const existingUsers = await authRouter.listUsers.query();
  // Identifiers are org-key sealed; the server cannot return plaintext.
  // Decrypt through the worker to match seed users on re-runs.
  const decrypted = await bridge.orgDecryptBatch(
    existingUsers.map((u) => ({
      cacheKey: u.id,
      ciphertext: u.encryptedIdentifier,
    })),
  );
  const existingIdByIdentifier = new Map<string, string>();
  for (const r of decrypted) {
    if (r.plaintext !== null) {
      // care-y-ignore-next-line no-plaintext-db-write -- in-memory Map for seed idempotency, not a DB write
      existingIdByIdentifier.set(r.plaintext, r.cacheKey);
    }
  }
  const seededUserIds: Record<string, string> = {};

  for (const user of seedUsers) {
    const existingId = existingIdByIdentifier.get(user.identifier);
    if (existingId !== undefined) {
      seededUserIds[user.identifier] = existingId;
      console.log(
        `[dev-seed] User "${user.identifier}" already exists, skipping`,
      );
      continue;
    }
    const result = await authRouter.register.mutate({
      identifier: user.identifier,
      password: SEED_PASSWORD,
      displayName: user.displayName,
      roleId: user.roleId,
    });
    seededUserIds[user.identifier] = result.user.id;
    console.log(`[dev-seed] Created user: ${user.identifier}`);
  }

  // ── Step 2: Queues ──────────────────────────────────────────────────
  progress("Creating queues...");
  for (const q of QUEUES) {
    await ticketRouter.createQueue.mutate({
      encryptedName: seal(q.name, orgPublicKey),
      encryptedColor: seal(q.color, orgPublicKey),
      encryptedIcon: seal(q.icon, orgPublicKey),
      escalateDays: q.escalateDays,
    });
    console.log(`[dev-seed] Created queue: ${q.name}`);
  }

  const queues = await ticketRouter.listQueues.query();

  // Assign admin (current user) to all queues
  const meResult = await authRouter.me.query();
  const adminId = meResult.user.id;
  for (const q of queues) {
    await ticketRouter.addQueueMember.mutate({
      queueId: q.id,
      userId: adminId,
    });
  }

  // Assign seeded users to their queues
  for (const user of seedUsers) {
    const userId = seededUserIds[user.identifier];
    if (userId === undefined || userId === "") continue;
    for (const qi of user.queueIndices) {
      const queue = queues[qi];
      if (!queue) continue;
      await ticketRouter.addQueueMember.mutate({
        queueId: queue.id,
        userId,
      });
    }
  }
  console.log("[dev-seed] Queue assignments complete");

  // Inbound calls and routed quarantine voicemails open tickets in the
  // intake queue, which a real org sets on the admin queues screen.
  const intakeQueue = queues.at(0);
  if (intakeQueue !== undefined) {
    await client.org.setIntakeQueue.mutate({ queueId: intakeQueue.id });
  }

  // ── Step 2b: Branding ───────────────────────────────────────────────
  // The org's name and its brand and accent colors, set the way the
  // settings pages set them.
  progress("Setting branding...");
  await client.branding.saveBrandingField.mutate({
    field: "name",
    value: SEED_ORG_NAME,
  });
  await client.branding.saveBrandingField.mutate({
    field: "primary_color",
    value: SEED_BRAND_PRIMARY,
  });
  await client.branding.saveBrandingField.mutate({
    field: "accent_color",
    value: SEED_BRAND_ACCENT,
  });

  // ── Step 3: KB Categories ───────────────────────────────────────────
  progress("Creating KB categories...");
  for (const name of KB_CATEGORIES) {
    await kbRouter.createCategory.mutate({
      encryptedName: seal(name, orgPublicKey),
    });
    console.log(`[dev-seed] Created KB category: ${name}`);
  }

  const categories = await kbRouter.listCategories.query();

  // ── Step 4: Note Types ──────────────────────────────────────────────
  progress("Creating note types...");
  const noteTypesRouter = ticketRouter.noteTypes;
  const noteTypeIds: string[] = [];
  if (noteTypesRouter) {
    for (const nt of NOTE_TYPES) {
      const result = await noteTypesRouter.create.mutate({
        encryptedName: seal(nt.name, orgPublicKey),
        encryptedIcon: seal(nt.icon, orgPublicKey),
        escalationTargets: nt.escalationTargets,
        requiresOnClose: nt.requiresOnClose,
      });
      noteTypeIds.push(result.id);
      console.log(`[dev-seed] Created note type: ${nt.name}`);
    }
  }

  // ── Step 5: KB Articles ─────────────────────────────────────────────
  progress("Creating KB articles...");
  const categoryNameToSortOrder: Record<string, number> = {
    Procedures: 1,
    Resources: 2,
    Safety: 3,
  };

  const articleIds: string[] = [];
  for (const article of KB_ARTICLES) {
    const targetSort = categoryNameToSortOrder[article.category];
    const cat = categories.find((c) => c.sortOrder === targetSort);
    if (!cat) continue;

    const result = await kbRouter.createItem.mutate({
      categoryId: cat.id,
      encryptedTitle: seal(article.title, orgPublicKey),
      encryptedBody: seal(article.body, orgPublicKey),
      encryptedExcerpt: seal(article.excerpt, orgPublicKey),
    });
    articleIds.push(result.id);
    console.log(`[dev-seed] Created KB article: ${article.title}`);
  }

  // ── Ticket helpers ──────────────────────────────────────────────────
  // Shared by the story replay and the handbook story ticket below, so
  // both go through the same create, write and read-state code.

  /** Creates a ticket the way the new-ticket screen does. Returns its id. */
  const createTicket = async (
    lookup: SeedPhoneLookup,
    def: {
      readonly queue: string;
      readonly title: string;
      readonly description: string;
      readonly priority: TicketPriority;
    },
  ): Promise<string> => {
    // Seeding assumes a reset DB (step 0), so every create is fresh and
    // the minted id is the id the row will get (the content AAD binds it).
    const mintedTicketId = newTicketId();

    const targetQueue = queues[QUEUES.findIndex((q) => q.name === def.queue)];
    if (!targetQueue) {
      throw new SeedReplayError("Seed queue not found: " + def.queue);
    }

    // Fetch queue member public keys for the wrap floor
    const recipients = await ticketRouter.listQueueMemberPublicKeys.query({
      queueId: targetQueue.id,
    });

    const encrypted = await bridge.createTicketEncryption(
      mintedTicketId,
      [
        { name: "title", plaintext: def.title },
        { name: "description", plaintext: def.description },
      ],
      recipients,
    );

    const findField = (name: string): string => {
      const field = encrypted.encryptedFields.find((f) => f.name === name);
      if (!field) {
        throw new SeedReplayError("Missing encrypted field: " + name);
      }
      return field.ciphertext;
    };

    const created = await ticketRouter.create.mutate({
      id: mintedTicketId,
      ...(lookup.found
        ? { clientId: lookup.clientId }
        : { clientToken: lookup.token }),
      queueId: targetQueue.id,
      encryptedTitle: findField("title"),
      encryptedDescription: findField("description"),
      priority: def.priority,
      keyGeneration: encrypted.keyGeneration,
      keyWraps: [...encrypted.keyWraps],
    });
    return created.id;
  };

  /**
   * Caches the viewer's copy of the ticket key for follow-up encryption.
   * The create path zeroes its content key, so the seed unwraps its own.
   * Returns the ticket's key generation.
   */
  const cacheTicketKey = async (ticketId: string): Promise<string> => {
    const ticketData = await ticketRouter.get.query({ ticketId });
    if (!ticketData.keyWrap) {
      throw new SeedReplayError("Seed ticket has no key wrap for the viewer");
    }
    await bridge.unwrapTk(
      ticketId,
      ticketId,
      ticketData.keyWrap.ephemeralPoint,
      ticketData.keyWrap.nonce,
      ticketData.keyWrap.wrappedKey,
    );
    return ticketData.keyGeneration;
  };

  /** Writes one follow-up through createFollowUp. Returns its id. */
  const writeFollowUp = async (
    ticketId: string,
    kind: { readonly type: FollowUpType; readonly source: FollowUpSource },
    content: string,
    options?: {
      readonly noteTypeId?: string;
      readonly attachments?: readonly { attachmentId: string }[];
    },
  ): Promise<string> => {
    const followUpId = newFollowupId();
    const encryptedContent = await bridge.encrypt(
      ticketId,
      followupSlot(followUpId),
      content,
    );
    await ticketRouter.createFollowUp.mutate({
      id: followUpId,
      ticketId,
      encryptedContent,
      source: kind.source,
      type: kind.type,
      isPrivate: kind.type === "internal_note",
      mentionedPseudonyms: [],
      ...(options?.noteTypeId !== undefined
        ? { noteTypeId: options.noteTypeId }
        : {}),
      ...(options?.attachments !== undefined
        ? { attachments: [...options.attachments] }
        : {}),
    });
    return followUpId;
  };

  /** How many follow-ups the ticket has, as the timeline lists them. */
  const countFollowUps = async (ticketId: string): Promise<number> => {
    const written = await ticketRouter.listFollowUps.query({
      ticketId,
      limit: 500,
    });
    return written.followUps.length;
  };

  /**
   * Marks the ticket read up to `minutesAgo` for the viewer, so client
   * messages after it show as unread.
   */
  const readCursorTicketIds: string[] = [];
  const writeReadCursor = async (
    ticketId: string,
    minutesAgo: number,
  ): Promise<void> => {
    const readUpTo = new Date(Date.now() - minutesAgo * 60_000);
    const encryptedReadCursor = await bridge.encrypt(
      ticketId,
      cursorSlot(adminId),
      JSON.stringify({ readUpTo: readUpTo.toISOString() }),
    );
    // updateReadCursor only updates; getReadCursor creates the row first.
    await ticketRouter.getReadCursor.query({ ticketId });
    await ticketRouter.updateReadCursor.mutate({
      ticketId,
      encryptedReadCursor,
    });
    readCursorTicketIds.push(ticketId);
  };

  // ── Step 6: Ticket stories ──────────────────────────────────────────
  // Each story is replayed through the production mutations, then the dev
  // timeline procedure spreads the written follow-ups across its times.
  const stories = buildSeedStories(deps.storyCount);
  // In the order the caller listed the users, which decides who is drawn
  // first.
  const userIdValues = seedUsers
    .map((user) => seededUserIds[user.identifier] ?? "")
    .filter((id) => id !== "");
  let otherAssignCount = 0;
  const voicemailAudio = encode(await deps.loadVoicemail());
  const quarantineRouter = client.voicemailQuarantine;

  // Pending quarantine entries: the ones the admin quarantine screen keeps
  // showing, plus one per quarantine story, routed below the way an admin
  // routes them.
  progress("Seeding quarantined voicemails...");
  const quarantineResult = await devRouter.seedQuarantine.mutate({
    audio: voicemailAudio,
    durationSeconds: SEED_VOICEMAIL_DURATION_S,
    routable: stories.filter((s) => s.origin.kind === "quarantine").length,
  });
  console.log(
    `[dev-seed] Quarantine: ${String(quarantineResult.count)} entries seeded`,
  );
  let routedCount = 0;
  const storyTicketIds: string[] = [];

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    if (story === undefined) continue;

    if (i % 10 === 0) {
      progress(`Seeding tickets (${String(i)}/${String(stories.length)})...`);
    }

    const phone = `+1555001${String(i + 1).padStart(4, "0")}`;
    const lookup = await deps.phoneLookup(phone);

    // A quarantine story's ticket is created by routing a pending
    // quarantined voicemail, as an admin would. Every other ticket is
    // created the way the app and the inbound channels create it.
    const { origin } = story;
    const points: SeedTimelinePoint[] = [];
    let ticketId: string;
    if (origin.kind === "quarantine") {
      const quarantineId = quarantineResult.routableIds.at(routedCount);
      if (quarantineId === undefined) {
        throw new SeedReplayError("No quarantined voicemail left to route");
      }
      routedCount++;
      const routed = await quarantineRouter.route.mutate({
        quarantineId,
        target: lookup.found
          ? { type: "clientId", clientId: lookup.clientId }
          : { type: "clientToken", clientToken: lookup.token },
        audioData: voicemailAudio,
        durationSeconds: SEED_VOICEMAIL_DURATION_S,
      });
      ticketId = routed.ticketId;
      // Routing writes the voicemail follow-up. Count what it wrote so the
      // timeline points line up one to one.
      const written = await countFollowUps(ticketId);
      for (let k = 0; k < written; k++) {
        points.push({ minutesAgo: origin.agoMinutes });
      }
    } else {
      ticketId = await createTicket(lookup, {
        queue: story.queue,
        title: story.title,
        description: story.description,
        priority: story.initialPriority,
      });
    }

    storyTicketIds.push(ticketId);
    const keyGeneration = await cacheTicketKey(ticketId);

    // Routing titles the ticket from the server's generic text. Rename it
    // through the content edit a volunteer would use, so it carries the
    // story's title and description. This writes an audit row only, no
    // follow-up, so the timeline points above still match one to one.
    if (origin.kind === "quarantine") {
      await ticketRouter.updateContent.mutate({
        ticketId,
        encryptedTitle: await bridge.encrypt(ticketId, "title", story.title),
        encryptedDescription: await bridge.encrypt(
          ticketId,
          "description",
          story.description,
        ),
        keyGeneration,
      });
    }

    // One point per follow-up, in insertion order: the origin follow-ups
    // (none for a ticket staff opened), then one per step (each step's
    // mutation writes exactly one follow-up). A call with a duration was
    // answered; one without it was missed, matching how the server seeder
    // writes the same stories. A voicemail follows its missed call a
    // minute later, through the production recording path.
    if (origin.kind !== "quarantine") {
      for (const [k, shape] of originFollowUps(origin.kind).entries()) {
        if (shape.type === "voicemail") {
          await devRouter.seedVoicemail.mutate({
            ticketId,
            audio: voicemailAudio,
            durationSeconds: SEED_VOICEMAIL_DURATION_S,
          });
          points.push({ minutesAgo: origin.agoMinutes - k });
        } else if (shape.type === "phone_call") {
          await writeFollowUp(ticketId, shape, "");
          points.push(
            origin.callDurationSeconds !== undefined
              ? {
                  minutesAgo: origin.agoMinutes,
                  callStatus: "completed",
                  callDurationSeconds: origin.callDurationSeconds,
                }
              : { minutesAgo: origin.agoMinutes, callStatus: "no_answer" },
          );
        } else {
          await writeFollowUp(ticketId, shape, origin.content);
          points.push({ minutesAgo: origin.agoMinutes });
        }
      }
    }

    let viewerOwns = false;
    let lastReplyAgoMinutes: number | undefined;
    for (const step of story.steps) {
      switch (step.kind) {
        case "message":
          if (step.from === "volunteer") lastReplyAgoMinutes = step.agoMinutes;
          await writeFollowUp(
            ticketId,
            messageFollowUp(story.channel, step.from),
            messageStepContent(story, step),
          );
          break;
        case "note":
          await writeFollowUp(
            ticketId,
            { type: "internal_note", source: "volunteer" },
            step.content,
            { noteTypeId: noteTypeIds[0] },
          );
          break;
        case "priority":
          await ticketRouter.update.mutate({ ticketId, priority: step.to });
          break;
        case "assign":
          viewerOwns = step.to === "me";
          if (step.to === "me") {
            await ticketRouter.take.mutate({ ticketId });
          } else {
            const targetUserId =
              userIdValues[otherAssignCount % userIdValues.length];
            if (targetUserId === undefined) {
              throw new SeedReplayError("No seeded users to assign tickets to");
            }
            otherAssignCount++;
            await ticketRouter.assignTo.mutate({ ticketId, targetUserId });
          }
          break;
        case "hold":
          await ticketRouter.update.mutate({ ticketId, onHold: true });
          break;
        case "close":
          await ticketRouter.update.mutate({ ticketId, status: "closed" });
          break;
      }
      points.push({ minutesAgo: step.agoMinutes });
    }

    await devRouter.applySeedTimeline.mutate({
      ticketId,
      createdMinutesAgo: origin.agoMinutes,
      points,
    });

    // Tickets that end up with the viewer read up to the viewer's last
    // reply, so client messages after it show as unread.
    if (viewerOwns && lastReplyAgoMinutes !== undefined) {
      await writeReadCursor(ticketId, lastReplyAgoMinutes);
    }

    if (i % 10 === 0) {
      console.log(
        `[dev-seed] Seeded ticket ${String(i + 1)}/${String(stories.length)}`,
      );
    }
  }
  console.log(`[dev-seed] Seeded ${String(stories.length)} ticket stories`);

  // ── Step 6b: Handbook story ticket ──────────────────────────────────
  // The ticket the handbook walkthrough follows, replayed through the same
  // mutations as the stories. The merge rows are left out: the replay has
  // no second ticket to merge in.
  progress("Seeding the handbook story ticket...");
  const handbook = SEED_HANDBOOK_TICKET;
  // The volunteer who works the first shift and reacts to the note: the
  // same pool the stories draw someone else from.
  const handbookOtherId = userIdValues.at(0);
  if (handbookOtherId === undefined) {
    throw new SeedReplayError(
      "No seeded users to hand the handbook ticket over",
    );
  }
  const handbookTicketId = await createTicket(
    await deps.phoneLookup(HANDBOOK_CLIENT_PHONE),
    {
      queue: handbook.queue,
      title: handbook.title,
      description: handbook.description,
      priority: handbook.initialPriority,
    },
  );
  // Reopening below mints a new key generation but keeps the same ticket
  // key, so this cached copy encrypts every later follow-up.
  await cacheTicketKey(handbookTicketId);

  // Anything the create itself wrote lands at the ticket's creation.
  const handbookPoints: SeedTimelinePoint[] = [];
  let handbookWritten = await countFollowUps(handbookTicketId);
  for (let k = 0; k < handbookWritten; k++) {
    handbookPoints.push({ minutesAgo: handbook.createdAgo });
  }

  /** One point per follow-up the last mutation wrote, all at `point`. */
  const recordHandbookPoints = async (
    point: SeedTimelinePoint,
  ): Promise<void> => {
    const count = await countFollowUps(handbookTicketId);
    for (let k = handbookWritten; k < count; k++) {
      handbookPoints.push({ ...point });
    }
    handbookWritten = count;
  };

  const reopenHandbookTicket = async (
    row: SeedHandbookFollowUp,
  ): Promise<void> => {
    // The client texting back reopens the ticket in production, through
    // the inbound path, which keeps the key generation. A volunteer's
    // manual reopen would also bump it and lock the ticket.
    await devRouter.reopenAsClient.mutate({ ticketId: handbookTicketId });
    await recordHandbookPoints({ minutesAgo: row.agoMinutes });
  };

  /**
   * Uploads a message's files the way the composer does, before the
   * message that carries them. Returns the links for createFollowUp.
   */
  const uploadHandbookMedia = async (
    row: SeedHandbookFollowUp,
  ): Promise<{ attachmentId: string }[]> => {
    const links: { attachmentId: string }[] = [];
    for (const media of row.media ?? []) {
      const contentType = portalContentTypeSchema.safeParse(media.contentType);
      if (media.kind === "recording" || !contentType.success) {
        throw new SeedReplayError(
          `Handbook ${media.kind} (${String(media.contentType)}) is not an uploadable attachment`,
        );
      }
      const bytes =
        media.kind === "image" ? generateSeedPng() : generateSeedTextFile();
      const data = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(data).set(bytes);
      const attachmentId = newAttachmentId();
      const result = await bridge.encryptAttachment(
        handbookTicketId,
        attachmentId,
        media.filename ?? HANDBOOK_PHOTO_FILENAME,
        data,
      );
      await ticketRouter.uploadAttachment.mutate({
        ticketId: handbookTicketId,
        attachmentId,
        blob: encode(new Uint8Array(result.blob)),
        sizeBytes: result.blob.byteLength,
        contentType: contentType.data,
        fileKeyWrap: result.fileKeyWrap,
        encryptedFilename: result.encryptedFilename,
      });
      links.push({ attachmentId });
    }
    return links;
  };

  const handbookRows = handbook.followUps.filter((fu) => fu.mergedIn !== true);
  const reopenedEarly = new Set<SeedHandbookFollowUp>();
  let handbookClosed = false;
  for (const [idx, row] of handbookRows.entries()) {
    const type = row.type ?? "message";
    const byOther = row.source === "volunteer" && row.author === "other";

    // The app writes nothing on a closed ticket, so the reopen that
    // follows a message in the story runs before it. The timeline still
    // places the message first.
    if (handbookClosed && row.source !== "system") {
      const reopenRow = handbookRows
        .slice(idx + 1)
        .find((r) => r.type === "status_opened");
      if (reopenRow === undefined) {
        throw new SeedReplayError("Handbook message on a closed ticket");
      }
      await reopenHandbookTicket(reopenRow);
      reopenedEarly.add(reopenRow);
      handbookClosed = false;
    }

    switch (type) {
      case "volunteer_assigned":
        if (
          row.eventParams !== undefined &&
          "user" in row.eventParams &&
          row.eventParams.user === "other"
        ) {
          await ticketRouter.assignTo.mutate({
            ticketId: handbookTicketId,
            targetUserId: handbookOtherId,
          });
        } else {
          await ticketRouter.take.mutate({ ticketId: handbookTicketId });
        }
        await recordHandbookPoints({ minutesAgo: row.agoMinutes });
        break;
      case "volunteer_unassigned":
        // take refuses a ticket someone else holds, so the handoff clears
        // the assignment first and the assign row after it takes over.
        await ticketRouter.assignTo.mutate({
          ticketId: handbookTicketId,
          targetUserId: null,
        });
        await recordHandbookPoints({ minutesAgo: row.agoMinutes });
        break;
      case "hold_placed":
      case "hold_removed":
        await ticketRouter.update.mutate({
          ticketId: handbookTicketId,
          onHold: type === "hold_placed",
        });
        await recordHandbookPoints({ minutesAgo: row.agoMinutes });
        break;
      case "priority_changed":
        await ticketRouter.update.mutate({
          ticketId: handbookTicketId,
          priority:
            row.eventParams !== undefined && "to" in row.eventParams
              ? row.eventParams.to
              : handbook.priority,
        });
        await recordHandbookPoints({ minutesAgo: row.agoMinutes });
        break;
      case "status_closed":
        await ticketRouter.update.mutate({
          ticketId: handbookTicketId,
          status: "closed",
        });
        handbookClosed = true;
        await recordHandbookPoints({ minutesAgo: row.agoMinutes });
        break;
      case "status_opened":
        if (!reopenedEarly.has(row)) {
          await reopenHandbookTicket(row);
          handbookClosed = false;
        }
        break;
      case "voicemail":
        await devRouter.seedVoicemail.mutate({
          ticketId: handbookTicketId,
          audio: voicemailAudio,
          durationSeconds: SEED_VOICEMAIL_DURATION_S,
        });
        await recordHandbookPoints({ minutesAgo: row.agoMinutes });
        break;
      case "phone_call":
        await writeFollowUp(handbookTicketId, { type, source: row.source }, "");
        await recordHandbookPoints({
          minutesAgo: row.agoMinutes,
          ...(row.callStatus !== undefined
            ? { callStatus: row.callStatus }
            : {}),
          ...(row.callDurationSeconds !== undefined
            ? { callDurationSeconds: row.callDurationSeconds }
            : {}),
          ...(byOther ? { createdBy: handbookOtherId } : {}),
        });
        break;
      case "internal_note": {
        const noteId = await writeFollowUp(
          handbookTicketId,
          { type, source: row.source },
          row.content,
          { noteTypeId: noteTypeIds[0] },
        );
        // The seeding account reacts as itself; the timeline point
        // re-stamps the reaction to the volunteer who left it.
        const reactions = row.reactions ?? [];
        if (reactions.length > 1) {
          throw new SeedReplayError("Handbook note has more than one reaction");
        }
        const reaction = reactions.at(0);
        if (reaction !== undefined) {
          await ticketRouter.toggleReaction.mutate({
            followUpId: noteId,
            reaction: reaction.reaction,
          });
        }
        await recordHandbookPoints({
          minutesAgo: row.agoMinutes,
          ...(byOther ? { createdBy: handbookOtherId } : {}),
          ...(reaction !== undefined
            ? {
                reaction: {
                  userId: handbookOtherId,
                  minutesAgo: reaction.agoMinutes,
                },
              }
            : {}),
        });
        break;
      }
      case "queue_changed":
      case "merge_note":
      case "share_link":
      case "contact_correction":
        // Merge rows are skipped above; the others never occur in the
        // handbook thread.
        throw new SeedReplayError(`Handbook row type not replayed: ${type}`);
      case "message":
      case "sms_outbound":
      case "sms_inbound":
      case "email_outbound":
      case "email_inbound": {
        // Messages on every channel. Email content is the JSON payload
        // the email handlers store, written as given.
        const attachments = await uploadHandbookMedia(row);
        await writeFollowUp(
          handbookTicketId,
          { type, source: row.source },
          row.content,
          attachments.length > 0 ? { attachments } : undefined,
        );
        await recordHandbookPoints({
          minutesAgo: row.agoMinutes,
          ...(byOther ? { createdBy: handbookOtherId } : {}),
        });
        break;
      }
    }
  }

  await devRouter.applySeedTimeline.mutate({
    ticketId: handbookTicketId,
    createdMinutesAgo: handbook.createdAgo,
    points: handbookPoints,
  });
  await writeReadCursor(handbookTicketId, handbook.unreadSince);
  console.log("[dev-seed] Seeded the handbook story ticket");

  // ── Step 7: Preset replies ──────────────────────────────────────────
  progress("Creating preset replies...");
  for (const preset of PRESET_REPLIES) {
    await ticketRouter.createPreset.mutate({
      encryptedTitle: seal(preset.title, orgPublicKey),
      encryptedBody: seal(preset.body, orgPublicKey),
    });
    console.log(`[dev-seed] Created preset reply: ${preset.title}`);
  }

  // ── Step 8: KB votes ────────────────────────────────────────────────
  progress("Adding KB votes...");
  for (const itemId of articleIds.slice(0, 4)) {
    await kbRouter.castVote.mutate({ itemId, direction: "up" });
  }
  console.log("[dev-seed] KB votes cast");

  // ── Step 8b: Backdate org setup ─────────────────────────────────────
  // Everything above was stamped "now". Move the org's setup to just
  // before the oldest ticket story, so the org reads as set up first.
  progress("Backdating org setup...");
  await devRouter.backdateOrgSetup.mutate({ minutesAgo: 43_500 });
  console.log("[dev-seed] Org setup backdated");

  // ── Step 8c: Recent admin edits ─────────────────────────────────────
  // Two ordinary admin changes through the same mutations the admin pages
  // use, so the activity feed opens with org events alongside ticket ones.
  // They land "now", after the backdated setup.
  progress("Recording recent admin edits...");
  const housingQueue = queues.at(2);
  const housingDef = QUEUES.at(2);
  if (housingQueue !== undefined && housingDef !== undefined) {
    await ticketRouter.updateQueue.mutate({
      queueId: housingQueue.id,
      encryptedColor: seal(housingDef.color, orgPublicKey),
      encryptedIcon: seal(housingDef.icon, orgPublicKey),
    });
  }
  const safetyNoteTypeId = noteTypeIds.at(2);
  if (noteTypesRouter && safetyNoteTypeId !== undefined) {
    await noteTypesRouter.update.mutate({
      id: safetyNoteTypeId,
      encryptedDescription: seal(
        "Use when a client may be in danger. Alerts admins and managers.",
        orgPublicKey,
      ),
    });
  }
  console.log("[dev-seed] Recent admin edits recorded");

  // ── Step 9: Telephony Config ────────────────────────────────────────
  const seedTel = client.telephonyAdmin.devSeedTelephony;
  if (seedTel) {
    const result = await seedTel.mutate();
    console.log(
      `[dev-seed] Telephony config: ${result.skipped ? "already exists" : "seeded"}`,
    );
  }

  progress("Done!");
  console.log("[dev-seed] All seed data created");
  return {
    ticketIds: [handbookTicketId, ...storyTicketIds],
    articleIds,
    noteTypeIds,
    readCursorTicketIds,
  };
}
