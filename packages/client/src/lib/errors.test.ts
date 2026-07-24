/**
 * Tests for client-side error type hierarchy.
 *
 * Uses data-driven parameterized testing per testing-reference.md Section 9.
 * Each error class is verified for name, instanceof chain, and message.
 */

import { describe, it, expect } from "vitest";
import {
  ClientError,
  WebauthnError,
  CryptoWorkerTestError,
  WorkerNotReadyError,
  TelephonyError,
  RouterNotAvailableError,
  RelayError,
  RateLimitError,
  BrandingError,
  requireRouter,
} from "./errors.js";
import { OrgKeyNotLoadedError } from "./crypto/org-key.js";

const cases = [
  {
    name: "ClientError",
    create: () => new ClientError("base error"),
    expectedName: "ClientError",
    expectedMessage: "base error",
    assertMessage: true,
    isClientError: true,
  },
  {
    name: "WebauthnError",
    create: () => new WebauthnError("credential rejected"),
    expectedName: "WebauthnError",
    expectedMessage: "credential rejected",
    assertMessage: true,
    isClientError: true,
  },
  {
    name: "CryptoWorkerTestError",
    create: () => new CryptoWorkerTestError("handler missing"),
    expectedName: "CryptoWorkerTestError",
    expectedMessage: "handler missing",
    assertMessage: true,
    isClientError: true,
  },
  {
    name: "WorkerNotReadyError",
    create: () => new WorkerNotReadyError(),
    expectedName: "WorkerNotReadyError",
    expectedMessage: "",
    assertMessage: false, // dev-console only, not rendered in UI
    isClientError: true,
  },
  {
    name: "TelephonyError",
    create: () => new TelephonyError("device not registered"),
    expectedName: "TelephonyError",
    expectedMessage: "device not registered",
    assertMessage: true,
    isClientError: true,
  },
  {
    name: "RouterNotAvailableError",
    create: () => new RouterNotAvailableError("tickets"),
    expectedName: "RouterNotAvailableError",
    expectedMessage: "tickets router unavailable",
    assertMessage: true,
    isClientError: true,
  },
  {
    name: "RelayError",
    create: () => new RelayError("TIMEOUT", 504),
    expectedName: "RelayError",
    expectedMessage: "Relay error: TIMEOUT (504)",
    assertMessage: true,
    isClientError: true,
  },
  {
    name: "RateLimitError",
    create: () => new RateLimitError(30),
    expectedName: "RateLimitError",
    expectedMessage: "Rate limited. Retry after 30s",
    assertMessage: true,
    isClientError: true,
  },
  {
    name: "BrandingError",
    create: () => new BrandingError("image too large"),
    expectedName: "BrandingError",
    expectedMessage: "image too large",
    assertMessage: true,
    isClientError: true,
  },
  {
    name: "OrgKeyNotLoadedError",
    create: () => new OrgKeyNotLoadedError(),
    expectedName: "OrgKeyNotLoadedError",
    expectedMessage: "",
    assertMessage: false, // dev-console only, not rendered in UI
    isClientError: false, // extends Error directly, not ClientError
  },
] as const;

describe("Client error hierarchy", () => {
  for (const {
    name,
    create,
    expectedName,
    expectedMessage,
    assertMessage,
    isClientError,
  } of cases) {
    describe(name, () => {
      it("has correct name property", () => {
        const err = create();
        expect(err.name).toBe(expectedName);
      });

      if (assertMessage) {
        it("has correct message", () => {
          const err = create();
          expect(err.message).toBe(expectedMessage);
        });
      }

      it("is an instance of Error", () => {
        const err = create();
        expect(err).toBeInstanceOf(Error);
      });

      if (isClientError) {
        it("is an instance of ClientError", () => {
          const err = create();
          expect(err).toBeInstanceOf(ClientError);
        });
      }
    });
  }

  describe("RelayError extra fields", () => {
    it("exposes code and status", () => {
      const err = new RelayError("GATEWAY_ERROR", 502);
      expect(err.code).toBe("GATEWAY_ERROR");
      expect(err.status).toBe(502);
    });
  });

  describe("RateLimitError extra fields", () => {
    it("exposes retryAfterSeconds", () => {
      const err = new RateLimitError(60);
      expect(err.retryAfterSeconds).toBe(60);
    });

    it("formats message with the retry delay", () => {
      const err = new RateLimitError(0);
      expect(err.message).toBe("Rate limited. Retry after 0s");
    });
  });

  describe("requireRouter", () => {
    it("throws RouterNotAvailableError for null", () => {
      expect(() => requireRouter(null, "auth")).toThrow(
        RouterNotAvailableError,
      );
    });

    it("throws RouterNotAvailableError for undefined", () => {
      expect(() => requireRouter(undefined, "auth")).toThrow(
        RouterNotAvailableError,
      );
    });

    it("returns the router when it is a valid object", () => {
      const router = { query: () => "result" };
      const result = requireRouter(router, "tickets");
      expect(result).toBe(router);
    });

    it("includes the router name in the error message", () => {
      expect(() => requireRouter(null, "telephony")).toThrow(
        "telephony router unavailable",
      );
    });
  });
});
