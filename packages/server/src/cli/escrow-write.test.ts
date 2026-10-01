/**
 * Unit tests for the infrastructure escrow file writer.
 *
 * Envelope tests run the real Argon2id escrow parameters, so each seal or
 * open costs about a second; the envelope is sealed once in beforeAll.
 * CLI runs inject the prompt and the clock and write into a per-test
 * mkdtemp directory.
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
  type Mock,
  type MockInstance,
} from "vitest";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ARGON2_ESCROW_PARAMS,
  DecryptionError,
  decryptWithPassphrase,
  getSodium,
  toNonce,
  toSalt,
  type EscrowBlob,
} from "@care-y/crypto";
import { ValidationError } from "../errors.js";
import {
  assertPassphraseWordCount,
  buildEscrowFilename,
  buildInfraEscrowEnvelope,
  buildSha256Sidecar,
  decodeOpsSecretsKey,
  parseInfraEscrowType,
  runEscrowWrite,
  type EscrowEnvelope,
  type EscrowWriteIo,
} from "./escrow-write.js";

/** The field set packages/client/src/lib/escrow/export-escrow-file.ts emits. */
const CLIENT_ENVELOPE_KEYS = [
  "format",
  "type",
  "created",
  "kdf",
  "kdf_params",
  "salt",
  "nonce",
  "ciphertext",
];
const CLIENT_KDF_PARAM_KEYS = ["opslimit", "memlimit", "parallelism"];

const SIX_WORDS = "maple orbit lantern quiet harbor velvet";
const FIVE_WORDS = "maple orbit lantern quiet harbor";
const FIXED_DATE = new Date("2026-03-14T09:26:53.000Z");

const encoder = new TextEncoder();

interface FakeIo extends EscrowWriteIo {
  readonly promptPassphrase: Mock<(question: string) => Promise<string>>;
}

function blobFromEnvelope(envelope: EscrowEnvelope): EscrowBlob {
  return {
    salt: toSalt(Buffer.from(envelope.salt, "base64")),
    nonce: toNonce(Buffer.from(envelope.nonce, "base64")),
    ciphertext: Buffer.from(envelope.ciphertext, "base64"),
  };
}

/** Runs `fn`, which must throw, and returns the thrown message. */
function thrownMessage(fn: () => unknown): string {
  try {
    fn();
  } catch (err: unknown) {
    return err instanceof Error ? err.message : String(err);
  }
  return expect.unreachable("expected the call to throw");
}

beforeAll(async () => {
  // encryptWithPassphrase and decryptWithPassphrase throw
  // SodiumNotReadyError until this resolves.
  await getSodium();
});

describe("buildInfraEscrowEnvelope", () => {
  const secret = new Uint8Array(32).fill(0x5a);
  let envelope: EscrowEnvelope;

  beforeAll(() => {
    envelope = buildInfraEscrowEnvelope(
      "backup-key",
      secret,
      encoder.encode(SIX_WORDS),
      FIXED_DATE,
    );
  });

  it("emits exactly the browser export's field set", () => {
    expect(Object.keys(envelope)).toEqual(CLIENT_ENVELOPE_KEYS);
    expect(Object.keys(envelope.kdf_params)).toEqual(CLIENT_KDF_PARAM_KEYS);
  });

  it("records the escrow Argon2id parameters with parallelism 1", () => {
    expect(envelope.format).toBe("care-y-escrow-v1");
    expect(envelope.type).toBe("backup-key");
    expect(envelope.created).toBe(FIXED_DATE.toISOString());
    expect(envelope.kdf).toBe("argon2id");
    expect(envelope.kdf_params).toEqual({
      opslimit: ARGON2_ESCROW_PARAMS.iterations,
      memlimit: ARGON2_ESCROW_PARAMS.memoryKiB * 1024,
      parallelism: 1,
    });
  });

  it("decrypts back to the secret with the same passphrase", () => {
    const recovered = decryptWithPassphrase(
      blobFromEnvelope(envelope),
      encoder.encode(SIX_WORDS),
    );
    expect(recovered).toEqual(secret);
  });

  it("throws DecryptionError for a wrong passphrase", () => {
    expect(() =>
      decryptWithPassphrase(
        blobFromEnvelope(envelope),
        encoder.encode("maple orbit lantern quiet harbor violet"),
      ),
    ).toThrow(DecryptionError);
  });
});

describe("assertPassphraseWordCount", () => {
  it("refuses five words", () => {
    expect(() => {
      assertPassphraseWordCount(FIVE_WORDS);
    }).toThrow(ValidationError);
  });

  it("accepts six words", () => {
    expect(() => {
      assertPassphraseWordCount(SIX_WORDS);
    }).not.toThrow();
  });

  it("counts words, not separators", () => {
    expect(() => {
      assertPassphraseWordCount(`  ${FIVE_WORDS.replaceAll(" ", "   ")}  `);
    }).toThrow(ValidationError);
  });

  it("does not echo the passphrase in its message", () => {
    const message = thrownMessage(() => {
      assertPassphraseWordCount(FIVE_WORDS);
    });
    expect(message).not.toContain("maple");
  });
});

