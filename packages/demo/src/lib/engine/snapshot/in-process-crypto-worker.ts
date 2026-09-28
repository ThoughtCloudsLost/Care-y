/**
 * A Worker stand-in for the Node seed snapshot builder, so the product's
 * CryptoBridge runs unchanged in dedicated mode without a browser.
 *
 * Node has no global Worker. The bridge's dedicated mode constructs
 * `new Worker(url, { type: "module" })` and then uses only onmessage,
 * onerror, postMessage(msg, { transfer }) and terminate. This class
 * provides exactly that surface over crypto-core's createDispatcher, the
 * same dispatcher crypto.worker.ts wires to `self`. Messages cross with
 * structuredClone (transfer lists honoured, so sent buffers are
 * neutered as they would be across a real Worker) and are delivered on a
 * later task, never synchronously.
 *
 * Key material stays inside crypto-core's module state, as it does in
 * the browser's worker. The build process holds one core, so at most one
 * bridge may be open at a time.
 *
 * Builder only: nothing in the shipped demo imports this module.
 */

import { createDispatcher } from "$lib/workers/crypto-core.js";
import type {
  WorkerRequest,
  RewrapResultEvent,
} from "$lib/workers/crypto-protocol.js";
import { SeedSnapshotBuildError } from "../errors.js";

type MessageHandler = (event: MessageEvent) => void;
type ErrorHandler = (event: ErrorEvent) => void;

/** The fields CryptoBridge reads off a worker error event. */
interface WorkerErrorLike {
  readonly message: string;
  readonly filename: string;
  readonly lineno: number;
}

function isWorkerMessage(
  value: unknown,
): value is WorkerRequest | RewrapResultEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    ("type" in value || "kind" in value)
  );
}

export class InProcessCryptoWorker {
  onmessage: MessageHandler | null = null;
  onerror: ErrorHandler | null = null;
  private terminated = false;
  private readonly dispatch: (req: WorkerRequest | RewrapResultEvent) => void;

  constructor(_url: URL | string, _options?: WorkerOptions) {
    this.dispatch = createDispatcher((msg, transfer) => {
      const data: unknown = structuredClone(msg, { transfer: transfer ?? [] });
      setTimeout(() => {
        if (this.terminated) return;
        // CryptoBridge reads only `data` off the event.
        this.onmessage?.({ data } as MessageEvent);
      }, 0);
    });
  }

  postMessage(message: unknown, options?: StructuredSerializeOptions): void {
    if (this.terminated) return;
    const data: unknown = structuredClone(message, options);
    setTimeout(() => {
      if (this.terminated) return;
      if (!isWorkerMessage(data)) {
        this.fail("In-process crypto worker received a malformed message");
        return;
      }
      try {
        this.dispatch(data);
      } catch (err: unknown) {
        this.fail(err instanceof Error ? err.message : String(err));
      }
    }, 0);
  }

  terminate(): void {
    this.terminated = true;
  }

  private fail(message: string): void {
    const event: WorkerErrorLike = { message, filename: "", lineno: 0 };
    // CryptoBridge reads only message, filename and lineno.
    this.onerror?.(event as ErrorEvent);
  }
}

/**
 * Install {@link InProcessCryptoWorker} as the global Worker for the
 * duration of `run`, then remove it again. Throws if the runtime already
 * has a Worker, since that means this is not the Node builder.
 */
export async function withInProcessCryptoWorker<T>(
  run: () => Promise<T>,
): Promise<T> {
  if (Reflect.has(globalThis, "Worker")) {
    throw new SeedSnapshotBuildError(
      "A global Worker already exists; the in-process crypto worker is for the Node builder only",
    );
  }
  Object.defineProperty(globalThis, "Worker", {
    value: InProcessCryptoWorker,
    configurable: true,
    writable: true,
  });
  try {
    return await run();
  } finally {
    Reflect.deleteProperty(globalThis, "Worker");
  }
}
