import { vi } from "vitest";
import {
  decodeSelfBlobPayload,
  encodeSelfBlobPayload,
  type SelfBlobEnvelope,
  type SelfBlobTransport,
} from "$lib/prefs/synced-self-blob.svelte.js";

/**
 * Fake transport: seal is the identity on the payload (wrappedPayload
 * carries the base64 payload verbatim) so envelope contents stay
 * inspectable without crypto. Nothing is stored until a test overrides
 * fetchEnvelope.
 */
export function createFakeSelfBlobTransport(): SelfBlobTransport {
  return {
    fetchEnvelope: vi.fn((): Promise<SelfBlobEnvelope | null> =>
      Promise.resolve(null),
    ),
    pushEnvelope: vi.fn((): Promise<void> => Promise.resolve()),
    seal: vi.fn((dataB64: string) =>
      Promise.resolve({
        ephemeralPoint: "ep",
        nonce: "n",
        wrappedPayload: dataB64,
      }),
    ),
    open: vi.fn((envelope: SelfBlobEnvelope) =>
      Promise.resolve(envelope.wrappedPayload),
    ),
  };
}

/** Envelope the fake transport's open() reads back as `json`. */
export function envelopeOf(json: unknown): SelfBlobEnvelope {
  return {
    ephemeralPoint: "ep",
    nonce: "n",
    wrappedPayload: encodeSelfBlobPayload(json),
  };
}

/** Decoded JSON of the last envelope passed to a mocked pushEnvelope. */
export function lastPushedJson(transport: SelfBlobTransport): unknown {
  const pushed = vi.mocked(transport.pushEnvelope).mock.calls.at(-1)?.[0];
  return decodeSelfBlobPayload(pushed?.wrappedPayload ?? "");
}

/** A promise plus the functions that settle it. */
export function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (err: Error) => void;
} {
  let resolve: (value: T) => void = () => undefined;
  let reject: (err: Error) => void = () => undefined;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
