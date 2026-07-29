/**
 * Dev-only auto-login with full production crypto pipeline.
 *
 * Runs registerCrypto (Argon2id -> OPRF -> deriveKeys -> initCryptoKeys)
 * and loginCrypto (Worker-based key derivation -> KEYED state), then
 * rotates the throwaway org keypair (from seed) with a real client-generated
 * Curve25519 keypair, seals KB articles client-side, and seeds test tickets.
 *
 * The org key rotation matches the production flow: the browser generates
 * the keypair, ECIES-wraps the secret for authorized volunteers, and uploads
 * via the rotateOrgKey endpoint. The server never holds the org secret key.
 *
 * This file is dynamically imported only when import.meta.env.DEV is true,
 * so Vite's dead-code elimination strips it from production builds entirely.
 */
import { trpc } from "$lib/trpc/index.js";
import { setOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";
import { registerCrypto } from "$lib/auth/register-crypto.js";
import { loginCrypto } from "$lib/auth/login-crypto.js";
import { fetchAndUnwrapOrgKey } from "$lib/auth/crypto-helpers.js";
import {
  generateOrgKeypair,
  sealForOrgKey,
  wrapKey,
  encode,
  decode,
  getSodium,
  toRistrettoPoint,
} from "@care-y/crypto";
import type { RegisterCryptoCallbacks } from "$lib/auth/register-crypto.js";
import type { LoginCryptoCallbacks } from "$lib/auth/login-crypto.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";

const DEV_IDENTIFIER = "admin.dev";
const DEV_PASSWORD = "dev-password-1234!";

function getBypass2fa(): { mutate: () => Promise<unknown> } {
  const route = trpc.auth.devBypass2fa;
  if (!route)
    throw new TypeError("devBypass2fa route missing (not in dev mode?)");
  return route;
}

function getDevSeedTickets(): { mutate: () => Promise<unknown> } {
  // tickets and devSeedTickets are both conditionally spread on the server
  // (ticketDeps optional, devSeedTickets dev-only), so TypeScript doesn't
  // guarantee their existence. This file only runs in dev mode.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- dev-only, runtime guard follows
  const tickets = trpc.tickets as
    Record<string, { mutate: () => Promise<unknown> }> | undefined;
  const route = tickets?.devSeedTickets;
  if (route === undefined) {
    throw new TypeError("devSeedTickets route missing (not in dev mode?)");
  }
  return route;
}

/** No-op callbacks for registerCrypto. Logs phase transitions for dev visibility. */
const noopRegisterCallbacks: RegisterCryptoCallbacks = {
  onArgon2idStart: () => {
    console.log("[dev] registerCrypto: Argon2id start");
  },
  onArgon2idDone: () => {
    console.log("[dev] registerCrypto: Argon2id done");
  },
  onOprfStart: () => {
    console.log("[dev] registerCrypto: OPRF start");
  },
  onOprfDone: () => {
    console.log("[dev] registerCrypto: OPRF done");
  },
  onDeriveStart: () => {
    console.log("[dev] registerCrypto: derive start");
  },
  onDone: () => {
    console.log("[dev] registerCrypto: done");
  },
  onUploadStart: () => {
    console.log("[dev] registerCrypto: upload start");
  },
};

/** No-op callbacks for loginCrypto. Logs phase transitions for dev visibility. */
const noopLoginCallbacks: LoginCryptoCallbacks = {
  onArgon2idStart: () => {
    console.log("[dev] loginCrypto: Argon2id start");
  },
  onArgon2idDone: () => {
    console.log("[dev] loginCrypto: Argon2id done");
  },
  onOprfStart: () => {
    console.log("[dev] loginCrypto: OPRF start");
  },
  onOprfDone: () => {
    console.log("[dev] loginCrypto: OPRF done");
  },
  onDeriveStart: () => {
    console.log("[dev] loginCrypto: derive start");
  },
  onDone: () => {
    console.log("[dev] loginCrypto: done");
  },
  onPowRequired: () => {
    throw new TypeError("PoW should not be required in dev auto-login");
  },
};

/**
 * Check if a tRPC error is a CONFLICT (e.g., crypto keys already initialized).
 * tRPC client errors have a `data` property with the server's error shape,
 * and the top-level `code` is the tRPC error code string.
 */
function isConflictError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  // TRPCClientError exposes `.code` as the HTTP-style tRPC code
  if ("code" in err) {
    const { code } = err as Record<string, unknown>;
    if (code === "CONFLICT") return true;
  }
  // Fallback: check data.httpStatus for 409
  if ("data" in err) {
    const { data } = err as Record<string, unknown>;
    if (typeof data === "object" && data !== null && "httpStatus" in data) {
      const { httpStatus } = data as Record<string, unknown>;
      if (httpStatus === 409) return true;
    }
  }
  return false;
}

