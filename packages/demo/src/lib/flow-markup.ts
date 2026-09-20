/**
 * Lightweight inline markup for story body text.
 *
 * The reference-page copy needs bold runs, bullet lists, numbered
 * lists, and paragraph breaks inside a single body message. The syntax
 * is a deliberately tiny markdown subset chosen to stay clear of
 * paraglide's `{param}` placeholder braces:
 *
 *   - `**bold**` marks a bold run within a line.
 *   - `\n` separates layout units. A unit starting with `- ` is a
 *     bullet item; one starting with `N. ` (any digits) is a numbered
 *     item whose marker keeps the author's numbering; anything else is
 *     a paragraph. Blank lines are ignored.
 *
 * There is no escape syntax. A literal `**` or a line that starts with
 * `- ` cannot be rendered verbatim; none of the story copy needs to.
 *
 * Pure functions only. No DOM, no Svelte, no pretext imports.
 */

/** A hash-fragment link target attached to a run. */
export interface MarkupLink {
  readonly target: string;
}

/** One styled run of text within a unit. */
export interface MarkupRun {
  readonly text: string;
  readonly bold: boolean;
  readonly link?: MarkupLink;
}

export type MarkupUnitKind = "paragraph" | "bullet" | "number";

/** One layout unit: a paragraph or a list item. */
export interface MarkupUnit {
  readonly kind: MarkupUnitKind;
  /** Gutter prefix for list items ("•" or the author's "3."), null for paragraphs. */
  readonly marker: string | null;
  readonly runs: readonly MarkupRun[];
}

const BULLET_PREFIX = "- ";
const NUMBER_PREFIX = /^(\d+)\. /;
const BOLD_DELIMITER = "**";

/**
 * Fast check for whether a string uses any markup at all. Callers keep
 * plain strings on the existing single-block path when this is false,
 * so unmarked copy renders byte-identically to before.
 */
export function hasFlowMarkup(text: string): boolean {
  if (text.includes("\n")) return true;
  if (text.includes(BOLD_DELIMITER)) return true;
  if (text.startsWith(BULLET_PREFIX)) return true;
  if (text.includes("[[")) return true;
  if (text.includes("](#")) return true;
  return NUMBER_PREFIX.test(text);
}

/**
 * Regex for `[text](#target)` entry links. The text must be non-empty
 * and the target must start with `#`. Non-hash URLs degrade to visible
 * text (the regex will not match them).
 */
const LINK_RE = /\[([^\]]+)\]\((#[^)]+)\)/g;

/**
 * Split a segment of text into bold/plain runs on `**` delimiters.
 * An unpaired trailing `**` is treated as literal text, so a stray
 * delimiter degrades to visible asterisks instead of eating the rest
 * of the line.
 */
function parseBoldRuns(segment: string): MarkupRun[] {
  const runs: MarkupRun[] = [];
  let rest = segment;
  for (;;) {
    const open = rest.indexOf(BOLD_DELIMITER);
    if (open === -1) break;
    const close = rest.indexOf(BOLD_DELIMITER, open + BOLD_DELIMITER.length);
    if (close === -1) break;

    const before = rest.slice(0, open);
    if (before !== "") runs.push({ text: before, bold: false });
    const boldText = rest.slice(open + BOLD_DELIMITER.length, close);
    if (boldText !== "") runs.push({ text: boldText, bold: true });
    rest = rest.slice(close + BOLD_DELIMITER.length);
  }
  if (rest !== "") runs.push({ text: rest, bold: false });
  return runs;
}

/**
 * Split one line's text into styled runs. Links are extracted first,
 * then bold within the remaining (non-link) text. A link run is never
 * bold (non-nesting). Malformed links (`[text]` without `(#...)`, or
 * `[text](http://...)` with a non-hash URL) degrade to visible text.
 */
function parseRuns(line: string): MarkupRun[] {
  const runs: MarkupRun[] = [];
  let lastIndex = 0;

  // Reset the regex since it uses the global flag.
  LINK_RE.lastIndex = 0;
  let match = LINK_RE.exec(line);

  while (match !== null) {
    const before = line.slice(lastIndex, match.index);
    if (before !== "") {
      runs.push(...parseBoldRuns(before));
    }
    const linkText = match[1] ?? "";
    const linkTarget = match[2] ?? "";
    if (linkText !== "") {
      runs.push({
        text: linkText,
        bold: false,
        link: { target: linkTarget },
      });
    }
    lastIndex = match.index + match[0].length;
    match = LINK_RE.exec(line);
  }

  const tail = line.slice(lastIndex);
  if (tail !== "") {
    runs.push(...parseBoldRuns(tail));
  }
  return runs;
}

/**
 * Parse a body string into layout units. A plain string comes back as
 * a single paragraph unit whose one run is the input verbatim.
 */
export function parseFlowMarkup(text: string): MarkupUnit[] {
  const units: MarkupUnit[] = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (line === "") continue;

    let kind: MarkupUnitKind = "paragraph";
    let marker: string | null = null;
    let content = line;

    if (line.startsWith(BULLET_PREFIX)) {
      kind = "bullet";
      marker = "•";
      content = line.slice(BULLET_PREFIX.length);
    } else {
      const numbered = NUMBER_PREFIX.exec(line);
      if (numbered !== null) {
        kind = "number";
        marker = `${numbered[1] ?? ""}.`;
        content = line.slice(numbered[0].length);
      }
    }

    units.push({ kind, marker, runs: parseRuns(content) });
  }
  return units;
}

/** Whether any run in a unit is bold (drives rich-inline measurement). */
export function unitHasBold(unit: MarkupUnit): boolean {
  return unit.runs.some((r) => r.bold);
}

/** Whether any run has bold or link styling (drives rich-inline path). */
export function unitHasRichContent(unit: MarkupUnit): boolean {
  return unit.runs.some((r) => r.bold || r.link !== undefined);
}

/** The unit's full text with bold delimiters stripped. */
export function unitText(unit: MarkupUnit): string {
  return unit.runs.map((r) => r.text).join("");
}

// -----------------------------------------------------------------------
// Search tag extraction
//
// Tags are invisible metadata for corpus search, written as
// `[[#tag1 #tag2]]` blocks in the raw body text. extractTags strips
// them and returns the tag list. Called by the corpus builder before
// parseFlowMarkup; story rendering callers skip this step.
// -----------------------------------------------------------------------

/**
 * Regex matching a `[[...]]` block. The content is space-separated
 * `#tag` tokens. A `[[` without a matching `]]` is not stripped
 * (degrades to visible brackets).
 */
const TAG_BLOCK_RE = /\[\[([^\]]*)\]\]/g;

/** Regex matching a single `#tag` token inside a tag block. */
const TAG_TOKEN_RE = /#(\S+)/g;

export interface ExtractTagsResult {
  readonly cleaned: string;
  readonly tags: readonly string[];
}

/**
 * Strip `[[#tag1 #tag2]]` blocks from raw text and return the tag list.
 * Tags are the bare tokens without the leading `#`. A `[[` without a
 * closing `]]` is left as visible text (malformed input degrades).
 */
export function extractTags(text: string): ExtractTagsResult {
  const tags: string[] = [];
  const cleaned = text.replace(TAG_BLOCK_RE, (_match, content: string) => {
    TAG_TOKEN_RE.lastIndex = 0;
    let tok = TAG_TOKEN_RE.exec(content);
    while (tok !== null) {
      const tag = tok[1];
      if (tag !== undefined) {
        tags.push(tag);
      }
      tok = TAG_TOKEN_RE.exec(content);
    }
    return "";
  });
  return { cleaned, tags };
}
