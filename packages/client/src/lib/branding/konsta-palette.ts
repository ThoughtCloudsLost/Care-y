/**
 * Runtime derivation of Konsta UI's --k-color-* palette from a brand hex.
 *
 * Mirrors what konsta/plugin-colors.js does at Tailwind build time, but runs
 * in the browser so org brand colors can be applied dynamically.
 *
 * After writing the palette, a contrast enforcement pass checks all
 * foreground-on-background token pairs and adjusts foreground lightness
 * to meet WCAG AA (4.5:1). This runs for every theme, color scheme,
 * and brand color combination automatically.
 *
 * iOS colors: pure HSL math (adapted from konsta v5.0.8 color-utils/ios-colors.js, MIT).
 * Material colors: uses @material/material-color-utilities via dynamic import.
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

/**
 * Adjust a foreground color's lightness until it meets the target contrast
 * ratio against a background. Preserves hue and saturation. Returns the
 * original hex if it already passes.
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

  for (let i = 1; i <= 40; i++) {
    const newL = Math.max(0, Math.min(1, hsl[2] + direction * 0.02 * i));
    const candidate = hslToRgb(hsl[0], hsl[1], newL);
    if (contrastRatio(candidate, bgRgb) >= minRatio) {
      return rgbToHex(...candidate);
    }
  }

  return bgLum < 0.5 ? "#ffffff" : "#000000";
}

/**
 * Resolve a CSS custom property from :root's computed style to an RGB tuple.
 * Returns null if the property is unset or unparseable.
 */
function resolveVarToRgb(
  computed: CSSStyleDeclaration,
  prop: string,
): [number, number, number] | null {
  const raw = computed.getPropertyValue(prop).trim();
  if (!raw) return null;

  // Konsta vars are in "rgb(R G B)" format (space-separated, no commas)
  const rgbMatch = /rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\)/.exec(raw);
  if (rgbMatch && rgbMatch.length >= 4) {
    return [
      parseInt(rgbMatch[1] ?? "0", 10),
      parseInt(rgbMatch[2] ?? "0", 10),
      parseInt(rgbMatch[3] ?? "0", 10),
    ];
  }

  // Comma-separated rgb(R, G, B)
  const rgbComma = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(raw);
  if (rgbComma && rgbComma.length >= 4) {
    return [
      parseInt(rgbComma[1] ?? "0", 10),
      parseInt(rgbComma[2] ?? "0", 10),
      parseInt(rgbComma[3] ?? "0", 10),
    ];
  }

  // Hex fallback
  return hexToRgbArray(raw);
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

// --- Contrast enforcement ---

/**
 * Foreground/background pairs to check. Each entry maps a --k-color-* foreground
 * token to the CSS property of the surface it sits on. The surface property may
 * be a --k-color-* var or a --color-* var (Konsta theme surface).
 *
 * "white-on" entries check white (#ffffff) against a brand-derived background
 * to catch light brand colors where white text becomes unreadable.
 */
interface ContrastPair {
  /** CSS property name for the foreground color (e.g., "--k-color-ios-primary") */
  fg: string;
  /** CSS property name for the background surface */
  bg: string;
  /** WCAG AA minimum ratio (4.5 for normal text, 3.0 for large text) */
  ratio: number;
}

/** Build iOS foreground/background pairs for the current color scheme.
 *  Checks both --k-color-primary (used by text-primary class, TabbarLink)
 *  and --k-color-ios-primary (used by iOS-specific component styles).
 *  Uses worst-case surface so a single check covers all surface variants. */
function getIosBrandOnSurfacePairs(isDark: boolean): ContrastPair[] {
  const scheme = isDark ? "dark" : "light";
  return [
    {
      fg: "--k-color-primary",
      bg: `--color-ios-${scheme}-surface`,
      ratio: 4.5,
    },
    {
      fg: "--k-color-ios-primary",
      bg: `--color-ios-${scheme}-surface`,
      ratio: 4.5,
    },
  ];
}

/** Pairs where white text sits on the brand primary background.
 *  Only check --k-color-primary (used for button fills, badges, toggles).
 *  Do NOT check --k-color-ios-primary here because that token is primarily
 *  used as foreground text (tabbar, links) and gets lightened by the
 *  brand-on-surface check. Lightening + darkening the same token conflicts. */
const WHITE_ON_BRAND: ContrastPair[] = [
  // Button fill, Badge, Toggle checked, Checkbox/Radio checked, FAB
  { fg: "white", bg: "--k-color-primary", ratio: 4.5 },
];

/** Material pairs that should be safe from SchemeTonalSpot but worth verifying */
const MD_PAIRS: ContrastPair[] = [
  {
    fg: "--k-color-md-light-primary",
    bg: "--k-color-md-light-surface",
    ratio: 4.5,
  },
  {
    fg: "--k-color-md-dark-primary",
    bg: "--k-color-md-dark-surface",
    ratio: 4.5,
  },
  {
    fg: "--k-color-md-light-on-primary",
    bg: "--k-color-md-light-primary",
    ratio: 4.5,
  },
  {
    fg: "--k-color-md-dark-on-primary",
    bg: "--k-color-md-dark-primary",
    ratio: 4.5,
  },
  {
    fg: "--k-color-md-light-on-secondary-container",
    bg: "--k-color-md-light-secondary-container",
    ratio: 4.5,
  },
  {
    fg: "--k-color-md-dark-on-secondary-container",
    bg: "--k-color-md-dark-secondary-container",
    ratio: 4.5,
  },
];

