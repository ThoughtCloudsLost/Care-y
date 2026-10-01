// Loads the production secrets file and fills the getEnv() cache (ADR-131).
//
// Imported for its side effect as the first import of every process entry
// point: the API, the inbound SMTP receiver, the migration runners and the
// operator CLIs. ESM evaluates a module's imports in order, so this runs
// before any module that reads getEnv() at import time (db.ts builds its
// pool config that way).
//
// A missing or malformed secrets file (SecretsFileError) or an invalid
// environment (EnvValidationError) prints its message and exits 1 before any
// other module is evaluated. Both messages name keys only, never values.
// Anything else is a bug and is rethrown with its stack.

import { loadSecretsFile } from "./config/secrets-file.js";
import { EnvValidationError, initEnv } from "./env.js";
import { SecretsFileError } from "./errors.js";

try {
  const { source } = loadSecretsFile();
  initEnv(source);
} catch (err: unknown) {
  if (err instanceof SecretsFileError || err instanceof EnvValidationError) {
    console.error(err.message);
    process.exit(1);
  }
  throw err;
}
