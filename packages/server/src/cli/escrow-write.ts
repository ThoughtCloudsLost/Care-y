/**
 * Writes an ADR-019 escrow file for an infrastructure key: the restic
 * repository password (`backup-key`) or the operational secrets key
 * (`ops-secrets-key`).
 *
 * Usage:  pnpm escrow:write <backup-key|ops-secrets-key> <secret-file> <out-dir>
 *
 * Runs on the operator workstation with networking disabled. Both paths
 * must be absolute, because the pnpm script runs from packages/server and a
 * relative path would land the escrow file inside the repository. The
 * passphrase is typed twice at the terminal with echo off and never comes
 * from the command line or the environment.
 *
 * Output: `<out-dir>/care-y-escrow-<type>-<YYYY-MM-DD>.json` and a
 * `.json.sha256` sidecar in sha256sum format, both created with mode 0600.
 * Neither file is ever overwritten. stdout carries the two paths and the
 * hash, nothing else.
 *
 * The envelope carries exactly the fields the browser export writes
 * (packages/client/src/lib/escrow/export-escrow-file.ts), so recovery needs
 * only libsodium and the parameters in the file. This module reaches
 * neither the database nor the network, so it does not use withCli.
 */

import { createHash, timingSafeEqual } from "node:crypto";
import { lstat, open, readFile, stat, type FileHandle } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { parseArgs } from "node:util";
import {
  ARGON2_ESCROW_PARAMS,
  encryptWithPassphrase,
  getSodium,
} from "@care-y/crypto";
import {
  AppError,
  ConflictError,
  ValidationError,
  extractErrorMessage,
} from "../errors.js";

const COMMAND = "escrow:write";
const USAGE = `usage: ${COMMAND} <backup-key|ops-secrets-key> <secret-file> <out-dir>`;

/** Escrow types this CLI writes. Org key and OPRF share escrow have their own ceremonies. */
export const INFRA_ESCROW_TYPES = ["backup-key", "ops-secrets-key"] as const;

export type InfraEscrowType = (typeof INFRA_ESCROW_TYPES)[number];

/** ADR-019 calls for a 6-word diceware passphrase. */
export const MIN_PASSPHRASE_WORDS = 6;

/** OPS_SECRETS_KEY is 32 random bytes, provisioned as 64 hex characters. */
const OPS_KEY_BYTES = 32;

export interface EscrowEnvelope {
  readonly format: "care-y-escrow-v1";
  readonly type: InfraEscrowType;
  readonly created: string;
  readonly kdf: "argon2id";
  readonly kdf_params: {
    readonly opslimit: number;
    readonly memlimit: number;
    readonly parallelism: 1;
  };
  readonly salt: string;
  readonly nonce: string;
  readonly ciphertext: string;
}

/** Terminal interaction, injectable so tests run without a TTY. */
export interface EscrowWriteIo {
  /** Prompts for one passphrase entry without echoing it. */
  readonly promptPassphrase: (question: string) => Promise<string>;
  /** Clock for the filename and the envelope's `created` field. */
  readonly now: () => Date;
}

interface EscrowArgs {
  readonly type: InfraEscrowType;
  readonly secretPath: string;
  readonly outDir: string;
}

/**
 * Seals `secret` under `passphrase` and returns the escrow envelope. The
 * caller owns both buffers and zeros them afterwards.
 *
 * @param type - which infrastructure key the envelope holds
 * @param secret - the key bytes to protect
 * @param passphrase - UTF-8 passphrase bytes
 * @param now - creation time recorded in the envelope
 * @returns the envelope, field for field the browser export's shape
 */
export function buildInfraEscrowEnvelope(
  type: InfraEscrowType,
  secret: Uint8Array,
  passphrase: Uint8Array,
  now: Date,
): EscrowEnvelope {
  const blob = encryptWithPassphrase(secret, passphrase);
  return {
    format: "care-y-escrow-v1",
    type,
    created: now.toISOString(),
    kdf: "argon2id",
    kdf_params: {
      opslimit: ARGON2_ESCROW_PARAMS.iterations,
      memlimit: ARGON2_ESCROW_PARAMS.memoryKiB * 1024,
      parallelism: 1, // libsodium Argon2id is single-lane; see export-escrow-file.ts
    },
    // care-y-ignore-start no-standard-base64-server -- escrow file format, not a wire value: standard base64 exactly as the browser export writes it (uint8ArrayToBase64), read by offline recovery tools
    salt: Buffer.from(blob.salt).toString("base64"),
    nonce: Buffer.from(blob.nonce).toString("base64"),
    ciphertext: Buffer.from(blob.ciphertext).toString("base64"),
    // care-y-ignore-end no-standard-base64-server
  };
}

