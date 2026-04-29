import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { RelayError } from "$lib/errors.js";
import { callStore } from "$lib/stores/call.svelte.js";
import { toastStore } from "$lib/stores/toast.svelte.js";
import * as m from "$lib/paraglide/messages.js";

interface CallRelayResponse {
  method: "pstn" | "webrtc";
  callSid?: string;
}

function parseCallRelayResponse(data: unknown): CallRelayResponse {
  if (typeof data !== "object" || data === null) {
    return { method: "pstn", callSid: undefined };
  }
  const method =
    "method" in data && data.method === "webrtc" ? "webrtc" : "pstn";
  const callSid =
    "callSid" in data && typeof data.callSid === "string"
      ? data.callSid
      : undefined;
  return { method, callSid } as const;
}

export interface CallDispatchConfig {
  readonly getTicketId: () => string;
  readonly cryptoBridge: CryptoBridge;
  readonly getEncryptedPhone: () => string | null | undefined;
}

export interface CallDispatch {
  readonly inProgress: boolean;
  executeCall: () => Promise<void>;
}

export function createCallDispatch(config: CallDispatchConfig): CallDispatch {
  const { getTicketId, cryptoBridge, getEncryptedPhone } = config;

  let inProgress = $state(false);

  async function executeCall(): Promise<void> {
    inProgress = true;
    const ticketId = getTicketId();

    try {
      const reqBody: Record<string, string> = { ticketId };
      const encryptedPhone = getEncryptedPhone();
      if (encryptedPhone != null) {
        reqBody.consultantPhone = await cryptoBridge.orgDecrypt(encryptedPhone);
      }

      const resp = await fetch("/relay/call", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      if (!resp.ok) throw new RelayError("CALL_FAILED", resp.status);

      const data = parseCallRelayResponse(await resp.json());

      if (data.method === "webrtc") {
        const tokenResp = await fetch("/relay/webrtc-token", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!tokenResp.ok)
          throw new RelayError("TOKEN_FAILED", tokenResp.status);
        callStore.start({ ticketId, callSid: "webrtc" });
      } else if (data.callSid !== undefined) {
        callStore.start({ ticketId, callSid: data.callSid });
      }
    } catch {
      toastStore.show(m.ticket_call_error(), 3000);
    } finally {
      inProgress = false;
    }
  }

  return {
    get inProgress() {
      return inProgress;
    },
    executeCall,
  };
}
