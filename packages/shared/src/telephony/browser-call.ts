/** Call state transitions: idle -> connecting -> ringing -> connected -> disconnected. */
export type BrowserCallState =
  | "idle"
  | "connecting"
  | "ringing"
  | "connected"
  | "disconnected"
  | "error";

export interface BrowserCallEvents {
  onStateChange(state: BrowserCallState): void;
  /** Incoming DTMF from the remote party (rare but possible). */
  onDtmf?(digit: string): void;
  onError(error: Error): void;
}

/**
 * Provider-agnostic interface for browser-based voice calling.
 *
 * Current: TwilioBrowserCallService (uses @twilio/voice-sdk)
 * Future: JsSipBrowserCallService (uses JsSIP, connects to SignalWire/FreeSWITCH)
 */
export interface BrowserCallService {
  /** Initialize the SDK with a capability token from /relay/webrtc-token. */
  register(token: string, events: BrowserCallEvents): Promise<void>;

  /** Place an outbound call. clientPhone is E.164. */
  connect(clientPhone: string, callerId: string): Promise<void>;

  /** Hang up the current call. */
  disconnect(): void;

  /** Toggle microphone mute. Returns new mute state. */
  toggleMute(): boolean;

  /** Send a DTMF tone during an active call. */
  sendDtmf(digit: string): void;

  /** Get current call state. */
  getState(): BrowserCallState;

  /** Clean up SDK resources (call on component unmount / page unload). */
  destroy(): void;
}
