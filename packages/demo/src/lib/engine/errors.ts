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
