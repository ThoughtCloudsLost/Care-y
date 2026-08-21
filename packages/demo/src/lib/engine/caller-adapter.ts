/**
 * Caller adapter: wraps a tRPC callerFactory result as a ProcedureProxy
 * tree, reshaping response values to the JSON wire format the client
 * expects.
 *
 * Extracted from bootDemoEngine to keep the boot function focused on
 * sequencing. The adapter is the demo's server boundary: every
 * phone-side call crosses it, mock-overlay delegations included.
 */

import { TRPCError } from "@trpc/server";
import { TRPCClientError } from "@trpc/client";
import { makeProcedureProxy, type ProcedureProxy } from "./proc-proxy.js";
import {
  traceFlowSpan,
  buildFlowDetail,
  describeFlowError,
} from "../flow-events.js";

// ── Wire reshaping ─────────────────────────────────────────────────
//
// Reshape a caller result to the JSON wire shape the client expects.
// tRPC over HTTP (no superjson) serializes Node Buffers as
// { type: "Buffer", data: number[] }; the in-process caller returns
// live Buffer/Uint8Array instances, which client helpers like
// serializedBufferToBase64 cannot read (buf.data is undefined), so
// ciphertext reached the crypto worker as empty bytes and every
// ticket decrypt failed. Dates and primitives pass through unchanged.
//
// Optimization: returns the ORIGINAL reference for any subtree that
// contains no Uint8Array, only rebuilding nodes on the path to a
// converted Buffer. This avoids deep-cloning buffer-free response
// trees (the common case for most queries).

/**
 * Walk `value` and convert Uint8Array leaves to the { type, data }
 * wire shape. Returns the original reference when no descendant
 * contains a Uint8Array.
 */
export function reshapeWire(value: unknown): unknown {
  if (value instanceof Uint8Array) {
    return { type: "Buffer", data: Array.from(value) };
  }
  if (value instanceof Date) return value;
  if (Array.isArray(value)) {
    const items: readonly unknown[] = value;
    let changed = false;
    const out: unknown[] = [];
    for (const original of items) {
      const reshaped = reshapeWire(original);
      out.push(reshaped);
      if (reshaped !== original) changed = true;
    }
    return changed ? out : value;
  }
  if (value !== null && typeof value === "object") {
    // Map instead of computed property writes: keys arrive from
    // arbitrary response objects, and Map.set carries no
    // prototype-pollution surface.
    const entries = Object.entries(value);
    let changed = false;
    const built = new Map<string, unknown>();
    for (const [key, entry] of entries) {
      const reshaped = reshapeWire(entry);
      built.set(key, reshaped);
      if (reshaped !== entry) changed = true;
    }
    return changed ? Object.fromEntries(built) : value;
  }
  return value;
}

// ── Error branding ─────────────────────────────────────────────────

/**
 * Brand-check a thrown value as a TRPCError without relying on
 * instanceof. @trpc/server v11 duplicates its core (including the
 * TRPCError class) across its own published entry bundles, so the copy
 * a router chunk throws is not reliably the copy this module imported;
 * instanceof across those copies is false while the shape is identical.
 */
export function isTrpcServerError(err: unknown): err is TRPCError {
  return (
    err instanceof Error &&
    err.name === "TRPCError" &&
    typeof (err as { code?: unknown }).code === "string"
  );
}

// ── Adapter factory ────────────────────────────────────────────────

export interface CallerAdapterDeps {
  /** The tRPC caller object (recursive proxy). */
  readonly callerObj: Record<string, unknown>;
  /**
   * Called before each dispatch when the dirty flag is set. Reloads
   * the admin user record so ctx.user reflects recent mutations.
   */
  readonly refreshAdminUser: () => Promise<void>;
  /**
   * Mark the admin user as dirty so the next dispatch refreshes it.
   * The adapter calls this after mutate dispatches and the caller
   * can also call it for out-of-band mutations (e.g. setSignedInRole).
   */
  readonly markDirty: () => void;
  /**
   * Query the current dirty state. Exposed so the adapter can check
   * without closing over mutable state.
   */
  readonly isDirty: () => boolean;
}

/**
 * Create the caller adapter. Returns the ProcedureProxy tree.
 *
 * Every phone-side call crosses dispatchPath, so it is the demo's
 * server boundary and the only honest place to time a request. The
 * embedded router carries no demo middleware and must not grow one.
 */
export function createCallerAdapter(deps: CallerAdapterDeps): ProcedureProxy {
  const { callerObj, refreshAdminUser, markDirty, isDirty } = deps;

  async function dispatchPath(
    path: readonly string[],
    kind: "query" | "mutate",
    input?: unknown,
  ): Promise<unknown> {
    const procedurePath = path.join(".");
    // reshapeWire returns the original reference when no Uint8Array was
    // found in the tree, so a reference mismatch is the cheapest "has
    // ciphertext" signal. Captured here because resultDetail receives
    // the already-reshaped return value.
    let responseHadCiphertext = false;
    return traceFlowSpan(
      {
        lane: "server",
        label: `route ${procedurePath}`,
        detail: () =>
          buildFlowDetail({
            source: procedurePath,
            input: [{ name: "kind", value: kind, kind: "identifier" }],
          }),
        resultDetail: () =>
          buildFlowDetail({
            source: procedurePath,
            result: [
              {
                name: "carries ciphertext",
                value: responseHadCiphertext ? "yes" : "no",
                kind: responseHadCiphertext ? "ciphertext" : "metadata",
              },
            ],
          }),
        failureDetail: (err) => {
          // Only the code travels. TRPCError.message is free text and
          // can embed the input values that caused the failure.
          const code = isTrpcServerError(err)
            ? err.code
            : describeFlowError(err);
          return buildFlowDetail({
            source: procedurePath,
            result: [{ name: "error", value: code, kind: "metadata" }],
          });
        },
      },
      async () => {
        try {
          // Per-request user reload, mirroring the production session
          // middleware: profile mutations must be visible to the very
          // next ctx.user read. Only refresh when a prior mutation (or
          // out-of-band role switch) set the dirty flag.
          if (isDirty()) {
            await refreshAdminUser();
          }
          // The tRPC caller is a recursive proxy: property access resolves
          // procedures, but it exposes no enumerable own keys, so key
          // enumeration (Object.entries) sees nothing. Always use Reflect.get.
          let node: unknown = callerObj;
          for (const segment of path) {
            if (node === undefined || node === null) break;
            node = Reflect.get(node as Record<string, unknown>, segment);
          }
          if (typeof node !== "function") {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Procedure "${path.join(".")}" not found`,
            });
          }
          try {
            const result = await (node as (i: unknown) => Promise<unknown>)(
              input,
            );
            const reshaped = reshapeWire(result);
            responseHadCiphertext = reshaped !== result;
            return reshaped;
          } finally {
            // Mark dirty after any mutation (success or failure) so the
            // next dispatch sees the updated user record. A procedure that
            // writes rows then throws still dirties the DB, and the next
            // read must reflect those writes.
            if (kind === "mutate") {
              markDirty();
            }
          }
        } catch (err: unknown) {
          if (isTrpcServerError(err)) {
            throw TRPCClientError.from(err);
          }
          throw err;
        }
      },
    );
  }

  return makeProcedureProxy(dispatchPath);
}
