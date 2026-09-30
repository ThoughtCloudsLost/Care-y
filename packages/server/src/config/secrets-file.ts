// Production secrets file loader (ADR-129).
// Reads /etc/care-y/secrets.env and returns a merged source object for
// initEnv(). Nothing from the file is ever assigned to process.env:
// the validated config object is the only place the values live.
// Errors and log lines name keys only, never values.

import {
  closeSync,
  constants,
  fstatSync,
  openSync,
  readFileSync,
} from "node:fs";
import { SecretsFileError } from "../errors.js";

const SECRETS_FILE_PATH = "/etc/care-y/secrets.env";

/** Keys the loader is allowed to merge. Names mirror env.ts exactly. */
const LOADED_KEYS = [
  "OPS_SECRETS_KEY",
  "OPS_SECRETS_KEY_OLD", // present only mid-rotation
  "TWILIO_MASTER_SID",
  "TWILIO_MASTER_AUTH_TOKEN",
  "TWILIO_API_KEY_SID",
  "TWILIO_API_KEY_SECRET",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASSWORD",
] as const;

const LOADED_KEY_SET: ReadonlySet<string> = new Set<string>(LOADED_KEYS);

/** Group and world permission bits. Any of them set means the file is too open. */
const GROUP_OTHER_BITS = 0o077;

export interface LoadSecretsOptions {
  /** Test injection; production uses the fixed secrets path. */
  readonly path?: string;
  /** Test injection; defaults to process.env. Never mutated. */
  readonly env?: NodeJS.ProcessEnv;
  /** Defaults to process.env.NODE_ENV. */
  readonly nodeEnv?: string;
}

export interface SecretsFileReport {
  readonly loadedKeys: readonly string[];
  /** Unknown keys found in the file (names only). */
  readonly ignoredKeys: readonly string[];
}

export interface SecretsFileResult {
  /** `{ ...env, ...allowlisted file keys }`. Pass to initEnv(source). Never assigned to process.env. */
  readonly source: NodeJS.ProcessEnv;
  readonly report: SecretsFileReport;
}

const EMPTY_REPORT: SecretsFileReport = { loadedKeys: [], ignoredKeys: [] };

function errnoCode(err: unknown): string | undefined {
  if (!(err instanceof Error) || !("code" in err)) return undefined;
  // After "code" in err, TS narrows to Error & Record<"code", unknown>
  const code: unknown = err.code;
  return typeof code === "string" ? code : undefined;
}

/** Opens the file without following a symlink at the final path component. */
function openNoFollow(path: string): number {
  try {
    return openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  } catch (err: unknown) {
    const code = errnoCode(err);
    if (code === "ELOOP") {
      throw new SecretsFileError(
        `Secrets file ${path} is a symlink; refusing to follow it`,
      );
    }
    if (code === "ENOENT") {
      throw new SecretsFileError(`Secrets file ${path} not found`);
    }
    throw new SecretsFileError(
      `Secrets file ${path} could not be opened (${code ?? "unknown error"})`,
    );
  }
}

/**
 * Checks the opened descriptor (not the path, so there is no gap between
 * check and read) and returns the file content.
 */
function readCheckedFile(path: string): string {
  const fd = openNoFollow(path);
  try {
    const stats = fstatSync(fd);
    if (!stats.isFile()) {
      throw new SecretsFileError(`Secrets file ${path} is not a regular file`);
    }
    if ((stats.mode & GROUP_OTHER_BITS) !== 0) {
      const mode = (stats.mode & 0o777).toString(8).padStart(3, "0");
      throw new SecretsFileError(
        `Secrets file ${path} has mode ${mode}; group and world bits must be clear (expected 600)`,
      );
    }
    return readFileSync(fd, "utf-8");
  } finally {
    closeSync(fd);
  }
}

/**
 * Parses KEY=VALUE lines: trim, skip blank and `#` lines, split at the
 * first `=`, no quoting or interpolation (the dialect smtp-config.ts
 * reads). A remaining line with no `=` or an empty key is unparseable;
 * the error names the line number only, never its content.
 */
function parseSecretsFile(content: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const [index, line] of content.split("\n").entries()) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx <= 0) {
      throw new SecretsFileError(
        `Secrets file line ${String(index + 1)} is not a KEY=VALUE line`,
      );
    }
    result.set(trimmed.slice(0, eqIdx), trimmed.slice(eqIdx + 1));
  }
  return result;
}

/**
 * Production only (ADR-129): opens the secrets file with O_NOFOLLOW, checks
 * the mode on the opened descriptor (mode & 0o077 must be zero), parses it,
 * and returns a merged source object for initEnv(). Secrets never enter
 * process.env; the validated config object is the only place they exist.
 * Outside production returns `{ source: env, report: empty }` untouched.
 * Throws SecretsFileError (key NAMES only, never values) when: the file is
 * missing, a symlink, group/world-readable, unparseable, or a loaded key is
 * already set in the environment (split-source config is a deployment
 * mistake; fail loud).
 */
export function loadSecretsFile(opts?: LoadSecretsOptions): SecretsFileResult {
  const env = opts?.env ?? process.env;
  const nodeEnv = opts?.nodeEnv ?? process.env.NODE_ENV;

  if (nodeEnv !== "production") {
    return { source: env, report: EMPTY_REPORT };
  }

  const path = opts?.path ?? SECRETS_FILE_PATH;
  const parsed = parseSecretsFile(readCheckedFile(path));

  const loaded = new Map<string, string>();
  const ignoredKeys: string[] = [];
  for (const [key, value] of parsed) {
    if (LOADED_KEY_SET.has(key)) {
      loaded.set(key, value);
    } else {
      ignoredKeys.push(key);
    }
  }

  const conflicts = [...loaded.keys()].filter((key) => env[key] !== undefined);
  if (conflicts.length > 0) {
    throw new SecretsFileError(
      `Secrets file keys also set in the environment: ${conflicts.join(", ")}. Set each key in exactly one place.`,
    );
  }

  const source: NodeJS.ProcessEnv = { ...env };
  for (const [key, value] of loaded) {
    source[key] = value;
  }

  const loadedKeys = [...loaded.keys()];
  const loadedPart = loadedKeys.length > 0 ? loadedKeys.join(", ") : "none";
  const ignoredPart =
    ignoredKeys.length > 0 ? `; ignored ${ignoredKeys.join(", ")}` : "";
  console.log(`secrets file: loaded ${loadedPart}${ignoredPart}`);

  return { source, report: { loadedKeys, ignoredKeys } };
}
