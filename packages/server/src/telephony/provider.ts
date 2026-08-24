import type { CallSid, E164, OrgId, StoredProviderId } from "@care-y/shared";

/** Result of sending an SMS. */
export interface SendSmsResult {
  /** Provider-assigned message identifier (e.g., Twilio MessageSid). */
  readonly messageId: string;
}

/** Parameters for initiating a two-leg phone callback. */
export interface OutboundCallParams {
  /** Volunteer's personal phone number (E.164). Leg 1 target. */
  readonly consultantPhone: string;
  /** Client's phone number (E.164). Leg 2 target. */
  readonly clientPhone: string;
  /** Hotline number shown on client's caller ID (E.164). */
  readonly callerId: string;
  /** Webhook URL for DTMF confirmation after consultant picks up. */
  readonly confirmWebhookUrl: string;
  /** Webhook URL for call status events. */
  readonly statusWebhookUrl: string;
}

/** Parameters for initiating a WebRTC browser call. */
export interface WebRtcCallParams {
  /** Client's phone number (E.164). */
  readonly clientPhone: string;
  /** Hotline number shown on client's caller ID (E.164). */
  readonly callerId: string;
  /** Webhook URL for call status events. */
  readonly statusWebhookUrl: string;
}

/** Structured data from an incoming call webhook. */
export interface IncomingCallData {
  readonly callId: CallSid;
  readonly from: E164;
  readonly to: E164;
  readonly direction: "inbound";
}

/** Structured data from an incoming SMS webhook. */
export interface IncomingSmsData {
  readonly messageId: string;
  readonly from: E164;
  readonly to: E164;
  readonly body: string;
  readonly numMedia: number;
  readonly mediaUrls: readonly string[];
  readonly mediaContentTypes: readonly string[];
}

/** Voice response instruction set (provider renders to TwiML or equivalent). */
export interface VoiceInstruction {
  readonly type:
    | "say"
    | "play"
    | "gather"
    | "record"
    | "hangup"
    | "dial"
    | "pause"
    | "reject";
  readonly attributes?: Record<string, string | number | boolean>;
  readonly children?: readonly VoiceInstruction[];
}

/** Display-safe version of provider config (auth tokens masked). */
export interface MaskedTelephonyConfig {
  readonly provider: StoredProviderId;
  readonly mode: string;
  readonly maskedAccountId: string;
  readonly maskedAuthToken: string;
  readonly phoneNumbers: readonly {
    readonly number: string;
    readonly label?: string;
  }[];
}

/** Webhook validation request data. */
export interface WebhookValidationRequest {
  /** The full URL the provider used to make the request. */
  readonly url: string;
  /** HTTP request body as key-value pairs. */
  readonly body: Record<string, string>;
  /** The provider's signature header value. */
  readonly signature: string;
  /** The auth token for this org's account (used as HMAC key). */
  readonly authToken: string;
}

/** Caller and callee phone numbers for a completed or in-progress call. */
export interface CallDetails {
  readonly from: E164;
  readonly to: E164;
}

/**
 * TelephonyProvider defines all operations a telephony provider must support.
 *
 * Implementations are per-org (one instance per org, holding that org's credentials).
 * The provider factory creates instances by decrypting the org's config blob.
 *
 * All phone numbers in parameters and return values use E.164 format.
 */
export interface TelephonyProvider {
  /** Provider identifier (e.g., "twilio", "signalwire"). */
  readonly providerId: StoredProviderId;

  // --- Outbound ---

  /** Send an SMS message. */
  sendSms(to: string, body: string, callerId: string): Promise<SendSmsResult>;

  /** Initiate a two-leg phone callback (volunteer phone -> client phone). */
  initiateOutboundCall(params: OutboundCallParams): Promise<string>;

  /** Initiate a WebRTC browser-to-PSTN call. */
  initiateWebRtcCall(params: WebRtcCallParams): Promise<string>;

  // --- Inbound ---

  /** Validate an inbound webhook's authenticity (signature check). */
  validateWebhook(request: WebhookValidationRequest): boolean;

  /** Parse an incoming call webhook body into structured data. */
  parseIncomingCall(body: Record<string, string>): IncomingCallData;

  /** Parse an incoming SMS webhook body into structured data. */
  parseIncomingSms(body: Record<string, string>): IncomingSmsData;

  // --- Voice response ---

  /** Generate a voice response document (TwiML or equivalent) from instructions. */
  generateVoiceResponse(instructions: readonly VoiceInstruction[]): string;

  // --- Recordings ---

  /** Fetch a recording as a raw audio stream (Buffer). Caller encrypts. */
  getRecording(recordingId: string): Promise<Buffer>;

  /** Delete a recording from the provider. */
  deleteRecording(recordingId: string): Promise<void>;

  // --- Log deletion (GAP-16) ---

  /**
   * Fetch caller and callee phone numbers for a given call.
   * Used to route quarantined voicemails when the call tracker
   * has no record of the call.
   */
  getCallDetails(callId: string): Promise<CallDetails>;

  /** Delete a call log record from the provider. */
  deleteCallLog(callId: string): Promise<void>;

  /** Delete a message log record from the provider. */
  deleteMessageLog(messageId: string): Promise<void>;

  // --- Config lifecycle ---

  /**
   * Return a display-safe version of the config (tokens masked).
   * Used by admin UI to show current configuration.
   */
  maskConfig(): MaskedTelephonyConfig;
}

/**
 * Extracts media URLs and content types from a Twilio-format webhook body.
 * Twilio encodes MMS attachments as MediaUrl0..N and MediaContentType0..N.
 * Both the real Twilio provider and the mock use this format.
 */
export function extractMediaFromWebhookBody(
  body: Record<string, string>,
  numMedia: number,
): { mediaUrls: string[]; mediaContentTypes: string[] } {
  const mediaUrls: string[] = [];
  const mediaContentTypes: string[] = [];
  for (let i = 0; i < numMedia; i++) {
    const url = body[`MediaUrl${String(i)}`];
    const contentType = body[`MediaContentType${String(i)}`];
    if (url !== undefined) mediaUrls.push(url);
    if (contentType !== undefined) mediaContentTypes.push(contentType);
  }
  return { mediaUrls, mediaContentTypes };
}

/**
 * Static factory methods for a provider implementation.
 * Config types are `unknown` because each provider defines its own Zod shape.
 * Callers MUST parse/validate return values before storing.
 */
export interface TelephonyProviderStatic {
  /** Parse and validate raw config JSON. Returns validated config. Throws on invalid shape. */
  validateConfig(raw: unknown): unknown;

  /**
   * Configure webhook URLs on the provider side for an org's phone numbers.
   * Returns updated config with provisioned webhook metadata.
   * Caller MUST re-validate the return value with the provider's Zod schema
   * before encrypting and storing (provisioning may add or modify fields).
   */
  provisionWebhooks(
    config: unknown,
    orgId: OrgId,
    baseUrl: string,
  ): Promise<unknown>;
}
