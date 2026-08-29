/**
 * Error type for portal crypto Worker failures surfaced through the bridge.
 *
 * Carries the Worker's error code (from portal-protocol.ts PortalErrorResponse)
 * so callers can switch on failure type without parsing message strings.
 */

import type { PortalWorkerErrorCode } from "./portal-protocol.js";

export class PortalWorkerError extends Error {
  readonly code: PortalWorkerErrorCode;

  constructor(message: string, code: PortalWorkerErrorCode) {
    super(message);
    this.name = "PortalWorkerError";
    this.code = code;
  }
}
