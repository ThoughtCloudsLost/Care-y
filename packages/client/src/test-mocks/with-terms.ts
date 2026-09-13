/**
 * Shared vi.mock() factory for $lib/terminology/with-terms.js.
 *
 * Keeps the identity stub tests rely on (message params pass through
 * untouched) while every other export stays real:
 *
 *   import type * as WithTermsNS from "$lib/terminology/with-terms.js";
 *   vi.mock("$lib/terminology/with-terms.js", async (importOriginal) =>
 *     (await import("$lib/../test-mocks/with-terms.js")).withTermsMock(
 *       await importOriginal<typeof WithTermsNS>(),
 *     ));
 */

import type * as WithTermsNS from "$lib/terminology/with-terms.js";

export function withTermsMock(
  original: typeof WithTermsNS,
): typeof WithTermsNS {
  return {
    ...original,
    // Deliberately narrower than the real overloads: tests want the extra
    // params back unchanged, without terminology keys mixed in.
    withTerms: ((extra?: Record<string, unknown>) =>
      extra ?? {}) as typeof WithTermsNS.withTerms,
  };
}
