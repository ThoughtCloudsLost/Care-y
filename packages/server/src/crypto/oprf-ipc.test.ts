import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer, type Server } from "node:net";
import { existsSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  getSodium,
  requireSodium,
  oprfBlind,
  oprfFinalize,
  type SodiumBackend,
  type EvaluatedElement,
} from "@care-y/crypto";
import { blindEvaluate } from "./oprf-server.js";
import { createMockEvaluator, createIpcEvaluator } from "./oprf-ipc.js";
import { startOprfProcess } from "./oprf-process.js";
import { OprfError } from "../errors.js";

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

describe.skipIf(!IS_LINUX)("createIpcEvaluator (Linux only)", () => {
  const socketPathA = join(tmpdir(), `oprf-ipc-a-${Date.now()}.sock`);
  const socketPathB = join(tmpdir(), `oprf-ipc-b-${Date.now()}.sock`);
  let serverA: Server | undefined;
  let serverB: Server | undefined;

  // Generate a full key and split into Shamir shares
  let shareAHex: string;
  let shareBHex: string;
  let fullKey: Uint8Array;

  beforeAll(async () => {
    const s = requireSodium();
    fullKey = s.crypto_core_ristretto255_scalar_random();
    const a = s.crypto_core_ristretto255_scalar_random();
    const shareA = s.crypto_core_ristretto255_scalar_add(fullKey, a);
    const twoA = s.crypto_core_ristretto255_scalar_add(a, a);
    const shareB = s.crypto_core_ristretto255_scalar_add(fullKey, twoA);

    shareAHex = Buffer.from(shareA).toString("hex");
    shareBHex = Buffer.from(shareB).toString("hex");

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- test socket cleanup
    if (existsSync(socketPathA)) unlinkSync(socketPathA);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- test socket cleanup
    if (existsSync(socketPathB)) unlinkSync(socketPathB);

    const srvA = await startOprfProcess({
      socketPath: socketPathA,
      shareHex: shareAHex,
    });
    const srvB = await startOprfProcess({
      socketPath: socketPathB,
      shareHex: shareBHex,
    });
    serverA = srvA;
    serverB = srvB;

    // Wait for both to be listening
    await Promise.all([
      new Promise<void>((resolve) => {
        const check = (): void => {
          if (srvA.listening) resolve();
          else setTimeout(check, 10);
        };
        check();
      }),
      new Promise<void>((resolve) => {
        const check = (): void => {
          if (srvB.listening) resolve();
          else setTimeout(check, 10);
        };
        check();
      }),
    ]);
  });

  afterAll(() => {
    serverA?.close();
    serverB?.close();
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- test socket cleanup
    if (existsSync(socketPathA)) unlinkSync(socketPathA);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- test socket cleanup
    if (existsSync(socketPathB)) unlinkSync(socketPathB);
  });

  it("evaluates a blinded element via two OPRF processes", async () => {
    const evaluator = createIpcEvaluator({
      socketPathA,
      socketPathB,
    });

    const input = new TextEncoder().encode("ipc-threshold-test");
    const { blindedElement } = oprfBlind(input);

    const result = await evaluator.evaluate(blindedElement);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(POINT_BYTES);
    evaluator.close();
  });

  it("threshold IPC result matches single-key evaluation", async () => {
    const evaluator = createIpcEvaluator({
      socketPathA,
      socketPathB,
    });

    const input = new TextEncoder().encode("ipc-parity-test");
    const { blindedElement, blindState } = oprfBlind(input);

    const ipcResult = await evaluator.evaluate(blindedElement);
    const directResult = blindEvaluate(fullKey, blindedElement);

    // Finalize both and compare
    const ipcOutput = oprfFinalize(
      blindState,
      ipcResult as EvaluatedElement,
      input,
    );
    const directOutput = oprfFinalize(
      blindState,
      directResult as EvaluatedElement,
      input,
    );

    expect(Buffer.from(ipcOutput).equals(Buffer.from(directOutput))).toBe(true);
    evaluator.close();
  });

  it("rejects blinded element with wrong length", async () => {
    const evaluator = createIpcEvaluator({
      socketPathA,
      socketPathB,
    });

    await expect(evaluator.evaluate(new Uint8Array(16))).rejects.toThrow(
      OprfError,
    );
    evaluator.close();
  });
});

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
