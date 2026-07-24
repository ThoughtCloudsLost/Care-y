/**
 * Shared lazily-created Intl.Collator instances, one per locale.
 *
 * Comparator hot paths (list sorts) run thousands of comparisons; MDN's
 * localeCompare guidance is to create one Intl.Collator and use its
 * compare method when comparing large numbers of strings. The
 * no-argument default carries the same host-locale semantics as calling
 * localeCompare with no arguments, so swapping call sites over is
 * order-preserving.
 */

const collators = new Map<string, Intl.Collator>();

export function getCollator(locale?: string): Intl.Collator {
  const key = locale ?? "";
  let collator = collators.get(key);
  if (collator === undefined) {
    collator = new Intl.Collator(locale);
    collators.set(key, collator);
  }
  return collator;
}