describe("buildSha256Sidecar", () => {
  it("returns sha256sum output for a known byte string", () => {
    expect(buildSha256Sidecar(encoder.encode("abc"), "file.json")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad  file.json\n",
    );
  });
});

describe("buildEscrowFilename", () => {
  it("names the file by type and UTC date", () => {
    expect(buildEscrowFilename("ops-secrets-key", FIXED_DATE)).toBe(
      "care-y-escrow-ops-secrets-key-2026-03-14.json",
    );
  });
});

describe("parseInfraEscrowType", () => {
  it.each(["backup-key", "ops-secrets-key"])("accepts %s", (value) => {
    expect(parseInfraEscrowType(value)).toBe(value);
  });

  it.each(["org-key", "oprf-shares", "", "BACKUP-KEY"])(
    "refuses %j",
    (value) => {
      expect(() => parseInfraEscrowType(value)).toThrow(ValidationError);
    },
  );
});

describe("decodeOpsSecretsKey", () => {
  const expected = new Uint8Array(32).map((_, i) => i * 7 + 3);
  const hex = Buffer.from(expected).toString("hex");

  it("decodes 64 lowercase hex characters to 32 bytes", () => {
    expect(decodeOpsSecretsKey(encoder.encode(hex))).toEqual(expected);
  });

  it("accepts uppercase hex and a trailing newline", () => {
    expect(
      decodeOpsSecretsKey(encoder.encode(`${hex.toUpperCase()}\n`)),
    ).toEqual(expected);
  });

  it.each([
    ["63 characters", "a".repeat(63)],
    ["66 characters", "a".repeat(66)],
    ["a non-hex character", `${"a".repeat(63)}g`],
    ["an env-file line", `KEY=${"a".repeat(64)}`],
    ["an empty file", ""],
  ])("refuses %s", (_label, content) => {
    expect(() => decodeOpsSecretsKey(encoder.encode(content))).toThrow(
      ValidationError,
    );
  });

  it("does not echo file content in its message", () => {
    const message = thrownMessage(() =>
      decodeOpsSecretsKey(encoder.encode(`${"b".repeat(63)}z`)),
    );
    expect(message).not.toContain("bbbb");
  });
});

