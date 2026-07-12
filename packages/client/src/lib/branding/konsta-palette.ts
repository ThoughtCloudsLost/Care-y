/**
 * Runtime derivation of Konsta UI's --k-color-* palette from a brand hex,
 * plus dual-token contrast enforcement.
 *
 * Two functional tokens derived from the brand color:
 * - --k-color-primary (fill token): used by bg-primary (buttons, badges,
 *   toggles). Darkened if too light for white text on top.
 * - --brand-text: used for brand-colored text on surfaces (tabbar active,
 *   links, list buttons, outline buttons). Lightened in dark mode or
 *   darkened in light mode to meet WCAG AA 4.5:1.
 *
 * iOS colors: pure HSL math (adapted from konsta v5.0.8, MIT).
 * Material colors: @material/material-color-utilities via dynamic import.
 */

// --- Color conversion utilities ---

function hexToRgbArray(hex: string): [number, number, number] | null {
  const h = hex.replace(
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
    (_m, r: string, g: string, b: string) => r + r + g + g + b + b,
  );
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
  if (!result || result.length < 4) return null;
  const r = result[1] ?? "00";
  const g = result[2] ?? "00";
  const b = result[3] ?? "00";
  return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((n) => {
        const hex = n.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      })
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  const l = (min + max) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (h < 0) h = 360 / 60 + h;
  return [h * 60, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let rgb1: [number, number, number];
  if (Number.isNaN(h) || typeof h === "undefined") rgb1 = [0, 0, 0];
  else if (hp <= 1) rgb1 = [c, x, 0];
  else if (hp <= 2) rgb1 = [x, c, 0];
  else if (hp <= 3) rgb1 = [0, c, x];
  else if (hp <= 4) rgb1 = [0, x, c];
  else if (hp <= 5) rgb1 = [x, 0, c];
  else rgb1 = [c, 0, x];
  const m = l - c / 2;
  const mapped = rgb1.map((n) =>
    Math.max(0, Math.min(255, Math.round(255 * (n + m)))),
  );
  return [mapped[0] ?? 0, mapped[1] ?? 0, mapped[2] ?? 0];
}

function hexToRgbString(hex: string): string {
  const rgb = hexToRgbArray(hex);
  if (!rgb) return "0 0 0";
  return rgb.join(" ");
}

// --- WCAG contrast utilities ---

/** Relative luminance per WCAG 2.1 (https://www.w3.org/TR/WCAG21/#dfn-relative-luminance) */
function relativeLuminance(r: number, g: number, b: number): number {
  function linearize(c: number): number {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** WCAG contrast ratio between two RGB colors (always >= 1) */
function contrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number],
): number {
  const l1 = relativeLuminance(...rgb1);
  const l2 = relativeLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const MAX_LIGHTNESS_STEPS = 40;
const LIGHTNESS_STEP = 0.02;

/**
 * Adjust a color's lightness until it meets the target contrast ratio
 * against a background. Preserves hue and saturation.
 */
function ensureContrast(
  fgHex: string,
  bgRgb: [number, number, number],
  minRatio = 4.5,
): string {
  const fgRgb = hexToRgbArray(fgHex);
  if (!fgRgb) return fgHex;
  if (contrastRatio(fgRgb, bgRgb) >= minRatio) return fgHex;

  const hsl = rgbToHsl(...fgRgb);
  const bgLum = relativeLuminance(...bgRgb);
  const direction = bgLum < 0.5 ? 1 : -1;

  for (let i = 1; i <= MAX_LIGHTNESS_STEPS; i++) {
    const newL = Math.max(
      0,
      Math.min(1, hsl[2] + direction * LIGHTNESS_STEP * i),
    );
    const candidate = hslToRgb(hsl[0], hsl[1], newL);
    if (contrastRatio(candidate, bgRgb) >= minRatio) {
      return rgbToHex(...candidate);
    }
  }

  return bgLum < 0.5 ? "#ffffff" : "#000000";
}

/**
 * Pick black or white text for use on top of a given background color,
 * based on which achieves higher WCAG contrast. If neither meets AA 4.5:1,
 * the higher-contrast option is still returned (best effort).
 */
function deriveOnColor(bgHex: string): string {
  const bgRgb = hexToRgbArray(bgHex);
  if (!bgRgb) return "#000000";
  const BLACK_RGB: [number, number, number] = [0, 0, 0];
  const whiteContrast = contrastRatio(WHITE_RGB, bgRgb);
  const blackContrast = contrastRatio(BLACK_RGB, bgRgb);
  return whiteContrast >= blackContrast ? "#ffffff" : "#000000";
}

// --- Dual-token derivation ---

// Worst-case surfaces for contrast checks. Strict supersets of both the
// riso and Inkwell (default theme) surface ramps: #e5e1da is darker than
// the Inkwell's darkest light surface (--paper-deep #ede7d8), and #2c2a2c
// is at least as light as the Inkwell's lightest dark surface (the Konsta
// overlay step #2f2a1e). konsta-palette.test.ts locks the Inkwell coverage
// explicitly, so these constants cannot silently drift below it.
const WORST_DARK: [number, number, number] = [44, 42, 44]; // #2c2a2c
const WORST_LIGHT: [number, number, number] = [229, 225, 218]; // #e5e1da
const WHITE_RGB: [number, number, number] = [255, 255, 255];

/**
 * Derive --brand-text: the brand color adjusted for text-on-surface.
 * Lightened in dark mode, darkened in light mode, to meet WCAG AA 4.5:1
 * against the worst-case surface.
 */
function deriveBrandText(brandHex: string, isDark: boolean): string {
  const worstSurface = isDark ? WORST_DARK : WORST_LIGHT;
  return ensureContrast(brandHex, worstSurface, 4.5);
}

/**
 * Derive --brand-fill: the brand color adjusted for white-text-on-fill.
 * Darkened if the brand is too light for white text, to meet WCAG AA 4.5:1.
 * Returns the original hex if it already passes.
 */
function deriveBrandFill(brandHex: string): string {
  const brandRgb = hexToRgbArray(brandHex);
  if (!brandRgb) return brandHex;
  if (contrastRatio(WHITE_RGB, brandRgb) >= 4.5) return brandHex;

  // Darken the brand color until white passes
  const hsl = rgbToHsl(...brandRgb);
  for (let i = 1; i <= MAX_LIGHTNESS_STEPS; i++) {
    const newL = Math.max(0, hsl[2] - LIGHTNESS_STEP * i);
    const candidate = hslToRgb(hsl[0], hsl[1], newL);
    if (contrastRatio(WHITE_RGB, candidate) >= 4.5) {
      return rgbToHex(...candidate);
    }
  }
  return "#000000";
}

// --- iOS color derivation (pure HSL math) ---

function deriveIosColors(hex: string): Record<string, string> {
  const rgb = hexToRgbArray(hex);
  if (!rgb) return {};
  const hsl = rgbToHsl(...rgb);
  const shade = rgbToHex(
    ...hslToRgb(hsl[0], hsl[1], Math.max(0, hsl[2] - 0.08)),
  );
  const tint = rgbToHex(
    ...hslToRgb(hsl[0], hsl[1], Math.min(1, hsl[2] + 0.08)),
  );
  return {
    "ios-primary": hex,
    "ios-primary-tint": tint,
    "ios-primary-shade": shade,
  };
}

// --- Material color derivation (dynamic import, browser-only) ---

const MD_KEEP = new Set([
  "primary",
  "on_primary",
  "primary_container",
  "on_primary_container",
  "secondary",
  "on_secondary",
  "secondary_container",
  "on_secondary_container",
  "outline",
  "outline_variant",
  "on_surface",
  "on_surface_variant",
  "surface",
  "surface_variant",
  "surface_1",
  "surface_2",
  "surface_3",
  "surface_4",
]);

function getColorName(name: string): string {
  if (name === "surface_dim") return "surface_variant";
  if (name === "surface_container_low") return "surface_1";
  if (name === "surface_container") return "surface_2";
  if (name === "surface_container_high") return "surface_3";
  if (name === "surface_container_highest") return "surface_4";
  return name;
}

async function deriveMdColors(
  hexColor: string,
): Promise<Record<string, string>> {
  const { argbFromHex, Hct, SchemeTonalSpot, hexFromArgb } =
    await import("@material/material-color-utilities");

  const sourceColor = argbFromHex(`#${hexColor.replace("#", "")}`);
  const hctColor = Hct.fromInt(sourceColor);
  const lightScheme = new SchemeTonalSpot(hctColor, false, 0);
  const darkScheme = new SchemeTonalSpot(hctColor, true, 0);

  const colors: Record<string, string> = {};

  for (const color of lightScheme.colors.allColors) {
    const name = getColorName(color.name);
    if (!MD_KEEP.has(name)) continue;
    const argb = color.getArgb(lightScheme);
    colors[`md-light-${name.replace(/_/g, "-")}`] = hexFromArgb(argb);
  }

  for (const color of darkScheme.colors.allColors) {
    const name = getColorName(color.name);
    if (!MD_KEEP.has(name)) continue;
    const argb = color.getArgb(darkScheme);
    colors[`md-dark-${name.replace(/_/g, "-")}`] = hexFromArgb(argb);
  }

  return colors;
}

// --- OKLCH proximity (the branding editor's semantic-hue nudge) ---
//
// If an org picks a brand shade that reads as the urgent red or the care
// ochre, the editor offers a hue-nudged alternative instead of blocking
// (spec: The org's pen). Conversion matrices are the OKLab reference set
// (Bjorn Ottosson, public domain; adopted by CSS Color 4).

interface Oklch {
  l: number;
  c: number;
  h: number; // degrees
}

function srgbChannelToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function linearChannelToSrgb(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(1, v)) * 255);
}