// ── ProseMirror JSON helpers for seed content ───────────────────────
// These build doc.toJSON()-compatible nodes. The real editor (06f.2)
// will produce the same structure via ProseMirror's serialization.

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

/** KB article definitions for dev seeding (ProseMirror JSON bodies). */
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

  // ── A11y test article ─────────────────────────────────────────────
  // This article intentionally violates every ATAG check so the a11y
  // plugin and preview page have real content to flag. Keep in sync
  // with the checks in atag-checks.ts.
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

      // ── Heading skip ──────────────────────────────────────────────
      h(2, t("Skipped heading levels")),
      p(
        t(
          "Headings form an outline that screen reader users navigate to jump between sections. When a level is skipped (for example, jumping from H2 to H4), the outline has a gap. A screen reader user cannot tell whether they missed a section or the author used the wrong level for visual styling. Always step headings down one level at a time.",
        ),
      ),

      // ❌ heading-skip: H4 directly after H2 (skipped H3)
      h(4, t("This heading skips from H2 to H4")),
      p(
        t(
          "The heading above should be H3, not H4. The checker flags this as a heading level skip.",
        ),
      ),

      // ── Empty headings ────────────────────────────────────────────
      h(2, t("Empty headings")),
      p(
        t(
          'An empty heading is announced by screen readers as a heading with no label. The user hears something like "heading level 3, blank" and has no way to know what section they entered. Empty headings are often left behind after deleting text or pasting from another document. Delete the heading node entirely if it has no content.',
        ),
      ),

      // ❌ empty-heading: heading node with zero text content
      h(3),

      p(
        t(
          "The empty heading above has no text at all. The checker flags it as an empty heading.",
        ),
      ),

      // ❌ empty-heading: heading with only whitespace
      h(3, t(" ")),

      p(
        t(
          "The heading above contains only a space character, which is treated the same as empty. Whitespace-only headings are equally invisible to assistive technology.",
        ),
      ),

      // ── Missing alt text ──────────────────────────────────────────
      h(2, t("Images without alt text")),
      p(
        t(
          'When an image has no alt text, screen readers either skip it entirely or read the raw file URL, which sounds like "image, https colon slash slash example dot com slash photos slash workstation dash layout dot jpg." Neither outcome tells the user what the image shows. Every image should have alt text that conveys the same information a sighted user gets from looking at it.',
        ),
      ),

      // ❌ missing-alt: image with no alt attribute
      img("https://example.com/photos/workstation-layout.jpg"),

      p(
        t(
          "The image above has no alt attribute. The checker flags it as missing alt text.",
        ),
      ),

      p(t("For comparison, here is the same image with proper alt text:")),

      // ✅ Control case: image with descriptive alt text (should NOT trigger)
      p(
        img(
          "https://example.com/photos/workstation-layout.jpg",
          "Recommended desk layout showing monitor, keyboard, phone, and headset positions",
        ),
      ),

      // ❌ missing-alt: second image without alt text
      img("https://example.com/photos/headset-comparison.jpg"),

      p(
        t(
          "This second image also lacks alt text. The checker should flag each instance independently.",
        ),
      ),

      // ── Generic link text ─────────────────────────────────────────
      h(2, t("Generic link text")),
      p(
        t(
          'Screen reader users often navigate by pulling up a list of all links on the page. When every link says "click here" or "read more," the list is useless. Link text should describe where the link goes or what it does, so it makes sense out of context.',
        ),
      ),

      // ❌ heading-skip: H4 after H2 (second heading skip example)
      h(4, t("Examples of generic link text")),

      // ❌ generic-link-text: "click here"
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

      // ❌ generic-link-text: "Read more"
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

      // ❌ generic-link-text: "here"
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

      // ❌ generic-link-text: "Learn more"
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

