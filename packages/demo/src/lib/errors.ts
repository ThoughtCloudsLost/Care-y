/**
 * Shared error types for demo entry points.
 *
 * A single class satisfies the no-bare-Error rule across the main,
 * phone, and health entry points without duplicating the definition.
 */

export class DemoMountError extends Error {
  override name = "DemoMountError" as const;
}
