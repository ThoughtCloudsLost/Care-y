export const ErrorCode = {
  RATE_LIMIT_COOLDOWN: "RATE_LIMIT_COOLDOWN",
  RATE_LIMIT_HOURLY: "RATE_LIMIT_HOURLY",
  NO_ACTIVE_CODE: "NO_ACTIVE_CODE",
  TOO_MANY_ATTEMPTS: "TOO_MANY_ATTEMPTS",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];
