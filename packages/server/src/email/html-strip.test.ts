import { describe, expect, it } from "vitest";
import { htmlStrip } from "./html-strip.js";

describe("htmlStrip", () => {
  it("strips simple tags and keeps text", () => {
    expect(htmlStrip("<p>Hello <b>there</b></p>")).toBe("Hello there");
  });

  it("converts br and block closers to newlines", () => {
    expect(htmlStrip("line one<br>line two<br/>line three")).toBe(
      "line one\nline two\nline three",
    );
    expect(htmlStrip("<p>first</p><p>second</p>")).toBe("first\nsecond");
    expect(htmlStrip("<div>a</div><div>b</div>")).toBe("a\nb");
  });

  it("removes script and style contents entirely", () => {
    expect(
      htmlStrip('<script>alert("x")</script>body<style>p{color:red}</style>'),
    ).toBe("body");
    expect(htmlStrip('<script src="a.js"></script>text')).toBe("text");
  });

  it("decodes the small entity set and leaves the rest", () => {
    expect(htmlStrip("a &amp; b &lt;c&gt; &quot;d&quot; &#39;e&#39;")).toBe(
      "a & b <c> \"d\" 'e'",
    );
    expect(htmlStrip("&nbsp;x")).toBe("x");
    expect(htmlStrip("&euro;100")).toBe("&euro;100");
  });

  it("collapses runs of blank lines", () => {
    expect(htmlStrip("<p>a</p>\n\n\n<p></p><p></p><p>b</p>")).toBe("a\n\nb");
  });

  it("handles empty and tag-only input", () => {
    expect(htmlStrip("")).toBe("");
    expect(htmlStrip("<div></div>")).toBe("");
  });

  it("keeps quoted-reply markers verbatim", () => {
    expect(htmlStrip("<blockquote>original text</blockquote>")).toBe(
      "original text",
    );
  });
});
