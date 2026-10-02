/**
 * Unit tests for stripping the template's explanatory comments.
 *
 * The preservation cases matter most: Svelte's hydration markers are HTML
 * comments too, and removing one breaks hydration on the client.
 */

import { describe, it, expect } from "vitest";

import { stripTemplateComments } from "./template-comments.js";

describe("stripTemplateComments", () => {
  it("removes a multi-line comment", () => {
    const html =
      "<head>\n    <!-- first line\n         second line\n         third line -->\n    <meta />\n</head>";
    expect(stripTemplateComments(html)).toBe(
      "<head>\n    \n    <meta />\n</head>",
    );
  });

  it("removes a single-line comment with a leading space", () => {
    expect(stripTemplateComments("<div><!-- note --></div>")).toBe(
      "<div></div>",
    );
  });

  it("removes a comment whose opener is followed by a newline", () => {
    expect(
      stripTemplateComments("<!doctype html>\n<!--\n  note\n-->\n<html>"),
    ).toBe("<!doctype html>\n\n<html>");
  });

  it("preserves the block-open hydration marker", () => {
    const html = "<div><!--[--><p>a</p><!--]--></div>";
    expect(stripTemplateComments(html)).toBe(html);
  });

  it("preserves the block-close hydration marker", () => {
    const html = "<ul><li>a</li><!--]--></ul>";
    expect(stripTemplateComments(html)).toBe(html);
  });

  it("preserves the empty hydration marker", () => {
    const html = "<span>a</span><!----><span>b</span>";
    expect(stripTemplateComments(html)).toBe(html);
  });

  it("preserves the else-branch hydration marker", () => {
    const html = "<section><!--[!--><p>empty</p><!--]--></section>";
    expect(stripTemplateComments(html)).toBe(html);
  });

  it("preserves a comment with no whitespace after the opener", () => {
    const html = "<div><!--x--></div>";
    expect(stripTemplateComments(html)).toBe(html);
  });

  it("leaves text outside comments byte-identical", () => {
    const before = '<html lang="en">\n  <body class="a">\t';
    const middle = "<p>text &amp; more</p><!--[-->";
    const after = "<!--]-->\n  </body>\n</html>\n";
    const html = `${before}<!-- removed -->${middle}<!--\nalso removed\n-->${after}`;
    expect(stripTemplateComments(html)).toBe(before + middle + after);
  });
});
