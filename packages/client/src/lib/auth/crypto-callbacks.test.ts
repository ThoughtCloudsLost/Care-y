import { describe, it, expect, vi, afterEach } from "vitest";
import type * as AnnounceModule from "$lib/utils/announce.js";
import type * as PowSolverModule from "$lib/auth/pow-solver.js";

// vi.mock required: announceToLiveRegion accesses document.getElementById
// at call time, which does not exist in node test environment.
vi.mock("$lib/utils/announce.js", async (importOriginal) => ({
  ...(await importOriginal<typeof AnnounceModule>()),
  announceToLiveRegion: vi.fn(),
}));

// vi.mock required: solveProofOfWork uses crypto.subtle.digest in an
// infinite brute-force loop; cannot run meaningfully in node tests.
vi.mock("$lib/auth/pow-solver.js", async (importOriginal) => ({
  ...(await importOriginal<typeof PowSolverModule>()),
  solveProofOfWork: vi.fn(),
}));

import {
  buildRegisterCallbacks,
  buildLoginCallbacks,
} from "./crypto-callbacks.js";
import { announceToLiveRegion } from "$lib/utils/announce.js";
import { solveProofOfWork } from "$lib/auth/pow-solver.js";

const mockAnnounce = vi.mocked(announceToLiveRegion);
const mockSolvePow = vi.mocked(solveProofOfWork);

describe("buildRegisterCallbacks", () => {
  afterEach(() => {
    // clearAllMocks, not restoreAllMocks: the module mocks above are vi.fn()
    // instances, and restoreAllMocks only touches vi.spyOn spies since Vitest 3,
    // so call history would leak into the not-called assertions below.
    vi.clearAllMocks();
  });

  it("onArgon2idStart sets phase to argon2id", () => {
    const setPhase = vi.fn();
    const cbs = buildRegisterCallbacks(setPhase);

    cbs.onArgon2idStart();

    expect(setPhase).toHaveBeenCalledWith("argon2id");
  });

  it("onOprfStart sets phase to oprf", () => {
    const setPhase = vi.fn();
    const cbs = buildRegisterCallbacks(setPhase);

    cbs.onOprfStart();

    expect(setPhase).toHaveBeenCalledWith("oprf");
  });

  it("onDeriveStart sets phase to derive", () => {
    const setPhase = vi.fn();
    const cbs = buildRegisterCallbacks(setPhase);

    cbs.onDeriveStart();

    expect(setPhase).toHaveBeenCalledWith("derive");
  });

  it("announces argon2id and derive messages when provided", () => {
    const setPhase = vi.fn();
    const cbs = buildRegisterCallbacks(setPhase, {
      argon2id: "Strengthening password",
      derive: "Generating keys",
    });

    cbs.onArgon2idStart();
    cbs.onDeriveStart();

    expect(mockAnnounce).toHaveBeenCalledWith(
      "polite",
      "Strengthening password",
    );
    expect(mockAnnounce).toHaveBeenCalledWith("polite", "Generating keys");
  });

  it("does not announce when messages are omitted (default parameter)", () => {
    const setPhase = vi.fn();
    const cbs = buildRegisterCallbacks(setPhase);

    cbs.onArgon2idStart();
    cbs.onDeriveStart();

    expect(mockAnnounce).not.toHaveBeenCalled();
  });

  it("noop callbacks do not throw", () => {
    const setPhase = vi.fn();
    const cbs = buildRegisterCallbacks(setPhase);

    expect(() => {
      cbs.onArgon2idDone();
      cbs.onOprfDone();
      cbs.onDone();
      cbs.onUploadStart();
    }).not.toThrow();
  });
});

describe("buildLoginCallbacks", () => {
  afterEach(() => {
    // clearAllMocks, not restoreAllMocks: the module mocks above are vi.fn()
    // instances, and restoreAllMocks only touches vi.spyOn spies since Vitest 3,
    // so call history would leak into the not-called assertions below.
    vi.clearAllMocks();
  });

  it("onArgon2idStart sets phase to argon2id", () => {
    const setPhase = vi.fn();
    const cbs = buildLoginCallbacks(setPhase);

    cbs.onArgon2idStart();

    expect(setPhase).toHaveBeenCalledWith("argon2id");
  });

  it("onOprfStart sets phase to oprf", () => {
    const setPhase = vi.fn();
    const cbs = buildLoginCallbacks(setPhase);

    cbs.onOprfStart();

    expect(setPhase).toHaveBeenCalledWith("oprf");
  });

  it("onDeriveStart sets phase to derive", () => {
    const setPhase = vi.fn();
    const cbs = buildLoginCallbacks(setPhase);

    cbs.onDeriveStart();

    expect(setPhase).toHaveBeenCalledWith("derive");
  });

  it("announces argon2id and derive messages when provided", () => {
    const setPhase = vi.fn();
    const cbs = buildLoginCallbacks(setPhase, {
      argon2id: "Strengthening password",
      derive: "Generating keys",
    });

    cbs.onArgon2idStart();
    cbs.onDeriveStart();

    expect(mockAnnounce).toHaveBeenCalledWith(
      "polite",
      "Strengthening password",
    );
    expect(mockAnnounce).toHaveBeenCalledWith("polite", "Generating keys");
  });

  it("does not announce when messages are omitted", () => {
    const setPhase = vi.fn();
    const cbs = buildLoginCallbacks(setPhase);

    cbs.onArgon2idStart();
    cbs.onDeriveStart();

    expect(mockAnnounce).not.toHaveBeenCalled();
  });

  it("onPowRequired sets phase to pow and delegates to solveProofOfWork", async () => {
    const setPhase = vi.fn();
    mockSolvePow.mockResolvedValue("deadbeef");
    const cbs = buildLoginCallbacks(setPhase, { pow: "Verifying" });

    const result = await cbs.onPowRequired("challenge-xyz", 16);

    expect(setPhase).toHaveBeenCalledWith("pow");
    expect(mockAnnounce).toHaveBeenCalledWith("polite", "Verifying");
    expect(mockSolvePow).toHaveBeenCalledWith("challenge-xyz", 16);
    expect(result).toBe("deadbeef");
  });

  it("onPowRequired works without pow message", async () => {
    const setPhase = vi.fn();
    mockSolvePow.mockResolvedValue("0f0f");
    const cbs = buildLoginCallbacks(setPhase);

    await cbs.onPowRequired("ch", 8);

    expect(setPhase).toHaveBeenCalledWith("pow");
    expect(mockAnnounce).not.toHaveBeenCalled();
    expect(mockSolvePow).toHaveBeenCalledWith("ch", 8);
  });

  it("noop callbacks do not throw", () => {
    const setPhase = vi.fn();
    const cbs = buildLoginCallbacks(setPhase);

    expect(() => {
      cbs.onArgon2idDone();
      cbs.onOprfDone();
      cbs.onDone();
    }).not.toThrow();
  });
});
