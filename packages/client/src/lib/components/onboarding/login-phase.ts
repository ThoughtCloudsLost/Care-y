export type LoginPhaseId =
  | "idle"
  | "auth"
  | "argon2id"
  | "oprf"
  | "pow"
  | "derive"
  | "done"
  | "error";
