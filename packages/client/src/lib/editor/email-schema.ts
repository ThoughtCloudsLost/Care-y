/**
 * Trimmed ProseMirror schema for email composition.
 *
 * Subset of the full editorSchema: paragraph, lists, hard_break, text,
 * plus strong, em, link marks. No headings, images, tables, code blocks,
 * or figure nodes. This set renders reliably across mail clients.
 *
 * Serializers convert a ProseMirror doc JSON to HTML (for the relay) and
 * plain text (for the relay's text fallback). Both run through the
 * shared sanitizer pipeline before leaving this module.
 */

import {
  Schema,
  Node as PMNode,
  DOMSerializer,
  type NodeSpec,
  type MarkSpec,
} from "prosemirror-model";
import { nodes, marks } from "./prosemirror-schema.js";
import { sanitizeArticleHtml } from "$lib/utils/render-article.js";
import { proseMirrorDocSchema } from "@care-y/shared";
import type { ProseMirrorDocJSON } from "@care-y/shared";

// ---------------------------------------------------------------------------
// Email schema (trimmed node/mark subset)
// ---------------------------------------------------------------------------

/** Map views over the spec objects: lookup without an indexed-access sink. */
const nodeSpecs = new Map(Object.entries(nodes));
const markSpecs = new Map(Object.entries(marks));

/** Throws if the spec map does not contain the expected key. */
function requireNode(key: string): NodeSpec {
  const spec = nodeSpecs.get(key);
  if (spec === undefined) {
    throw new TypeError(`Missing required node spec: ${key}`);
  }
  return spec;
}

function requireMark(key: string): MarkSpec {
  const spec = markSpecs.get(key);
  if (spec === undefined) {
    throw new TypeError(`Missing required mark spec: ${key}`);
  }
  return spec;
}

export const emailSchema = new Schema({
  nodes: {
    doc: { content: "block+" },
    paragraph: requireNode("paragraph"),
    bullet_list: requireNode("bullet_list"),
    ordered_list: requireNode("ordered_list"),
    list_item: requireNode("list_item"),
    hard_break: requireNode("hard_break"),
    text: requireNode("text"),
  },
  marks: {
    strong: requireMark("strong"),
    em: requireMark("em"),
    link: requireMark("link"),
  },
});

// ---------------------------------------------------------------------------
// Doc JSON -> sanitized HTML (for relay html field)
// ---------------------------------------------------------------------------

/**
 * Serialize a ProseMirror doc JSON (from the email compose editor) to
 * sanitized HTML. The output is safe for {@html} rendering and for the
 * relay's html field.
 */
export function emailDocToHtml(doc: ProseMirrorDocJSON): string {
  const pmDoc = PMNode.fromJSON(emailSchema, doc);
  const serializer = DOMSerializer.fromSchema(emailSchema);
  const fragment = serializer.serializeFragment(pmDoc.content);
  const div = document.createElement("div");
  div.appendChild(fragment);
  return sanitizeArticleHtml(div.innerHTML);
}

// ---------------------------------------------------------------------------
// Stored email_outbound payload -> subject + sanitized body HTML
// ---------------------------------------------------------------------------

/** Parsed form of a stored email_outbound follow-up payload. */
export interface ParsedEmailOutbound {
  readonly subject: string;
  readonly bodyHtml: string;
}

/**
 * Parse a decrypted email_outbound payload (`{ subject, doc }` JSON) into a
 * subject and sanitized body HTML. Returns null for anything malformed so
 * callers can fall back to plain-text rendering.
 */
export function parseEmailOutbound(raw: string): ParsedEmailOutbound | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("subject" in parsed) ||
      !("doc" in parsed)
    )
      return null;
    const subject = typeof parsed.subject === "string" ? parsed.subject : "";
    const doc = proseMirrorDocSchema.safeParse(parsed.doc);
    if (!doc.success) return null;
    const bodyHtml = emailDocToHtml(doc.data);
    return { subject, bodyHtml };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Doc JSON -> plain text (for relay text field)
// ---------------------------------------------------------------------------

/**
 * Serialize a ProseMirror doc JSON to plain text.
 *
 * - Paragraphs separated by double newlines.
 * - List items prefixed with "- " (bullet) or "N. " (ordered).
 * - Links rendered as "label (url)".
 * - Hard breaks become single newlines.
 */
export function emailDocToText(doc: ProseMirrorDocJSON): string {
  const pmDoc = PMNode.fromJSON(emailSchema, doc);
  const blocks: string[] = [];

  pmDoc.forEach((node) => {
    blocks.push(blockToText(node, 1));
  });

  return blocks.join("\n\n").trim();
}

/** Convert a single block node to plain text. */
function blockToText(node: PMNode, listStart?: number): string {
  switch (node.type.name) {
    case "paragraph":
      return inlineToText(node);
    case "bullet_list": {
      const items: string[] = [];
      node.forEach((li) => {
        items.push(listItemToText(li, "- "));
      });
      return items.join("\n");
    }
    case "ordered_list": {
      const start =
        typeof node.attrs.order === "number"
          ? node.attrs.order
          : (listStart ?? 1);
      const items: string[] = [];
      let idx = start;
      node.forEach((li) => {
        items.push(listItemToText(li, `${String(idx)}. `));
        idx++;
      });
      return items.join("\n");
    }
    default:
      return inlineToText(node);
  }
}

/** Extract text from a list_item, which contains paragraph block(s). */
function listItemToText(li: PMNode, prefix: string): string {
  const parts: string[] = [];
  li.forEach((child) => {
    parts.push(blockToText(child));
  });
  return prefix + parts.join("\n");
}

/** Extract inline text from a node, handling marks and hard_break. */
function inlineToText(node: PMNode): string {
  const parts: string[] = [];
  node.forEach((child) => {
    if (child.type.name === "hard_break") {
      parts.push("\n");
      return;
    }
    if (child.isText && child.text !== undefined) {
      const linkMark = child.marks.find((m) => m.type.name === "link");
      if (linkMark !== undefined) {
        const href: unknown = linkMark.attrs.href;
        if (typeof href === "string" && href !== child.text) {
          parts.push(`${child.text} (${href})`);
          return;
        }
      }
      parts.push(child.text);
    }
  });
  return parts.join("");
}
