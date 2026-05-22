export type LoginPhaseId =
  | "briefing"
  | "idle"
  | "auth"
  | "argon2id"
  | "oprf"
  | "pow"
  | "derive"
  | "twofa"
  | "twofa-verify"
  | "done"
  | "error";