const WHITE_RGB: [number, number, number] = [255, 255, 255];

/**
 * Post-write contrast enforcement. Reads computed values from the DOM,
 * checks each foreground/background pair, and overwrites foreground
 * tokens that fail WCAG AA.
 */
function enforceContrast(el: HTMLElement): void {
  const computed = getComputedStyle(el);
  const isDark = el.classList.contains("dark");
  const scheme = isDark ? "dark" : "light";

  const allPairs = [
    ...getIosBrandOnSurfacePairs(isDark),
    ...WHITE_ON_BRAND,
    // Material pairs filtered to current scheme
    ...MD_PAIRS.filter((p) => p.fg.includes(scheme) || p.bg.includes(scheme)),
  ];

  // Worst-case surfaces for contrast checks. Use the LIGHTEST dark surface
  // and DARKEST light surface, so if the check passes here it passes everywhere.
  // getComputedStyle often returns Konsta's @theme defaults (e.g., pure black)
  // instead of the theme's overrides, so we always use these known values.
  const WORST_DARK: [number, number, number] = [44, 42, 44]; // #2c2a2c (surface-variant, lightest dark)
  const WORST_LIGHT: [number, number, number] = [229, 225, 218]; // #e5e1da (surface-variant, darkest light)

  for (const pair of allPairs) {
    // Always use worst-case surfaces instead of trusting getComputedStyle
    let bgRgb: [number, number, number];
    if (pair.bg.includes("dark")) bgRgb = WORST_DARK;
    else if (pair.bg.includes("light")) bgRgb = WORST_LIGHT;
    else {
      // For non-scheme-specific tokens (e.g., --k-color-primary), try resolving
      const resolved = resolveVarToRgb(computed, pair.bg);
      if (!resolved) continue;
      bgRgb = resolved;
    }

    const fgLabel = pair.fg.replace(/^--k-color-/, "");
    const bgLabel = pair.bg.replace(/^--(color-|k-color-)/, "");

    if (pair.fg === "white") {
      const ratio = contrastRatio(WHITE_RGB, bgRgb);
      const pass = ratio >= pair.ratio;
      (pass ? console.log : console.warn)(
        `[contrast] white on ${bgLabel} = ${ratio.toFixed(2)} ${pass ? "PASS" : "FAIL"}`,
      );
      if (
        !pass &&
        (pair.bg === "--k-color-primary" || pair.bg === "--k-color-ios-primary")
      ) {
        const bgHsl = rgbToHsl(...bgRgb);
        for (let i = 1; i <= 40; i++) {
          const newL = Math.max(0, bgHsl[2] - 0.02 * i);
          const candidate = hslToRgb(bgHsl[0], bgHsl[1], newL);
          if (contrastRatio(WHITE_RGB, candidate) >= pair.ratio) {
            el.style.setProperty(
              pair.bg,
              `rgb(${String(candidate[0])} ${String(candidate[1])} ${String(candidate[2])})`,
            );
            console.warn(
              `[contrast] -> darkened ${bgLabel} to [${String(candidate)}]`,
            );
            break;
          }
        }
      }
      continue;
    }

    const fgRgb = resolveVarToRgb(computed, pair.fg);
    if (!fgRgb) {
      console.warn(
        `[contrast] ${fgLabel} on ${bgLabel}: fg unresolvable, skipped`,
      );
      continue;
    }

    const ratio = contrastRatio(fgRgb, bgRgb);
    const pass = ratio >= pair.ratio;
    (pass ? console.log : console.warn)(
      `[contrast] ${fgLabel} on ${bgLabel} = ${ratio.toFixed(2)} ${pass ? "PASS" : "FAIL"}`,
    );

    if (!pass) {
      const fgHex = rgbToHex(...fgRgb);
      const adjusted = ensureContrast(fgHex, bgRgb, pair.ratio);
      el.style.setProperty(pair.fg, `rgb(${hexToRgbString(adjusted)})`);
      console.warn(`[contrast] -> adjusted ${fgLabel} to ${adjusted}`);
    }
  }
}

// --- Public API ---

/**
 * Derives the full Konsta color palette from a brand hex, writes all
 * --k-color-* CSS vars to :root, then enforces WCAG AA contrast on
 * all foreground/background token pairs.
 *
 * Browser-only (no-op during SSR).
 */
export async function applyKonstaPalette(brandHex: string): Promise<void> {
  if (typeof document === "undefined") return;

  const el = document.documentElement;

  // Step 1: Write the raw palette
  el.style.setProperty("--k-color-primary", `rgb(${hexToRgbString(brandHex)})`);

  const ios = deriveIosColors(brandHex);
  for (const [token, hex] of Object.entries(ios)) {
    el.style.setProperty(`--k-color-${token}`, `rgb(${hexToRgbString(hex)})`);
  }

  const md = await deriveMdColors(brandHex);
  for (const [token, hex] of Object.entries(md)) {
    el.style.setProperty(`--k-color-${token}`, `rgb(${hexToRgbString(hex)})`);
  }

  // Step 2: Enforce contrast against actual computed surfaces.
  // The surfaces may come from riso.css (color-mix with brand), default.css,
  // or Konsta's built-in @theme defaults. Reading computed values handles
  // all cases without hardcoding surface colors.
  enforceContrast(el);
}

/**
 * Removes all runtime --k-color-* overrides from :root, reverting to
 * the build-time palette.
 */
export function resetKonstaPalette(): void {
  if (typeof document === "undefined") return;

  const el = document.documentElement;
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
