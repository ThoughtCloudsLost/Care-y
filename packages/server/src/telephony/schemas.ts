// Server-only: validates decrypted config blob shapes. Not exported to client.

import { z } from "zod";

/** Twilio phone number entry in config blob. */
const twilioPhoneNumberSchema = z.object({
  number: z.string().startsWith("+"), // E.164
  sid: z.string(), // Twilio PN SID (PN...)
});

/** Twilio provider config shape (stored as encrypted JSON blob). */
export const twilioConfigSchema = z.object({
  mode: z.enum(["byot", "managed"]),
  accountSid: z.string().min(1),
  authToken: z.string().min(1),
  phoneNumbers: z.array(twilioPhoneNumberSchema),
});

export type TwilioConfig = z.infer<typeof twilioConfigSchema>;

/** SignalWire provider config shape (validated but not yet implemented). */
export const signalWireConfigSchema = z.object({
  mode: z.enum(["cloud", "hybrid"]),
  projectId: z.string().min(1),
  apiToken: z.string().min(1),
  spaceUrl: z.string().min(1),
  phoneNumbers: z.array(
    z.object({
      number: z.string().startsWith("+"),
      id: z.string(),
    }),
  ),
});

export type SignalWireConfig = z.infer<typeof signalWireConfigSchema>;

/**
 * Registry mapping provider identifiers to their config schemas.
 * The factory uses this to validate decrypted JSON against the correct schema.
 */
export const providerConfigSchemas: Record<string, z.ZodType> = {
  twilio: twilioConfigSchema,
  signalwire: signalWireConfigSchema,
};
