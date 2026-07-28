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
