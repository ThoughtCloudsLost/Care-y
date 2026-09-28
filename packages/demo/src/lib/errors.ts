/**
 * Shared error types for demo entry points.
 *
 * A single class satisfies the no-bare-Error rule across the main,
 * phone, and health entry points without duplicating the definition.
 */

export class DemoMountError extends Error {
  override name = "DemoMountError" as const;
}

/**
 * Raised when the phone or the health page cannot fetch one of the seed
 * snapshot's files. Boot fails with it rather than starting on an empty
 * database.
 */
export class SeedSnapshotFetchError extends Error {
  override name = "SeedSnapshotFetchError" as const;
}
