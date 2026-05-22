/* eslint-disable security/detect-object-injection -- dev-only seed data uses known-key object lookups throughout */
/**
 * Dev-only data seeding via production endpoints.
 *
 * Creates queues, KB categories, note types, KB articles, clients + tickets,
 * and telephony config using the same tRPC mutations and relay endpoints that
 * the production UI uses. Doubles as an integration test for create pipelines.
 *
 * Dynamically imported behind `import.meta.env.DEV` so Vite tree-shakes it
 * from production builds entirely.
 */
import { trpc } from "$lib/trpc/index.js";
import { sealForOrgKey, encode } from "@care-y/crypto";
import { DEV_ORG_SLUG } from "$lib/utils/org-slug.js";
import { ClientError, RelayError } from "$lib/errors.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";
import type { EscalationTarget } from "@care-y/shared";

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

const SEED_TICKET_COUNT = 120;
const FOLLOWUP_TICKET_COUNT = 35;

const QUEUES = [
  { name: "Intake", escalateDays: 3 },
  { name: "Crisis", escalateDays: 1 },
  { name: "Housing", escalateDays: 5 },
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

interface SeedUserDef {
  identifier: string;
  displayName: string;
  roleId: "volunteer" | "manager";
  queueIndices: number[];
}

const SEED_USERS: readonly SeedUserDef[] = [
  {
    identifier: "vol.intake",
    displayName: "Jordan Rivera",
    roleId: "volunteer",
    queueIndices: [0],
  },
  {
    identifier: "vol.crisis",
    displayName: "Morgan Patel",
    roleId: "volunteer",
    queueIndices: [1],
  },
  {
    identifier: "vol.housing",
    displayName: "Avery Chen",
    roleId: "volunteer",
    queueIndices: [0, 2],
  },
  {
    identifier: "vol.all",
    displayName: "Riley Thompson",
    roleId: "volunteer",
    queueIndices: [0, 1, 2],
  },
  {
    identifier: "mgr.ops",
    displayName: "Casey Okafor",
    roleId: "manager",
    queueIndices: [0, 1, 2],
  },
];

const SEED_PASSWORD = "dev-password-1234!";

// ── Ticket template pools ───────────────────────────────────────────

const TITLE_POOL = [
  "Caller needs emergency housing referral",
  "Follow-up on custody hearing preparation",
  "Active safety concern reported",
  "New caller requesting general information",
  "Benefits application assistance needed",
  "Caller requesting legal aid referral",
  "Shelter placement follow-up",
  "Transportation assistance for medical appointment",
  "Caller needs help with protective order paperwork",
  "Employment program referral requested",
  "Child care subsidy application help",
  "Caller reporting landlord retaliation",
  "Mental health crisis intervention needed",
  "Insurance enrollment assistance",
  "Caller needs food bank and pantry locations",
  "Domestic violence safety planning",
  "Immigration legal consultation referral",
  "Utility shutoff prevention assistance",
  "School enrollment help for displaced family",
  "Caller seeking substance abuse treatment options",
];

const DESC_POOL = [
  "Caller reports being unhoused for two weeks. Has valid ID and is currently staying at a temporary shelter. Needs connection to transitional housing program.",
  "Returning caller. Custody hearing scheduled for next month. Needs legal aid referral updated with new court date. Previously connected with family law legal aid.",
  "Caller describes escalating conflict at home. Safety plan was created during previous call but caller reports the situation has changed. Requesting crisis volunteer connection.",
  "First-time caller asking about available services. Wants to understand what kind of help is available before deciding next steps. No immediate safety concerns reported.",
  "Caller needs help navigating benefits application process. Has difficulty with online forms due to limited internet access. Requested callback with step-by-step guidance.",
  "Caller was referred by a community partner. Seeking legal representation for upcoming hearing. Has documentation ready but needs help understanding the process.",
  "Caller placed in emergency shelter last week. Checking on timeline for transitional housing placement. Reports feeling safe at current location.",
  "Caller has medical appointment across town next Tuesday. No personal vehicle and public transit route requires three transfers. Requesting ride assistance.",
  "Caller needs to file a protective order but is unsure of the process. Has police report number from recent incident. Asking about court filing requirements.",
  "Caller recently lost employment and is seeking job placement assistance. Has previous experience in food service. Interested in job training programs.",
  "Caller is a single parent needing child care assistance to maintain employment. Currently on a waitlist for state subsidy. Asking about bridge programs.",
  "Caller's landlord has initiated eviction proceedings after caller reported code violations. Believes this is retaliatory. Needs tenant rights legal aid.",
  "Caller expressing suicidal ideation. Currently in a safe location but reports feeling overwhelmed by housing instability. Requesting immediate crisis support.",
  "Caller's insurance coverage lapsed during a recent move. Open enrollment is approaching and they need help understanding their options.",
  "Caller is new to the area and has three children. Needs locations for food banks that serve families and have weekend hours.",
  "Caller has left a dangerous living situation and is staying with a friend temporarily. Needs help creating a safety plan and understanding legal options.",
  "Caller is undocumented and seeking legal advice about available protections. Has been in the country for eight years and has US-citizen children.",
  "Caller received a shutoff notice for electricity. Payment is overdue by 60 days. Asking about emergency assistance programs and payment plans.",
  "Caller's family was displaced and children need to be enrolled in a new school district. Needs help understanding residency requirements and transfer process.",
  "Caller is interested in treatment options for substance use. Has tried outpatient programs before. Asking about inpatient and residential programs.",
];

const CLIENT_MSG_POOL = [
  "I need to update my phone number, can someone help?",
  "Can someone call me back? I have new information about my case.",
  "Thank you for the help last time. I have a follow-up question.",
  "My situation has changed since we last talked. I need to speak with someone.",
  "I received a letter I do not understand. Can someone explain it?",
  "Is there someone available who speaks Spanish?",
  "I missed my appointment. Can it be rescheduled?",
  "The shelter gave me a referral to call this number.",
  "I need help filling out some forms before my deadline.",
  "Things have gotten worse since our last call. Please call me back.",
  "I found the paperwork you mentioned. What do I do with it?",
  "My court date was moved. I need to let my advocate know.",
  "Can I get a copy of the information you sent me?",
  "I want to thank the person who helped me last week.",
  "I have a question about the program I was referred to.",
];

const VOL_REPLY_POOL = [
  "I have updated your case file with the new information. We will follow up within 48 hours.",
  "Connecting you with our housing team for next steps.",
  "I have scheduled a callback for tomorrow between 10am and 12pm.",
  "Your referral has been sent to the legal aid clinic. They should contact you within 3 business days.",
  "I have noted your updated contact information in the system.",
  "A specialist will review your case and reach out by end of day.",
  "The documents you need are available at the courthouse on 4th Street. Ask for the self-help center.",
  "I have escalated your case to our crisis team for immediate attention.",
  "Your appointment has been rescheduled for next Thursday at 2pm.",
  "I have added the new details to your file. Your assigned advocate will follow up.",
  "The program you are asking about has openings. I will send you the enrollment information.",
  "I spoke with the partner agency and they confirmed your referral is active.",
  "Your case has been transferred to a specialist who handles this type of request.",
  "I left a message with the organization. They typically respond within 24 hours.",
  "I have documented your concern. A supervisor will review this within one business day.",
];

const INTERNAL_NOTE_POOL = [
  "Caller sounded distressed but confirmed they are in a safe location. Monitoring.",
  "Verified caller identity against existing records. Information matches.",
  "Contacted partner agency directly. They confirmed availability for this week.",
  "Discussed case in team standup. Consensus is to escalate to manager review.",
  "Previous volunteer left detailed notes. Continuing from where they left off.",
  "Language barrier noted. Arranged interpreter for next callback.",
  "Caller has called three times this week. Consider assigning a dedicated advocate.",
  "Documentation from court received via fax. Scanned and attached to ticket.",
];

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

// ── Ticket generation ───────────────────────────────────────────────

type TicketPriority = "low" | "normal" | "high" | "urgent";

interface TicketDef {
  title: string;
  description: string;
  phone: string;
  priority: TicketPriority;
  queueIndex: number;
}

function generateTicket(index: number): TicketDef {
  const priorities: TicketPriority[] = [
    "normal",
    "normal",
    "normal",
    "normal",
    "normal",
    "normal",
    "high",
    "high",
    "low",
    "urgent",
  ];
  return {
    title: TITLE_POOL.at(index % TITLE_POOL.length) ?? "",
    description: DESC_POOL.at(index % DESC_POOL.length) ?? "",
    phone: `+1555001${String(index + 1).padStart(4, "0")}`,
    priority: priorities.at(index % priorities.length) ?? "normal",
    queueIndex: index % 3,
  };
}

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

interface PhoneLookupResult {
  found: boolean;
  token?: string;
  clientId?: string;
  alias?: string;
  openTicketId?: string | null;
}

async function phoneLookup(phone: string): Promise<PhoneLookupResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (import.meta.env.DEV) {
    headers["x-org-slug"] = DEV_ORG_SLUG;
  }

  const res = await fetch("/relay/phone-lookup", {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({ phone }),
  });

  if (!res.ok) {
    throw new RelayError("PHONE_LOOKUP_FAILED", res.status);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- dev-only, response shape is known
  return (await res.json()) as PhoneLookupResult;
}

// ── Main seed function ───────────────────────────────────────────────

export type SeedProgressCallback = (message: string) => void;

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any -- dev-only function; tRPC routers are conditionally spread so typed access is impossible without `any` */
export async function devSeedData(
  bridge: CryptoBridge,
  orgKeyManager: OrgKeyManager,
  onProgress?: SeedProgressCallback,
): Promise<void> {
  const orgPublicKey = orgKeyManager.getPublicKey();
  if (!orgPublicKey) {
    throw new ClientError(
      "Org public key not loaded. Complete onboarding first.",
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- no-op fallback for optional progress callback
  const progress = onProgress ?? (() => {});

  const ticketRouter = trpc.tickets as unknown as Record<string, any>;
  const kbRouter = trpc.kb as unknown as Record<string, any>;
  const authRouter = trpc.auth as unknown as Record<string, any>;
  const devRouter = trpc.dev as unknown as Record<string, any>;

  // ── Step 0: Reset existing seed data ────────────────────────────────
  progress("Resetting existing data...");
  await devRouter.resetSeedData.mutate();
  console.log("[dev-seed] Reset complete");

  // ── Step 1: Users + queue assignments ───────────────────────────────
  progress("Creating users...");
  const existingUsers = (await authRouter.listUsers.query()) as {
    id: string;
    identifier: string;
  }[];
  const existingIdentifiers = new Set(
    existingUsers.map((u: { identifier: string }) => u.identifier),
  );
  const seededUserIds: Record<string, string> = {};

  for (const user of SEED_USERS) {
    if (existingIdentifiers.has(user.identifier)) {
      const existing = existingUsers.find(
        (u: { identifier: string }) => u.identifier === user.identifier,
      );
      if (existing) seededUserIds[user.identifier] = existing.id;
      console.log(
        `[dev-seed] User "${user.identifier}" already exists, skipping`,
      );
      continue;
    }
    const result = (await authRouter.register.mutate({
      identifier: user.identifier,
      password: SEED_PASSWORD,
      displayName: user.displayName,
      roleId: user.roleId,
    })) as { user: { id: string } };
    seededUserIds[user.identifier] = result.user.id;
    console.log(`[dev-seed] Created user: ${user.identifier}`);
  }

  // ── Step 2: Queues ──────────────────────────────────────────────────
  progress("Creating queues...");
  for (const q of QUEUES) {
    await ticketRouter.createQueue.mutate({
      encryptedName: seal(q.name, orgPublicKey),
      escalateDays: q.escalateDays,
    });
    console.log(`[dev-seed] Created queue: ${q.name}`);
  }

  const queues = (await ticketRouter.listQueues.query()) as {
    id: string;
    sortOrder: number;
  }[];

  // Assign admin (current user) to all queues
  const meResult = (await authRouter.me.query()) as {
    user: { id: string };
  };
  const adminId = meResult.user.id;
  for (const q of queues) {
    await ticketRouter.addQueueMember.mutate({
      queueId: q.id,
      userId: adminId,
    });
  }

  // Assign seeded users to their queues
  for (const user of SEED_USERS) {
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

  // ── Step 3: KB Categories ───────────────────────────────────────────
  progress("Creating KB categories...");
  for (const name of KB_CATEGORIES) {
    await kbRouter.createCategory.mutate({
      encryptedName: seal(name, orgPublicKey),
    });
    console.log(`[dev-seed] Created KB category: ${name}`);
  }

  const categories = (await kbRouter.listCategories.query()) as {
    id: string;
    sortOrder: number;
  }[];

  // ── Step 4: Note Types ──────────────────────────────────────────────
  progress("Creating note types...");
  const noteTypesRouter = ticketRouter.noteTypes as
    | Record<string, any>
    | undefined;
  const noteTypeIds: string[] = [];
  if (noteTypesRouter) {
    for (const nt of NOTE_TYPES) {
      const result = (await noteTypesRouter.create.mutate({
        encryptedName: seal(nt.name, orgPublicKey),
        encryptedIcon: seal(nt.icon, orgPublicKey),
        escalationTargets: nt.escalationTargets,
        requiresOnClose: nt.requiresOnClose,
      })) as { id: string };
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

    const result = (await kbRouter.createItem.mutate({
      categoryId: cat.id,
      encryptedTitle: seal(article.title, orgPublicKey),
      encryptedBody: seal(article.body, orgPublicKey),
      encryptedExcerpt: seal(article.excerpt, orgPublicKey),
    })) as { id: string };
    articleIds.push(result.id);
    console.log(`[dev-seed] Created KB article: ${article.title}`);
  }

  // ── Step 6: Tickets ─────────────────────────────────────────────────
  const ticketIds: string[] = [];
  for (let i = 0; i < SEED_TICKET_COUNT; i++) {
    if (i % 10 === 0) {
      progress(
        `Creating tickets (${String(i)}/${String(SEED_TICKET_COUNT)})...`,
      );
    }

    const ticket = generateTicket(i);
    const lookup = await phoneLookup(ticket.phone);

    const encrypted = await bridge.createTicketEncryption([
      { name: "title", plaintext: ticket.title },
      { name: "description", plaintext: ticket.description },
    ]);

    const findField = (name: string): string => {
      const field = encrypted.encryptedFields.find((f) => f.name === name);
      if (!field) throw new ClientError("Missing encrypted field: " + name);
      return field.ciphertext;
    };

    const targetQueue = queues[ticket.queueIndex];
    if (!targetQueue) continue;

    const result = (await ticketRouter.create.mutate({
      ...(lookup.found
        ? { clientId: lookup.clientId }
        : { clientToken: lookup.token }),
      queueId: targetQueue.id,
      encryptedTitle: findField("title"),
      encryptedDescription: findField("description"),
      priority: ticket.priority,
      keyGeneration: encrypted.keyGeneration,
      keyWrap: encrypted.keyWrap,
    })) as { id: string };
    ticketIds.push(result.id);

    if (i % 10 === 0) {
      console.log(
        `[dev-seed] Created ticket ${String(i + 1)}/${String(SEED_TICKET_COUNT)}`,
      );
    }
  }
  console.log(`[dev-seed] Created ${String(ticketIds.length)} tickets`);

  // ── Step 7: Followup timelines ──────────────────────────────────────
  progress("Adding followup messages...");
  const followupTickets = ticketIds.slice(0, FOLLOWUP_TICKET_COUNT);

  for (let ti = 0; ti < followupTickets.length; ti++) {
    const ticketId = followupTickets.at(ti);
    if (ticketId === undefined) continue;

    if (ti % 10 === 0) {
      progress(
        `Adding followups (${String(ti)}/${String(followupTickets.length)})...`,
      );
    }

    const ticketData = (await ticketRouter.get.query({ ticketId })) as {
      keyWrap: {
        ephemeralPoint: string;
        nonce: string;
        wrappedKey: string;
      } | null;
    };

    if (!ticketData.keyWrap) {
      continue;
    }

    await bridge.unwrapTk(
      ticketId,
      ticketData.keyWrap.ephemeralPoint,
      ticketData.keyWrap.nonce,
      ticketData.keyWrap.wrappedKey,
    );

    const followupCount = 2 + (ti % 5);
    for (let fi = 0; fi < followupCount; fi++) {
      const isClientMsg = fi % 3 === 0;
      const isInternalNote = fi % 5 === 0 && !isClientMsg;

      let source: string;
      let type: string;
      let content: string;
      let noteTypeId: string | undefined;

      if (isClientMsg) {
        source = "client";
        type = "sms_inbound";
        content =
          CLIENT_MSG_POOL.at((ti * 3 + fi) % CLIENT_MSG_POOL.length) ?? "";
      } else if (isInternalNote && noteTypeIds.length > 0) {
        source = "volunteer";
        type = "internal_note";
        content =
          INTERNAL_NOTE_POOL.at((ti + fi) % INTERNAL_NOTE_POOL.length) ?? "";
        noteTypeId = noteTypeIds[0];
      } else {
        source = "volunteer";
        type = "message";
        content =
          VOL_REPLY_POOL.at((ti * 2 + fi) % VOL_REPLY_POOL.length) ?? "";
      }

      const encryptedContent = await bridge.encrypt(ticketId, content);
      await ticketRouter.createFollowUp.mutate({
        ticketId,
        encryptedContent,
        source,
        type,
        isPrivate: isInternalNote,
        mentionedPseudonyms: [],
        ...(noteTypeId !== undefined ? { noteTypeId } : {}),
      });
    }
  }
  console.log(
    `[dev-seed] Added followups to ${String(followupTickets.length)} tickets`,
  );

  // ── Step 8: Ticket state variety ────────────────────────────────────
  progress("Varying ticket states...");
  const userIdValues = Object.values(seededUserIds);

  for (let i = 0; i < Math.min(20, ticketIds.length); i++) {
    await ticketRouter.take.mutate({ ticketId: ticketIds[i] });
  }

  for (let i = 20; i < Math.min(35, ticketIds.length); i++) {
    const targetUserId = userIdValues[i % userIdValues.length];
    if (targetUserId !== undefined && targetUserId !== "") {
      await ticketRouter.assignTo.mutate({
        ticketId: ticketIds[i],
        targetUserId,
      });
    }
  }

  for (let i = 80; i < Math.min(90, ticketIds.length); i++) {
    await ticketRouter.update.mutate({
      ticketId: ticketIds[i],
      status: "closed",
    });
  }

  for (let i = 50; i < Math.min(58, ticketIds.length); i++) {
    await ticketRouter.update.mutate({
      ticketId: ticketIds[i],
      onHold: true,
    });
  }

  for (let i = 60; i < Math.min(65, ticketIds.length); i++) {
    await ticketRouter.update.mutate({
      ticketId: ticketIds[i],
      priority: "urgent",
    });
  }
  console.log("[dev-seed] Ticket state variety applied");

  // ── Step 9: Preset replies ──────────────────────────────────────────
  progress("Creating preset replies...");
  for (const preset of PRESET_REPLIES) {
    await ticketRouter.createPreset.mutate({
      encryptedTitle: seal(preset.title, orgPublicKey),
      encryptedBody: seal(preset.body, orgPublicKey),
    });
    console.log(`[dev-seed] Created preset reply: ${preset.title}`);
  }

  // ── Step 10: KB votes ───────────────────────────────────────────────
  progress("Adding KB votes...");
  for (let i = 0; i < Math.min(4, articleIds.length); i++) {
    await kbRouter.castVote.mutate({
      itemId: articleIds[i],
      direction: "up",
    });
  }
  console.log("[dev-seed] KB votes cast");

  // ── Step 11: Telephony Config ───────────────────────────────────────
  const telAdmin = trpc.telephonyAdmin as
    | Record<string, { mutate: () => Promise<{ skipped: boolean }> }>
    | undefined;
  const seedTel = telAdmin?.devSeedTelephony;
  if (seedTel) {
    const result = await seedTel.mutate();
    console.log(
      `[dev-seed] Telephony config: ${result.skipped ? "already exists" : "seeded"}`,
    );
  }

  progress("Done!");
  console.log("[dev-seed] All seed data created");
}
/* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any */
