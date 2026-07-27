/**
 * Typed error for the demo health-check engine and its shims.
 *
 * Every failure in this tree is the same category: a browser-demo
 * capability boundary was hit (a Node-only API, an uninitialized
 * singleton, an unimplemented shim member). One class keeps the
 * no-bare-Error rule satisfied without inventing a taxonomy the
 * health check does not need.
 */
export class HealthCheckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HealthCheckError";
  }
}
