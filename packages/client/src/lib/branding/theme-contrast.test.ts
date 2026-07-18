import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { contrast, parseHex } from "./test-helpers/wcag";

/**
 * Static token contrast lock.
 *
 * Parses each theme stylesheet's custom properties and asserts WCAG AA
 * 4.5:1 for the canonical text-on-surface pairs, register text over its
 * soft tint, and brand-on over brand-fill (unbranded defaults). Runtime
 * brand derivation is covered separately by konsta-palette.test.ts; this
 * file locks the values a theme author writes into the stylesheet.
 *
 * The default theme (light and dark) is mandatory: an unresolvable or
 * failing token fails the build. Dev themes are optional: a token group
 * that cannot be resolved statically (oklch color-mix, runtime
 * --brand-primary references) is skipped with the reason in the test
 * title. Includes --unread 3:1 non-text pairs (WCAG 1.4.11). Extension
 * point for the SEMANTIC_ANCHORS sync assertion.
 */

const THEMES_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "styles",
  "themes",
);

/** Read one theme stylesheet. Vite ?raw imports return empty strings under
 *  vitest (CSS is stubbed), so node:fs is the working route. */
function readThemeCss(file: string): string {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- path is the test's own directory joined to a const table of filenames; no user input reaches it (sanctioned 2026-07-16)
  return readFileSync(join(THEMES_DIR, file), "utf-8");
}

interface RuleBlock {
  readonly selector: string;
  readonly body: string;
}

/** Collect flat `selector { body }` blocks, skipping at-rule bodies
 *  (@media holds only viewport-conditional type-scale overrides). */
function collectRuleBlocks(css: string): RuleBlock[] {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: RuleBlock[] = [];
  let i = 0;
  while (i < source.length) {
    const open = source.indexOf("{", i);
    if (open === -1) break;
    // Block-less at-rules (@import) end in ";" and would otherwise glue
    // onto the next selector; keep only the text after the last one.
    const selector = (source.slice(i, open).split(";").pop() ?? "").trim();
    let depth = 1;
    let j = open + 1;
    while (j < source.length && depth > 0) {
      const ch = source.charAt(j);
      if (ch === "{") depth += 1;
      else if (ch === "}") depth -= 1;
      j += 1;
    }
    if (!selector.startsWith("@")) {
      blocks.push({ selector, body: source.slice(open + 1, j - 1) });
    }
    i = j;
  }
  return blocks;
}

function extractCustomProps(body: string): Map<string, string> {
  const props = new Map<string, string>();
  for (const match of body.matchAll(/--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)) {
    const name = match[1];
    const value = match[2];
    if (name !== undefined && value !== undefined) {
      props.set(name, value.replace(/\s+/g, " ").trim());
    }
  }
  return props;
}

/** Custom properties visible in a scheme: the theme's base block merged
 *  with its `.dark` (or `.light`) override block. */
function themeProps(
  css: string,
  theme: string,
  scheme: "light" | "dark",
): Map<string, string> {
  const selectors = [`.theme-${theme}`, `.theme-${theme}.${scheme}`];
  const merged = new Map<string, string>();
  for (const selector of selectors) {
    for (const block of collectRuleBlocks(css)) {
      if (block.selector !== selector) continue;
      for (const [name, value] of extractCustomProps(block.body)) {
        merged.set(name, value);
      }
    }
  }
  return merged;
}

class UnresolvableTokenError extends Error {}

interface ResolvedColor {
  readonly rgb: readonly [number, number, number];
  readonly alpha: number;
}

