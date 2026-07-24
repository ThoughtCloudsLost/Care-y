/**
 * WCAG contrast math shared by the branding test suites
 * (konsta-palette.test.ts, theme-contrast.test.ts).
 *
 * Test-only on purpose: konsta-palette.ts carries its own contrastRatio
 * so the tests verify the production derivation with independent math.
 */

/**
 * Parse a hex color to [r, g, b].
 */
export function parseHex(hex: string): [number, number, number] {
  const m = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (m?.[1] === undefined || m[2] === undefined || m[3] === undefined) {
    throw new TypeError(`Invalid hex: ${hex}`);
  }
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/**
 * WCAG 2.1 relative luminance.
 * Source: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function luminance(r: number, g: number, b: number): number {
  function lin(c: number): number {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * WCAG contrast ratio between two hex colors.
 */
export function contrast(hex1: string, hex2: string): number {
  const l1 = luminance(...parseHex(hex1));
  const l2 = luminance(...parseHex(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
