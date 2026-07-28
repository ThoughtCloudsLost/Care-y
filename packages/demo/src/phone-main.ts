import { mount } from "svelte";
import * as m from "$lib/paraglide/messages.js";
import { locales } from "$lib/paraglide/runtime.js";
import { bootDemoEngine } from "./lib/engine/engine.js";
import { setEngineTrpc } from "./stubs/trpc.js";
import PhoneApp from "./PhoneApp.svelte";
import "./app.css";

class DemoMountError extends Error {
  override name = "DemoMountError" as const;
}

// -----------------------------------------------------------------------
// WebAuthn monkeypatch (demo code only, never product)
// -----------------------------------------------------------------------
// TwoFactorChallenge calls navigator.credentials.get({publicKey}) then
// posts a serialized assertion. A demo iframe cannot run a real ceremony.
// Replace navigator.credentials with a stub.
//
// The component AUTO-STARTS the ceremony when the passkey method opens;
// succeeding there would complete login the moment a visitor peeks at
// the method. So an unarmed ceremony rejects like a dismissed browser
// prompt, and only a real tap on the "Use passkey" button arms the next
// ceremony to succeed. Visitors explore freely; the explicit tap logs in.

const textEncoder = new TextEncoder();

function makeFakeArrayBuffer(content: string): ArrayBuffer {
  return textEncoder.encode(content).buffer;
}

const WEBAUTHN_DELAY_MS = 800;
const WEBAUTHN_DISMISS_DELAY_MS = 1200;
const ARM_WINDOW_MS = 5000;

let passkeyArmedUntil = 0;

// Trusted clicks on the "Use passkey" button arm the ceremony. The
// picker row shares the same label but renders as a list item, not a
// button, so browsing to the method never arms it.
document.addEventListener(
  "click",
  (ev: MouseEvent): void => {
    if (!ev.isTrusted) return;
    const target = ev.target;
    if (!(target instanceof Element)) return;
    const button = target.closest("button");
    if (button === null) return;
    const text = button.textContent.trim();
    for (const locale of locales) {
      if (text === m.twofa_passkey_use({}, { locale })) {
        passkeyArmedUntil = Date.now() + ARM_WINDOW_MS;
        return;
      }
    }
  },
  { capture: true },
);

const fakeCredentialsApi = {
  async get(_options?: CredentialRequestOptions): Promise<{
    id: string;
    rawId: ArrayBuffer;
    authenticatorAttachment: string;
    type: string;
    response: {
      clientDataJSON: ArrayBuffer;
      authenticatorData: ArrayBuffer;
      signature: ArrayBuffer;
      userHandle: null;
    };
  }> {
    if (Date.now() > passkeyArmedUntil) {
      // Auto-started ceremony: behave like a dismissed passkey prompt
      await new Promise<void>((resolve) => {
        setTimeout(resolve, WEBAUTHN_DISMISS_DELAY_MS);
      });
      throw new DOMException("Demo passkey prompt dismissed", "AbortError");
    }
    passkeyArmedUntil = 0;
    await new Promise<void>((resolve) => {
      setTimeout(resolve, WEBAUTHN_DELAY_MS);
    });
    return {
      id: "demo-credential-id",
      rawId: makeFakeArrayBuffer("demo-credential-id"),
      authenticatorAttachment: "platform",
      type: "public-key",
      response: {
        clientDataJSON: makeFakeArrayBuffer("demo-client-data"),
        authenticatorData: makeFakeArrayBuffer("demo-auth-data"),
        signature: makeFakeArrayBuffer("demo-signature"),
        userHandle: null,
      },
    };
  },
  async create(_options?: CredentialCreationOptions): Promise<null> {
    await Promise.resolve();
    return null;
  },
};

// Replace navigator.credentials before any component mounts
try {
  Object.defineProperty(navigator, "credentials", {
    value: fakeCredentialsApi,
    writable: false,
    configurable: true,
  });
} catch {
  // Swallow if navigator.credentials is not configurable (test envs)
}

// -----------------------------------------------------------------------
// Engine boot (starts immediately, before mount)
// -----------------------------------------------------------------------

// Fire engine boot in the background. Wire the trpc adapter promise
// into the stub immediately so tRPC calls made by mounted components
// await the engine transparently.
const engineReady = bootDemoEngine();

// setEngineTrpc accepts a Promise: calls to trpc.* before boot
// completes will await it. A rejected boot surfaces through the
// first tRPC call that reads the rejected promise.
setEngineTrpc(engineReady.then((e) => e.trpc));

// Surface boot failures loudly rather than letting them become
// silent unhandled rejections.
engineReady.catch((err: unknown) => {
  console.error(
    "[demo] Engine boot failed:",
    err instanceof Error ? err.message : String(err),
  );
});

// -----------------------------------------------------------------------
// Mount
// -----------------------------------------------------------------------

const target = document.getElementById("app");
if (!target) throw new DemoMountError("Missing #app mount target");

mount(PhoneApp, { target, props: { engineReady } });
