/**
 * Unit tests for environment variable validation.
 *
 * Covers: validateEnv (success + failure), getEnv caching,
 * _resetEnvCache, and EnvValidationError formatting.
 *
 * Saves and restores process.env around each test to avoid
 * leaking state between suites.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  validateEnv,
  getEnv,
  _resetEnvCache,
  EnvValidationError,
} from "./env.js";

// Minimum valid env for the schema to pass.
const VALID_ENV = {
  NODE_ENV: "development",
  SESSION_SECRET: "a".repeat(64),
  DATABASE_URL: "postgresql://localhost:5432/test",
  OPS_SECRETS_KEY: "ab".repeat(32),
  CORS_ORIGIN: "http://localhost:5173",
};

describe("env validation", () => {
  let savedEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    savedEnv = { ...process.env };
    _resetEnvCache();
  });

  afterEach(() => {
    // Restore original env vars.
    for (const key of Object.keys(process.env)) {
      if (!(key in savedEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, savedEnv);
    _resetEnvCache();
  });

  // --- validateEnv ---

  describe("validateEnv", () => {
    it("succeeds with all required env vars set", () => {
      Object.assign(process.env, VALID_ENV);
      const env = validateEnv();

      expect(env.NODE_ENV).toBe("development");
      expect(env.SESSION_SECRET).toBe(VALID_ENV.SESSION_SECRET);
      expect(env.DATABASE_URL).toBe(VALID_ENV.DATABASE_URL);
      expect(env.OPS_SECRETS_KEY).toBe(VALID_ENV.OPS_SECRETS_KEY);
      expect(env.CORS_ORIGIN).toBe(VALID_ENV.CORS_ORIGIN);
    });

    it("throws EnvValidationError when NODE_ENV is not set", () => {
      const { NODE_ENV: _, ...rest } = VALID_ENV;
      Object.assign(process.env, rest);
      delete process.env.NODE_ENV;

      expect(() => validateEnv()).toThrow(EnvValidationError);
    });

    it("accepts each valid NODE_ENV value", () => {
      for (const value of ["development", "test", "production"] as const) {
        Object.assign(process.env, VALID_ENV);
        process.env.NODE_ENV = value;

        expect(validateEnv().NODE_ENV).toBe(value);
      }
    });

    it("defaults CORS_ORIGIN when not set", () => {
      const { CORS_ORIGIN: _, ...rest } = VALID_ENV;
      Object.assign(process.env, rest);
      delete process.env.CORS_ORIGIN;

      const env = validateEnv();
      expect(env.CORS_ORIGIN).toBe("http://localhost:5173");
    });

    it("throws EnvValidationError when SESSION_SECRET is missing", () => {
      const { SESSION_SECRET: _, ...rest } = VALID_ENV;
      Object.assign(process.env, rest);
      delete process.env.SESSION_SECRET;

      expect(() => validateEnv()).toThrow(EnvValidationError);
    });

    it("throws EnvValidationError when DATABASE_URL is missing", () => {
      const { DATABASE_URL: _, ...rest } = VALID_ENV;
      Object.assign(process.env, rest);
      delete process.env.DATABASE_URL;

      expect(() => validateEnv()).toThrow(EnvValidationError);
    });

    it("throws EnvValidationError when OPS_SECRETS_KEY is missing", () => {
      const { OPS_SECRETS_KEY: _, ...rest } = VALID_ENV;
      Object.assign(process.env, rest);
      delete process.env.OPS_SECRETS_KEY;

      expect(() => validateEnv()).toThrow(EnvValidationError);
    });

    it("throws when OPS_SECRETS_KEY is not valid hex", () => {
      Object.assign(process.env, VALID_ENV);
      process.env.OPS_SECRETS_KEY = "zz".repeat(32);

      expect(() => validateEnv()).toThrow(EnvValidationError);
    });

    it("throws when OPS_SECRETS_KEY is too short", () => {
      Object.assign(process.env, VALID_ENV);
      process.env.OPS_SECRETS_KEY = "ab".repeat(16); // 32 chars, need 64

      expect(() => validateEnv()).toThrow(EnvValidationError);
    });

    it("throws when SESSION_SECRET is too short", () => {
      Object.assign(process.env, VALID_ENV);
      process.env.SESSION_SECRET = "short";

      expect(() => validateEnv()).toThrow(EnvValidationError);
    });

    it("throws when NODE_ENV is an invalid value", () => {
      Object.assign(process.env, VALID_ENV);
      process.env.NODE_ENV = "staging";

      expect(() => validateEnv()).toThrow(EnvValidationError);
    });

    // --- SMTP env vars ---

    it("succeeds without SMTP vars (all optional)", () => {
      Object.assign(process.env, VALID_ENV);
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_PORT;
      delete process.env.SMTP_FROM;

      const env = validateEnv();
      expect(env.SMTP_HOST).toBeUndefined();
      expect(env.SMTP_PORT).toBeUndefined();
      expect(env.SMTP_FROM).toBe("noreply@care-y.app");
    });

    it("accepts valid SMTP config", () => {
      Object.assign(process.env, VALID_ENV);
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.SMTP_PORT = "587";
      process.env.SMTP_FROM = "noreply@example.com";

      const env = validateEnv();
      expect(env.SMTP_HOST).toBe("smtp.example.com");
      expect(env.SMTP_PORT).toBe(587);
      expect(env.SMTP_FROM).toBe("noreply@example.com");
    });

    it("coerces SMTP_PORT string to number", () => {
      Object.assign(process.env, VALID_ENV);
      process.env.SMTP_HOST = "localhost";
      process.env.SMTP_PORT = "1025";

      const env = validateEnv();
      expect(env.SMTP_PORT).toBe(1025);
      expect(typeof env.SMTP_PORT).toBe("number");
    });

    it("throws when SMTP_PORT is not a positive integer", () => {
      Object.assign(process.env, VALID_ENV);
      process.env.SMTP_HOST = "localhost";
      process.env.SMTP_PORT = "-1";

      expect(() => validateEnv()).toThrow(EnvValidationError);
    });

    it("throws when SMTP_PORT is zero", () => {
      Object.assign(process.env, VALID_ENV);
      process.env.SMTP_HOST = "localhost";
      process.env.SMTP_PORT = "0";

      expect(() => validateEnv()).toThrow(EnvValidationError);
    });

    it("throws when SMTP_PORT is a decimal", () => {
      Object.assign(process.env, VALID_ENV);
      process.env.SMTP_HOST = "localhost";
      process.env.SMTP_PORT = "25.5";

      expect(() => validateEnv()).toThrow(EnvValidationError);
    });

    it("defaults SMTP_FROM when not set", () => {
      Object.assign(process.env, VALID_ENV);
      process.env.SMTP_HOST = "localhost";
      process.env.SMTP_PORT = "1025";
      delete process.env.SMTP_FROM;

      const env = validateEnv();
      expect(env.SMTP_FROM).toBe("noreply@care-y.app");
    });
  });

  // --- getEnv caching ---

  describe("getEnv", () => {
    it("returns the same object on repeated calls (caching)", () => {
      Object.assign(process.env, VALID_ENV);
      const first = getEnv();
      const second = getEnv();

      expect(first).toBe(second);
    });

    it("returns fresh result after _resetEnvCache", () => {
      Object.assign(process.env, VALID_ENV);
      const first = getEnv();

      _resetEnvCache();
      process.env.CORS_ORIGIN = "http://other:4000";
      const second = getEnv();

      expect(first).not.toBe(second);
      expect(second.CORS_ORIGIN).toBe("http://other:4000");
    });
  });

  // --- EnvValidationError ---

  describe("EnvValidationError", () => {
    it("formats issue paths and messages into a readable string", () => {
      const err = new EnvValidationError([
        { path: ["DATABASE_URL"], message: "Required" },
        { path: ["OPS_SECRETS_KEY"], message: "Too short" },
      ]);

      expect(err.message).toContain("Invalid environment variables:");
      expect(err.message).toContain("DATABASE_URL: Required");
      expect(err.message).toContain("OPS_SECRETS_KEY: Too short");
      expect(err.name).toBe("EnvValidationError");
    });

    it("handles empty path as (root)", () => {
      const err = new EnvValidationError([
        { path: [], message: "Something failed" },
      ]);

      expect(err.message).toContain("(root): Something failed");
    });
  });
});
