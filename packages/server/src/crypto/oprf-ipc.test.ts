import { describe, it, expect, beforeAll } from "vitest";
import { createServer } from "node:net";
import { existsSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  getSodium,
  oprfBlind,
  oprfFinalize,
  deriveTaggedShare,
  type SodiumBackend,
  type EvaluatedElement,
} from "@care-y/crypto";
import { blindEvaluate } from "./oprf-server.js";
import { createMockEvaluator, createIpcEvaluator } from "./oprf-ipc.js";
import { OprfError } from "../errors.js";
import {
  DOCKER_OPRF_AVAILABLE,
  DOCKER_SOCKET_A,
  DOCKER_SOCKET_B,
} from "../test-utils.js";

const IS_LINUX = process.platform === "linux";
const LENGTH_PREFIX_BYTES = 4;
const POINT_BYTES = 32;

let sodium: SodiumBackend;

beforeAll(async () => {
  sodium = await getSodium();
});

/**
 * Generate 2-of-2 Shamir shares of a ristretto255 scalar.
 * Polynomial f(x) = k + a*x where k is the secret, a is random.
 * shareA = f(1) = k + a, shareB = f(2) = k + 2a
 */
function shamirSplit(key: Uint8Array): {
  shareA: Uint8Array;
  shareB: Uint8Array;
} {
  const a = sodium.crypto_core_ristretto255_scalar_random();

  // shareA = k + a
  const shareA = sodium.crypto_core_ristretto255_scalar_add(key, a);

  // shareB = k + 2a
  const twoA = sodium.crypto_core_ristretto255_scalar_add(a, a);
  const shareB = sodium.crypto_core_ristretto255_scalar_add(key, twoA);

  return { shareA, shareB };
}

/**
 * The combined tagged key is defined by the Lagrange combination of the
 * tagged shares (2*kA(tag) - kB(tag)), NOT by tagging the full key:
 * HKDF is nonlinear, so deriveTaggedShare(fullKey, tag) is a different
 * scalar by design (ADR-091).
 */
function combinedTaggedKey(
  shareA: Uint8Array,
  shareB: Uint8Array,
  tag: string,
): Uint8Array {
  const kATagged = deriveTaggedShare(shareA, tag);
  const kBTagged = deriveTaggedShare(shareB, tag);
  const twoKA = sodium.crypto_core_ristretto255_scalar_add(kATagged, kATagged);
  return sodium.crypto_core_ristretto255_scalar_sub(twoKA, kBTagged);
}

describe("createMockEvaluator (two-share, tagged)", () => {
  it("combines tagged partials correctly for a volunteer tag", async () => {
    const fullKey = sodium.crypto_core_ristretto255_scalar_random();
    const { shareA, shareB } = shamirSplit(fullKey);
    const evaluator = createMockEvaluator(shareA, shareB);
    const tag = "volunteer:mock-eval-test";

    const point = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );

    const result = await evaluator.evaluate(point, tag);

    // Verify against the true combined tagged scalar
    const derivedKey = combinedTaggedKey(shareA, shareB, tag);
    const directResult = blindEvaluate(derivedKey, point);

    expect(Buffer.from(result).equals(Buffer.from(directResult))).toBe(true);
  });

  it("produces different results for different tags", async () => {
    const fullKey = sodium.crypto_core_ristretto255_scalar_random();
    const { shareA, shareB } = shamirSplit(fullKey);
    const evaluator = createMockEvaluator(shareA, shareB);

    const point = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );

    const result1 = await evaluator.evaluate(point, "account:acct-1");
    const result2 = await evaluator.evaluate(point, "account:acct-2");

    expect(Buffer.from(result1).equals(Buffer.from(result2))).toBe(false);
  });

  it("produces consistent results for the same tag", async () => {
    const fullKey = sodium.crypto_core_ristretto255_scalar_random();
    const { shareA, shareB } = shamirSplit(fullKey);
    const evaluator = createMockEvaluator(shareA, shareB);
    const tag = "volunteer:consistency-test";

    const point = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );

    const result1 = await evaluator.evaluate(point, tag);
    const result2 = await evaluator.evaluate(point, tag);

    expect(Buffer.from(result1).equals(Buffer.from(result2))).toBe(true);
  });

  it("works end-to-end with oprfBlind and oprfFinalize", async () => {
    const fullKey = sodium.crypto_core_ristretto255_scalar_random();
    const { shareA, shareB } = shamirSplit(fullKey);
    const evaluator = createMockEvaluator(shareA, shareB);
    const tag = "volunteer:e2e-finalize";

    const input = new TextEncoder().encode("mock-evaluator-e2e-tagged");
    const { blindedElement, blindState } = oprfBlind(input);

    const evaluated = await evaluator.evaluate(blindedElement, tag);
    const output = oprfFinalize(
      blindState,
      evaluated as EvaluatedElement,
      input,
    );

    expect(output.length).toBe(64);
  });

  it("mock and direct tagged evaluation agree", async () => {
    const fullKey = sodium.crypto_core_ristretto255_scalar_random();
    const { shareA, shareB } = shamirSplit(fullKey);
    const evaluator = createMockEvaluator(shareA, shareB);
    const tag = "channel:org-uuid:channel-id";

    const input = new TextEncoder().encode("mock-vs-direct-tagged");
    const { blindedElement } = oprfBlind(input);

    // Mock evaluator path
    const mockResult = await evaluator.evaluate(blindedElement, tag);

    // Direct tagged evaluation path: the true combined tagged scalar
    const derivedFullKey = combinedTaggedKey(shareA, shareB, tag);
    const directResult = blindEvaluate(derivedFullKey, blindedElement);

    // Both should produce the same evaluated element
    expect(Buffer.from(mockResult).equals(Buffer.from(directResult))).toBe(
      true,
    );

    // A second blind round should agree with the direct evaluation too
    const { blindedElement: blindedElement2 } = oprfBlind(input);
    const mockResult2 = await evaluator.evaluate(blindedElement2, tag);
    const directResult2 = blindEvaluate(derivedFullKey, blindedElement2);
    expect(Buffer.from(mockResult2).equals(Buffer.from(directResult2))).toBe(
      true,
    );
  });

  it("close is callable without error", () => {
    const fullKey = sodium.crypto_core_ristretto255_scalar_random();
    const { shareA, shareB } = shamirSplit(fullKey);
    const evaluator = createMockEvaluator(shareA, shareB);

    expect(() => {
      evaluator.close();
    }).not.toThrow();
  });
});