/**
 * Narrows a command-line type argument to an infrastructure escrow type.
 *
 * @param value - the first positional argument
 * @returns the escrow type
 * @throws ValidationError for anything outside INFRA_ESCROW_TYPES
 */
export function parseInfraEscrowType(value: string): InfraEscrowType {
  const match = INFRA_ESCROW_TYPES.find((t) => t === value);
  if (match === undefined) {
    throw new ValidationError(
      "type must be backup-key or ops-secrets-key; org-key and oprf-shares escrow files are written by their own ceremonies",
    );
  }
  return match;
}

/**
 * Refuses a passphrase with fewer than MIN_PASSPHRASE_WORDS
 * whitespace-separated words. The message never repeats the passphrase.
 *
 * @param passphrase - the passphrase as typed
 * @throws ValidationError when it is too short
 */
export function assertPassphraseWordCount(passphrase: string): void {
  const words = passphrase.split(/\s+/).filter((word) => word.length > 0);
  if (words.length < MIN_PASSPHRASE_WORDS) {
    throw new ValidationError(
      `passphrase must be at least ${String(MIN_PASSPHRASE_WORDS)} diceware words separated by spaces`,
    );
  }
}

/**
 * Names the escrow file for a type and a UTC date, matching the browser
 * export's `care-y-escrow-<date>.json` with the type added.
 *
 * @param type - the escrow type
 * @param now - the creation time; its UTC date is used
 * @returns `care-y-escrow-<type>-<YYYY-MM-DD>.json`
 */
export function buildEscrowFilename(type: InfraEscrowType, now: Date): string {
  return `care-y-escrow-${type}-${now.toISOString().slice(0, 10)}.json`;
}

