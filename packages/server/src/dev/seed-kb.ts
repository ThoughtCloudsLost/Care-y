import type { Kysely } from "kysely";
import type { TenantDatabase } from "../db/types.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import type { BlobStore } from "../storage/store.js";
import { wilsonScore } from "../kb/service.js";

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
  return { type: "bullet_list", content: items };
}

function ol(...items: PmNode[]): PmNode {
  return { type: "ordered_list", attrs: { order: 1 }, content: items };
}

function li(...content: PmNode[]): PmNode {
  return { type: "list_item", content };
}

function codeBlock(text: string): PmNode {
  return {
    type: "code_block",
    content: [{ type: "text", text }],
  };
}

function hr(): PmNode {
  return { type: "horizontal_rule" };
}

function bq(...content: PmNode[]): PmNode {
  return { type: "blockquote", content };
}

const bold: PmMark = { type: "strong" };
const italic: PmMark = { type: "em" };

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
              attrs: { href: "https://example.com", title: null },
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
  blobStore?: BlobStore,
  orgSchema?: string,
  extraVoterIds?: readonly string[],
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

  // --- Seed votes ---
  // Spread upvotes across articles so vote counts are non-zero and varied.
  // The primary user always votes per the base spec. When extraVoterIds are
  // provided, additional voters are spread across articles for richer counts.
  const voteSpec: { index: number; direction: string }[] = [
    { index: 0, direction: "up" },
    { index: 1, direction: "down" },
    { index: 2, direction: "up" },
    { index: 4, direction: "up" },
  ];

  // Track cumulative counts per article for the final denormalized update
  const upCounts = new Map<string, number>();
  const downCounts = new Map<string, number>();

  for (const spec of voteSpec) {
    const itemId = articleIds[spec.index];
    if (itemId === undefined) continue;

    await tDb
      .insertInto("kb_votes")
      .values({
        kb_item_id: itemId,
        voter_pseudonym: userId,
        direction: spec.direction,
      })
      .execute();

    if (spec.direction === "up") {
      upCounts.set(itemId, (upCounts.get(itemId) ?? 0) + 1);
    } else {
      downCounts.set(itemId, (downCounts.get(itemId) ?? 0) + 1);
    }
  }

  // Extra voter votes (when roster users are available)
  if (extraVoterIds !== undefined && extraVoterIds.length > 0) {
    // Each extra voter votes on a rotating subset of articles with
    // varied directions to produce realistic, non-uniform counts.
    const extraVoteSpec: {
      voterIdx: number;
      articleIdx: number;
      direction: string;
    }[] = [
      { voterIdx: 0, articleIdx: 0, direction: "up" },
      { voterIdx: 0, articleIdx: 2, direction: "up" },
      { voterIdx: 0, articleIdx: 4, direction: "up" },
      { voterIdx: 1, articleIdx: 0, direction: "up" },
      { voterIdx: 1, articleIdx: 1, direction: "up" },
      { voterIdx: 1, articleIdx: 3, direction: "up" },
      { voterIdx: 2, articleIdx: 0, direction: "down" },
      { voterIdx: 2, articleIdx: 4, direction: "up" },
      { voterIdx: 3, articleIdx: 1, direction: "down" },
      { voterIdx: 3, articleIdx: 2, direction: "up" },
      { voterIdx: 3, articleIdx: 5, direction: "up" },
      { voterIdx: 4, articleIdx: 0, direction: "up" },
      { voterIdx: 4, articleIdx: 3, direction: "down" },
      { voterIdx: 4, articleIdx: 4, direction: "up" },
    ];

    for (const ev of extraVoteSpec) {
      const voterId = extraVoterIds[ev.voterIdx];
      if (voterId === undefined) continue;
      const itemId = articleIds[ev.articleIdx];
      if (itemId === undefined) continue;

      await tDb
        .insertInto("kb_votes")
        .values({
          kb_item_id: itemId,
          voter_pseudonym: voterId,
          direction: ev.direction,
        })
        .execute();

      if (ev.direction === "up") {
        upCounts.set(itemId, (upCounts.get(itemId) ?? 0) + 1);
      } else {
        downCounts.set(itemId, (downCounts.get(itemId) ?? 0) + 1);
      }
    }
  }

  // Update denormalized counts for all articles that received votes
  const votedItemIds = new Set([...upCounts.keys(), ...downCounts.keys()]);
  for (const itemId of votedItemIds) {
    const up = upCounts.get(itemId) ?? 0;
    const down = downCounts.get(itemId) ?? 0;
    await tDb
      .updateTable("kb_items")
      .set({
        vote_up_count: up,
        vote_down_count: down,
        rating: wilsonScore(up, down),
      })
      .where("id", "=", itemId)
      .execute();
  }

  // --- Seed attachments ---
  // Only seed attachments when a blob store is provided. Without one the
  // download path would fail (metadata rows with no backing bytes are
  // worse than no attachment rows at all).
  if (blobStore !== undefined && orgSchema !== undefined) {
    // Plaintext file content, generated in code. The client upload path
    // encrypts with crypto_box_seal (org public key) before storing;
    // sealedBox.sealBuffer is the same primitive. The download path
    // decrypts with crypto_box_seal_open in the client crypto Worker.
    // size_bytes in the schema is ciphertext length (matches the client
    // upload which sends encrypted.length as sizeBytes).

    // Minimal valid PDF (header + empty body + xref + trailer).
    const pdfPlain = Buffer.from(
      [
        "%PDF-1.0",
        "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
        "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
        "3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj",
        "xref",
        "0 4",
        "0000000000 65535 f ",
        "0000000009 00000 n ",
        "0000000058 00000 n ",
        "0000000115 00000 n ",
        "trailer<</Size 4/Root 1 0 R>>",
        "startxref",
        "190",
        "%%EOF",
      ].join("\n"),
    );

    const txtPlain = Buffer.from(
      [
        "Safety Plan Worksheet",
        "",
        "1. Warning signs that a crisis may be developing:",
        "   _______________________________________________",
        "",
        "2. Internal coping strategies I can use:",
        "   _______________________________________________",
        "",
        "3. People and places that provide distraction:",
        "   _______________________________________________",
        "",
        "4. People I can ask for help:",
        "   Name: ________________  Phone: (555) 000-____",
        "   Name: ________________  Phone: (555) 000-____",
        "",
        "5. Professionals or agencies I can contact:",
        "   Crisis line: (555) 012-3456",
        "   _______________________________________________",
        "",
        "6. Steps to make my environment safer:",
        "   _______________________________________________",
      ].join("\n"),
    );

    const attachmentDefs: {
      articleIndex: number;
      filename: string;
      contentType: string;
      plainBytes: Buffer;
    }[] = [
      {
        articleIndex: 4,
        filename: "safety-plan-worksheet.txt",
        contentType: "text/plain",
        plainBytes: txtPlain,
      },
      {
        articleIndex: 1,
        filename: "escalation-flowchart.pdf",
        contentType: "application/pdf",
        plainBytes: pdfPlain,
      },
    ];

    for (const att of attachmentDefs) {
      const itemId = articleIds[att.articleIndex];
      if (itemId === undefined) continue;

      // Encrypt blob content the same way the client does (sealed box).
      const encryptedBlob = sealedBox.sealBuffer(att.plainBytes);
      const blobKey = await blobStore.put(
        orgSchema,
        "kb-attachment",
        encryptedBlob,
      );

      // Encrypt filename with sealed box (matches client upload path).
      const encryptedFilename = sealedBox.seal(att.filename);

      await tDb
        .insertInto("kb_attachments")
        .values({
          item_id: itemId,
          blob_key: blobKey,
          size_bytes: encryptedBlob.length,
          encrypted_filename: encryptedFilename,
          content_type: att.contentType,
        })
        .execute();
    }
  }

  return { articleIds };
}
