/**
 * Konsta component styling constants.
 *
 * Konsta's `colors` and `class` props are the one sanctioned place the
 * codebase injects Tailwind arbitrary-value classes, in tension with the
 * Inkwell tokens-only rule: Konsta components resolve their own palette
 * internally, so tokens have to ride in through these props. Every such
 * literal lives here so the injection points cannot drift apart.
 */

/**
 * Checked-state brand colors for the Konsta Checkbox.
 *
 * Uses --brand-fill, never --brand-accent: konsta-palette.ts always
 * derives --brand-fill AA-adjusted for white-on-fill, while
 * --brand-accent is conditional (removed when the org sets no accent,
 * leaving only the neutral :root fallback).
 */
export const CHECKBOX_BRAND_COLORS = {
  bgCheckedIos: "bg-[var(--brand-fill)]",
  borderCheckedIos: "border-[var(--brand-fill)]",
  bgCheckedMaterial: "bg-[var(--brand-fill)]",
  borderCheckedMaterial: "border-[var(--brand-fill)]",
} as const;

/**
 * Destructive confirm action inside a Konsta Dialog: danger text,
 * never a raw red utility class.
 */
export const DIALOG_DESTRUCTIVE_CLASS =
  "text-[color:var(--danger)] font-semibold";
