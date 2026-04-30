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

interface TicketDef {
  title: string;
  description: string;
  phone: string;
  priority: "low" | "normal" | "high" | "urgent";
  queueIndex: number;
}

const TICKETS: readonly TicketDef[] = [
  {
    title: "Caller needs emergency housing referral",
    description:
      "Caller reports being unhoused for two weeks. Has valid ID and is currently staying at a temporary shelter. Needs connection to transitional housing program.",
    phone: "+15550010001",
    priority: "high",
    queueIndex: 2,
  },
  {
    title: "Follow-up on custody hearing preparation",
    description:
      "Returning caller. Custody hearing scheduled for next month. Needs legal aid referral updated with new court date. Previously connected with family law legal aid.",
    phone: "+15550010002",
    priority: "normal",
    queueIndex: 0,
  },
  {
    title: "Active safety concern reported",
    description:
      "Caller describes escalating conflict at home. Safety plan was created during previous call but caller reports the situation has changed. Requesting crisis volunteer connection.",
    phone: "+15550010003",
    priority: "urgent",
    queueIndex: 1,
  },
  {
    title: "New caller requesting general information",
    description:
      "First-time caller asking about available services. Wants to understand what kind of help is available before deciding next steps. No immediate safety concerns reported.",
    phone: "+15550010004",
    priority: "low",
    queueIndex: 0,
  },
  {
    title: "Benefits application assistance needed",
    description:
      "Caller needs help navigating benefits application process. Has difficulty with online forms due to limited internet access. Requested callback with step-by-step guidance.",
    phone: "+15550010005",
    priority: "normal",
    queueIndex: 2,
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

/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any -- dev-only function; tRPC routers are conditionally spread so typed access is impossible without `any` */
export async function devSeedData(
  bridge: CryptoBridge,
  orgKeyManager: OrgKeyManager,
): Promise<void> {
  const orgPublicKey = orgKeyManager.getPublicKey();
  if (!orgPublicKey) {
    throw new ClientError(
      "Org public key not loaded. Complete onboarding first.",
    );
  }

  // Tickets and KB routers are conditionally spread on the server, so
  // TypeScript doesn't guarantee route existence. This file only runs
  // in dev mode; runtime guards check each route before calling it.
  const ticketRouter = trpc.tickets as unknown as Record<string, any>;
  const kbRouter = trpc.kb as unknown as Record<string, any>;

  // ── Step 1: Queues ──────────────────────────────────────────────────
  const existingQueues = (await ticketRouter.listQueues.query()) as {
    id: string;
    sortOrder: number;
  }[];
  if (existingQueues.length === 0) {
    for (const q of QUEUES) {
      await ticketRouter.createQueue.mutate({
        encryptedName: seal(q.name, orgPublicKey),
        escalateDays: q.escalateDays,
      });
      console.log(`[dev-seed] Created queue: ${q.name}`);
    }
  } else {
    console.log("[dev-seed] Queues already exist, skipping");
  }

  // Re-fetch queues for IDs (needed for ticket creation)
  const queues = (await ticketRouter.listQueues.query()) as {
    id: string;
    sortOrder: number;
  }[];

  // ── Step 2: KB Categories ───────────────────────────────────────────
  const existingCategories = (await kbRouter.listCategories.query()) as {
    id: string;
    sortOrder: number;
  }[];
  if (existingCategories.length === 0) {
    for (const name of KB_CATEGORIES) {
      await kbRouter.createCategory.mutate({
        encryptedName: seal(name, orgPublicKey),
      });
      console.log(`[dev-seed] Created KB category: ${name}`);
    }
  } else {
    console.log("[dev-seed] KB categories already exist, skipping");
  }

  // Re-fetch categories for IDs (needed for article creation)
  const categories = (await kbRouter.listCategories.query()) as {
    id: string;
    sortOrder: number;
  }[];

  // ── Step 3: Note Types ──────────────────────────────────────────────
  const noteTypesRouter = ticketRouter.noteTypes as
    | Record<string, any>
    | undefined;
  if (noteTypesRouter) {
    const existingNoteTypes = (await noteTypesRouter.list.query()) as {
      id: string;
    }[];
    if (existingNoteTypes.length === 0) {
      for (const nt of NOTE_TYPES) {
        await noteTypesRouter.create.mutate({
          encryptedName: seal(nt.name, orgPublicKey),
          encryptedIcon: seal(nt.icon, orgPublicKey),
          escalationTargets: nt.escalationTargets,
          requiresOnClose: nt.requiresOnClose,
        });
        console.log(`[dev-seed] Created note type: ${nt.name}`);
      }
    } else {
      console.log("[dev-seed] Note types already exist, skipping");
    }
  }

  // ── Step 4: KB Articles ─────────────────────────────────────────────
  const existingItems = (await kbRouter.listItems.query({ limit: 1 })) as {
    items: unknown[];
  };
  if (existingItems.items.length === 0) {
    // Map category names to IDs by sort_order
    // Categories are created in order: Procedures=1, Resources=2, Safety=3
    const categoryNameToSortOrder: Record<string, number> = {
      Procedures: 1,
      Resources: 2,
      Safety: 3,
    };

    for (const article of KB_ARTICLES) {
      const targetSort = categoryNameToSortOrder[article.category];
      const cat = categories.find((c) => c.sortOrder === targetSort);
      if (!cat) {
        console.warn(
          `[dev-seed] Category "${article.category}" not found, skipping article "${article.title}"`,
        );
        continue;
      }

      await kbRouter.createItem.mutate({
        categoryId: cat.id,
        encryptedTitle: seal(article.title, orgPublicKey),
        encryptedBody: seal(article.body, orgPublicKey),
        encryptedExcerpt: seal(article.excerpt, orgPublicKey),
      });
      console.log(`[dev-seed] Created KB article: ${article.title}`);
    }
  } else {
    console.log("[dev-seed] KB articles already exist, skipping");
  }

  // ── Step 5: Clients + Tickets ───────────────────────────────────────
  const existingTickets = (await ticketRouter.list.query({})) as {
    items: unknown[];
  };
  if (existingTickets.items.length === 0) {
    for (const ticket of TICKETS) {
      // Phone lookup creates the pending client
      const lookup = await phoneLookup(ticket.phone);

      // Encrypt ticket content via the crypto Worker
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
      if (!targetQueue) {
        console.warn(
          `[dev-seed] Queue index ${String(ticket.queueIndex)} not found, skipping ticket "${ticket.title}"`,
        );
        continue;
      }

      await ticketRouter.create.mutate({
        ...(lookup.found
          ? { clientId: lookup.clientId }
          : { clientToken: lookup.token }),
        queueId: targetQueue.id,
        encryptedTitle: findField("title"),
        encryptedDescription: findField("description"),
        priority: ticket.priority,
        keyGeneration: encrypted.keyGeneration,
        keyWrap: encrypted.keyWrap,
      });
      console.log(`[dev-seed] Created ticket: ${ticket.title}`);
    }
  } else {
    console.log("[dev-seed] Tickets already exist, skipping");
  }

  // ── Step 6: Telephony Config ────────────────────────────────────────
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

  console.log("[dev-seed] All seed data created");
}
/* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-explicit-any */
