/**
 * Error type for crypto Worker failures surfaced through the bridge.
 *
 * Carries the Worker's error code (from crypto-protocol.ts ErrorResponse)
 * so callers can switch on failure type without parsing message strings.
 */

import type { WorkerErrorCode } from "./crypto-protocol.js";

export class CryptoWorkerError extends Error {
  readonly code: WorkerErrorCode;

  constructor(message: string, code: WorkerErrorCode) {
    super(message);
    this.name = "CryptoWorkerError";
    this.code = code;
  }
}