function hexToOklch(hex: string): Oklch | null {
  const rgb = hexToRgbArray(hex);
  if (!rgb) return null;
  const r = srgbChannelToLinear(rgb[0]);
  const g = srgbChannelToLinear(rgb[1]);
  const b = srgbChannelToLinear(rgb[2]);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const c = Math.sqrt(a * a + bb * bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

/** Inverse conversion. Returns null when the color is out of sRGB gamut. */
function oklchToHexInGamut(ok: Oklch): string | null {
  const hr = (ok.h * Math.PI) / 180;
  const a = ok.c * Math.cos(hr);
  const bb = ok.c * Math.sin(hr);

  const l = Math.pow(ok.l + 0.3963377774 * a + 0.2158037573 * bb, 3);
  const m = Math.pow(ok.l - 0.1055613458 * a - 0.0638541728 * bb, 3);
  const s = Math.pow(ok.l - 0.0894841775 * a - 1.291485548 * bb, 3);

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const eps = 0.0005;
  if (
    r < -eps ||
    r > 1 + eps ||
    g < -eps ||
    g > 1 + eps ||
    b < -eps ||
    b > 1 + eps
  ) {
    return null;
  }
  return rgbToHex(
    linearChannelToSrgb(r),
    linearChannelToSrgb(g),
    linearChannelToSrgb(b),
  );
}

/** Reduce chroma until the color fits the sRGB gamut (L and H kept). */
function oklchToHexClamped(ok: Oklch): string {
  let c = ok.c;
  for (let i = 0; i <= 20; i++) {
    const hex = oklchToHexInGamut({ l: ok.l, c, h: ok.h });
    if (hex !== null) return hex;
    c *= 0.85;
  }
  return oklchToHexInGamut({ l: ok.l, c: 0, h: ok.h }) ?? "#808080";
}

/** Signed shortest angular distance from a to b, in (-180, 180]. */
function hueDelta(from: number, to: number): number {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

// The semantic shades an org brand must stay apart from, in both modes
// (one brand hex serves light and dark). Values mirror default.css.
const SEMANTIC_ANCHORS: readonly {
  conflict: "urgent" | "care";
  hex: string;
}[] = [
  { conflict: "urgent", hex: "#a33224" },
  { conflict: "urgent", hex: "#e06a55" },
  { conflict: "care", hex: "#7c5e00" },
  { conflict: "care", hex: "#d9a93f" },
];

// Calibrated against the bake-off swatches: the mock's Signal red
// (#b3362b) measures deltaE 0.035 from the urgent anchor and must
// collide; Harborlight clay (#c05b3c) measures 0.075 at its nearest
// anchor and must not. The chroma floor keeps near-neutrals out
// entirely (the unbranded taupe sits at C 0.03).
const PROXIMITY_CHROMA_FLOOR = 0.05;
const PROXIMITY_DELTA_E = 0.06;
const NUDGE_CLEARANCE = 0.085;

export interface BrandProximity {
  collides: boolean;
  conflict?: "urgent" | "care";
  nudgedHex?: string;
}

/** Euclidean distance in OKLab (deltaEOK, CSS Color 4). */
function okDistance(a: Oklch, b: Oklch): number {
  const ar = (a.h * Math.PI) / 180;
  const br = (b.h * Math.PI) / 180;
  const dl = a.l - b.l;
  const da = a.c * Math.cos(ar) - b.c * Math.cos(br);
  const db = a.c * Math.sin(ar) - b.c * Math.sin(br);
  return Math.sqrt(dl * dl + da * da + db * db);
}

function nearestAnchor(ok: Oklch): {
  conflict: "urgent" | "care";
  h: number;
  dist: number;
} | null {
  let best: { conflict: "urgent" | "care"; h: number; dist: number } | null =
    null;
  for (const anchor of SEMANTIC_ANCHORS) {
    const anchorOk = hexToOklch(anchor.hex);
    if (!anchorOk) continue;
    const dist = okDistance(ok, anchorOk);
    if (!best || dist < best.dist) {
      best = { conflict: anchor.conflict, h: anchorOk.h, dist };
    }
  }
  return best;
}

function minAnchorDistance(ok: Oklch): number {
  return nearestAnchor(ok)?.dist ?? Infinity;
}

/**
 * Check a brand hex against the semantic shades (urgent red, care ochre).
 * When it collides, `nudgedHex` keeps the lightness and chroma and rotates
 * the hue just far enough that the result reads apart from every semantic
 * anchor. Never blocks: the caller offers the nudge as a suggestion.
 */
export function checkBrandProximity(hex: string): BrandProximity {
  const ok = hexToOklch(hex);
  if (!ok || ok.c < PROXIMITY_CHROMA_FLOOR) return { collides: false };

  const nearest = nearestAnchor(ok);
  if (!nearest || nearest.dist > PROXIMITY_DELTA_E) {
    return { collides: false };
  }

  // Rotate away from the offending anchor, preferring the side the brand
  // already leans toward; flip if that side never clears (it would run
  // into the other semantic hue).
  const lean = hueDelta(nearest.h, ok.h);
  const preferred = lean >= 0 ? 1 : -1;
  for (const direction of [preferred, -preferred]) {
    for (let step = 6; step <= 90; step += 3) {
      const candidate: Oklch = {
        l: ok.l,
        c: ok.c,
        h: (ok.h + direction * step + 360) % 360,
      };
      if (minAnchorDistance(candidate) < NUDGE_CLEARANCE) continue;
      // Gamut clamping trims chroma, which can pull the shade back
      // toward an anchor; verify the actual deliverable hex.
      const hexOut = oklchToHexClamped(candidate);
      const delivered = hexToOklch(hexOut);
      if (delivered && minAnchorDistance(delivered) > PROXIMITY_DELTA_E) {
        return {
          collides: true,
          conflict: nearest.conflict,
          nudgedHex: hexOut,
        };
      }
    }
  }

  return { collides: true, conflict: nearest.conflict };
}

// --- Public API ---

export interface BrandColors {
  primary: string;
  accent?: string;
}

/**
 * Derive contrast-safe token pairs for a single brand color.
 * Returns the text-safe and fill-safe hex values.
 */
function deriveDualTokens(
  hex: string,
  isDark: boolean,
): { text: string; fill: string } {
  return {
    text: deriveBrandText(hex, isDark),
    fill: deriveBrandFill(hex),
  };
}

/**
 * Derives the full Konsta color palette from brand colors, writes all
 * --k-color-* CSS vars to :root, and sets dual contrast tokens for
 * each brand color.
 *
 * For each color (primary, accent), two functional tokens are created:
 * - --brand-{name}-text: surface-safe for text accents (WCAG AA 4.5:1)
 * - --brand-{name}-fill: white-safe for fill backgrounds (WCAG AA 4.5:1)
 *
 * Shorthand aliases:
 * - --brand-text = --brand-primary-text
 * - --brand-fill = --brand-primary-fill
 *
 * --brand-on is the black-or-white text color for content sitting on
 * --brand-fill (primary buttons, brand chips, own-message send button).
 *
 * Konsta's --k-color-primary is set to the primary fill value.
 * Browser-only (no-op during SSR).
 */
function applyPrimaryTokens(
  el: HTMLElement,
  brand: BrandColors,
  isDark: boolean,
): { text: string; fill: string } {
  const primary = deriveDualTokens(brand.primary, isDark);
  el.style.setProperty("--brand-primary", brand.primary);
  el.style.setProperty(
    "--brand-primary-40",
    `color-mix(in srgb, ${brand.primary} 40%, transparent)`,
  );
  el.style.setProperty(
    "--brand-primary-20",
    `color-mix(in srgb, ${brand.primary} 20%, transparent)`,
  );
  el.style.setProperty("--brand-primary-text", primary.text);
  el.style.setProperty("--brand-primary-fill", primary.fill);
  el.style.setProperty("--brand-text", primary.text);
  el.style.setProperty("--brand-fill", primary.fill);
  // Text-on-fill color (primary buttons, brand chips). The fill is already
  // white-safe, so this resolves to white except for boundary fills where
  // black measures marginally higher.
  const primaryOn = deriveOnColor(primary.fill);
  el.style.setProperty("--brand-on", primaryOn);

  if (import.meta.env.DEV) {
    console.log(
      `[palette] primary=${brand.primary} text=${primary.text} fill=${primary.fill} on=${primaryOn} dark=${String(isDark)}`,
    );
  }

  return primary;
}

function applyAccentTokens(
  el: HTMLElement,
  brand: BrandColors,
  isDark: boolean,
): void {
  if (brand.accent !== undefined && brand.accent !== "") {
    const accent = deriveDualTokens(brand.accent, isDark);
    const accentOn = deriveOnColor(brand.accent);
    el.style.setProperty("--brand-accent", brand.accent);
    el.style.setProperty("--brand-accent-on", accentOn);
    el.style.setProperty("--brand-accent-text", accent.text);
    el.style.setProperty("--brand-accent-fill", accent.fill);
    el.style.setProperty(
      "--brand-accent-40",
      `color-mix(in srgb, ${brand.accent} 40%, transparent)`,
    );
    el.style.setProperty(
      "--brand-accent-20",
      `color-mix(in srgb, ${brand.accent} 20%, transparent)`,
    );
    if (import.meta.env.DEV) {
      console.log(
        `[palette] accent=${brand.accent} on=${accentOn} text=${accent.text} fill=${accent.fill}`,
      );
    }
  } else {
    el.style.removeProperty("--brand-accent");
    el.style.removeProperty("--brand-accent-on");
    el.style.removeProperty("--brand-accent-text");
    el.style.removeProperty("--brand-accent-fill");
    el.style.removeProperty("--brand-accent-40");
    el.style.removeProperty("--brand-accent-20");
  }
}

function applyKonstaColors(el: HTMLElement, primaryFill: string): void {
  el.style.setProperty(
    "--k-color-primary",
    `rgb(${hexToRgbString(primaryFill)})`,
  );

  const ios = deriveIosColors(primaryFill);
  for (const [token, hex] of Object.entries(ios)) {
    el.style.setProperty(`--k-color-${token}`, `rgb(${hexToRgbString(hex)})`);
  }
}

async function applyMaterialColors(
  el: HTMLElement,
  primaryHex: string,
): Promise<void> {
  const md = await deriveMdColors(primaryHex);
  for (const [token, hex] of Object.entries(md)) {
    el.style.setProperty(`--k-color-${token}`, `rgb(${hexToRgbString(hex)})`);
  }
}

export async function applyKonstaPalette(
  colors: BrandColors | string,
): Promise<void> {
  if (typeof document === "undefined") return;

  const brand: BrandColors =
    typeof colors === "string" ? { primary: colors } : colors;

  const el = document.documentElement;
  const isDark = el.classList.contains("dark");

  const primary = applyPrimaryTokens(el, brand, isDark);
  applyAccentTokens(el, brand, isDark);
  applyKonstaColors(el, primary.fill);
  await applyMaterialColors(el, brand.primary);
}

/**
 * Removes all runtime brand and --k-color-* overrides from :root,
 * reverting to the build-time palette.
 */
export function resetKonstaPalette(): void {
  if (typeof document === "undefined") return;

  const el = document.documentElement;
  const brandProps = [
    "--brand-primary",
    "--brand-primary-40",
    "--brand-primary-20",
    "--brand-text",
    "--brand-fill",
    "--brand-on",
    "--brand-primary-text",
    "--brand-primary-fill",
    "--brand-accent",
    "--brand-accent-on",
    "--brand-accent-text",
    "--brand-accent-fill",
    "--brand-accent-40",
    "--brand-accent-20",
  ];
  for (const prop of brandProps) {
    el.style.removeProperty(prop);
  }

  const propsToRemove: string[] = [];
  for (let i = 0; i < el.style.length; i++) {
    const prop = el.style.item(i);
    if (prop.startsWith("--k-color-")) {
      propsToRemove.push(prop);
    }
  }

  for (const prop of propsToRemove) {
    el.style.removeProperty(prop);
  }
}
