/**
 * Main-thread proxy to the dedicated portal crypto Worker.
 *
 * Callers use typed async methods without knowing a Worker is involved.
 * The bridge assigns monotonic IDs to each request, tracks pending
 * promises, and resolves them when the Worker responds. Mirrors the
 * CryptoBridge pattern for the volunteer crypto Worker.
 *
 * A portal session is one tab by design (ADR-091); no SharedWorker
 * variant exists. The Worker is instantiated at construction time
 * and destroyed on disconnect or page teardown.
 *
 * The postMessage binding is captured at construction time. If XSS
 * later patches Worker.prototype.postMessage, the bridge still uses
 * the original function (SEC-210 defense-in-depth).
 */

import { PortalWorkerError } from "./portal-bridge-errors.js";
import type {
  PortalWorkerRequest,
  PortalWorkerRequestType,
  PortalWorkerResponse,
  PortalWorkerSuccessResponse,
  PortalResponseForRequest,
  PortalWorkerEvent,
  PortalAttachmentInput,
  EciesTripleWireResponse,
  PortalAttachmentPayloadResponse,
  DerivationProgressEvent,
} from "./portal-protocol.js";

export type PortalBridgeState = "LOADING" | "READY" | "DESTROYED";
export type DerivationProgressHandler = (
  event: DerivationProgressEvent,
) => void;

/**
 * Distributive Omit that strips `id` from each union member individually.
 * Standard `Omit<Union, "id">` collapses the union, losing discriminant
 * narrowing.
 */
type RequestBody = PortalWorkerRequest extends infer R
  ? R extends PortalWorkerRequest
    ? Omit<R, "id">
    : never
  : never;

/**
 * Narrow a PortalWorkerSuccessResponse to the expected type.
 */
