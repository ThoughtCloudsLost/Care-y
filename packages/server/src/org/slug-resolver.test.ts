/**
 * Tests for org slug extraction from a request.
 *
 * The production cases pin the dev fallback off: outside development and
 * test the x-org-slug header is never read, so a request cannot choose an
 * org by header against a live host. The non-production case shows the header
 * path exists, which is what makes the production cases meaningful.
 */

import { IncomingMessage } from "node:http";
import { Socket } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { _resetEnvCache, initEnv } from "../env.js";
import { extractOrgSlug } from "./slug-resolver.js";

function envSource(nodeEnv: "production" | "test"): NodeJS.ProcessEnv {
  return {
    NODE_ENV: nodeEnv,
    SESSION_SECRET: "a".repeat(64),
    DATABASE_URL: "postgresql://localhost:5432/test",
    OPS_SECRETS_KEY: "ab".repeat(32),
  };
}

function requestWith(headers: IncomingMessage["headers"]): IncomingMessage {
  const req = new IncomingMessage(new Socket());
  req.headers = headers;
  return req;
}

describe("extractOrgSlug", () => {
  afterEach(() => {
    _resetEnvCache();
  });

  describe("in production", () => {
    beforeEach(() => {
      initEnv(envSource("production"));
    });

    it("ignores the x-org-slug header and resolves the Host subdomain", () => {
      const req = requestWith({
        host: "acme.example.org",
        "x-org-slug": "other-org",
      });

      expect(extractOrgSlug(req)).toBe("acme");
    });

    it("returns null on the apex host even when the header names an org", () => {
      const req = requestWith({
        host: "example.org",
        "x-org-slug": "other-org",
      });

      expect(extractOrgSlug(req)).toBeNull();
    });
  });

  describe("outside production", () => {
    beforeEach(() => {
      initEnv(envSource("test"));
    });

    it("reads the x-org-slug header ahead of the Host subdomain", () => {
      const req = requestWith({
        host: "acme.example.org",
        "x-org-slug": "other-org",
      });

      expect(extractOrgSlug(req)).toBe("other-org");
    });
  });
});
