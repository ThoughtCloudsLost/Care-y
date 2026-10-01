/**
 * Shared harness for the operator CLIs under src/cli/.
 *
 * Each CLI is a standalone tsx script that imports this module first, hands
 * its work to withCli(), and prints its result to stdout. withCli parses
 * the arguments, supplies the same Kysely instances index.ts uses, closes
 * the pool afterwards and sets the exit code.
 */

// Must stay the first import: loads the secrets file and fills the
// getEnv() cache before db.ts reads DATABASE_URL at import time (ADR-129).
// CLI entry files import this module before anything that reaches db.ts.
import "../env-bootstrap.js";
import { parseArgs } from "node:util";
import type { Kysely } from "kysely";
import type { OrgSchema } from "@care-y/shared";
import { db, tenantDb } from "../db/db.js";
import type { PlatformDatabase, TenantDatabase } from "../db/types.js";
import { AppError, ValidationError, extractErrorMessage } from "../errors.js";

export interface CliContext {
  readonly platformDb: Kysely<PlatformDatabase>;
  readonly tenantDbFactory: (schema: OrgSchema) => Kysely<TenantDatabase>;
}

/** Parsed command line. The CLIs take positionals only; any option is refused. */
export interface CliArgs {
  readonly positionals: readonly string[];
}

export type CliRun = (ctx: CliContext, args: CliArgs) => Promise<void>;

function parseCliArgs(argv: readonly string[]): CliArgs {
  try {
    const { positionals } = parseArgs({
      args: argv,
      options: {},
      strict: true,
      allowPositionals: true,
    });
    return { positionals };
  } catch (err: unknown) {
    // parseArgs reports an unknown option or a malformed argument. That is
    // operator input, not a bug, so it exits 1 with the message like any
    // other AppError.
    throw new ValidationError(extractErrorMessage(err));
  }
}

/**
 * Runs one operator command and exits the process.
 *
 * Exit 0 when `run` resolves. An AppError prints `<name>: <message>` to
 * stderr and exits 1. Anything else is a bug and is rethrown so it fails
 * loud with its stack. The pool is closed on every path.
 *
 * @param name - command name used as the stderr prefix (e.g. "org:create")
 * @param run - the command body; receives the DB context and parsed args
 * @param argv - arguments to parse; defaults to the process arguments
 * @returns never; the process exits, or the promise rejects on a bug
 */
export async function withCli(
  name: string,
  run: CliRun,
  argv: readonly string[] = process.argv.slice(2),
): Promise<never> {
  let exitCode = 1;
  try {
    await run(
      { platformDb: db, tenantDbFactory: tenantDb },
      parseCliArgs(argv),
    );
    exitCode = 0;
  } catch (err: unknown) {
    if (!(err instanceof AppError)) throw err;
    console.error(`${name}: ${err.message}`);
  } finally {
    await db.destroy();
  }
  return process.exit(exitCode);
}

/**
 * Returns the single positional argument, or throws a ValidationError
 * carrying the usage line when there is not exactly one.
 *
 * @param args - parsed arguments from withCli
 * @param usage - usage line shown on error (e.g. "org:create <slug>")
 * @returns the positional argument
 */
export function singlePositional(args: CliArgs, usage: string): string {
  const [first] = args.positionals;
  if (args.positionals.length !== 1 || first === undefined) {
    throw new ValidationError(`usage: ${usage}`);
  }
  return first;
}

/**
 * Builds the one-time setup link an operator hands to a new org's admin.
 *
 * @param appDomain - CAREY_APP_DOMAIN, the domain org subdomains hang off
 * @param slug - the org slug (already validated by the org service)
 * @param setupToken - the raw setup token, base64url
 * @returns `https://<slug>.<appDomain>/setup/<setupToken>`
 */
export function buildSetupUrl(
  appDomain: string,
  slug: string,
  setupToken: string,
): string {
  return `https://${slug}.${appDomain}/setup/${setupToken}`;
}
