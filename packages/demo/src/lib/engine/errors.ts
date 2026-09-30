/**
 * Typed error for the demo engine and its server shims.
 *
 * Every failure in this tree is the same category: a browser-demo
 * capability boundary was hit (a Node-only API, an uninitialized
 * singleton, an unimplemented shim member). One class keeps the
 * no-bare-Error rule satisfied without inventing a taxonomy the
 * engine does not need.
 */
export class DemoEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DemoEngineError";
  }
}

/**
 * Raised by the Node seed snapshot builder when a build step fails or
 * produces something the snapshot cannot carry. The builder fails loud
 * and writes no partial snapshot.
 */
export class SeedSnapshotBuildError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "SeedSnapshotBuildError";
  }
}

/**
 * Raised when the demo cannot load a seed snapshot's rows, because the
 * file does not decode, disagrees with its manifest, or an insert fails.
 * Nothing is left half loaded, because the load runs in one transaction.
 */
export class SeedSnapshotLoadError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "SeedSnapshotLoadError";
  }
}

/**
 * Raised when the demo cannot move a seeded read cursor's stored time by
 * the boot's time shift, because the cursor does not open, does not parse
 * as the product's cursor payload, or the write back fails.
 */
export class SeedTimeResealError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "SeedTimeResealError";
  }
}
