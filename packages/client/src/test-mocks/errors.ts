/**
 * Shared vi.mock() factory for $lib/errors.js.
 *
 * Error classes stay real (instanceof checks keep working); only
 * requireRouter is replaced with an identity passthrough so component
 * tests can render without a live tRPC router in context.
 *
 *   import type * as ErrorsNS from "$lib/errors.js";
 *   vi.mock("$lib/errors.js", async (importOriginal) =>
 *     (await import("$lib/../test-mocks/errors.js")).errorsMock(
 *       await importOriginal<typeof ErrorsNS>(),
 *     ));
 */

import type * as ErrorsNS from "$lib/errors.js";

export function errorsMock(original: typeof ErrorsNS): typeof ErrorsNS {
  return {
    ...original,
    requireRouter: (<T>(router: T) => router) as typeof original.requireRouter,
  };
}