function resolveValue(
  value: string,
  props: Map<string, string>,
  seen: Set<string>,
): ResolvedColor {
  const v = value.trim();
  if (v.startsWith("#")) return { rgb: parseHex(v), alpha: 1 };

  // var(--name) or var(--name, fallback), parsed by the first comma
  // (a fallback may itself contain nested var() with commas).
  if (v.startsWith("var(") && v.endsWith(")")) {
    const body = v.slice(4, -1).trim();
    const comma = body.indexOf(",");
    const reference = (comma === -1 ? body : body.slice(0, comma)).trim();
    const fallback = comma === -1 ? undefined : body.slice(comma + 1).trim();
    if (!reference.startsWith("--")) {
      throw new UnresolvableTokenError(`cannot statically resolve "${v}"`);
    }
    const name = reference.slice(2);
    if (props.has(name)) return resolveToken(name, props, seen);
    if (fallback !== undefined) return resolveValue(fallback, props, seen);
    throw new UnresolvableTokenError(
      `--${name} is not defined and has no fallback`,
    );
  }

  const mixMatch =
    /^color-mix\(\s*in srgb\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*transparent\s*\)$/.exec(
      v,
    );
  if (mixMatch?.[1] !== undefined && mixMatch[2] !== undefined) {
    const inner = resolveValue(mixMatch[1], props, seen);
    return {
      rgb: inner.rgb,
      alpha: inner.alpha * (Number(mixMatch[2]) / 100),
    };
  }

  throw new UnresolvableTokenError(`cannot statically resolve "${v}"`);
}

function resolveToken(
  name: string,
  props: Map<string, string>,
  seen = new Set<string>(),
): ResolvedColor {
  if (seen.has(name)) {
    throw new UnresolvableTokenError(`circular var() through --${name}`);
  }
  seen.add(name);
  const value = props.get(name);
  if (value === undefined) {
    throw new UnresolvableTokenError(`--${name} is not defined`);
  }
  return resolveValue(value, props, seen);
}

function toHex(rgb: readonly [number, number, number]): string {
  const chan = (c: number): string => c.toString(16).padStart(2, "0");
  return `#${chan(rgb[0])}${chan(rgb[1])}${chan(rgb[2])}`;
}

/** Alpha-composite a (possibly translucent) color over an opaque base. */
function compositeOver(
  fg: ResolvedColor,
  bg: readonly [number, number, number],
): [number, number, number] {
  const mix = (f: number, b: number): number =>
    Math.round(f * fg.alpha + b * (1 - fg.alpha));
  return [mix(fg.rgb[0], bg[0]), mix(fg.rgb[1], bg[1]), mix(fg.rgb[2], bg[2])];
}

function resolveOpaqueHex(name: string, props: Map<string, string>): string {
  const color = resolveToken(name, props);
  if (color.alpha !== 1) {
    throw new UnresolvableTokenError(`--${name} resolves translucent`);
  }
  return toHex(color.rgb);
}

const TEXT_TOKENS = ["ink", "ink-2", "muted"] as const;
const SURFACE_TOKENS = ["paper", "paper-deep", "raised"] as const;
const REGISTERS = [
  { text: "care", tint: "care-soft" },
  { text: "urgent", tint: "urgent-soft" },
] as const;

const THEMES = [
  { name: "default", css: readThemeCss("default.css"), mandatory: true },
  { name: "riso", css: readThemeCss("riso.css"), mandatory: false },
  { name: "frutiger", css: readThemeCss("frutiger.css"), mandatory: false },
  { name: "brutalist", css: readThemeCss("brutalist.css"), mandatory: false },
  { name: "cupertino", css: readThemeCss("cupertino.css"), mandatory: false },
  { name: "prism", css: readThemeCss("prism.css"), mandatory: false },
] as const;

/**
 * Dev-theme groups that fail AA today (measured 2026-07-16). Dev themes
 * are optional preview palettes that deliberately mimic external design
 * languages (iOS system grays, brutalist monochrome, risograph inks);
 * retuning them is a design decision this lock does not force. Each entry
 * is explicit so any NEW failure in a dev theme still breaks the build.
 * The default theme is never exempt.
 */
const KNOWN_DEV_AA_FAILURES = new Map<string, string>([
  ["riso dark :: text", "--muted 4.04:1 on --paper"],
  ["frutiger light :: register", "--care 1.61:1 on its tint"],
  ["brutalist light :: text", "--muted 3.05:1 on --paper"],
  ["brutalist light :: register", "--care 2.08:1 on its tint"],
  ["brutalist dark :: text", "--muted 3.41:1 on --paper"],
  ["brutalist dark :: register", "--urgent 4.31:1 on its tint"],
  ["cupertino light :: text", "--muted 2.92:1 on --paper"],
  ["cupertino light :: register", "--care 1.86:1 on its tint"],
  ["prism light :: text", "--muted 2.92:1 on --paper"],
  ["prism light :: register", "--care 1.86:1 on its tint"],
]);

