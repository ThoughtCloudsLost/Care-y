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
} from "./errors.js";
import { OrgKeyNotLoadedError } from "./crypto/org-key.js";

const cases = [
  {
    name: "ClientError",
    create: () => new ClientError("base error"),
    expectedName: "ClientError",
    expectedMessage: "base error",
    isClientError: true,
  },
  {
    name: "WebauthnError",
    create: () => new WebauthnError("credential rejected"),
    expectedName: "WebauthnError",
    expectedMessage: "credential rejected",
    isClientError: true,
  },
  {
    name: "CryptoWorkerTestError",
    create: () => new CryptoWorkerTestError("handler missing"),
    expectedName: "CryptoWorkerTestError",
    expectedMessage: "handler missing",
    isClientError: true,
  },
  {
    name: "WorkerNotReadyError",
    create: () => new WorkerNotReadyError(),
    expectedName: "WorkerNotReadyError",
    expectedMessage:
      "Crypto worker is not ready. Please wait for initialization.",
    isClientError: true,
  },
  {
    name: "OrgKeyNotLoadedError",
    create: () => new OrgKeyNotLoadedError(),
    expectedName: "OrgKeyNotLoadedError",
    expectedMessage: "Org encryption key not loaded. Please log in again.",
    isClientError: false, // extends Error directly, not ClientError
  },
] as const;

describe("Client error hierarchy", () => {
  for (const {
    name,
    create,
    expectedName,
    expectedMessage,
    isClientError,
  } of cases) {
    describe(name, () => {
      it("has correct name property", () => {
        const err = create();
        expect(err.name).toBe(expectedName);
      });

      it("has correct message", () => {
        const err = create();
        expect(err.message).toBe(expectedMessage);
      });

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
});