function sha256Hex(content: Uint8Array): string {
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Builds the sidecar line `sha256sum -c` verifies: the hex digest, two
 * spaces (text mode), the file name, and a newline.
 *
 * @param content - the exact bytes written to the escrow file
 * @param filename - the escrow file's base name
 * @returns the sidecar file content
 */
export function buildSha256Sidecar(
  content: Uint8Array,
  filename: string,
): string {
  return `${sha256Hex(content)}  ${filename}\n`;
}

function isAsciiWhitespace(byte: number | undefined): boolean {
  return byte === 0x20 || byte === 0x09 || byte === 0x0a || byte === 0x0d;
}

function hexNibble(byte: number | undefined): number {
  if (byte === undefined) return -1;
  if (byte >= 0x30 && byte <= 0x39) return byte - 0x30; // 0-9
  if (byte >= 0x61 && byte <= 0x66) return byte - 0x61 + 10; // a-f
  if (byte >= 0x41 && byte <= 0x46) return byte - 0x41 + 10; // A-F
  return -1;
}

/**
 * Decodes the hex OPS_SECRETS_KEY file to its 32 key bytes. Works on the
 * raw bytes so the key never becomes a JS string, which could not be
 * zeroed. Surrounding whitespace (a trailing newline) is ignored; anything
 * else must be exactly 64 hex characters. Errors never include file content.
 *
 * @param fileBytes - the secret file's content; the caller zeros it
 * @returns a fresh 32-byte key; the caller zeros it
 * @throws ValidationError when the content is not 64 hex characters
 */
export function decodeOpsSecretsKey(fileBytes: Uint8Array): Uint8Array {
  let start = 0;
  let end = fileBytes.length;
  while (start < end && isAsciiWhitespace(fileBytes[start])) start++;
  while (end > start && isAsciiWhitespace(fileBytes[end - 1])) end--;

  const notHex = new ValidationError(
    `the ops-secrets-key file must hold only the key as ${String(OPS_KEY_BYTES * 2)} hex characters`,
  );
  if (end - start !== OPS_KEY_BYTES * 2) throw notHex;

  const key = new Uint8Array(OPS_KEY_BYTES);
  for (let i = 0; i < OPS_KEY_BYTES; i++) {
    const high = hexNibble(fileBytes[start + i * 2]);
    const low = hexNibble(fileBytes[start + i * 2 + 1]);
    if (high < 0 || low < 0) {
      key.fill(0);
      throw notHex;
    }
    key[i] = high * 16 + low;
  }
  return key;
}

function errnoCode(err: unknown): string | undefined {
  if (!(err instanceof Error) || !("code" in err)) return undefined;
  // After "code" in err, TS narrows to Error & Record<"code", unknown>
  const code: unknown = err.code;
  return typeof code === "string" ? code : undefined;
}

function parseEscrowArgs(argv: readonly string[]): EscrowArgs {
  let positionals: string[];
  try {
    ({ positionals } = parseArgs({
      args: [...argv],
      options: {},
      strict: true,
      allowPositionals: true,
    }));
  } catch (err: unknown) {
    // An unknown option is operator input, not a bug.
    throw new ValidationError(`${extractErrorMessage(err)}\n${USAGE}`);
  }

  const [typeArg, secretPath, outDir] = positionals;
  if (
    positionals.length !== 3 ||
    typeArg === undefined ||
    secretPath === undefined ||
    outDir === undefined
  ) {
    throw new ValidationError(USAGE);
  }
  if (!isAbsolute(secretPath) || !isAbsolute(outDir)) {
    throw new ValidationError(
      "secret-file and out-dir must be absolute paths (the command runs from packages/server)",
    );
  }
  return { type: parseInfraEscrowType(typeArg), secretPath, outDir };
}

async function assertDirectory(outDir: string): Promise<void> {
  try {
    const stats = await stat(outDir);
    if (stats.isDirectory()) return;
  } catch (err: unknown) {
    if (errnoCode(err) !== "ENOENT") throw err;
  }
  throw new ValidationError(`out-dir ${outDir} is not an existing directory`);
}

function alreadyExists(path: string): ConflictError {
  return new ConflictError(
    `${path} already exists; escrow files are never overwritten, choose a different out-dir`,
  );
}

async function assertAbsent(path: string): Promise<void> {
  try {
    // lstat: a dangling symlink at the path also counts as existing.
    await lstat(path);
  } catch (err: unknown) {
    if (errnoCode(err) === "ENOENT") return;
    throw err;
  }
  throw alreadyExists(path);
}

/** Reads the secret file and returns the bytes to escrow. The caller zeros them. */
async function readSecret(
  type: InfraEscrowType,
  secretPath: string,
): Promise<Uint8Array> {
  let fileBytes: Buffer;
  try {
    fileBytes = await readFile(secretPath);
  } catch (err: unknown) {
    if (errnoCode(err) !== "ENOENT") throw err;
    throw new ValidationError(`secret file ${secretPath} not found`);
  }

  if (type === "ops-secrets-key") {
    try {
      return decodeOpsSecretsKey(fileBytes);
    } finally {
      fileBytes.fill(0);
    }
  }

  // The restic password is escrowed exactly as the file holds it, so a
  // recovered file reads back identically through --password-file.
  if (fileBytes.every((byte) => isAsciiWhitespace(byte))) {
    fileBytes.fill(0);
    throw new ValidationError(`secret file ${secretPath} is empty`);
  }
  return fileBytes;
}

/**
 * Prompts twice and returns the confirmed passphrase as UTF-8 bytes, which
 * the caller zeros. The typed strings cannot be zeroed; their lifetime ends
 * when this process exits.
 */
async function readConfirmedPassphrase(io: EscrowWriteIo): Promise<Uint8Array> {
  const first = await io.promptPassphrase("Escrow passphrase: ");
  assertPassphraseWordCount(first);
  const second = await io.promptPassphrase("Repeat the passphrase: ");

  const encoder = new TextEncoder();
  const firstBytes = encoder.encode(first);
  const secondBytes = encoder.encode(second);
  try {
    const matches =
      firstBytes.length === secondBytes.length &&
      timingSafeEqual(firstBytes, secondBytes);
    if (!matches) {
      firstBytes.fill(0);
      throw new ValidationError("the two passphrase entries do not match");
    }
    return firstBytes;
  } finally {
    secondBytes.fill(0);
  }
}

/** Creates the file with mode 0600 and fails if the path already exists. */
async function openExclusive(path: string): Promise<FileHandle> {
  try {
    return await open(path, "wx", 0o600);
  } catch (err: unknown) {
    if (errnoCode(err) !== "EEXIST") throw err;
    throw alreadyExists(path);
  }
}

async function writeNewFile(
  path: string,
  content: Uint8Array | string,
): Promise<void> {
  const handle = await openExclusive(path);
  try {
    await handle.writeFile(content);
    // The out-dir is removable media; flush before reporting success.
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function writeEscrow(
  argv: readonly string[],
  io: EscrowWriteIo,
): Promise<void> {
  const { type, secretPath, outDir } = parseEscrowArgs(argv);
  const now = io.now();
  const filename = buildEscrowFilename(type, now);
  const jsonPath = join(outDir, filename);
  const sidecarPath = `${jsonPath}.sha256`;

  // These checks run before the prompt. A run that cannot write its files
  // fails here, before the operator has typed a passphrase.
  await assertDirectory(outDir);
  await assertAbsent(jsonPath);
  await assertAbsent(sidecarPath);

  // encryptWithPassphrase throws SodiumNotReadyError until this resolves.
  await getSodium();

  const secret = await readSecret(type, secretPath);
  let passphrase: Uint8Array | null = null;
  try {
    passphrase = await readConfirmedPassphrase(io);
    const envelope = buildInfraEscrowEnvelope(type, secret, passphrase, now);
    // Same serialization as the browser export: two-space indent, no trailing newline.
    const json = Buffer.from(JSON.stringify(envelope, null, 2), "utf8");

    await writeNewFile(jsonPath, json);
    await writeNewFile(sidecarPath, buildSha256Sidecar(json, filename));

    console.log(jsonPath);
    console.log(sidecarPath);
    console.log(`sha256 ${sha256Hex(json)}`);
  } finally {
    secret.fill(0);
    passphrase?.fill(0);
  }
}

/**
 * Prompts on the controlling terminal with echo off: readline runs in
 * terminal mode (stdin in raw mode) over an output stream that discards
 * everything, so neither the terminal nor readline echoes a keystroke.
 * History is disabled so readline keeps no copy of the line.
 */
async function promptHiddenOnTty(question: string): Promise<string> {
  if (process.stdin.isTTY !== true) {
    throw new ValidationError(
      "the passphrase must be typed at a terminal; stdin is not a TTY",
    );
  }
  const muted = new Writable({
    write(
      _chunk: unknown,
      _encoding: BufferEncoding,
      callback: (error?: Error | null) => void,
    ): void {
      callback();
    },
  });
  const rl = createInterface({
    input: process.stdin,
    output: muted,
    terminal: true,
    historySize: 0,
  });
  const controller = new AbortController();
  const cancel = (): void => {
    controller.abort();
  };
  // Ctrl+C or end of input cancels the prompt instead of leaving it pending.
  rl.on("SIGINT", cancel);
  rl.on("close", cancel);

  process.stderr.write(question);
  try {
    return await rl.question("", { signal: controller.signal });
  } catch (err: unknown) {
    if (controller.signal.aborted) {
      throw new ValidationError("passphrase entry cancelled");
    }
    throw err;
  } finally {
    rl.off("close", cancel);
    rl.close();
    process.stderr.write("\n");
  }
}

const TERMINAL_IO: EscrowWriteIo = {
  promptPassphrase: promptHiddenOnTty,
  now: () => new Date(),
};

/**
 * Runs the command and returns its exit code. An AppError prints
 * `escrow:write: <message>` to stderr and returns 1; anything else is a bug
 * and is rethrown so it fails loud with its stack.
 *
 * @param argv - arguments without the node and script paths
 * @param io - terminal prompt and clock; defaults to the real terminal
 * @returns 0 on success, 1 on an operator error
 */
export async function runEscrowWrite(
  argv: readonly string[],
  io: EscrowWriteIo = TERMINAL_IO,
): Promise<number> {
  try {
    await writeEscrow(argv, io);
    return 0;
  } catch (err: unknown) {
    if (!(err instanceof AppError)) throw err;
    console.error(`${COMMAND}: ${err.message}`);
    return 1;
  }
}

// Run only when executed as a script, not when a test imports this module.
const entryArg = process.argv[1] ?? "";
if (
  entryArg.endsWith("escrow-write.ts") ||
  entryArg.endsWith("escrow-write.js")
) {
  process.exitCode = await runEscrowWrite(process.argv.slice(2));
}
