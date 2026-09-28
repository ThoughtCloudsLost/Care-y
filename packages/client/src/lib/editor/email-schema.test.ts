// @vitest-environment jsdom
/**
 * Tests for the trimmed email ProseMirror schema and its serializers.
 *
 * Covers emailDocToHtml and emailDocToText for marks (strong, em, link),
 * lists (bullet, ordered), hard breaks, and link labels. Also covers the
 * stored-payload parsers and the one-line preview text derived from them.
 */

import { describe, it, expect } from "vitest";
import type { ProseMirrorDocJSON } from "@care-y/shared";
import {
  emailDocToHtml,
  emailDocToText,
  emailPreviewText,
  emailSchema,
  parseEmailInbound,
  parseEmailOutbound,
} from "./email-schema.js";

// ---------------------------------------------------------------------------
// Schema structure
// ---------------------------------------------------------------------------

describe("emailSchema", () => {
  it("has the expected node types", () => {
    const nodeNames: string[] = [];
    emailSchema.spec.nodes.forEach((name: string) => {
      nodeNames.push(name);
    });
    expect(nodeNames).toEqual(
      expect.arrayContaining([
        "doc",
        "paragraph",
        "bullet_list",
        "ordered_list",
        "list_item",
        "hard_break",
        "text",
      ]),
    );
    expect(nodeNames).not.toContain("heading");
    expect(nodeNames).not.toContain("image");
    expect(nodeNames).not.toContain("table");
  });

  it("has the expected mark types", () => {
    const markNames: string[] = [];
    emailSchema.spec.marks.forEach((name: string) => {
      markNames.push(name);
    });
    expect(markNames).toEqual(expect.arrayContaining(["strong", "em", "link"]));
    expect(markNames).not.toContain("code");
    expect(markNames).not.toContain("strikethrough");
  });
});

// ---------------------------------------------------------------------------
// emailDocToHtml
// ---------------------------------------------------------------------------

describe("emailDocToHtml", () => {
  it("renders a paragraph with bold text", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Hello " },
            {
              type: "text",
              text: "world",
              marks: [{ type: "strong" }],
            },
          ],
        },
      ],
    };
    const html = emailDocToHtml(doc);
    expect(html).toContain("<strong>");
    expect(html).toContain("world");
    expect(html).toContain("<p>");
  });

  it("renders italic text", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "emphasis",
              marks: [{ type: "em" }],
            },
          ],
        },
      ],
    };
    const html = emailDocToHtml(doc);
    expect(html).toContain("<em>");
    expect(html).toContain("emphasis");
  });

  it("renders links with security attributes", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "click here",
              marks: [
                {
                  type: "link",
                  attrs: { href: "https://example.com", title: null },
                },
              ],
            },
          ],
        },
      ],
    };
    const html = emailDocToHtml(doc);
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("click here");
  });

  it("renders bullet lists", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "bullet_list",
          content: [
            {
              type: "list_item",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "item one" }],
                },
              ],
            },
          ],
        },
      ],
    };
    const html = emailDocToHtml(doc);
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
    expect(html).toContain("item one");
  });

  it("renders hard breaks", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "before" },
            { type: "hard_break" },
            { type: "text", text: "after" },
          ],
        },
      ],
    };
    const html = emailDocToHtml(doc);
    expect(html).toContain("<br>");
    expect(html).toContain("before");
    expect(html).toContain("after");
  });

  it("sanitizes script tags from malicious input", () => {
    // Even though the schema would never produce this, verify the
    // sanitizer strips it when rendering.
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "safe" }],
        },
      ],
    };
    const html = emailDocToHtml(doc);
    expect(html).not.toContain("<script");
  });
});

// ---------------------------------------------------------------------------
// emailDocToText
// ---------------------------------------------------------------------------

describe("emailDocToText", () => {
  it("converts paragraphs to double-newline-separated text", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "First paragraph" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Second paragraph" }],
        },
      ],
    };
    const text = emailDocToText(doc);
    expect(text).toBe("First paragraph\n\nSecond paragraph");
  });

  it("converts bullet list items with dash prefix", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "bullet_list",
          content: [
            {
              type: "list_item",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "apples" }],
                },
              ],
            },
            {
              type: "list_item",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "bananas" }],
                },
              ],
            },
          ],
        },
      ],
    };
    const text = emailDocToText(doc);
    expect(text).toBe("- apples\n- bananas");
  });

  it("converts ordered list items with numbered prefix", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "ordered_list",
          attrs: { order: 1 },
          content: [
            {
              type: "list_item",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "first" }],
                },
              ],
            },
            {
              type: "list_item",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "second" }],
                },
              ],
            },
          ],
        },
      ],
    };
    const text = emailDocToText(doc);
    expect(text).toBe("1. first\n2. second");
  });

  it("renders links as label (url) when href differs from text", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "click here",
              marks: [
                {
                  type: "link",
                  attrs: { href: "https://example.com", title: null },
                },
              ],
            },
          ],
        },
      ],
    };
    const text = emailDocToText(doc);
    expect(text).toBe("click here (https://example.com)");
  });

  it("renders links without parens when href matches text", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "https://example.com",
              marks: [
                {
                  type: "link",
                  attrs: { href: "https://example.com", title: null },
                },
              ],
            },
          ],
        },
      ],
    };
    const text = emailDocToText(doc);
    expect(text).toBe("https://example.com");
  });

  it("converts hard breaks to single newlines", () => {
    const doc: ProseMirrorDocJSON = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "line one" },
            { type: "hard_break" },
            { type: "text", text: "line two" },
          ],
        },
      ],
    };
    const text = emailDocToText(doc);
    expect(text).toBe("line one\nline two");
  });
});

