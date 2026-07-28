/**
 * Shared Zod schemas for telephony content management.
 *
 * PhoneGreeting: IVR greetings played to callers, keyed by phone + locale + type.
 * SMSResponse: Auto-reply templates sent to SMS senders, keyed by locale + type.
 * Consultant: Volunteer personal phone registration for callback flows.
 */

import { z } from "zod";

// --- PhoneGreeting ---

export const greetingTypeSchema = z.enum([
  "answer",
  "language_prompt",
  "new_client",
  "existing_client",
  "staff_menu",
]);
export type GreetingType = z.infer<typeof greetingTypeSchema>;

const e164Schema = z.string().regex(/^\+[1-9]\d{1,14}$/);

export const createGreetingInputSchema = z.object({
  phoneNumber: e164Schema,
  locale: z.string().min(2).max(10),
  greetingType: greetingTypeSchema,
  text: z.string().min(1).max(2000),
  isAudio: z.boolean().default(false),
});
export type CreateGreetingInput = z.infer<typeof createGreetingInputSchema>;

export const updateGreetingInputSchema = z.object({
  id: z.uuid(),
  phoneNumber: e164Schema.optional(),
  text: z.string().min(1).max(2000).optional(),
  isAudio: z.boolean().optional(),
});
export type UpdateGreetingInput = z.infer<typeof updateGreetingInputSchema>;

export const deleteGreetingInputSchema = z.object({
  id: z.uuid(),
});
export type DeleteGreetingInput = z.infer<typeof deleteGreetingInputSchema>;

export const listGreetingsInputSchema = z.object({
  phoneNumber: e164Schema.optional(),
});
export type ListGreetingsInput = z.infer<typeof listGreetingsInputSchema>;

export const GREETING_AUDIO_MAX_BYTES = 5 * 1024 * 1024;

export const greetingAudioContentTypeSchema = z.enum([
  "audio/wav",
  "audio/mpeg",
  "audio/ogg",
]);
export type GreetingAudioContentType = z.infer<
  typeof greetingAudioContentTypeSchema
>;

export const uploadGreetingAudioInputSchema = z.object({
  greetingId: z.uuid(),
  audioBase64: z.string().min(1),
  contentType: greetingAudioContentTypeSchema,
});
export type UploadGreetingAudioInput = z.infer<
  typeof uploadGreetingAudioInputSchema
>;

export const createAudioGreetingInputSchema = z.object({
  phoneNumber: e164Schema,
  locale: z.string().min(2).max(10),
  greetingType: greetingTypeSchema,
  audioBase64: z.string().min(1),
  contentType: greetingAudioContentTypeSchema,
});
export type CreateAudioGreetingInput = z.infer<
  typeof createAudioGreetingInputSchema
>;

export const getGreetingAudioInputSchema = z.object({
  greetingId: z.uuid(),
});
export type GetGreetingAudioInput = z.infer<typeof getGreetingAudioInputSchema>;

// --- SMSResponse ---

export const smsResponseTypeSchema = z.enum(["new_client", "error"]);
export type SmsResponseType = z.infer<typeof smsResponseTypeSchema>;

export const createSmsResponseInputSchema = z.object({
  locale: z.string().min(2).max(10),
  responseType: smsResponseTypeSchema,
  text: z.string().min(1).max(1600),
});
export type CreateSmsResponseInput = z.infer<
  typeof createSmsResponseInputSchema
>;

export const updateSmsResponseInputSchema = z.object({
  id: z.uuid(),
  text: z.string().min(1).max(1600).optional(),
});
export type UpdateSmsResponseInput = z.infer<
  typeof updateSmsResponseInputSchema
>;

export const deleteSmsResponseInputSchema = z.object({
  id: z.uuid(),
});
export type DeleteSmsResponseInput = z.infer<
  typeof deleteSmsResponseInputSchema
>;

export const listSmsResponsesInputSchema = z.object({
  locale: z.string().min(2).max(10).optional(),
});
export type ListSmsResponsesInput = z.infer<typeof listSmsResponsesInputSchema>;

// --- Consultant ---

export const preferredCallMethodSchema = z.enum(["phone_callback", "webrtc"]);
export type PreferredCallMethod = z.infer<typeof preferredCallMethodSchema>;

export const registerConsultantInputSchema = z.object({
  encryptedPhone: z.string().min(1),
  phoneHash: z.string().min(1),
  preferredCallMethod: preferredCallMethodSchema,
});
export type RegisterConsultantInput = z.infer<
  typeof registerConsultantInputSchema
>;

export const updateConsultantInputSchema = z.object({
  preferredCallMethod: preferredCallMethodSchema.optional(),
});
export type UpdateConsultantInput = z.infer<typeof updateConsultantInputSchema>;

export const verifyConsultantInputSchema = z.object({
  code: z.string().length(6),
});
export type VerifyConsultantInput = z.infer<typeof verifyConsultantInputSchema>;
