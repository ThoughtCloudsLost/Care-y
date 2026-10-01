/**
 * Unit tests for the production secrets file loader.
 *
 * Fixtures live in a per-test mkdtemp directory with an explicit chmod.
 * No test reads /etc/care-y/. The injected env object stands in for
 * process.env and is asserted unchanged after every load.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  chmodSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadSecretsFile } from "./secrets-file.js";
import { SecretsFileError } from "../errors.js";
import { _resetEnvCache, getEnv, initEnv, validateEnv } from "../env.js";

const OPS_KEY = "3f".repeat(32);
const OPS_KEY_OLD = "9c".repeat(32);
const TWILIO_SID = `AC${"1".repeat(32)}`;
const TWILIO_TOKEN = "file-twilio-token-value";
const TWILIO_API_KEY_SID = `SK${"2".repeat(32)}`;
const TWILIO_API_KEY_SECRET = "file-twilio-api-key-secret-value";
const SMTP_PASSWORD = "file-smtp-password-value";

const ALL_KEYS_CONTENT = [
  `OPS_SECRETS_KEY=${OPS_KEY}`,
  `OPS_SECRETS_KEY_OLD=${OPS_KEY_OLD}`,
  `TWILIO_MASTER_SID=${TWILIO_SID}`,
  `TWILIO_MASTER_AUTH_TOKEN=${TWILIO_TOKEN}`,
  `TWILIO_API_KEY_SID=${TWILIO_API_KEY_SID}`,
  `TWILIO_API_KEY_SECRET=${TWILIO_API_KEY_SECRET}`,
  "SMTP_HOST=smtp.example.org",
  "SMTP_PORT=587",
  "SMTP_SECURE=true",
  "SMTP_USER=platform-mailer",
  `SMTP_PASSWORD=${SMTP_PASSWORD}`,
  "",
].join("\n");

// Pre-set environment for a production boot, minus anything the file provides.
function baseEnv(): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "production",
    SESSION_SECRET: "a".repeat(64),
    DATABASE_URL: "postgresql://localhost:5432/test",
  };
}

function spyOnConsoleLog() {
  return vi.spyOn(console, "log").mockReturnValue(undefined);
}

describe("loadSecretsFile", () => {
  let dir: string;
  let logSpy: ReturnType<typeof spyOnConsoleLog>;

  function writeFixture(content: string, mode: number): string {
    const path = join(dir, "secrets.env");
    // Path is built from the temporary directory this test created
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    writeFileSync(path, content, "utf-8");
    // chmod after write so the process umask cannot widen or narrow the mode.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    chmodSync(path, mode);
    return path;
  }

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "secrets-file-test-"));
    logSpy = spyOnConsoleLog();
  });

  afterEach(() => {
    logSpy.mockRestore();
    rmSync(dir, { recursive: true, force: true });
    _resetEnvCache();
  });

  describe("merge", () => {
    it("returns every allowlisted key on the source without mutating the injected env", () => {
      const path = writeFixture(ALL_KEYS_CONTENT, 0o600);
      const env = baseEnv();
      const before = { ...env };

      const { source, report } = loadSecretsFile({
        path,
        env,
        nodeEnv: "production",
      });

      expect(source.OPS_SECRETS_KEY).toBe(OPS_KEY);
      expect(source.OPS_SECRETS_KEY_OLD).toBe(OPS_KEY_OLD);
      expect(source.TWILIO_MASTER_SID).toBe(TWILIO_SID);
      expect(source.TWILIO_MASTER_AUTH_TOKEN).toBe(TWILIO_TOKEN);
      expect(source.TWILIO_API_KEY_SID).toBe(TWILIO_API_KEY_SID);
      expect(source.TWILIO_API_KEY_SECRET).toBe(TWILIO_API_KEY_SECRET);
      expect(source.SMTP_HOST).toBe("smtp.example.org");
      expect(source.SMTP_PORT).toBe("587");
      expect(source.SMTP_SECURE).toBe("true");
      expect(source.SMTP_USER).toBe("platform-mailer");
      expect(source.SMTP_PASSWORD).toBe(SMTP_PASSWORD);
      // Pre-set values carry through.
      expect(source.DATABASE_URL).toBe(before.DATABASE_URL);

      expect(env).toEqual(before);
      expect(source).not.toBe(env);
      expect(report.loadedKeys).toEqual([
        "OPS_SECRETS_KEY",
        "OPS_SECRETS_KEY_OLD",
        "TWILIO_MASTER_SID",
        "TWILIO_MASTER_AUTH_TOKEN",
        "TWILIO_API_KEY_SID",
        "TWILIO_API_KEY_SECRET",
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_SECURE",
        "SMTP_USER",
        "SMTP_PASSWORD",
      ]);
      expect(report.ignoredKeys).toEqual([]);
    });

    it("never assigns file values to process.env", () => {
      const path = writeFixture(ALL_KEYS_CONTENT, 0o600);
      const processEnvBefore = { ...process.env };

      loadSecretsFile({ path, env: baseEnv(), nodeEnv: "production" });

      expect(process.env).toEqual(processEnvBefore);
    });

    it("produces a source validateEnv accepts with the 64-hex ops key", () => {
      const path = writeFixture(`OPS_SECRETS_KEY=${OPS_KEY}\n`, 0o600);

      const { source } = loadSecretsFile({
        path,
        env: baseEnv(),
        nodeEnv: "production",
      });
      const validated = validateEnv(source);

      expect(validated.OPS_SECRETS_KEY).toBe(OPS_KEY);
      expect(validated.OPS_SECRETS_KEY).toMatch(/^[0-9a-f]{64}$/);
      expect(validated.NODE_ENV).toBe("production");
    });

    it("exposes the file-provided ops key through getEnv after initEnv(source)", () => {
      const path = writeFixture(`OPS_SECRETS_KEY=${OPS_KEY}\n`, 0o600);
      const processEnvBefore = { ...process.env };

      const { source } = loadSecretsFile({
        path,
        env: baseEnv(),
        nodeEnv: "production",
      });
      initEnv(source);

      expect(getEnv().OPS_SECRETS_KEY).toBe(OPS_KEY);
      expect(process.env).toEqual(processEnvBefore);
    });

    it("logs loaded and ignored key names without any value", () => {
      const path = writeFixture(
        `OPS_SECRETS_KEY=${OPS_KEY}\nSMTP_PASSWORD=${SMTP_PASSWORD}\nFOO=bar-value\n`,
        0o600,
      );

      loadSecretsFile({ path, env: baseEnv(), nodeEnv: "production" });

      expect(logSpy).toHaveBeenCalledTimes(1);
      const line = String(logSpy.mock.calls[0]?.[0]);
      expect(line).toBe(
        "secrets file: loaded OPS_SECRETS_KEY, SMTP_PASSWORD; ignored FOO",
      );
      expect(line).not.toContain(OPS_KEY);
      expect(line).not.toContain(SMTP_PASSWORD);
      expect(line).not.toContain("bar-value");
    });
  });

  describe("symlink", () => {
    it("refuses a symlink to a 0600 file", () => {
      const target = writeFixture(`OPS_SECRETS_KEY=${OPS_KEY}\n`, 0o600);
      const link = join(dir, "linked-secrets.env");
      // Paths are built from the temporary directory this test created
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      symlinkSync(target, link);

      expect(() =>
        loadSecretsFile({ path: link, env: baseEnv(), nodeEnv: "production" }),
      ).toThrow(SecretsFileError);
    });
  });

  describe("conflict", () => {
    it("throws naming the key and neither value when a file key is pre-set", () => {
      const path = writeFixture(`OPS_SECRETS_KEY=${OPS_KEY}\n`, 0o600);
      const envValue = "e4".repeat(32);
      const env = { ...baseEnv(), OPS_SECRETS_KEY: envValue };

      let caught: unknown;
      try {
        loadSecretsFile({ path, env, nodeEnv: "production" });
      } catch (err: unknown) {
        caught = err;
      }

      expect(caught).toBeInstanceOf(SecretsFileError);
      const message = caught instanceof Error ? caught.message : "";
      expect(message).toContain("OPS_SECRETS_KEY");
      expect(message).not.toContain(OPS_KEY);
      expect(message).not.toContain(envValue);
    });

    it("leaves the injected env unchanged when it throws", () => {
      const path = writeFixture(`SMTP_PASSWORD=${SMTP_PASSWORD}\n`, 0o600);
      const env = { ...baseEnv(), SMTP_PASSWORD: "env-password-value" };
      const before = { ...env };

      expect(() =>
        loadSecretsFile({ path, env, nodeEnv: "production" }),
      ).toThrow(SecretsFileError);
      expect(env).toEqual(before);
    });
  });

  describe("permissions", () => {
    it.each([0o644, 0o660, 0o640, 0o604])("refuses mode %o", (mode) => {
      const path = writeFixture(`OPS_SECRETS_KEY=${OPS_KEY}\n`, mode);

      expect(() =>
        loadSecretsFile({ path, env: baseEnv(), nodeEnv: "production" }),
      ).toThrow(SecretsFileError);
    });

    it("loads a 0600 file", () => {
      const path = writeFixture(`OPS_SECRETS_KEY=${OPS_KEY}\n`, 0o600);

      const { source } = loadSecretsFile({
        path,
        env: baseEnv(),
        nodeEnv: "production",
      });

      expect(source.OPS_SECRETS_KEY).toBe(OPS_KEY);
    });

    it("does not put the file content in the mode error", () => {
      const path = writeFixture(`OPS_SECRETS_KEY=${OPS_KEY}\n`, 0o644);

      let caught: unknown;
      try {
        loadSecretsFile({ path, env: baseEnv(), nodeEnv: "production" });
      } catch (err: unknown) {
        caught = err;
      }

      expect(caught).toBeInstanceOf(SecretsFileError);
      const message = caught instanceof Error ? caught.message : "";
      expect(message).toContain("644");
      expect(message).not.toContain(OPS_KEY);
    });
  });

  describe("missing file and non-production", () => {
    it("throws in production when the file is missing", () => {
      const path = join(dir, "does-not-exist.env");

      expect(() =>
        loadSecretsFile({ path, env: baseEnv(), nodeEnv: "production" }),
      ).toThrow(SecretsFileError);
    });

    it.each(["development", "test"])(
      "is a no-op in %s and returns the env untouched",
      (nodeEnv) => {
        const path = join(dir, "does-not-exist.env");
        const env = { ...baseEnv(), NODE_ENV: nodeEnv };
        const before = { ...env };

        const { source, report } = loadSecretsFile({ path, env, nodeEnv });

        expect(source).toBe(env);
        expect(env).toEqual(before);
        expect(report.loadedKeys).toEqual([]);
        expect(report.ignoredKeys).toEqual([]);
        expect(logSpy).not.toHaveBeenCalled();
      },
    );

    it("does not read the file outside production even when it is readable", () => {
      // A loose-mode file would throw in production; outside it, nothing is opened.
      const path = writeFixture(`OPS_SECRETS_KEY=${OPS_KEY}\n`, 0o644);
      const env = { ...baseEnv(), NODE_ENV: "development" };

      const { source } = loadSecretsFile({ path, env, nodeEnv: "development" });

      expect(source).toBe(env);
      expect(source.OPS_SECRETS_KEY).toBeUndefined();
    });
  });

  describe("parser", () => {
    it("skips comments and blank lines and splits at the first =", () => {
      const path = writeFixture(
        [
          "# CARE-Y operational secrets.",
          "",
          "   ",
          `OPS_SECRETS_KEY=${OPS_KEY}`,
          "  # indented comment",
          "# SMTP_HOST=commented.example.org",
          "SMTP_PASSWORD=pa=ss=word",
          "",
        ].join("\n"),
        0o600,
      );

      const { source, report } = loadSecretsFile({
        path,
        env: baseEnv(),
        nodeEnv: "production",
      });

      expect(source.OPS_SECRETS_KEY).toBe(OPS_KEY);
      expect(source.SMTP_PASSWORD).toBe("pa=ss=word");
      expect(source.SMTP_HOST).toBeUndefined();
      expect(report.loadedKeys).toEqual(["OPS_SECRETS_KEY", "SMTP_PASSWORD"]);
    });

    it("normalizes CRLF line endings", () => {
      const path = writeFixture(
        `OPS_SECRETS_KEY=${OPS_KEY}\r\nSMTP_USER=platform-mailer\r\n`,
        0o600,
      );

      const { source } = loadSecretsFile({
        path,
        env: baseEnv(),
        nodeEnv: "production",
      });

      expect(source.OPS_SECRETS_KEY).toBe(OPS_KEY);
      expect(source.SMTP_USER).toBe("platform-mailer");
    });

    it("ignores unknown keys but reports their names", () => {
      const path = writeFixture(
        `OPS_SECRETS_KEY=${OPS_KEY}\nOPS_SECRET_KEY=typo-value\nSMTP_FROM=noreply@example.org\n`,
        0o600,
      );

      const { source, report } = loadSecretsFile({
        path,
        env: baseEnv(),
        nodeEnv: "production",
      });

      expect(source.OPS_SECRET_KEY).toBeUndefined();
      expect(source.SMTP_FROM).toBeUndefined();
      expect(report.loadedKeys).toEqual(["OPS_SECRETS_KEY"]);
      expect(report.ignoredKeys).toEqual(["OPS_SECRET_KEY", "SMTP_FROM"]);
    });

    it("throws on a line that is not KEY=VALUE, naming the line number only", () => {
      const strayValue = "stray-secret-looking-line";
      const path = writeFixture(
        `OPS_SECRETS_KEY=${OPS_KEY}\n${strayValue}\n`,
        0o600,
      );

      let caught: unknown;
      try {
        loadSecretsFile({ path, env: baseEnv(), nodeEnv: "production" });
      } catch (err: unknown) {
        caught = err;
      }

      expect(caught).toBeInstanceOf(SecretsFileError);
      const message = caught instanceof Error ? caught.message : "";
      expect(message).toContain("line 2");
      expect(message).not.toContain(strayValue);
      expect(message).not.toContain(OPS_KEY);
    });

    it("throws on a line with an empty key", () => {
      const path = writeFixture(`=${OPS_KEY}\n`, 0o600);

      expect(() =>
        loadSecretsFile({ path, env: baseEnv(), nodeEnv: "production" }),
      ).toThrow(SecretsFileError);
    });
  });

  describe("DATABASE_URL", () => {
    const FILE_DB_URL =
      "postgresql://carey:test-file-db-password@db:5432/carey";

    // Production boot where the URL lives only in the secrets file.
    function envWithoutDatabaseUrl(): NodeJS.ProcessEnv {
      const env = baseEnv();
      delete env.DATABASE_URL;
      return env;
    }

    it("loads DATABASE_URL from the file and validateEnv accepts it", () => {
      const path = writeFixture(
        `OPS_SECRETS_KEY=${OPS_KEY}\nDATABASE_URL=${FILE_DB_URL}\n`,
        0o600,
      );
      const env = envWithoutDatabaseUrl();
      const before = { ...env };

      const { source, report } = loadSecretsFile({
        path,
        env,
        nodeEnv: "production",
      });

      expect(source.DATABASE_URL).toBe(FILE_DB_URL);
      expect(validateEnv(source).DATABASE_URL).toBe(FILE_DB_URL);
      expect(report.loadedKeys).toEqual(["OPS_SECRETS_KEY", "DATABASE_URL"]);
      expect(report.ignoredKeys).toEqual([]);
      expect(env).toEqual(before);
    });

    it("throws naming DATABASE_URL and neither value when it is also pre-set", () => {
      const path = writeFixture(`DATABASE_URL=${FILE_DB_URL}\n`, 0o600);
      const envValue =
        "postgresql://carey:test-env-db-password@localhost:5432/carey";
      const env = { ...baseEnv(), DATABASE_URL: envValue };

      let caught: unknown;
      try {
        loadSecretsFile({ path, env, nodeEnv: "production" });
      } catch (err: unknown) {
        caught = err;
      }

      expect(caught).toBeInstanceOf(SecretsFileError);
      const message = caught instanceof Error ? caught.message : "";
      expect(message).toContain("DATABASE_URL");
      expect(message).not.toContain(FILE_DB_URL);
      expect(message).not.toContain(envValue);
    });
  });
});
