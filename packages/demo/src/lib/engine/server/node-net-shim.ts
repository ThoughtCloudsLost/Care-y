/**
 * Shim for node:net
 *
 * Only createConnection is used by oprf-ipc.ts. The OPRF evaluator
 * is injected as a stub so this never actually runs; it just needs
 * to exist so the import resolves.
 */

import { DemoEngineError } from "../errors.js";

export function createConnection(): never {
  throw new DemoEngineError("node:net is not available in the browser demo");
}

export default { createConnection };
