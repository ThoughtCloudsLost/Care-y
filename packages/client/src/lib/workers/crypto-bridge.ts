/**
 * Main-thread proxy to the crypto Web Worker.
 *
 * Callers use typed async methods (decrypt, encrypt, deriveKeys, etc.)
 * without knowing a Worker is involved. The bridge assigns monotonic IDs
 * to each request, tracks pending promises, and resolves them when the
 * Worker responds. Follows ProtonMail's CryptoProxy pattern (SEC-211).
 *
 * The Worker reference and postMessage binding are captured at construction
 * time. If XSS later patches Worker.prototype.postMessage, the bridge
 * still uses the original function (SEC-210 defense-in-depth).
 *
 * The app creates a singleton bridge during initialization and
 * distributes it via Svelte context (setContext/getContext).
 *
 * References:
 *   SEC-210  W3C Web Crypto: postMessage key interception risk
 *   SEC-211  ProtonMail CryptoProxy pattern
 */

import { CryptoWorkerError } from "./crypto-bridge-errors.js";
import type {
  WorkerRequest,
  WorkerRequestType,
  WorkerResponse,
  WorkerSuccessResponse,
  ResponseForRequest,
} from "./crypto-protocol.js";

export type BridgeState = "LOADING" | "READY" | "KEYED" | "DESTROYED";

/**
 * Distributive Omit that strips `id` from each union member individually.
 * Standard `Omit<Union, "id">` collapses the union into a single object type,
 * losing discriminant narrowing and excess property checks. This distributes
 * the Omit across each member via a conditional type.
 * Pattern: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
 */
type RequestBody = WorkerRequest extends infer R
  ? R extends WorkerRequest
    ? Omit<R, "id">
    : never
  : never;

/**
 * Narrow a WorkerSuccessResponse to the expected type, throwing if the
 * Worker returned a mismatched response discriminant.
 */
