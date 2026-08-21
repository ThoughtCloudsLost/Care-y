import { mount } from "svelte";
import * as m from "$lib/paraglide/messages.js";
import type { DemoEngineResult } from "./lib/engine/engine.js";
import { setEngineTrpc } from "./stubs/trpc.js";
import { traceFlowLocal, buildFlowDetail } from "./lib/flow-events.js";
import { matchesAnyLocale } from "./lib/topic-classifier.js";
import { DemoMountError } from "./lib/errors.js";
import PhoneApp from "./PhoneApp.svelte";
import "./app.css";

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
    if (matchesAnyLocale(text, (opts) => m.twofa_passkey_use({}, opts))) {
      passkeyArmedUntil = Date.now() + ARM_WINDOW_MS;
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
    return traceFlowLocal(
      {
        lane: "crypto",
        label: "webauthn assertion",
        seamKey: "webauthn-authenticator",
        resultDetail: () =>
          buildFlowDetail({
            result: [
              { name: "outcome", value: "armed (approved)", kind: "metadata" },
            ],
          }),
        failureDetail: () =>
          buildFlowDetail({
            result: [
              {
                name: "outcome",
                value: "dismissed (unarmed)",
                kind: "metadata",
              },
            ],
          }),
      },
      async () => {
        const armed = Date.now() <= passkeyArmedUntil;
        if (!armed) {
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
    );
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
// Engine boot (starts after the first frame commits)
// -----------------------------------------------------------------------

// Dynamic import moves the engine (PGlite, migrations, seeds, router)
// off the initial chunk. Issuing the import at module evaluation still
// put the chunk's fetch, parse, and wasm compile in contention with the
// login screen's first paint on this same thread, so the import waits
// for one frame plus a macrotask: the frame commits, then boot starts
// within a few ms of load. The rAF guard covers non-browser test envs.
const afterFirstPaint = new Promise<void>((resolve) => {
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => {
      setTimeout(resolve, 0);
    });
  } else {
    setTimeout(resolve, 0);
  }
});

const enginePromise: Promise<DemoEngineResult> = afterFirstPaint
  .then(async () => {
    performance.mark("demo-engine-import-start");
    return import("./lib/engine/engine.js");
  })
  .then(async (mod) => mod.bootDemoEngine());

// setEngineTrpc accepts a Promise: calls to trpc.* before boot
// completes will await it. A rejected boot surfaces through the
// first tRPC call that reads the rejected promise.
setEngineTrpc(enginePromise.then((e) => e.trpc));

// Measurement hook: marks when the engine (DB, migrations, seeds,
// router) is ready. Read via performance.getEntriesByName in devtools.
enginePromise.then(
  () => {
    performance.mark("demo-engine-ready");
  },
  () => {
    // Boot failure is reported by the catch below; nothing to mark.
  },
);

// Surface boot failures loudly rather than letting them become
// silent unhandled rejections.
enginePromise.catch((err: unknown) => {
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

mount(PhoneApp, { target, props: { enginePromise } });
