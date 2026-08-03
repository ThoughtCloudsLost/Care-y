/**
 * Typed error for capture pipeline failures. Every throw in the capture
 * scripts uses this class so callers can distinguish pipeline failures
 * from programming errors, and so failure messages stay actionable.
 */
export class CaptureError extends Error {
  name = "CaptureError";
}
