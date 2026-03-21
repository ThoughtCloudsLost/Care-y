import { z } from "zod";

// ---------------------------------------------------------------------------
// Outbound SMS relay
// ---------------------------------------------------------------------------

export const relaySmsInputSchema = z.object({
  /** Client phone number in E.164 format. */
  to: z.string().min(1),
  /** SMS body text. */
  body: z.string().min(1).max(1600),
});
export type RelaySmsInput = z.infer<typeof relaySmsInputSchema>;

export const relaySmsOutputSchema = z.object({
  messageId: z.string(),
});
export type RelaySmsOutput = z.infer<typeof relaySmsOutputSchema>;

// ---------------------------------------------------------------------------
// Outbound call relay
// ---------------------------------------------------------------------------

export const relayCallInputSchema = z.object({
  /** Client phone number in E.164 format. */
  clientPhone: z.string().min(1),
  /** Consultant's personal phone (browser-decrypted). Required for phone_callback method. */
  consultantPhone: z.string().min(1).optional(),
});
export type RelayCallInput = z.infer<typeof relayCallInputSchema>;

export const relayCallOutputSchema = z.object({
  callSid: z.string(),
  method: z.enum(["phone_callback", "webrtc"]),
});
export type RelayCallOutput = z.infer<typeof relayCallOutputSchema>;

// ---------------------------------------------------------------------------
// WebRTC token
// ---------------------------------------------------------------------------

/**
 * WebRTC token endpoint has no input body (session auth only).
 * The caller ID for WebRTC calls is resolved server-side from
 * org_config.phone_outbound_sid, not passed by the client.
 */

export const relayWebrtcTokenOutputSchema = z.object({
  token: z.string(),
  /** TTL in seconds. Client should request a new token before expiry. */
  ttl: z.number(),
});
export type RelayWebrtcTokenOutput = z.infer<
  typeof relayWebrtcTokenOutputSchema
>;
