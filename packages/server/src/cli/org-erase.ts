/**
 * Processes org deletion requests on the owner-role pool.
 *
 * Usage (dev):  pnpm org:erase                               process every due request
 *               pnpm org:erase --due                         list the snapshots still owed
 *               pnpm org:erase --request-now <slug>          make one org due now
 *               pnpm org:erase --snapshot-recorded <id>      record a stored snapshot
 * Production:   deploy/db/org-erase.sh, started daily by
 *               deploy/db/care-y-org-erase.timer and run by hand as
 *               `org-erase.sh --now <slug>` for an emergency erasure
 *
 * The modes are exclusive. The pnpm script ends in `--`, and the host
 * wrapper passes `--` too, so withCli's strict parser receives the flags
 * as positionals.
 *
 * This CLI never takes the pre-deletion snapshot. backup-org.sh needs root,
 * restic and the host's restic.env, none of which exist in the api
 * container, so the host wrapper takes it between `--due` and
 * `--snapshot-recorded`. The plain run defers any request whose snapshot is
 * still owed.
 *
 * Besides the secrets loader's summary line (key names only), stdout
 * carries nothing but these lines:
 *
 *   --due, --request-now:  <request id> <org schema>
 *   plain run:             erased <org uuid>
 *                          busy <org uuid>
 *                          deferred <org uuid> snapshot
 *                          deferred <org uuid> <step> <error class>
 *
 * No line carries a slug or an error message.
 */

// Must stay the first import: cli-utils boots the secrets loader before
// anything below reaches db.ts (ADR-129).
import { withCli, type CliArgs, type CliContext } from "./cli-utils.js";
import {
  deletionRequestIdSchema,
  type DeletionRequestId,
} from "@care-y/shared";
import { getEnv } from "../env.js";
import { createSecretsEncryptor, deriveSecretsKey } from "../config/secrets.js";
import type { BlobStoreType } from "../storage/index.js";
import { createLocalBlobStore } from "../storage/local.js";
import type { OrgBlobSweeper } from "../storage/store.js";
import { closeTwilioSubaccount } from "../telephony/twilio.js";
import {
  createErasureService,
  type DueErasure,
  type ErasureService,
  type ErasureTarget,
} from "../org/erasure-service.js";
import { ErasureStepError, ValidationError } from "../errors.js";

/** Recorded as the actor on the platform audit rows the CLI writes. */
export const CLI_ACTOR = "cli";

export const ORG_ERASE_USAGE =
  "usage: org:erase [--due | --request-now <slug> | --snapshot-recorded <request id>]";

/** What one invocation does. */
export type OrgEraseMode =
  | { readonly kind: "process" }
  | { readonly kind: "due" }
  | { readonly kind: "request-now"; readonly slug: string }
  | {
      readonly kind: "snapshot-recorded";
      readonly requestId: DeletionRequestId;
    };

/**
 * Reads the command line. No positionals is the plain run; otherwise
 * exactly one of the three flags, with its value where it takes one.
 *
 * @param args - parsed arguments from withCli
 * @returns the mode to run
 * @throws ValidationError carrying the usage line for anything else
 */
export function parseOrgEraseMode(args: CliArgs): OrgEraseMode {
  const { positionals } = args;
  if (positionals.length === 0) return { kind: "process" };

  const [flag, value] = positionals;
  if (positionals.length === 1 && flag === "--due") return { kind: "due" };
  if (positionals.length === 2 && value !== undefined) {
    if (flag === "--request-now") return { kind: "request-now", slug: value };
    if (flag === "--snapshot-recorded") {
      const parsed = deletionRequestIdSchema.safeParse(value);
      if (parsed.success) {
        return { kind: "snapshot-recorded", requestId: parsed.data };
      }
    }
  }
  throw new ValidationError(ORG_ERASE_USAGE);
}

/** The `<request id> <org schema>` line the host wrapper reads. */
function targetLine(target: ErasureTarget): string {
  return `${target.id} ${target.orgSchema}`;
}

async function processOne(
  service: ErasureService,
  request: DueErasure,
): Promise<string> {
  try {
    const outcome = await service.processRequest(request.id, CLI_ACTOR);
    if (outcome === "snapshot-owed") {
      return `deferred ${request.orgId} snapshot`;
    }
    return `${outcome} ${request.orgId}`;
  } catch (err: unknown) {
    if (!(err instanceof ErasureStepError)) throw err;
    return `deferred ${request.orgId} ${err.step} ${err.causeName}`;
  }
}

/**
 * The command body. In the plain run a failed step yields a `deferred`
 * line and the run moves on to the next request; any other error is
 * rethrown.
 *
 * @param service - the erasure service over the owner-role pool
 * @param args - parsed arguments from withCli
 * @param print - receives each output line (console.log in the CLI)
 */
export async function runOrgErase(
  service: ErasureService,
  args: CliArgs,
  print: (line: string) => void,
): Promise<void> {
  const mode = parseOrgEraseMode(args);
  switch (mode.kind) {
    case "due": {
      for (const target of await service.listSnapshotsOwed()) {
        print(targetLine(target));
      }
      return;
    }
    case "request-now": {
      print(targetLine(await service.requestImmediate(mode.slug)));
      return;
    }
    case "snapshot-recorded": {
      await service.recordSnapshot(mode.requestId);
      return;
    }
    case "process": {
      for (const request of await service.listDue()) {
        print(await processOne(service, request));
      }
      return;
    }
  }
}

// Every backend in BlobStoreType must sweep an org: a missing key in this
// record is a compile error until the new backend has a sweeper.
const blobSweepers: Record<
  BlobStoreType,
  (basePath: string) => OrgBlobSweeper
> = {
  local: createLocalBlobStore,
};

/** The blob sweeper for the configured backend. */
function createBlobSweeper(
  type: BlobStoreType,
  basePath: string,
): OrgBlobSweeper {
  // `type` is a closed Zod-validated union from env.ts, not user input
  // eslint-disable-next-line security/detect-object-injection
  return blobSweepers[type](basePath);
}

/**
 * Builds the erasure service for the CLI process: the blob sweeper and the
 * secrets encryptor over the api's own configuration, and
 * closeTwilioSubaccount for managed-mode subaccounts.
 *
 * @param ctx - the withCli context; its platformDb runs on the owner role
 * @returns the erasure service
 */
export function createCliErasureService(ctx: CliContext): ErasureService {
  const env = getEnv();
  const opsKey = Buffer.from(env.OPS_SECRETS_KEY, "hex");
  let secretsKey: Buffer;
  try {
    secretsKey = deriveSecretsKey(opsKey);
  } finally {
    opsKey.fill(0);
  }
  return createErasureService({
    platformDb: ctx.platformDb,
    blobSweeper: createBlobSweeper(env.BLOB_STORE_TYPE, env.BLOB_STORE_PATH),
    secretsEncryptor: createSecretsEncryptor(secretsKey),
    closeSubaccount: closeTwilioSubaccount,
    now: () => new Date(),
  });
}

// Run only when executed as a script, not when a test imports this module.
const entryArg = process.argv[1] ?? "";
if (entryArg.endsWith("org-erase.ts") || entryArg.endsWith("org-erase.js")) {
  await withCli("org:erase", async (ctx, args) => {
    await runOrgErase(createCliErasureService(ctx), args, (line) => {
      console.log(line);
    });
  });
}
