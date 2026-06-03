import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";

interface PmNode {
  type: string;
  attrs?: Record<string, unknown>;
  marks?: PmMark[];
  content?: PmNode[];
  text?: string;
}

interface PmMark {
  type: string;
  attrs?: Record<string, unknown>;
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
  return { type: "bulletList", content: items };
}

function ol(...items: PmNode[]): PmNode {
  return { type: "orderedList", attrs: { start: 1 }, content: items };
}

function li(...content: PmNode[]): PmNode {
  return { type: "listItem", content };
}

function codeBlock(text: string): PmNode {
  return {
    type: "codeBlock",
    attrs: { language: null },
    content: [{ type: "text", text }],
  };
}

function hr(): PmNode {
  return { type: "horizontalRule" };
}

function bq(...content: PmNode[]): PmNode {
  return { type: "blockquote", content };
}

const bold: PmMark = { type: "bold" };
const italic: PmMark = { type: "italic" };

interface ArticleDef {
  category: string;
  title: string;
  body: string;
  excerpt: string;
}

const ARTICLES: readonly ArticleDef[] = [
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
        t(". Escalation connects the caller with resources faster."),
      ),
      h(2, t("Recognizing escalation triggers")),
      ul(
        li(p(t("The caller states they are in physical danger right now"))),
        li(p(t("The caller describes an active threat from a known person"))),
        li(p(t("The caller mentions self-harm or suicidal ideation"))),
        li(
          p(t("A child or dependent is described as being in immediate risk")),
        ),
      ),
      h(2, t("Escalation steps")),
      ol(
        li(p(t("Stay on the line with the caller."))),
        li(p(t("Use the "), t("crisis flag", bold), t(" on the ticket form."))),
      ),
      codeBlock(
        "ESCALATION HANDOFF\nTime: [HH:MM]\nTransferred to: [volunteer name]\nReason: [brief trigger description]",
      ),
      hr(),
      h(2, t("After an escalation")),
      p(
        t(
          "Take a few minutes before your next call if you need to. Debrief with your supervisor if the situation was particularly intense.",
        ),
      ),
    ),
  },
  {
    category: "Resources",
    title: "Housing referral contacts",
    excerpt: "Regional housing assistance contacts and referral procedures.",
    body: pmDoc(
      p(
        t(
          "This directory covers housing assistance programs available to callers in the service area.",
        ),
      ),
      h(2, t("Emergency shelters")),
      ul(
        li(p(t("City Emergency Shelter: open 24/7, walk-in accepted"))),
        li(p(t("Family Haven: families with children, referral required"))),
      ),
      h(2, t("Transitional housing")),
      p(
        t(
          "Transitional programs typically require a referral from a case manager.",
        ),
      ),
    ),
  },
  {
    category: "Resources",
    title: "Legal aid directory",
    excerpt:
      "Legal aid organizations and pro bono services available for callers.",
    body: pmDoc(
      p(
        t(
          "The following organizations provide free or low-cost legal services to eligible callers.",
        ),
      ),
      h(2, t("Family law")),
      ul(
        li(p(t("Legal Aid Society: protective orders, custody, divorce"))),
        li(p(t("Pro Bono Clinic: Saturdays 10am-2pm, walk-in"))),
      ),
      h(2, t("Immigration")),
      p(
        t(
          "Immigration legal help is available through the Regional Immigration Center.",
        ),
      ),
    ),
  },
  {
    category: "Safety",
    title: "Safety planning template",
    excerpt:
      "Template for creating personalized safety plans with callers in domestic violence situations.",
    body: pmDoc(
      h(2, t("What is a safety plan?")),
      p(
        t(
          "A safety plan is a personalized, practical plan that helps someone recognize warning signs, use coping strategies, and identify people and resources to contact during a crisis.",
        ),
      ),
      h(2, t("Steps")),
      ol(
        li(p(t("Warning signs that a crisis may be developing"))),
        li(p(t("Internal coping strategies"))),
        li(p(t("People and social settings that provide distraction"))),
        li(p(t("People I can ask for help"))),
        li(p(t("Professionals or agencies I can contact during a crisis"))),
        li(p(t("Making the environment safe"))),
      ),
      p(
        t("Adapt each step to the caller's specific situation. "),
        t(
          "Never pressure them to disclose more than they are comfortable sharing.",
          italic,
        ),
      ),
    ),
  },
  {
    category: "Safety",
    title: "Accessibility issues example",
    excerpt:
      "Example article with intentional accessibility issues for ATAG testing.",
    body: pmDoc(
      h(2, t("About this article")),
      p(
        t(
          "This article contains intentional accessibility issues for testing the editor's ATAG checks.",
        ),
      ),
      h(4, t("Skipped heading level")),
      p(t("The heading above skips from h2 to h4.")),
      h(2),
      p(t("The heading above is empty.")),
      p(
        t("Click "),
        {
          type: "text",
          text: "here",
          marks: [
            {
              type: "link",
              attrs: { href: "https://example.com", target: "_blank" },
            },
          ],
        },
        t(" for more information."),
      ),
    ),
  },
];

export async function seedKbArticles(
  tDb: Kysely<TenantDatabase>,
  sealedBox: SealedBoxEncryptor,
  userId: string,
): Promise<{ articleIds: string[] }> {
  const existing = await tDb
    .selectFrom("kb_items")
    .select("id")
    .limit(1)
    .executeTakeFirst();

  if (existing) {
    const all = await tDb.selectFrom("kb_items").select("id").execute();
    return { articleIds: all.map((r) => r.id) };
  }

  const categories = await tDb
    .selectFrom("kb_categories")
    .select(["id", "sort_order"])
    .orderBy("sort_order", "asc")
    .execute();

  const categoryNameToSortOrder: Record<string, number> = {
    Procedures: 1,
    Resources: 2,
    Safety: 3,
  };

  const catMap = new Map<number, string>();
  for (const cat of categories) {
    catMap.set(cat.sort_order, cat.id);
  }

  const articleIds: string[] = [];

  for (const article of ARTICLES) {
    const sortOrder = categoryNameToSortOrder[article.category];
    if (sortOrder === undefined) continue;
    const categoryId = catMap.get(sortOrder);
    if (categoryId === undefined) continue;

    const result = await tDb
      .insertInto("kb_items")
      .values({
        category_id: categoryId,
        created_by: userId,
        encrypted_title: sealedBox.seal(article.title),
        encrypted_body: sealedBox.seal(article.body),
        encrypted_excerpt: sealedBox.seal(article.excerpt),
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    articleIds.push(result.id);
  }

  return { articleIds };
}
