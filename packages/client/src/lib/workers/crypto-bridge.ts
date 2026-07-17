/**
 * Main-thread proxy to the crypto Worker (shared or dedicated).
 *
 * Callers use typed async methods (decrypt, encrypt, deriveKeys, etc.)
 * without knowing a Worker is involved. The bridge assigns monotonic IDs
 * to each request, tracks pending promises, and resolves them when the
 * Worker responds. Follows ProtonMail's CryptoProxy pattern (SEC-211).
 *
 * In "shared" mode (default), the bridge connects to a SharedWorker
 * that survives page refreshes (ADR-044). On reconnection to an
 * already-keyed Worker, the bridge skips password derivation. Falls
 * back to a dedicated Worker if SharedWorker is unavailable.
 *
 * In "dedicated" mode, the bridge uses a standalone dedicated Worker.
 * Used by password change flows that need an isolated key derivation.
 *
 * The postMessage binding is captured at construction time. If XSS
 * later patches Worker.prototype.postMessage, the bridge still uses
 * the original function (SEC-210 defense-in-depth).
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
  WorkerEvent,
  RewrapResultEvent,
  StateChangeEvent,
} from "./crypto-protocol.js";

export type BridgeState = "LOADING" | "READY" | "KEYED" | "DESTROYED";
export type BridgeMode = "shared" | "dedicated";
export type StateChangeHandler = (event: StateChangeEvent) => void;

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

export type WorkerEventHandler = (event: WorkerEvent) => void;

export class CryptoBridge {
  private worker: Worker | null = null;
  private sharedWorker: SharedWorker | null = null;
  private port: MessagePort | null = null;
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
  private post!: (msg: unknown, options?: StructuredSerializeOptions) => void;
  private readonly readyPromise: Promise<void>;
  private workerEventHandler: WorkerEventHandler | null = null;
  private stateChangeHandler: StateChangeHandler | null = null;
  private stateCallback: ((state: BridgeState) => void) | null = null;
  private readonly mode: BridgeMode;
  private reconnected = false;
  private reconnectVolPublic: string | undefined;
  private reconnectOrgPublicKey: string | undefined;

  constructor(mode: BridgeMode = "shared") {
    this.mode = mode;

    if (mode === "shared" && typeof SharedWorker !== "undefined") {
      this.initShared();
    } else {
      this.initDedicated();
    }

    this.readyPromise = this.initWorker();
  }

  // ── Initialization ──────────────────────────────────────────────────

  private initShared(): void {
    const sw = new SharedWorker(
      new URL("./crypto.shared-worker.ts", import.meta.url),
      { type: "module", name: "care-y-crypto", extendedLifetime: true },
    );
    this.sharedWorker = sw;
    this.port = sw.port;
    const boundPost = sw.port.postMessage.bind(sw.port);
    this.post = (msg, options) => {
      boundPost(msg, options);
    };

    sw.port.onmessage = (
      e: MessageEvent<WorkerResponse | WorkerEvent>,
    ): void => {
      const data = e.data;
      if ("kind" in data) {
        if (data.kind === "stateChange") {
          this.handleStateChange(data);
        } else {
          this.workerEventHandler?.(data);
        }
        return;
      }
      this.handleResponse(data);
    };

    sw.onerror = (e: Event): void => {
      console.error("[CryptoBridge] SharedWorker error:", e);
      this.setState("READY");
      this.rejectAllPending("SharedWorker failed to load");
    };

    sw.port.start();
  }

  private initDedicated(): void {
    const worker = new Worker(new URL("./crypto.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker = worker;
    this.post = (msg, options) => {
      worker.postMessage(msg, options);
    };

    worker.onmessage = (
      e: MessageEvent<WorkerResponse | WorkerEvent>,
    ): void => {
      const data = e.data;
      if ("kind" in data) {
        this.workerEventHandler?.(data);
        return;
      }
      this.handleResponse(data);
    };

    worker.onerror = (e: ErrorEvent): void => {
      console.error(
        "[CryptoBridge] Worker error:",
        e.message,
        e.filename,
        e.lineno,
      );
      this.setState("READY");
      this.rejectAllPending(`Worker failed to load: ${e.message}`);
    };
  }

  private async initWorker(): Promise<void> {
    await this.sendRequest({ type: "init" });
    this.setState("READY");

    if (this.sharedWorker) {
      const resp = expectResponse(
        await this.sendRequest({ type: "connect" }),
        "connect",
      );
      if (resp.state === "KEYED") {
        this.reconnected = true;
        this.reconnectVolPublic = resp.volPublic;
        this.reconnectOrgPublicKey = resp.orgPublicKey;
        this.setState("KEYED");
      }
    }
  }

  private rejectAllPending(
    message: string,
    code: "WORKER_ERROR" | "BRIDGE_DESTROYED" = "WORKER_ERROR",
  ): void {
    for (const [, entry] of this.pending) {
      entry.reject(new CryptoWorkerError(message, code));
    }
    this.pending.clear();
  }

  // ── Public API: lifecycle ─────────────────────────────────────────

  /** Wait for libsodium initialization in the Worker. */
  async waitReady(): Promise<void> {
    return this.readyPromise;
  }

  /** Whether the bridge reconnected to an already-keyed SharedWorker. */
  isReconnected(): boolean {
    return this.reconnected;
  }

  /** Public keys from the reconnected SharedWorker (undefined if cold start). */
  getReconnectData(): { volPublic?: string; orgPublicKey?: string } {
    return {
      volPublic: this.reconnectVolPublic,
      orgPublicKey: this.reconnectOrgPublicKey,
    };
  }

  /** Current bridge mode. */
  getMode(): BridgeMode {
    return this.sharedWorker ? "shared" : "dedicated";
  }

  /**
   * Gracefully disconnect this port from the SharedWorker.
   * In shared mode: sends disconnect message, starts zero-on-last-disconnect timer.
   * In dedicated mode: fires zeroAll + terminate (same as old destroy behavior).
   */
  disconnect(): void {
    if (this.state === "DESTROYED") return;

    if (this.sharedWorker && this.port) {
      try {
        this.post({ type: "disconnect", id: this.nextId++ });
      } catch (err: unknown) {
        if (import.meta.env.DEV) {
          console.warn(
            "CryptoBridge: could not send disconnect (port already closed)",
            err instanceof Error ? err.message : String(err),
          );
        }
      }
      this.setState("DESTROYED");
      this.rejectAllPending("Bridge disconnected", "BRIDGE_DESTROYED");
    } else {
      this.destroy();
    }
  }

  /** Register a handler for SharedWorker state change broadcasts. */
  onStateChange(handler: StateChangeHandler): void {
    this.stateChangeHandler = handler;
  }

  /**
   * Register a handler for ALL bridge state transitions (local and remote).
   * Fires from setState() on every transition. Used by CryptoProvider to
   * keep the reactive isCryptoKeyed() signal in sync (ADR-049).
   */
  onBridgeStateChange(handler: (state: BridgeState) => void): void {
    this.stateCallback = handler;
  }

  // ── Public API: crypto operations ─────────────────────────────────

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
    this.setState("KEYED");
    return { volPublic: resp.volPublic };
  }

  /**
   * Decrypt ticket content. Returns UTF-8 plaintext.
   * The slot names where the ciphertext was stored (ADR-053), e.g.
   * "title" or followupSlot(id); it feeds the AEAD associated data.
   */
  async decrypt(
    ticketId: string,
    slot: string,
    keyCacheId: string,
    ephemeralPoint: string,
    nonce: string,
    wrappedKey: string,
    ciphertext: string,
  ): Promise<string> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "decryptContent",
        ticketId,
        keyCacheId,
        slot,
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
   * Decrypt follow-up content encrypted with tk_temp, display it, and
   * trigger background re-encryption with the ticket's canonical tk.
   * Returns UTF-8 plaintext (same as decrypt). The Worker posts a
   * RewrapEvent to the main thread as a side-effect and caches tk_temp
   * for subsequent rewrapBlob calls.
   */
  async decryptAndRewrap(
    followUpId: string,
    ticketId: string,
    ephemeralPoint: string,
    nonce: string,
    wrappedKey: string,
    ciphertext: string,
  ): Promise<string> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "decryptAndRewrap",
        followUpId,
        ticketId,
        ephemeralPoint,
        nonce,
        wrappedKey,
        ciphertext,
      }),
      "decryptAndRewrap",
    );
    return resp.plaintext;
  }

  /**
   * Re-encrypt a single blob from tk_temp to canonical tk.
   * The Worker must have cached tk_temp from a prior decryptAndRewrap call.
   * Returns the re-encrypted blob data and metadata for the server mutation.
   */
  async rewrapBlob(
    followUpId: string,
    ticketId: string,
    ciphertext: string,
    blobKey: string,
    blobId: string,
    category: "attachment" | "recording",
  ): Promise<{
    encryptedData: string;
    blobKey: string;
    category: "attachment" | "recording";
  }> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "rewrapBlob",
        followUpId,
        ticketId,
        ciphertext,
        blobKey,
        blobId,
        category,
      }),
      "rewrapBlob",
    );
    return {
      encryptedData: resp.encryptedData,
      blobKey: resp.blobKey,
      category: resp.category,
    };
  }

  /**
   * Encrypt plaintext with the cached tk for this ticket.
   * Returns base64 ciphertext. The tk must have been cached by a prior decrypt.
   */
  async encrypt(
    ticketId: string,
    slot: string,
    plaintext: string,
  ): Promise<string> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "encryptContent",
        ticketId,
        slot,
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
    slot: string,
    ephemeralPoint: string,
    nonce: string,
    wrappedKey: string,
    ciphertext: string,
  ): Promise<ArrayBuffer> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "decryptBlob",
        ticketId,
        keyCacheId: ticketId,
        slot,
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
    this.setState("READY");
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
   * Unwrap the org key via ECIES using the Worker's volPrivate.
   * The Worker retains the secret for XSS isolation. Returns only the
   * org public key (base64) for main-thread caching.
   */
  async unwrapOrgKey(
    wrappedOrgKey: string,
    ephemeralPoint: string,
    nonce: string,
  ): Promise<string> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "unwrapOrgKey",
        wrappedOrgKey,
        ephemeralPoint,
        nonce,
      }),
      "unwrapOrgKey",
    );
    return resp.orgPublicKey;
  }

  /**
   * Preload a ticket key into the Worker cache without requiring ciphertext.
   * Used by password change to pre-cache all tks before re-wrapping.
   */
  async unwrapTk(
    ticketId: string,
    keyCacheId: string,
    ephemeralPoint: string,
    nonce: string,
    wrappedKey: string,
  ): Promise<void> {
    await this.sendRequest({
      type: "unwrapTk",
      ticketId,
      keyCacheId,
      ephemeralPoint,
      nonce,
      wrappedKey,
    });
  }

  /**
   * ECIES-encrypt data with the Worker's current volPublic.
   * Used by password change to re-wrap the org private key after key re-derivation.
   */
  async wrapWithVolPublic(
    data: string,
  ): Promise<{ ephemeralPoint: string; nonce: string; wrappedKey: string }> {
    const resp = expectResponse(
      await this.sendRequest({ type: "wrapWithVolPublic", data }),
      "wrapWithVolPublic",
    );
    return {
      ephemeralPoint: resp.ephemeralPoint,
      nonce: resp.nonce,
      wrappedKey: resp.wrappedKey,
    };
  }

  /**
   * Seal a payload (base64) to the Worker's own volPublic with the
   * self-blob domain tag inside. Used for server-stored per-user data
   * (recently-viewed history).
   */
  async sealSelfBlob(data: string): Promise<{
    ephemeralPoint: string;
    nonce: string;
    wrappedPayload: string;
  }> {
    const resp = expectResponse(
      await this.sendRequest({ type: "sealSelfBlob", data }),
      "sealSelfBlob",
    );
    return {
      ephemeralPoint: resp.ephemeralPoint,
      nonce: resp.nonce,
      wrappedPayload: resp.wrappedPayload,
    };
  }

  /**
   * Open a self-blob envelope with the Worker's volPrivate. Rejects
   * envelopes whose plaintext lacks the self-blob domain tag (the Worker
   * refuses to act as a generic vol_private decrypt oracle). Returns the
   * payload base64.
   */
  async openSelfBlob(envelope: {
    ephemeralPoint: string;
    nonce: string;
    wrappedPayload: string;
  }): Promise<string> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "openSelfBlob",
        ephemeralPoint: envelope.ephemeralPoint,
        nonce: envelope.nonce,
        wrappedPayload: envelope.wrappedPayload,
      }),
      "openSelfBlob",
    );
    return resp.data;
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

  async createTicketEncryption(
    ticketId: string,
    fields: readonly { name: string; plaintext: string }[],
  ): Promise<{
    encryptedFields: readonly { name: string; ciphertext: string }[];
    keyWrap: { ephemeralPoint: string; nonce: string; wrappedKey: string };
    keyGeneration: string;
  }> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "createTicketKey",
        ticketId,
        fields,
      }),
      "createTicketKey",
    );
    return {
      encryptedFields: resp.encryptedFields,
      keyWrap: resp.keyWrap,
      keyGeneration: resp.keyGeneration,
    };
  }

  /** Decrypt org-tier sealed-box ciphertext. Returns UTF-8 plaintext. */
  async orgDecrypt(ciphertext: string): Promise<string> {
    const resp = expectResponse(
      await this.sendRequest({ type: "orgDecrypt", ciphertext }),
      "orgDecrypt",
    );
    return resp.plaintext;
  }

  /** Encrypt plaintext with the org public key (sealed-box). Returns base64 ciphertext. */
  async orgEncrypt(plaintext: string): Promise<string> {
    const resp = expectResponse(
      await this.sendRequest({ type: "orgEncrypt", plaintext }),
      "orgEncrypt",
    );
    return resp.ciphertext;
  }

  /**
   * Batch decrypt multiple org-tier sealed-box ciphertexts.
   * Returns per-item results with null for individual failures.
   */
  async orgDecryptBatch(
    items: readonly { cacheKey: string; ciphertext: string }[],
  ): Promise<readonly { cacheKey: string; plaintext: string | null }[]> {
    const resp = expectResponse(
      await this.sendRequest({ type: "orgDecryptBatch", items }),
      "orgDecryptBatch",
    );
    return resp.results;
  }

  /**
   * Export the org secret key from the Worker as a Transferable ArrayBuffer.
   * For escrow export and password change only. Zero immediately after use.
   */
  async exportOrgSecretKey(): Promise<ArrayBuffer> {
    const resp = expectResponse(
      await this.sendRequest({ type: "exportOrgSecretKey" }),
      "exportOrgSecretKey",
    );
    return resp.orgSecretKey;
  }

  /** Get the org public key (base64) from the Worker. */
  async getOrgPublicKey(): Promise<string> {
    const resp = expectResponse(
      await this.sendRequest({ type: "getOrgPublicKey" }),
      "getOrgPublicKey",
    );
    return resp.orgPublicKey;
  }

  /**
   * Destroy the bridge. In dedicated mode: zeroAll + terminate.
   * In shared mode: disconnect port (SharedWorker stays alive for other tabs).
   */
  destroy(): void {
    if (this.state === "DESTROYED") return;

    if (this.worker) {
      try {
        this.post({ type: "zeroAll", id: this.nextId++ });
      } catch (err: unknown) {
        console.warn(
          "CryptoBridge: could not send zeroAll before terminate",
          err instanceof Error ? err.message : String(err),
        );
      }
      this.worker.terminate();
    } else {
      this.disconnect();
      return;
    }

    this.setState("DESTROYED");
    this.rejectAllPending("Worker destroyed", "BRIDGE_DESTROYED");
  }

  /** Register a handler for Worker-initiated events (re-wrap notifications). */
  onWorkerEvent(handler: WorkerEventHandler): void {
    this.workerEventHandler = handler;
  }

  /** Post a non-request event to the Worker (e.g., re-wrap result). */
  postEvent(event: RewrapResultEvent): void {
    if (this.state === "DESTROYED") return;
    this.post(event);
  }

  /** Current bridge state (for UI status indicators). */
  getState(): BridgeState {
    return this.state;
  }

  // ── Private ─────────────────────────────────────────────────────────

  private setState(newState: BridgeState): void {
    if (this.state === newState) return;
    this.state = newState;
    this.stateCallback?.(newState);
  }

  private handleStateChange(event: StateChangeEvent): void {
    if (event.state === "READY") {
      this.setState("READY");
    } else {
      this.setState("KEYED");
    }
    this.stateChangeHandler?.(event);
  }

  private async sendRequest(
    req: RequestBody,
    transfer?: Transferable[],
  ): Promise<WorkerSuccessResponse> {
    if (this.state === "DESTROYED") {
      throw new CryptoWorkerError("Bridge is destroyed", "BRIDGE_DESTROYED");
    }

    const id = this.nextId++;
    const fullReq = { ...req, id };

    return new Promise<WorkerSuccessResponse>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });

      if (transfer) {
        this.post(fullReq, { transfer });
      } else {
        this.post(fullReq);
      }
    });
  }

  private handleResponse(res: WorkerResponse): void {
    const entry = this.pending.get(res.id);
    if (!entry) return;

    this.pending.delete(res.id);

    if (res.ok) {
      entry.resolve(res);
    } else {
      entry.reject(new CryptoWorkerError(res.error, res.code));
    }
  }
}