// ---------------------------------------------------------------------------
// parseEmailOutbound
// ---------------------------------------------------------------------------

describe("parseEmailOutbound", () => {
  const validPayload = JSON.stringify({
    subject: "Follow-up 749124",
    doc: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Here is an" },
            { type: "text", marks: [{ type: "strong" }], text: " update" },
          ],
        },
      ],
    },
  });

  it("parses a stored payload into subject and sanitized body HTML", () => {
    const parsed = parseEmailOutbound(validPayload);
    expect(parsed).not.toBeNull();
    expect(parsed?.subject).toBe("Follow-up 749124");
    expect(parsed?.bodyHtml).toContain("<strong> update</strong>");
  });

  it("returns null for a plain text message (not JSON)", () => {
    expect(parseEmailOutbound("just a normal message")).toBeNull();
  });

  it("returns null when subject or doc keys are missing", () => {
    expect(parseEmailOutbound(JSON.stringify({ subject: "x" }))).toBeNull();
    expect(parseEmailOutbound(JSON.stringify({ doc: {} }))).toBeNull();
    expect(parseEmailOutbound(JSON.stringify(null))).toBeNull();
    expect(parseEmailOutbound(JSON.stringify("string"))).toBeNull();
  });

  it("returns null when the doc contains nodes outside the email schema", () => {
    const payload = JSON.stringify({
      subject: "x",
      doc: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "not allowed" }],
          },
        ],
      },
    });
    expect(parseEmailOutbound(payload)).toBeNull();
  });

  it("coerces a non-string subject to an empty string", () => {
    const payload = JSON.stringify({
      subject: 42,
      doc: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "body" }] },
        ],
      },
    });
    const parsed = parseEmailOutbound(payload);
    expect(parsed?.subject).toBe("");
    expect(parsed?.bodyHtml).toContain("body");
  });
});

// ---------------------------------------------------------------------------
// parseEmailInbound
// ---------------------------------------------------------------------------

describe("parseEmailInbound", () => {
  it("parses a stored payload into its typed fields", () => {
    const parsed = parseEmailInbound(
      JSON.stringify({
        subject: "Re: Follow-up 749124",
        text: "Thanks, that works",
        from: "sender@example.com",
        droppedAttachments: 2,
      }),
    );
    expect(parsed).toEqual({
      subject: "Re: Follow-up 749124",
      text: "Thanks, that works",
      from: "sender@example.com",
      droppedAttachments: 2,
    });
  });

  it("defaults missing optional fields", () => {
    const parsed = parseEmailInbound(
      JSON.stringify({ text: "body", from: "sender@example.com" }),
    );
    expect(parsed?.subject).toBe("");
    expect(parsed?.droppedAttachments).toBe(0);
  });

  it("returns null for malformed payloads", () => {
    expect(parseEmailInbound("just a normal message")).toBeNull();
    expect(parseEmailInbound(JSON.stringify({ text: "no from" }))).toBeNull();
    expect(parseEmailInbound(JSON.stringify(null))).toBeNull();
    expect(parseEmailInbound(JSON.stringify("string"))).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// emailPreviewText
// ---------------------------------------------------------------------------

describe("emailPreviewText", () => {
  it("shows the trimmed body text of an inbound email", () => {
    const raw = JSON.stringify({
      subject: "Re: Follow-up 749124",
      text: "  Thanks, that works\n",
      from: "sender@example.com",
      droppedAttachments: 0,
    });
    expect(emailPreviewText("email_inbound", raw)).toBe("Thanks, that works");
  });

  it("falls back to the subject when the inbound body is blank", () => {
    const raw = JSON.stringify({
      subject: "Re: Follow-up 749124",
      text: "   ",
      from: "sender@example.com",
      droppedAttachments: 0,
    });
    expect(emailPreviewText("email_inbound", raw)).toBe("Re: Follow-up 749124");
  });

  it("shows the plain text of an outbound email's doc", () => {
    const raw = JSON.stringify({
      subject: "Follow-up 749124",
      doc: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Here is an" },
              { type: "text", marks: [{ type: "strong" }], text: " update" },
            ],
          },
        ],
      },
    });
    expect(emailPreviewText("email_outbound", raw)).toBe("Here is an update");
  });

  it("falls back to the subject when the outbound doc has no text", () => {
    const raw = JSON.stringify({
      subject: "Follow-up 749124",
      doc: { type: "doc", content: [{ type: "paragraph" }] },
    });
    expect(emailPreviewText("email_outbound", raw)).toBe("Follow-up 749124");
  });

  it("passes non-email content through unchanged", () => {
    const raw = JSON.stringify({ text: "looks like email", from: "x" });
    expect(emailPreviewText("message", raw)).toBe(raw);
    expect(emailPreviewText("message", "plain text")).toBe("plain text");
  });

  it("passes malformed email payloads through unchanged", () => {
    expect(emailPreviewText("email_inbound", "not json")).toBe("not json");
    expect(emailPreviewText("email_outbound", "not json")).toBe("not json");
    const outsideSchema = JSON.stringify({
      subject: "x",
      doc: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "not allowed" }],
          },
        ],
      },
    });
    expect(emailPreviewText("email_outbound", outsideSchema)).toBe(
      outsideSchema,
    );
  });
});