function expectResponse<T extends WorkerRequestType>(
  resp: WorkerSuccessResponse,
  expectedType: T,
): ResponseForRequest<T> {
  if (resp.type !== expectedType) {
    throw new CryptoWorkerError("Unexpected response type", "WORKER_ERROR");
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowed by discriminant check above
  return resp as ResponseForRequest<T>;
}

export class CryptoBridge {
  private worker: Worker;
  private state: BridgeState = "LOADING";
  private nextId = 0;
  private readonly pending = new Map<
    number,
    {
      resolve: (value: WorkerSuccessResponse) => void;
      reject: (reason: CryptoWorkerError) => void;
    }
  >();
  /** Captured at construction time to resist postMessage monkey-patching. */
  private readonly post: Worker["postMessage"];
  private readonly readyPromise: Promise<void>;

  constructor() {
    const worker = new Worker(new URL("./crypto.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker = worker;
    this.post = worker.postMessage.bind(worker);
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      this.handleResponse(e.data);
    };
    worker.onerror = (e: ErrorEvent) => {
      console.error(
        "[CryptoBridge] Worker error:",
        e.message,
        e.filename,
        e.lineno,
      );
      // Reject all pending requests so callers don't hang forever
      for (const [, entry] of this.pending) {
        entry.reject(
          new CryptoWorkerError(
            `Worker failed to load: ${e.message}`,
            "WORKER_ERROR",
          ),
        );
      }
      this.pending.clear();
    };
    this.readyPromise = this.sendRequest({ type: "init" }).then(() => {
      this.state = "READY";
    });
  }

  /** Wait for libsodium initialization in the Worker. */
  async waitReady(): Promise<void> {
    return this.readyPromise;
  }

  /**
   * Run Argon2id inside the Worker. password and salt are Transferable:
   * they become zero-length (neutered) on the main thread after this call.
   */
  async argon2id(password: ArrayBuffer, salt: ArrayBuffer): Promise<void> {
    await this.readyPromise;
    await this.sendRequest({ type: "argon2id", password, salt }, [
      password,
      salt,
    ]);
  }

  /**
   * Blind the stretched password for OPRF evaluation.
   * Returns the blinded element (base64, public) to send to the OPRF server.
   */
  async oprfBlind(): Promise<{ blindedElement: string }> {
    const resp = expectResponse(
      await this.sendRequest({ type: "oprfBlind" }),
      "oprfBlind",
    );
    return { blindedElement: resp.blindedElement };
  }

  /**
   * Finalize OPRF and derive masterKey + volPrivate + volPublic.
   * evaluated is Transferable: neutered on the main thread after this call.
   */
  async deriveKeys(evaluated: ArrayBuffer): Promise<{ volPublic: string }> {
    const resp = expectResponse(
      await this.sendRequest({ type: "deriveKeys", evaluated }, [evaluated]),
      "deriveKeys",
    );
    this.state = "KEYED";
    return { volPublic: resp.volPublic };
  }

  /** Decrypt ticket content. Returns UTF-8 plaintext. */
  async decrypt(
    ticketId: string,
    ephemeralPoint: string,
    nonce: string,
    wrappedKey: string,
    ciphertext: string,
  ): Promise<string> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "decryptContent",
        ticketId,
        ephemeralPoint,
        nonce,
        wrappedKey,
        ciphertext,
      }),
      "decryptContent",
    );
    return resp.plaintext;
  }

  /**
   * Encrypt plaintext with the cached tk for this ticket.
   * Returns base64 ciphertext. The tk must have been cached by a prior decrypt.
   */
  async encrypt(ticketId: string, plaintext: string): Promise<string> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "encryptContent",
        ticketId,
        plaintext,
      }),
      "encryptContent",
    );
    return resp.ciphertext;
  }

  /**
   * Decrypt a binary blob (voicemail recording, MMS image, file attachment).
   * Returns the raw decrypted bytes as an ArrayBuffer (Transferable from Worker).
   * Uses the same ECIES key-wrap as decryptContent, but returns binary instead of UTF-8.
   */
  async decryptBlob(
    ticketId: string,
    ephemeralPoint: string,
    nonce: string,
    wrappedKey: string,
    ciphertext: string,
  ): Promise<ArrayBuffer> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "decryptBlob",
        ticketId,
        ephemeralPoint,
        nonce,
        wrappedKey,
        ciphertext,
      }),
      "decryptBlob",
    );
    return resp.data;
  }

  /** Evict a specific tk from the Worker cache (TanStack Query GC signal). */
  async evictTk(ticketId: string): Promise<void> {
    await this.sendRequest({ type: "evictTk", ticketId });
  }

  /** Zero all key material and return to READY state. */
  async zeroAll(): Promise<void> {
    await this.sendRequest({ type: "zeroAll" });
    this.state = "READY";
  }

  /** Get the volunteer's public key (base64). Only valid when KEYED. */
  async getVolPublic(): Promise<string> {
    const resp = expectResponse(
      await this.sendRequest({ type: "getVolPublic" }),
      "getVolPublic",
    );
    return resp.volPublic;
  }

  /**
   * Unwrap the org secret key via ECIES using the Worker's volPrivate.
   * Returns the unwrapped key as an ArrayBuffer (non-PII tier, for org-key module).
   */
  async unwrapOrgKey(
    wrappedOrgKey: string,
    ephemeralPoint: string,
    nonce: string,
  ): Promise<ArrayBuffer> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "unwrapOrgKey",
        wrappedOrgKey,
        ephemeralPoint,
        nonce,
      }),
      "unwrapOrgKey",
    );
    // care-y-ignore-next-line no-org-private-key-server -- protocol field, client-side bridge
    return resp.orgPrivateKey;
  }

  /**
   * Re-encrypt a cached tk for a new recipient's volPublic.
   * Returns the ECIES wrapping output (ephemeralPoint, nonce, wrappedKey).
   */
  async rewrapTk(
    ticketId: string,
    recipientVolPublic: string,
  ): Promise<{ ephemeralPoint: string; nonce: string; wrappedKey: string }> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "rewrapTk",
        ticketId,
        recipientVolPublic,
      }),
      "rewrapTk",
    );
    return {
      ephemeralPoint: resp.ephemeralPoint,
      nonce: resp.nonce,
      wrappedKey: resp.wrappedKey,
    };
  }

  /** Zero all keys, terminate the Worker, reject any pending requests. */
  destroy(): void {
    if (this.state === "DESTROYED") return;

    // Best-effort zeroAll before termination (fire-and-forget).
    // The Worker may already be terminated (e.g., browser tab closing),
    // in which case postMessage throws. This is expected, not an error.
    try {
      this.post.call(this.worker, { type: "zeroAll", id: this.nextId++ });
    } catch (err: unknown) {
      console.warn(
        "CryptoBridge: could not send zeroAll before terminate",
        err instanceof Error ? err.message : String(err),
      );
    }

    this.worker.terminate();
    this.state = "DESTROYED";

    // Reject all pending requests
    for (const [, entry] of this.pending) {
      entry.reject(new CryptoWorkerError("Worker destroyed", "WORKER_ERROR"));
    }
    this.pending.clear();
  }

  /** Current bridge state (for UI status indicators). */
  getState(): BridgeState {
    return this.state;
  }

  // ── Private ─────────────────────────────────────────────────────────

  private async sendRequest(
    req: RequestBody,
    transfer?: Transferable[],
  ): Promise<WorkerSuccessResponse> {
    if (this.state === "DESTROYED") {
      throw new CryptoWorkerError("Bridge is destroyed", "WORKER_ERROR");
    }

    const id = this.nextId++;
    const fullReq = { ...req, id };

    return new Promise<WorkerSuccessResponse>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });

      if (transfer) {
        this.post.call(this.worker, fullReq, { transfer });
      } else {
        this.post.call(this.worker, fullReq);
      }
    });
  }

  private handleResponse(res: WorkerResponse): void {
    const entry = this.pending.get(res.id);
    if (!entry) return; // Stale response (e.g., after destroy)

    this.pending.delete(res.id);

    if (res.ok) {
      entry.resolve(res);
    } else {
      entry.reject(new CryptoWorkerError(res.error, res.code));
    }
  }
}
