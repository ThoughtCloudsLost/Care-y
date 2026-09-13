// Server-only: validates decrypted config blob shapes. Not exported to client.

import { z } from "zod";
import type { StoredProviderId } from "@care-y/shared";

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

/** Mock provider config shape. Matches the dev seed and E2E fixture format. */
export const mockConfigSchema = z.object({
  accountSid: z.string().min(1),
  authToken: z.string().min(1),
  phoneNumbers: z.array(
    z.object({
      number: z.string().startsWith("+"), // E.164
      sid: z.string(),
      label: z.string().optional(),
    }),
  ),
});

export type MockConfig = z.infer<typeof mockConfigSchema>;

/**
 * Registry mapping provider identifiers to their config schemas.
 * The factory uses this to validate decrypted JSON against the correct schema.
 *
 * Keyed exhaustively over STORED_PROVIDER_IDS: adding a stored provider id
 * without a config schema is a compile error here, not a runtime surprise.
 *
 * "mock" is registered unconditionally. Production stays fail-closed because
 * the constructor and statics maps are both prod-gated: a production server
 * with a mock row passes schema validation here and then fails at the
 * registry lookup in the factory or config service, which is correct.
 */
export const providerConfigSchemas: Record<StoredProviderId, z.ZodType> = {
  twilio: twilioConfigSchema,
  signalwire: signalWireConfigSchema,
  mock: mockConfigSchema,
};
