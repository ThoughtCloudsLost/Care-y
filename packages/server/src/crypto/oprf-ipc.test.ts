import { describe, it, expect, beforeAll } from "vitest";
import { createServer } from "node:net";
import { existsSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  getSodium,
  oprfBlind,
  oprfFinalize,
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

describe("createMockEvaluator", () => {
  it("produces same output as direct blindEvaluate", async () => {
    const fullKey = sodium.crypto_core_ristretto255_scalar_random();
    const evaluator = createMockEvaluator(fullKey);

    const point = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );

    const direct = blindEvaluate(fullKey, point);
    const viaEvaluator = await evaluator.evaluate(point);

    expect(Buffer.from(viaEvaluator).equals(Buffer.from(direct))).toBe(true);
  });

  it("produces consistent results", async () => {
    const fullKey = sodium.crypto_core_ristretto255_scalar_random();
    const evaluator = createMockEvaluator(fullKey);

    const point = sodium.crypto_scalarmult_ristretto255_base(
      sodium.crypto_core_ristretto255_scalar_random(),
    );

    const result1 = await evaluator.evaluate(point);
    const result2 = await evaluator.evaluate(point);

    expect(Buffer.from(result1).equals(Buffer.from(result2))).toBe(true);
  });

  it("works end-to-end with oprfBlind and oprfFinalize", async () => {
    const fullKey = sodium.crypto_core_ristretto255_scalar_random();
    const evaluator = createMockEvaluator(fullKey);

    const input = new TextEncoder().encode("mock-evaluator-e2e");
    const { blindedElement, blindState } = oprfBlind(input);

    const evaluated = await evaluator.evaluate(blindedElement);
    const output = oprfFinalize(
      blindState,
      evaluated as EvaluatedElement,
      input,
    );

    expect(output.length).toBe(64);
  });

  it("close is callable without error", () => {
    const fullKey = sodium.crypto_core_ristretto255_scalar_random();
    const evaluator = createMockEvaluator(fullKey);

    expect(() => {
      evaluator.close();
    }).not.toThrow();
  });
});

describe.skipIf(!DOCKER_OPRF_AVAILABLE)(
  "createIpcEvaluator (Docker OPRF containers)",
  () => {
    it("evaluates a blinded element via Docker OPRF processes", async () => {
      const evaluator = createIpcEvaluator({
        socketPathA: DOCKER_SOCKET_A,
        socketPathB: DOCKER_SOCKET_B,
      });

      const input = new TextEncoder().encode("docker-ipc-threshold-test");
      const { blindedElement } = oprfBlind(input);

      const result = await evaluator.evaluate(blindedElement);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(POINT_BYTES);
      evaluator.close();
    });

    it("produces deterministic results for the same input", async () => {
      const evaluator = createIpcEvaluator({
        socketPathA: DOCKER_SOCKET_A,
        socketPathB: DOCKER_SOCKET_B,
      });

      const input = new TextEncoder().encode("docker-determinism-test");
      const { blindedElement } = oprfBlind(input);

      const result1 = await evaluator.evaluate(blindedElement);
      const result2 = await evaluator.evaluate(blindedElement);

      expect(Buffer.from(result1).equals(Buffer.from(result2))).toBe(true);
      evaluator.close();
    });

    it("end-to-end blind/evaluate/finalize produces 64-byte output", async () => {
      const evaluator = createIpcEvaluator({
        socketPathA: DOCKER_SOCKET_A,
        socketPathB: DOCKER_SOCKET_B,
      });

      const input = new TextEncoder().encode("docker-e2e-finalize-test");
      const { blindedElement, blindState } = oprfBlind(input);

      const evaluated = await evaluator.evaluate(blindedElement);
      const output = oprfFinalize(
        blindState,
        evaluated as EvaluatedElement,
        input,
      );

      expect(output.length).toBe(64);
      evaluator.close();
    });

    it("produces different results for different inputs", async () => {
      const evaluator = createIpcEvaluator({
        socketPathA: DOCKER_SOCKET_A,
        socketPathB: DOCKER_SOCKET_B,
      });

      const inputA = new TextEncoder().encode("docker-distinct-a");
      const inputB = new TextEncoder().encode("docker-distinct-b");
      const { blindedElement: blindedA } = oprfBlind(inputA);
      const { blindedElement: blindedB } = oprfBlind(inputB);

      const resultA = await evaluator.evaluate(blindedA);
      const resultB = await evaluator.evaluate(blindedB);

      expect(Buffer.from(resultA).equals(Buffer.from(resultB))).toBe(false);
      evaluator.close();
    });

    it("rejects blinded element with wrong length", async () => {
      const evaluator = createIpcEvaluator({
        socketPathA: DOCKER_SOCKET_A,
        socketPathB: DOCKER_SOCKET_B,
      });

      await expect(evaluator.evaluate(new Uint8Array(16))).rejects.toThrow(
        OprfError,
      );
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

    await expect(evaluator.evaluate(point)).rejects.toThrow(OprfError);
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

    await expect(evaluator.evaluate(point)).rejects.toThrow(OprfError);

    mockServer.close();
    evaluator.close();
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- test socket cleanup
    if (existsSync(mockSocketPath)) unlinkSync(mockSocketPath);
  });
});
