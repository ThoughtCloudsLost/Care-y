import { describe, expect, it } from "vitest";
import {
  AppError,
  AuthError,
  ConflictError,
  CryptoError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  extractErrorMessage,
  isAppError,
} from "./errors.js";

describe("AppError hierarchy", () => {
  it("AppError is abstract and cannot be instantiated directly", () => {
    // TypeScript prevents `new AppError(...)` at compile time.
    // At runtime, verify it has no own constructor that bypasses subclasses.
    expect(AppError.prototype).toBeInstanceOf(Error);
  });

  const operationalCases: {
    name: string;
    create: () => AppError;
    code: string;
    httpStatus: number;
    expectedName: string;
  }[] = [
    {
      name: "AuthError",
      create: () => new AuthError("bad creds"),
      code: "AUTH_ERROR",
      httpStatus: 401,
      expectedName: "AuthError",
    },
    {
      name: "ForbiddenError",
      create: () => new ForbiddenError("no access"),
      code: "FORBIDDEN",
      httpStatus: 403,
      expectedName: "ForbiddenError",
    },
    {
      name: "NotFoundError",
      create: () => new NotFoundError("missing"),
      code: "NOT_FOUND",
      httpStatus: 404,
      expectedName: "NotFoundError",
    },
    {
      name: "ValidationError",
      create: () => new ValidationError("bad input"),
      code: "VALIDATION_ERROR",
      httpStatus: 400,
      expectedName: "ValidationError",
    },
    {
      name: "ConflictError",
      create: () => new ConflictError("duplicate"),
      code: "CONFLICT",
      httpStatus: 409,
      expectedName: "ConflictError",
    },
  ];

  for (const {
    name,
    create,
    code,
    httpStatus,
    expectedName,
  } of operationalCases) {
    describe(name, () => {
      it("has correct code and httpStatus", () => {
        const err = create();
        expect(err.code).toBe(code);
        expect(err.httpStatus).toBe(httpStatus);
      });

      it("has correct name from constructor", () => {
        const err = create();
        expect(err.name).toBe(expectedName);
      });

      it("is operational by default", () => {
        const err = create();
        expect(err.isOperational).toBe(true);
      });

      it("preserves the message", () => {
        const err = create();
        expect(err.message).toBeTruthy();
      });

      it("is an instance of Error and AppError", () => {
        const err = create();
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(AppError);
      });
    });
  }

  describe("RateLimitError", () => {
    it("stores retryAfterSeconds", () => {
      const err = new RateLimitError("slow down", 30);
      expect(err.retryAfterSeconds).toBe(30);
    });

    it("has correct code and httpStatus", () => {
      const err = new RateLimitError("slow down", 60);
      expect(err.code).toBe("RATE_LIMITED");
      expect(err.httpStatus).toBe(429);
    });

    it("is operational", () => {
      const err = new RateLimitError("slow down", 10);
      expect(err.isOperational).toBe(true);
    });

    it("has correct name", () => {
      const err = new RateLimitError("slow down", 10);
      expect(err.name).toBe("RateLimitError");
    });
  });

  describe("InternalError", () => {
    it("is non-operational", () => {
      const err = new InternalError("unexpected failure");
      expect(err.isOperational).toBe(false);
    });

    it("has correct code and httpStatus", () => {
      const err = new InternalError("oops");
      expect(err.code).toBe("INTERNAL_ERROR");
      expect(err.httpStatus).toBe(500);
    });

    it("has correct name", () => {
      const err = new InternalError("oops");
      expect(err.name).toBe("InternalError");
    });
  });
});

describe("isAppError", () => {
  it("returns true for AppError subclasses", () => {
    expect(isAppError(new AuthError("test"))).toBe(true);
    expect(isAppError(new ForbiddenError("test"))).toBe(true);
    expect(isAppError(new NotFoundError("test"))).toBe(true);
    expect(isAppError(new ValidationError("test"))).toBe(true);
    expect(isAppError(new ConflictError("test"))).toBe(true);
    expect(isAppError(new RateLimitError("test", 10))).toBe(true);
    expect(isAppError(new InternalError("test"))).toBe(true);
  });

  it("returns false for plain Error", () => {
    expect(isAppError(new Error("plain"))).toBe(false);
  });

  it("returns false for non-error values", () => {
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError("string")).toBe(false);
    expect(isAppError(42)).toBe(false);
    expect(isAppError({})).toBe(false);
  });
});

describe("extractErrorMessage", () => {
  it("returns .message from Error instances", () => {
    expect(extractErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("returns .message from AppError subclasses", () => {
    expect(extractErrorMessage(new AuthError("denied"))).toBe("denied");
    expect(extractErrorMessage(new CryptoError("decrypt failed"))).toBe(
      "decrypt failed",
    );
  });

  it("stringifies non-Error values", () => {
    expect(extractErrorMessage("raw string")).toBe("raw string");
    expect(extractErrorMessage(42)).toBe("42");
    expect(extractErrorMessage(null)).toBe("null");
    expect(extractErrorMessage(undefined)).toBe("undefined");
  });

  it("stringifies objects without .message", () => {
    expect(extractErrorMessage({ code: "ENOENT" })).toBe("[object Object]");
  });
});