describe("runEscrowWrite", () => {
  let workDir: string;
  let outDir: string;
  let secretPath: string;
  let logSpy: MockInstance<typeof console.log>;
  let errorSpy: MockInstance<typeof console.error>;

  const RESTIC_PASSWORD = "restic-repository-password-placeholder\n";
  const JSON_NAME = "care-y-escrow-backup-key-2026-03-14.json";

  function fakeIo(...answers: string[]): FakeIo {
    const promptPassphrase = vi.fn<(question: string) => Promise<string>>();
    for (const answer of answers) {
      promptPassphrase.mockResolvedValueOnce(answer);
    }
    return { promptPassphrase, now: () => FIXED_DATE };
  }

  function lastError(): string {
    return String(errorSpy.mock.calls.at(-1)?.[0]);
  }

  beforeEach(() => {
    workDir = mkdtempSync(join(tmpdir(), "escrow-write-"));
    outDir = join(workDir, "usb");
    secretPath = join(workDir, "restic.password");
    // Paths are built from the temporary directory this test created
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    mkdirSync(outDir);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    writeFileSync(secretPath, RESTIC_PASSWORD, { mode: 0o600 });
    logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(workDir, { recursive: true, force: true });
  });

  it("writes the envelope and a verifiable sidecar, both 0600", async () => {
    const io = fakeIo(SIX_WORDS, SIX_WORDS);

    const code = await runEscrowWrite(["backup-key", secretPath, outDir], io);

    expect(code).toBe(0);
    expect(errorSpy).not.toHaveBeenCalled();

    const jsonPath = join(outDir, JSON_NAME);
    const sidecarPath = `${jsonPath}.sha256`;
    // Paths are built from the temporary directory this test created
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const jsonBytes = readFileSync(jsonPath);
    const digest = createHash("sha256").update(jsonBytes).digest("hex");

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(readFileSync(sidecarPath, "utf8")).toBe(`${digest}  ${JSON_NAME}\n`);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(statSync(jsonPath).mode & 0o777).toBe(0o600);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(statSync(sidecarPath).mode & 0o777).toBe(0o600);

    const parsed = JSON.parse(jsonBytes.toString("utf8")) as EscrowEnvelope;
    expect(Object.keys(parsed)).toEqual(CLIENT_ENVELOPE_KEYS);
    expect(parsed.type).toBe("backup-key");
    expect(
      decryptWithPassphrase(
        blobFromEnvelope(parsed),
        encoder.encode(SIX_WORDS),
      ),
    ).toEqual(encoder.encode(RESTIC_PASSWORD));

    const printed = logSpy.mock.calls.map((call) => String(call[0]));
    expect(printed).toEqual([jsonPath, sidecarPath, `sha256 ${digest}`]);
    expect(printed.join("\n")).not.toContain("maple");
    expect(printed.join("\n")).not.toContain("restic-repository-password");
  });

  it("refuses to overwrite an existing escrow file without prompting", async () => {
    // Paths are built from the temporary directory this test created
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    writeFileSync(join(outDir, JSON_NAME), "existing");
    const io = fakeIo(SIX_WORDS, SIX_WORDS);

    const code = await runEscrowWrite(["backup-key", secretPath, outDir], io);

    expect(code).toBe(1);
    expect(lastError()).toContain("already exists");
    expect(io.promptPassphrase).not.toHaveBeenCalled();
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(readFileSync(join(outDir, JSON_NAME), "utf8")).toBe("existing");
  });

  it("refuses when only the sidecar already exists", async () => {
    // Paths are built from the temporary directory this test created
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    writeFileSync(join(outDir, `${JSON_NAME}.sha256`), "existing");
    const io = fakeIo(SIX_WORDS, SIX_WORDS);

    const code = await runEscrowWrite(["backup-key", secretPath, outDir], io);

    expect(code).toBe(1);
    expect(lastError()).toContain("already exists");
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(existsSync(join(outDir, JSON_NAME))).toBe(false);
  });

  it("refuses a five-word passphrase before the confirmation prompt", async () => {
    const io = fakeIo(FIVE_WORDS, FIVE_WORDS);

    const code = await runEscrowWrite(["backup-key", secretPath, outDir], io);

    expect(code).toBe(1);
    expect(io.promptPassphrase).toHaveBeenCalledTimes(1);
    // Path is built from the temporary directory this test created
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(existsSync(join(outDir, JSON_NAME))).toBe(false);
  });

  it("refuses mismatched passphrase entries and writes nothing", async () => {
    const io = fakeIo(SIX_WORDS, `${SIX_WORDS} extra`);

    const code = await runEscrowWrite(["backup-key", secretPath, outDir], io);

    expect(code).toBe(1);
    expect(lastError()).toContain("do not match");
    // Path is built from the temporary directory this test created
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    expect(existsSync(join(outDir, JSON_NAME))).toBe(false);
  });

  it.each([["org-key"], ["oprf-shares"]])(
    "refuses the %s type",
    async (type) => {
      const io = fakeIo();

      const code = await runEscrowWrite([type, secretPath, outDir], io);

      expect(code).toBe(1);
      expect(lastError()).toContain("own ceremonies");
    },
  );

  it("refuses relative paths", async () => {
    const code = await runEscrowWrite(
      ["backup-key", "restic.password", outDir],
      fakeIo(),
    );

    expect(code).toBe(1);
    expect(lastError()).toContain("absolute paths");
  });

  it.each([
    [["backup-key", "/tmp/a"]],
    [["backup-key", "/tmp/a", "/tmp/b", "/tmp/c"]],
    [["--secret=/tmp/a", "backup-key", "/tmp/a", "/tmp/b"]],
  ])("prints usage for %j", async (argv) => {
    const code = await runEscrowWrite(argv, fakeIo());

    expect(code).toBe(1);
    expect(lastError()).toContain("usage:");
  });

  it("refuses an out-dir that does not exist", async () => {
    const code = await runEscrowWrite(
      ["backup-key", secretPath, join(workDir, "missing")],
      fakeIo(),
    );

    expect(code).toBe(1);
    expect(lastError()).toContain("not an existing directory");
  });

  it("refuses a missing secret file", async () => {
    const code = await runEscrowWrite(
      ["backup-key", join(workDir, "absent"), outDir],
      fakeIo(),
    );

    expect(code).toBe(1);
    expect(lastError()).toContain("not found");
  });

  it("refuses an empty backup-key file", async () => {
    // Path is built from the temporary directory this test created
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    writeFileSync(secretPath, "\n");

    const code = await runEscrowWrite(
      ["backup-key", secretPath, outDir],
      fakeIo(SIX_WORDS, SIX_WORDS),
    );

    expect(code).toBe(1);
    expect(lastError()).toContain("is empty");
  });

  it("refuses an ops-secrets-key file that is not 64 hex characters", async () => {
    const io = fakeIo(SIX_WORDS, SIX_WORDS);

    const code = await runEscrowWrite(
      ["ops-secrets-key", secretPath, outDir],
      io,
    );

    expect(code).toBe(1);
    expect(lastError()).toContain("hex characters");
    expect(io.promptPassphrase).not.toHaveBeenCalled();
  });

  it("rethrows an error that is not an AppError", async () => {
    const io: EscrowWriteIo = {
      promptPassphrase: () => Promise.reject(new TypeError("prompt bug")),
      now: () => FIXED_DATE,
    };

    await expect(
      runEscrowWrite(["backup-key", secretPath, outDir], io),
    ).rejects.toThrow(TypeError);
  });
});