function expectResponse<T extends PortalWorkerRequestType>(
  resp: PortalWorkerSuccessResponse,
  expectedType: T,
): PortalResponseForRequest<T> {
  if (resp.type !== expectedType) {
    throw new PortalWorkerError("Unexpected response type", "WORKER_ERROR");
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrowed by discriminant check above
  return resp as PortalResponseForRequest<T>;
}

export class PortalBridge {
  private worker: Worker | null = null;
  private state: PortalBridgeState = "LOADING";
  private nextId = 0;
  private readonly pending = new Map<
    number,
    {
      resolve: (value: PortalWorkerSuccessResponse) => void;
      reject: (reason: PortalWorkerError) => void;
    }
  >();
  /** Captured at construction time to resist postMessage monkey-patching. */
  private post!: (msg: unknown, options?: StructuredSerializeOptions) => void;
  private readonly readyPromise: Promise<void>;
  private derivationProgressHandler: DerivationProgressHandler | null = null;

  constructor() {
    const worker = new Worker(new URL("./portal.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker = worker;
    this.post = (msg, options) => {
      worker.postMessage(msg, options);
    };

    worker.onmessage = (
      e: MessageEvent<PortalWorkerResponse | PortalWorkerEvent>,
    ): void => {
      const data = e.data;
      if ("kind" in data) {
        this.derivationProgressHandler?.(data);
        return;
      }
      this.handleResponse(data);
    };

    worker.onerror = (e: ErrorEvent): void => {
      console.error(
        "[PortalBridge] Worker error:",
        e.message,
        e.filename,
        e.lineno,
      );
      this.rejectAllPending(`Worker failed to load: ${e.message}`);
    };

    this.readyPromise = this.initWorker();
  }

  // -- Initialization ---------------------------------------------------------

  private async initWorker(): Promise<void> {
    await this.sendRequest({ type: "init" });
    this.state = "READY";
  }

  private rejectAllPending(
    message: string,
    code: "WORKER_ERROR" | "BRIDGE_DESTROYED" = "WORKER_ERROR",
  ): void {
    for (const [, entry] of this.pending) {
      entry.reject(new PortalWorkerError(message, code));
    }
    this.pending.clear();
  }

  // -- Public API: lifecycle --------------------------------------------------

  /** Wait for libsodium initialization in the Worker. */
  async waitReady(): Promise<void> {
    return this.readyPromise;
  }

  /** Current bridge state. */
  getState(): PortalBridgeState {
    return this.state;
  }

  /** Register a handler for derivation progress events. */
  onDerivationProgress(handler: DerivationProgressHandler): void {
    this.derivationProgressHandler = handler;
  }

  /**
   * Destroy the bridge: send zeroAll, then terminate the Worker.
   * All pending promises are rejected with BRIDGE_DESTROYED.
   */
  destroy(): void {
    if (this.state === "DESTROYED") return;

    if (this.worker) {
      try {
        this.post({ type: "zeroAll", id: this.nextId++ });
      } catch (err: unknown) {
        if (import.meta.env.DEV) {
          console.warn(
            "PortalBridge: could not send zeroAll before terminate",
            err instanceof Error ? err.message : String(err),
          );
        }
      }
      this.worker.terminate();
    }

    this.state = "DESTROYED";
    this.rejectAllPending("Worker destroyed", "BRIDGE_DESTROYED");
  }

  // -- Public API: channel session --------------------------------------------

  /**
   * Start a channel session: derive channelId and auth from seed,
   * run portalOprfInput + oprfBlind. The seed ArrayBuffer is transferred
   * and neutered on the main thread.
   *
   * Returns the channelId, auth, and blinded element. The caller sends
   * the blinded element to the OPRF server, then calls channelSessionFinish.
   */
  async channelSessionStart(
    seed: ArrayBuffer,
    passphrase?: string,
  ): Promise<{ channelId: string; auth: string; blindedElement: string }> {
    await this.readyPromise;
    const resp = expectResponse(
      await this.sendRequest(
        { type: "channelSessionStart", seed, passphrase },
        [seed],
      ),
      "channelSessionStart",
    );
    return {
      channelId: resp.channelId,
      auth: resp.auth,
      blindedElement: resp.blindedElement,
    };
  }

  /**
   * Re-run the channel derivation from the Worker-held seed with a new
   * passphrase. Valid after a failed key check or an unfinished round;
   * the seed never returns to the main thread.
   */
  async channelSessionRestart(
    passphrase?: string,
  ): Promise<{ channelId: string; auth: string; blindedElement: string }> {
    const resp = expectResponse(
      await this.sendRequest({ type: "channelSessionRestart", passphrase }),
      "channelSessionRestart",
    );
    return {
      channelId: resp.channelId,
      auth: resp.auth,
      blindedElement: resp.blindedElement,
    };
  }

  /**
   * Finish a channel session: OPRF finalize + derive keypair.
   * Returns the client public key (base64url).
   */
  async channelSessionFinish(
    evaluated: string,
  ): Promise<{ clientPublic: string }> {
    const resp = expectResponse(
      await this.sendRequest({ type: "channelSessionFinish", evaluated }),
      "channelSessionFinish",
    );
    return { clientPublic: resp.clientPublic };
  }

  /**
   * Verify the derived keypair against a server-stored key check.
   * Returns true iff the decrypted plaintext matches PORTAL_KEY_CHECK.
   */
  async verifyKeyCheck(
    ephemeralPoint: string,
    nonce: string,
    ciphertext: string,
  ): Promise<boolean> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "verifyKeyCheck",
        ephemeralPoint,
        nonce,
        ciphertext,
      }),
      "verifyKeyCheck",
    );
    return resp.passed;
  }

  // -- Public API: passphrase-derive (add-a-password) -------------------------

  /**
   * Start a passphrase-derive round from the Worker-held seed plus a
   * new passphrase, without disturbing the active session's keys.
   * Returns channelId, auth, and blindedElement for the evaluate hop.
   */
  async channelPassphraseDerive(
    passphrase: string,
  ): Promise<{ channelId: string; auth: string; blindedElement: string }> {
    const resp = expectResponse(
      await this.sendRequest({ type: "channelPassphraseDerive", passphrase }),
      "channelPassphraseDerive",
    );
    return {
      channelId: resp.channelId,
      auth: resp.auth,
      blindedElement: resp.blindedElement,
    };
  }

  /**
   * Finalize the passphrase-derive OPRF round. Returns only the new
   * client public key (base64url). The private key and all intermediates
   * are zeroed inside the Worker.
   */
  async channelPassphraseFinish(
    evaluated: string,
  ): Promise<{ clientPublic: string }> {
    const resp = expectResponse(
      await this.sendRequest({ type: "channelPassphraseFinish", evaluated }),
      "channelPassphraseFinish",
    );
    return { clientPublic: resp.clientPublic };
  }

  // -- Public API: message operations -----------------------------------------

  /**
   * Decrypt a portal message (ECIES triple encrypted to clientPublic).
   * Returns UTF-8 plaintext.
   */
  async decryptMessage(
    ephemeralPoint: string,
    nonce: string,
    ciphertext: string,
  ): Promise<string> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "decryptMessage",
        ephemeralPoint,
        nonce,
        ciphertext,
      }),
      "decryptMessage",
    );
    return resp.plaintext;
  }

  /**
   * Encrypt a client reply with optional attachments.
   * Returns the full payload ready for the portalReply mutation.
   */
  async encryptReply(
    text: string,
    orgPublicKey: string,
    ticketId: string,
    followUpId: string,
    keyGeneration: string,
    attachments?: readonly PortalAttachmentInput[],
  ): Promise<{
    encryptedContent: string;
    wrappedTkTemp: string;
    selfCopy: EciesTripleWireResponse;
    attachments: readonly PortalAttachmentPayloadResponse[];
  }> {
    const transfer: Transferable[] = [];
    if (attachments) {
      for (const att of attachments) {
        transfer.push(att.data);
      }
    }
    const resp = expectResponse(
      await this.sendRequest(
        {
          type: "encryptReply",
          text,
          orgPublicKey,
          ticketId,
          followUpId,
          keyGeneration,
          attachments: attachments ?? [],
        },
        transfer,
      ),
      "encryptReply",
    );
    return {
      encryptedContent: resp.encryptedContent,
      wrappedTkTemp: resp.wrappedTkTemp,
      selfCopy: resp.selfCopy,
      attachments: resp.attachments,
    };
  }

  // -- Public API: attachment operations --------------------------------------

  /**
   * Decrypt an attachment key from the client's self-copy ECIES wrap.
   * Returns the file key (base64url) and original filename.
   */
  async decryptAttachmentKey(
    ephemeralPoint: string,
    nonce: string,
    ciphertext: string,
  ): Promise<{ fileKey: string; filename: string }> {
    const resp = expectResponse(
      await this.sendRequest({
        type: "decryptAttachmentKey",
        ephemeralPoint,
        nonce,
        ciphertext,
      }),
      "decryptAttachmentKey",
    );
    return { fileKey: resp.fileKey, filename: resp.filename };
  }

  /**
   * Decrypt an attachment blob with a file key. The file key is zeroed
   * inside the Worker after one use. Returns decrypted bytes as a
   * Transferable ArrayBuffer.
   */
  async decryptAttachmentBlob(
    ciphertext: ArrayBuffer,
    fileKey: string,
    ticketId: string,
    attachmentId: string,
  ): Promise<ArrayBuffer> {
    const resp = expectResponse(
      await this.sendRequest(
        {
          type: "decryptAttachmentBlob",
          ciphertext,
          fileKey,
          ticketId,
          attachmentId,
        },
        [ciphertext],
      ),
      "decryptAttachmentBlob",
    );
    return resp.data;
  }

  // -- Public API: account session --------------------------------------------

  /**
   * Start an account session: Argon2id stretch + OPRF blind.
   * The password ArrayBuffer is transferred and neutered.
   * Returns the blinded element for the OPRF server.
   */
  async accountSessionStart(
    password: ArrayBuffer,
    salt: string,
  ): Promise<{ blindedElement: string }> {
    await this.readyPromise;
    const resp = expectResponse(
      await this.sendRequest({ type: "accountSessionStart", password, salt }, [
        password,
      ]),
      "accountSessionStart",
    );
    return { blindedElement: resp.blindedElement };
  }

  /**
   * Finish an account session: OPRF finalize + deriveClientAccountKeys.
   * Returns the client public key and auth token for the login mutation.
   */
  async accountSessionFinish(
    evaluated: string,
  ): Promise<{ clientPublic: string; authToken: string }> {
    const resp = expectResponse(
      await this.sendRequest({ type: "accountSessionFinish", evaluated }),
      "accountSessionFinish",
    );
    return { clientPublic: resp.clientPublic, authToken: resp.authToken };
  }

  // -- Public API: zero -------------------------------------------------------

  /** Zero all key material and return to READY state. */
  async zeroAll(): Promise<void> {
    await this.sendRequest({ type: "zeroAll" });
  }

  // -- Private ----------------------------------------------------------------

  private async sendRequest(
    req: RequestBody,
    transfer?: Transferable[],
  ): Promise<PortalWorkerSuccessResponse> {
    if (this.state === "DESTROYED") {
      throw new PortalWorkerError("Bridge is destroyed", "BRIDGE_DESTROYED");
    }

    const id = this.nextId++;
    const fullReq = { ...req, id };

    return new Promise<PortalWorkerSuccessResponse>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });

      if (transfer) {
        this.post(fullReq, { transfer });
      } else {
        this.post(fullReq);
      }
    });
  }

  private handleResponse(res: PortalWorkerResponse): void {
    const entry = this.pending.get(res.id);
    if (!entry) return;

    this.pending.delete(res.id);

    if (res.ok) {
      entry.resolve(res);
    } else {
      entry.reject(new PortalWorkerError(res.error, res.code));
    }
  }
}