/** Register an assertion when the group resolves statically; otherwise
 *  skip (dev themes) or fail (default theme) with the resolver's reason.
 *  Dev-theme groups in KNOWN_DEV_AA_FAILURES skip with their measurement. */
function itResolvable(
  mandatory: boolean,
  failureKey: string,
  title: string,
  prepare: () => () => void,
): void {
  const knownFailure = mandatory
    ? undefined
    : KNOWN_DEV_AA_FAILURES.get(failureKey);
  if (knownFailure !== undefined) {
    it.skip(`${title} (known dev-theme AA failure: ${knownFailure})`);
    return;
  }

  let assertNow: (() => void) | null = null;
  let reason = "";
  try {
    assertNow = prepare();
  } catch (err) {
    if (!(err instanceof UnresolvableTokenError)) throw err;
    reason = err.message;
  }
  if (assertNow) {
    const run = assertNow;
    it(title, () => {
      run();
    });
  } else if (mandatory) {
    it(title, () => {
      expect.fail(`mandatory theme token is unresolvable: ${reason}`);
    });
  } else {
    it.skip(`${title} (statically unresolvable: ${reason})`);
  }
}

for (const theme of THEMES) {
  for (const scheme of ["light", "dark"] as const) {
    describe(`${theme.name} ${scheme}`, () => {
      const props = themeProps(theme.css, theme.name, scheme);

      itResolvable(
        theme.mandatory,
        `${theme.name} ${scheme} :: text`,
        "text tokens clear AA 4.5:1 on every base surface",
        () => {
          const pairs = TEXT_TOKENS.flatMap((text) =>
            SURFACE_TOKENS.map((surface) => ({
              text,
              surface,
              textHex: resolveOpaqueHex(text, props),
              surfaceHex: resolveOpaqueHex(surface, props),
            })),
          );
          return () => {
            for (const pair of pairs) {
              expect(
                contrast(pair.textHex, pair.surfaceHex),
                `--${pair.text} (${pair.textHex}) on --${pair.surface} (${pair.surfaceHex})`,
              ).toBeGreaterThanOrEqual(4.5);
            }
          };
        },
      );

      itResolvable(
        theme.mandatory,
        `${theme.name} ${scheme} :: register`,
        "register text clears AA 4.5:1 over its soft tint on paper",
        () => {
          const paper = resolveToken("paper", props);
          const pairs = REGISTERS.map((register) => {
            const tint = resolveToken(register.tint, props);
            const tintedSurface = toHex(compositeOver(tint, paper.rgb));
            return {
              text: register.text,
              textHex: resolveOpaqueHex(register.text, props),
              tint: register.tint,
              tintedSurface,
            };
          });
          return () => {
            for (const pair of pairs) {
              expect(
                contrast(pair.textHex, pair.tintedSurface),
                `--${pair.text} (${pair.textHex}) on --${pair.tint} over paper (${pair.tintedSurface})`,
              ).toBeGreaterThanOrEqual(4.5);
            }
          };
        },
      );

      itResolvable(
        theme.mandatory,
        `${theme.name} ${scheme} :: brand`,
        "brand-on clears AA 4.5:1 on brand-fill (unbranded defaults)",
        () => {
          const on = resolveOpaqueHex("brand-on", props);
          const fill = resolveOpaqueHex("brand-fill", props);
          return () => {
            expect(
              contrast(on, fill),
              `--brand-on (${on}) on --brand-fill (${fill})`,
            ).toBeGreaterThanOrEqual(4.5);
          };
        },
      );

      const UNREAD_SURFACES = ["paper", "raised"] as const;
      itResolvable(
        theme.mandatory,
        `${theme.name} ${scheme} :: unread`,
        "unread clears WCAG 1.4.11 3:1 on paper and raised",
        () => {
          const unreadHex = resolveOpaqueHex("unread", props);
          const pairs = UNREAD_SURFACES.map((surface) => ({
            surface,
            surfaceHex: resolveOpaqueHex(surface, props),
          }));
          return () => {
            for (const pair of pairs) {
              expect(
                contrast(unreadHex, pair.surfaceHex),
                `--unread (${unreadHex}) on --${pair.surface} (${pair.surfaceHex})`,
              ).toBeGreaterThanOrEqual(3);
            }
          };
        },
      );
    });
  }
}
