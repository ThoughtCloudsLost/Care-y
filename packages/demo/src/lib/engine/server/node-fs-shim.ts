/**
 * Shim for node:fs and node:fs/promises
 *
 * The schema-utils shim replaces the FileMigrationProvider so these
 * are no longer called. This exists for any transitive imports that
 * reference node:fs.
 */

import { DemoEngineError } from "../errors.js";

export async function readdir(): Promise<string[]> {
  return Promise.reject(
    new DemoEngineError("node:fs is not available in the browser demo"),
  );
}

export function readFileSync(): never {
  throw new DemoEngineError("node:fs is not available in the browser demo");
}

export function existsSync(): boolean {
  return false;
}

export default { readdir, readFileSync, existsSync };