/**
 * Rotate the throwaway seed keypair with a real client-generated one.
 * Returns the org public key and loads the secret into OrgKeyManager.
 */
async function bootstrapOrgKeypair(
  bridge: CryptoBridge,
  orgKeyManager: OrgKeyManager,
  userId: string,
): Promise<Uint8Array> {
  await getSodium();

  // Generate real Curve25519 org keypair in the browser
  const { publicKey, secretKey } = generateOrgKeypair();

  try {
    // Get the admin's volPublic for ECIES wrapping
    const volPublicB64 = await bridge.getVolPublic();
    const volPublicBytes = decode(volPublicB64);
    const volPublicPoint = toRistrettoPoint(volPublicBytes);

    // ECIES-wrap org secret for the admin
    const wrap = wrapKey(secretKey, volPublicPoint);

    // Rotate: replace the throwaway seed keypair with the real one
    await trpc.keys.rotateOrgKey.mutate({
      newOrgPublicKey: encode(publicKey),
      wrappedKeys: [
        {
          userId,
          ephemeralPoint: encode(wrap.ephemeralPoint),
          nonce: encode(wrap.nonce),
          wrappedKey: encode(wrap.ciphertext),
        },
      ],
    });

    // Load org key into Worker via normal unwrap path (round-trip to server).
    // The Worker retains the secret; we get back the public key.
    const orgPubKeyB64 = await fetchAndUnwrapOrgKey(bridge);
    if (orgPubKeyB64 === null) {
      throw new TypeError(
        "bootstrapOrgKeypair: fetchAndUnwrapOrgKey returned null after rotation",
      );
    }
    orgKeyManager.load(orgPubKeyB64);

    console.log("[dev] org keypair: rotated seed keypair with real one");
    return publicKey;
  } finally {
    // Zero the org secret key material
    const sodium = await getSodium();
    sodium.memzero(secretKey);
  }
}

/**
 * Seal and upload KB articles using the real org public key.
 * Skips if articles already exist for the admin user.
 */
