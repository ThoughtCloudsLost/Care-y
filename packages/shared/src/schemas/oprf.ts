import { z } from "zod";

/** Base64-encoded ristretto255 point (32 bytes raw, 44 chars base64) */
const base64PointSchema = z.string().min(1).max(64);

export const oprfEvaluateInputSchema = z.object({
  userId: z.uuid(),
  blindedElement: base64PointSchema,
  /** PoW solution fields, required only after 3 failures */
  powChallenge: z.string().optional(),
  powSolution: z.string().optional(),
});

export type OprfEvaluateInput = z.infer<typeof oprfEvaluateInputSchema>;

export const oprfEvaluateOutputSchema = z.object({
  evaluated: base64PointSchema,
});

export type OprfEvaluateOutput = z.infer<typeof oprfEvaluateOutputSchema>;

/** PoW challenge returned in error response body */
export const powChallengeSchema = z.object({
  challenge: z.string(),
  difficulty: z.number().int().min(1).max(32),
  expiresAt: z.iso.datetime(),
});

export type PowChallenge = z.infer<typeof powChallengeSchema>;
