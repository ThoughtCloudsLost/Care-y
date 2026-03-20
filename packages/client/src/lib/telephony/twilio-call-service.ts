/**
 * Twilio implementation of BrowserCallService.
 *
 * Wraps @twilio/voice-sdk's Device and Call objects behind the provider-
 * agnostic BrowserCallService interface. The SignalWire migration will swap this for a
 * JsSIP implementation when switching to SignalWire/FreeSWITCH.
 *
 * This file is client-only (browser). Never import it server-side.
 */

import { Device, type Call } from "@twilio/voice-sdk";
import type {
  BrowserCallService,
  BrowserCallState,
  BrowserCallEvents,
} from "@care-y/shared";
import { TelephonyError } from "../errors.js";

export function createTwilioBrowserCallService(): BrowserCallService {
  let device: Device | null = null;
  let activeCall: Call | null = null;
  let state: BrowserCallState = "idle";
  let events: BrowserCallEvents | null = null;
  let isMuted = false;

  function setState(newState: BrowserCallState): void {
    state = newState;
    events?.onStateChange(newState);
  }

  return {
    async register(token: string, callbackEvents: BrowserCallEvents) {
      events = callbackEvents;

      device = new Device(token, {
        // Disable incoming calls (CARE-Y is voicemail-only inbound)
        allowIncomingWhileBusy: false,
      });

      device.on("error", (err: Error) => {
        setState("error");
        events?.onError(err);
      });

      // Device disconnection (network loss, token expiry)
      device.on("unregistered", () => {
        setState("error");
        events?.onError(new Error("Voice device unregistered"));
      });

      try {
        await device.register();
      } catch (err: unknown) {
        setState("error");
        const wrapped = err instanceof Error ? err : new Error(String(err));
        events.onError(wrapped);
        throw wrapped;
      }
    },

    async connect(clientPhone: string, callerId: string) {
      if (!device) throw new TelephonyError("Device not registered");

      setState("connecting");

      activeCall = await device.connect({
        params: {
          To: clientPhone,
          CallerId: callerId,
        },
      });

      activeCall.on("ringing", () => {
        setState("ringing");
      });
      activeCall.on("accept", () => {
        setState("connected");
      });
      activeCall.on("disconnect", () => {
        setState("disconnected");
        activeCall = null;
      });
      activeCall.on("error", (err: Error) => {
        setState("error");
        events?.onError(err);
        activeCall = null;
      });
    },

    disconnect() {
      activeCall?.disconnect();
      activeCall = null;
      setState("disconnected");
    },

    toggleMute() {
      if (!activeCall) return isMuted;
      isMuted = !isMuted;
      activeCall.mute(isMuted);
      return isMuted;
    },

    sendDtmf(digit: string) {
      activeCall?.sendDigits(digit);
    },

    getState() {
      return state;
    },

    destroy() {
      activeCall?.disconnect();
      activeCall = null;
      device?.destroy();
      device = null;
      setState("idle");
      events = null;
    },
  };
}