async function seedKBArticles(
  orgPublicKey: Uint8Array,
  orgKeyManager: OrgKeyManager,
): Promise<void> {
  // kb router is conditionally spread on the server, so TypeScript
  // doesn't guarantee its existence. This file only runs in dev mode.
  const kb = trpc.kb;
  if (!kb) throw new TypeError("kb router unavailable (not in dev mode?)");

  // Fetch category list from server. Category names are encrypted (ADR-030),
  // so we decrypt them with the org key to map article definitions by name.
  const categories = await kb.listCategories.query();
  const decoder = new TextDecoder();
  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    try {
      const plainBytes = await orgKeyManager.decrypt(decode(c.encryptedName));
      categoryMap.set(decoder.decode(plainBytes), c.id);
    } catch (err: unknown) {
      console.debug("[dev] skipping category decrypt:", err);
    }
  }

  // Check if articles already exist (idempotent re-run)
  const existingItems = await kb.listItems.query({ limit: 1 });
  if (existingItems.items.length > 0) {
    console.log("[dev] KB articles already seeded, skipping.");
    return;
  }

  const encoder = new TextEncoder();

  for (const article of KB_ARTICLES) {
    const categoryId = categoryMap.get(article.category);
    if (categoryId === undefined) {
      console.warn(
        `[dev] KB category "${article.category}" not found, skipping article "${article.title}"`,
      );
      continue;
    }

    // Seal title, body, and excerpt client-side with the org public key.
    // Matches the production publish flow from kb-editor-design.md:
    // title encrypted independently, body as ProseMirror JSON, excerpt
    // as plain text (~150 chars).
    const encryptedTitle = sealForOrgKey(
      encoder.encode(article.title),
      orgPublicKey,
    );
    const encryptedBody = sealForOrgKey(
      encoder.encode(article.body),
      orgPublicKey,
    );
    const encryptedExcerpt = sealForOrgKey(
      encoder.encode(article.excerpt),
      orgPublicKey,
    );

    await kb.createItem.mutate({
      categoryId,
      encryptedTitle: encode(encryptedTitle),
      encryptedBody: encode(encryptedBody),
      encryptedExcerpt: encode(encryptedExcerpt),
    });

    console.log(`[dev] Created KB article "${article.title}"`);
  }
}

/**
 * Re-encrypt seed queue and KB category names with the real org public key.
 * The seed script encrypts with the throwaway keypair; after org key rotation
 * the ciphertext is undecryptable. This re-seals with the real key.
 *
 * Dev-only. Matches known seed names by sort_order (deterministic).
 */
async function reEncryptSeedNames(orgPublicKey: Uint8Array): Promise<void> {
  const tickets = trpc.tickets;
  const kb = trpc.kb;
  if (!tickets || !kb) return;

  const encoder = new TextEncoder();

  // Re-encrypt queue names by sort_order (seed assigns 1=Intake, 2=Crisis, 3=Housing)
  const queueNamesBySortOrder = ["Intake", "Crisis", "Housing"];
  const queues = await tickets.listQueues.query();
  for (const q of queues) {
    const expectedName = queueNamesBySortOrder.at(q.sortOrder - 1);
    if (expectedName === undefined) continue;
    const sealed = sealForOrgKey(encoder.encode(expectedName), orgPublicKey);
    await tickets.updateQueue.mutate({
      queueId: q.id,
      encryptedName: encode(sealed),
    });
  }
  console.log("[dev] re-encrypted queue names with real org key");

  // Re-encrypt KB category names (seed assigns 1=Procedures, 2=Resources, 3=Safety)
  const kbNamesBySortOrder = ["Procedures", "Resources", "Safety"];
  const categories = await kb.listCategories.query();
  for (const c of categories) {
    const expectedName = kbNamesBySortOrder.at(c.sortOrder - 1);
    if (expectedName === undefined) continue;
    const sealed = sealForOrgKey(encoder.encode(expectedName), orgPublicKey);
    await kb.updateCategory.mutate({
      categoryId: c.id,
      encryptedName: encode(sealed),
    });
  }
  console.log("[dev] re-encrypted KB category names with real org key");

  // Re-encrypt admin user's display name (seed encrypted with throwaway key)
  const { user } = await trpc.auth.me.query();
  const sealedAdminName = sealForOrgKey(
    encoder.encode("Dev Admin"),
    orgPublicKey,
  );
  // devReEncryptDisplayName is dev-only (conditionally spread on server)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- dev-only, runtime guard follows
  const auth = trpc.auth as unknown as
    | Record<string, { mutate: (input: unknown) => Promise<unknown> }>
    | undefined;
  const reEncrypt = auth?.devReEncryptDisplayName;
  if (reEncrypt) {
    await reEncrypt.mutate({
      userId: user.id,
      encryptedDisplayName: encode(sealedAdminName),
    });
    console.log("[dev] re-encrypted admin display name with real org key");
  }
}