describe.skipIf(!DOCKER_OPRF_AVAILABLE)(
  "createIpcEvaluator (Docker OPRF containers)",
  () => {
    it("evaluates a blinded element via Docker OPRF processes with tag", async () => {
      const evaluator = createIpcEvaluator({
        socketPathA: DOCKER_SOCKET_A,
        socketPathB: DOCKER_SOCKET_B,
      });

      const input = new TextEncoder().encode("docker-ipc-threshold-tagged");
      const { blindedElement } = oprfBlind(input);

      const result = await evaluator.evaluate(
        blindedElement,
        "volunteer:docker-test",
      );

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(POINT_BYTES);
      evaluator.close();
    });

    it("produces deterministic results for the same input and tag", async () => {
      const evaluator = createIpcEvaluator({
        socketPathA: DOCKER_SOCKET_A,
        socketPathB: DOCKER_SOCKET_B,
      });

      const input = new TextEncoder().encode("docker-determinism-tagged");
      const { blindedElement } = oprfBlind(input);
      const tag = "account:docker-determinism";

      const result1 = await evaluator.evaluate(blindedElement, tag);
      const result2 = await evaluator.evaluate(blindedElement, tag);

      expect(Buffer.from(result1).equals(Buffer.from(result2))).toBe(true);
      evaluator.close();
    });

    it("produces different results for different tags", async () => {
      const evaluator = createIpcEvaluator({
        socketPathA: DOCKER_SOCKET_A,
        socketPathB: DOCKER_SOCKET_B,
      });

      const input = new TextEncoder().encode("docker-distinct-tags");
      const { blindedElement } = oprfBlind(input);

      const resultA = await evaluator.evaluate(
        blindedElement,
        "volunteer:tag-a",
      );
      const resultB = await evaluator.evaluate(
        blindedElement,
        "volunteer:tag-b",
      );

      expect(Buffer.from(resultA).equals(Buffer.from(resultB))).toBe(false);
      evaluator.close();
    });

    it("rejects blinded element with wrong length", async () => {
      const evaluator = createIpcEvaluator({
        socketPathA: DOCKER_SOCKET_A,
        socketPathB: DOCKER_SOCKET_B,
      });

      await expect(
        evaluator.evaluate(new Uint8Array(16), "volunteer:wrong-len"),
      ).rejects.toThrow(OprfError);
      evaluator.close();
    });
  },
);

describe.skipIf(!IS_LINUX)("IPC error handling (Linux only)", () => {
  it("rejects with OprfError when connecting to nonexistent socket", async () => {
    const evaluator = createIpcEvaluator({
      socketPathA: "/tmp/nonexistent-oprf-a.sock",
      socketPathB: "/tmp/nonexistent-oprf-b.sock",
    });

    const point = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );

    await expect(
      evaluator.evaluate(point, "volunteer:nonexistent"),
    ).rejects.toThrow(OprfError);
    evaluator.close();
  });

  it("rejects with OprfError when process returns zero-length (error)", async () => {
    // Spin up a mock process that always returns zero-length error
    const mockSocketPath = join(tmpdir(), `oprf-mock-err-${Date.now()}.sock`);
    const mockServer = createServer((socket) => {
      socket.on("data", () => {
        const errBuf = Buffer.alloc(LENGTH_PREFIX_BYTES);
        errBuf.writeUInt32BE(0, 0);
        socket.write(errBuf);
      });
    });

    await new Promise<void>((resolve) => {
      mockServer.listen(mockSocketPath, resolve);
    });

    const evaluator = createIpcEvaluator({
      socketPathA: mockSocketPath,
      socketPathB: mockSocketPath,
    });

    const point = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );

    await expect(
      evaluator.evaluate(point, "volunteer:mock-error"),
    ).rejects.toThrow(OprfError);

    mockServer.close();
    evaluator.close();
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- test socket cleanup
    if (existsSync(mockSocketPath)) unlinkSync(mockSocketPath);
  });
});