export async function devAutoLogin(
  bridge: CryptoBridge,
  orgKeyManager: OrgKeyManager,
): Promise<void> {
  // 1. Auth login (creates session)
  try {
    await getBypass2fa().mutate();
  } catch {
    await trpc.auth.login.mutate({
      identifier: DEV_IDENTIFIER,
      password: DEV_PASSWORD,
    });
    await getBypass2fa().mutate();
  }

  // 2. Get userId for registerCrypto
  const { user } = await trpc.auth.me.query();

  // 3. Register crypto keys (first run only, idempotent on re-runs)
  try {
    await registerCrypto(user.id, DEV_PASSWORD, noopRegisterCallbacks);
    console.log("[dev] registerCrypto: keys initialized");
  } catch (err: unknown) {
    if (isConflictError(err)) {
      console.log("[dev] registerCrypto: keys already exist, skipping");
    } else {
      throw err;
    }
  }

  // 4. Login crypto (Worker-based key derivation -> KEYED state)
  await bridge.waitReady();
  const { orgPublicKey: orgPubKeyB64 } = await loginCrypto(
    DEV_IDENTIFIER,
    DEV_PASSWORD,
    bridge,
    noopLoginCallbacks,
  );
  console.log("[dev] loginCrypto: Worker is KEYED");

  // 5. Org key bootstrap
  // On first run: orgPubKeyB64 is null (seed created a throwaway keypair,
  // no wrapped_org_keys row exists). Generate real keypair and rotate.
  // On re-run: orgPubKeyB64 is non-null (rotation already happened,
  // wrapped_org_keys row exists). Load directly.
  let orgPublicKey: Uint8Array | null = null;

  if (orgPubKeyB64 !== null) {
    orgKeyManager.load(orgPubKeyB64);
    console.log("[dev] orgKeyManager: org key loaded (existing)");
  } else {
    orgPublicKey = await bootstrapOrgKeypair(bridge, orgKeyManager, user.id);
    // Re-encrypt seed data (queue names, KB category names) with the real org key.
    // The seed encrypted them with the throwaway keypair which is now gone.
    await reEncryptSeedNames(orgPublicKey);
  }
  setOrgKeyReady(true);

  // 6. Seed KB articles client-side (first run only)
  // Need the org public key. On first run we have it from bootstrapOrgKeypair.
  // On re-run, derive it from the secret key in OrgKeyManager.
  if (!orgPublicKey) {
    // Re-run path: derive public key from secret key. OrgKeyManager holds
    // the secret. We can derive pk = scalarmult_base(sk), but OrgKeyManager
    // doesn't expose the raw key. KB articles should already exist on re-run
    // so we just skip seeding. The listItems check in seedKBArticles handles this.
    console.log("[dev] KB seeding: skipping (re-run, articles should exist)");
  } else {
    await seedKBArticles(orgPublicKey, orgKeyManager);
  }

  // 7. Seed telephony config (server encrypts with its own secretsEncryptor)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- dev-only, conditionally spread route
  const telAdmin = trpc.telephonyAdmin as
    Record<string, { mutate: () => Promise<unknown> }> | undefined;
  const seedTel = telAdmin?.devSeedTelephony;
  if (seedTel) {
    await seedTel.mutate();
    console.log("[dev] devSeedTelephony: telephony config seeded");
  }

  // 8. Seed test tickets (server creates tickets with real ECIES key wraps)
  await getDevSeedTickets().mutate();
  console.log("[dev] devSeedTickets: tickets seeded");

  // 9. Seed quarantine entries (sealed-box encrypted voicemails)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- dev-only, runtime guard follows
  const devRouterAL = trpc.dev as unknown as
    Record<string, { mutate: () => Promise<{ count: number }> }> | undefined;
  const seedQ = devRouterAL?.seedQuarantine;
  if (seedQ) {
    const result = await seedQ.mutate();
    console.log(`[dev] quarantine: ${String(result.count)} entries seeded`);
  }
}
