/**
 * Portal thread reseed composable.
 *
 * After a volunteer generates a new portal link, this walks every ticket
 * belonging to the client, has the crypto Worker re-seal each eligible
 * follow-up and media item under the new channel key, and posts the
 * re-sealed copies to the server in chunks.
 *
 * Processing is sequential (chunked + progress, not parallel) per the
 * user's design choice. Messages are processed before media for each
 * ticket. Blob conversions (null-wrap items) run strictly one at a time.
 */

import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import type {
  KeyWrapTriple,
  PortalCopyTriple,
} from "$lib/workers/crypto-protocol.js";
import { readRateLimitError } from "$lib/portal/rate-limit-error.js";
import { requireRouter } from "$lib/errors.js";
import { trpc as defaultTrpc } from "$lib/trpc/index.js";
import { encode } from "@care-y/crypto";
import { fetchBlob as defaultFetchBlob } from "$lib/utils/fetch-blob.js";
import { SvelteSet } from "svelte/reactivity";

// ── Chunk/batch constants ──────────────────────────────────────────────

/** Max items per sealFollowUpsToPublic bridge call. */
const SEAL_BATCH_SIZE = 50;

/** Max messages per reseedPortalHistory mutation. */
const RESEED_MESSAGE_CHUNK = 200;

/** Max attachment/recording wraps per reseedPortalHistory mutation. */
const RESEED_MEDIA_CHUNK = 100;

/** Max items per sealFileKeysToPublic bridge call. */
const FILE_KEY_BATCH_SIZE = 50;

/** Follow-up page size for listFollowUps pagination. */
const FOLLOWUP_PAGE_SIZE = 500;

/** Media page size for listAttachments/listRecordings pagination. */
const MEDIA_PAGE_SIZE = 200;

/**
 * Follow-up types eligible for portal message copies. Must stay in step
 * with MESSAGE_COPY_TYPES in the server's reseed service, which rejects
 * anything outside its set. email_outbound and email_inbound are included
 * because the live send path stores a portal copy for every org email
 * (outbound) and the ingest handler stores one for every client reply
 * (inbound); recovered history should match the live thread.
 */
const ELIGIBLE_TYPES = new Set([
  "message",
  "sms_outbound",
  "sms_inbound",
  "email_outbound",
  "email_inbound",
]);

// ── Public types ───────────────────────────────────────────────────────

export interface PortalReseedState {
  readonly phase: "idle" | "running" | "done" | "cancelled" | "error";
  readonly ticketsTotal: number;
  readonly ticketsDone: number;
  readonly itemsDone: number;
  readonly itemsTotal: number;
  readonly skippedCount: number;
}

export interface PortalReseedStartArgs {
  readonly clientId: string;
  readonly channelId: string;
  readonly clientPublic: string;
}

export interface PortalReseed {
  readonly state: PortalReseedState;
  start(args: PortalReseedStartArgs): Promise<void>;
  cancel(): void;
}

// ── Wire types (inferred from tRPC router shapes) ──────────────────────

interface WireFollowUp {
  readonly id: string;
  readonly type: string;
  readonly source?: string;
  readonly isPrivate: boolean;
  readonly encryptedContent: string;
  readonly keyWrap: KeyWrapTriple | null;
  readonly portalWrap?: string | null;
}

interface WireAttachment {
  readonly id: string;
  readonly followupId: string | null;
  readonly blobKey: string;
  readonly fileKeyWrap: string | null;
  readonly encryptedFilename: string | null;
}

interface WireRecording {
  readonly id: string;
  readonly followupId: string | null;
  readonly blobKey: string;
  readonly fileKeyWrap: string | null;
}

// ── Deps (optional overrides for testability) ──────────────────────────

interface TrpcSurface {
  tickets: {
    listForClient: {
      query: (input: { clientId: string }) => Promise<
        {
          ticketId: string;
          /** Caller's wrap for the ticket's current key generation. */
          keyWrap: KeyWrapTriple | null;
        }[]
      >;
    };
    listFollowUps: {
      query: (input: {
        ticketId: string;
        limit: number;
        cursor?: string;
        direction?: "newer" | "older";
        includeClientSource?: boolean;
      }) => Promise<{
        followUps: WireFollowUp[];
        reactions: Record<string, unknown>;
      }>;
    };
    listAttachments: {
      query: (input: {
        ticketId: string;
        limit: number;
        cursor?: string;
        direction?: "newer" | "older";
      }) => Promise<WireAttachment[]>;
    };
    listRecordings: {
      query: (input: {
        ticketId: string;
        limit: number;
        cursor?: string;
        direction?: "newer" | "older";
      }) => Promise<WireRecording[]>;
    };
    reseedPortalHistory: {
      mutate: (input: {
        clientId: string;
        channelId: string;
        messages: { followupId: string; copy: PortalCopyTriple }[];
        attachmentWraps: {
          attachmentId: string;
          followupId: string;
          copy: PortalCopyTriple;
        }[];
        recordingWraps: {
          recordingId: string;
          followupId: string;
          copy: PortalCopyTriple;
        }[];
      }) => Promise<{ inserted: number; skipped: number }>;
    };
    convertBlobForReseed: {
      mutate: (input: {
        clientId: string;
        channelId: string;
        kind: "attachment" | "recording";
        rowId: string;
        followupId: string;
        encryptedData: string;
        fileKeyWrap: string;
        copy: PortalCopyTriple;
      }) => Promise<{ inserted: boolean }>;
    };
  };
}

export interface PortalReseedDeps {
  readonly bridge: CryptoBridge;
  readonly trpc?: TrpcSurface;
  readonly fetchBlob?: (path: string) => Promise<ArrayBuffer>;
}

/**
 * Resolve a TrpcSurface from deps or the default module-level client.
 * The real client's decorated procedures are not structurally
 * assignable to the narrow TrpcSurface, so the default is a set of
 * delegating wrappers: each call is type-checked against the real
 * procedure, with no assertion anywhere.
 */
function resolveTrpc(deps: PortalReseedDeps): TrpcSurface {
  if (deps.trpc !== undefined) return deps.trpc;
  const tickets = requireRouter(defaultTrpc.tickets, "tickets");
  return {
    tickets: {
      listForClient: {
        query: async (input) => tickets.listForClient.query(input),
      },
      listFollowUps: {
        query: async (input) => tickets.listFollowUps.query(input),
      },
      listAttachments: {
        query: async (input) => tickets.listAttachments.query(input),
      },
      listRecordings: {
        query: async (input) => tickets.listRecordings.query(input),
      },
      reseedPortalHistory: {
        mutate: async (input) => tickets.reseedPortalHistory.mutate(input),
      },
      convertBlobForReseed: {
        mutate: async (input) => tickets.convertBlobForReseed.mutate(input),
      },
    },
  };
}

// ── Helpers ────────────────────────────────────────────────────────────

/** Chunk an array into sub-arrays of at most `size` elements. */
function chunk<T>(arr: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Detect a server "already converted" conflict from the tRPC error shape.
 * The server throws NotFoundError(PORTAL_RESEED_ALREADY_CONVERTED) which
 * arrives as a NOT_FOUND tRPC error with code "PORTAL_RESEED_ALREADY_CONVERTED".
 */
function isAlreadyConverted(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("data" in err)) return false;
  const record = err as Record<string, unknown>;
  const data = record.data;
  if (typeof data !== "object" || data === null || !("code" in data))
    return false;
  const dataRecord = data as Record<string, unknown>;
  return dataRecord.code === "PORTAL_RESEED_ALREADY_CONVERTED";
}

// ── Factory ────────────────────────────────────────────────────────────

export function createPortalReseed(deps: PortalReseedDeps): PortalReseed {
  const { bridge } = deps;
  const trpcClient = resolveTrpc(deps);
  const fetchBlobFn = deps.fetchBlob ?? defaultFetchBlob;

  let phase = $state<PortalReseedState["phase"]>("idle");
  let ticketsTotal = $state(0);
  let ticketsDone = $state(0);
  let itemsDone = $state(0);
  let itemsTotal = $state(0);
  let skippedCount = $state(0);

  let cancelled = false;
  let activeTimer: ReturnType<typeof setTimeout> | null = null;

  function isCancelled(): boolean {
    return cancelled;
  }

  function cleanup(): void {
    if (activeTimer !== null) {
      clearTimeout(activeTimer);
      activeTimer = null;
    }
  }

  /**
   * Retry a single async call once on network/mutation error.
   * Rate-limit errors wait the advised delay, then retry once.
   * Returns the result or throws on a second failure.
   */
  async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err: unknown) {
      const rateInfo = readRateLimitError(err);
      if (rateInfo !== null) {
        const waitMs = (rateInfo.retryAfterSeconds ?? 30) * 1000;
        await new Promise<void>((resolve) => {
          activeTimer = setTimeout(() => {
            activeTimer = null;
            resolve();
          }, waitMs);
        });
        // Single retry after rate-limit wait
        return fn();
      }
      // Non-rate-limit: single retry
      return fn();
    }
  }

  async function start(args: PortalReseedStartArgs): Promise<void> {
    if (phase === "running") return;

    phase = "running";
    cancelled = false;
    ticketsTotal = 0;
    ticketsDone = 0;
    itemsDone = 0;
    itemsTotal = 0;
    skippedCount = 0;

    try {
      await run(args);
    } catch {
      if (!isCancelled()) {
        phase = "error";
      }
      return;
    } finally {
      cleanup();
    }

    if (isCancelled()) {
      phase = "cancelled";
    } else {
      phase = "done";
    }
  }

  async function run(args: PortalReseedStartArgs): Promise<void> {
    const { clientId, channelId, clientPublic } = args;

    // Step 1: enumerate tickets for this client
    const tickets = await withRetry(async () =>
      trpcClient.tickets.listForClient.query({ clientId }),
    );

    ticketsTotal = tickets.length;

    // Step 2-4: process each ticket sequentially
    for (const { ticketId, keyWrap: ticketKeyWrap } of tickets) {
      if (isCancelled()) return;

      const blockedParents = await processTicketMessages(
        ticketId,
        clientId,
        channelId,
        clientPublic,
        ticketKeyWrap,
      );
      if (isCancelled()) return;

      await processTicketMedia(
        ticketId,
        clientId,
        channelId,
        clientPublic,
        blockedParents,
        ticketKeyWrap,
      );
      if (isCancelled()) return;

      ticketsDone += 1;
    }
  }

  // ── Messages ──────────────────────────────────────────────────────

  async function processTicketMessages(
    ticketId: string,
    clientId: string,
    channelId: string,
    clientPublic: string,
    ticketKeyWrap: KeyWrapTriple | null,
  ): Promise<SvelteSet<string>> {
    // Collect all eligible follow-ups across pages. Also record the
    // follow-ups whose media must never reach the portal (private or
    // internal-note parents), so the media pass can filter against
    // them instead of tripping the server's whole-chunk rejection.
    const eligible: {
      followUpId: string;
      ciphertext: string;
      keyWrap?: KeyWrapTriple;
      portalWrap?: string;
    }[] = [];
    const blockedParents = new SvelteSet<string>();

    let cursor: string | undefined;
    let done = false;

    while (!done) {
      if (isCancelled()) return blockedParents;

      const page = await withRetry(async () =>
        trpcClient.tickets.listFollowUps.query({
          ticketId,
          limit: FOLLOWUP_PAGE_SIZE,
          cursor,
          direction: "newer",
          includeClientSource: true,
        }),
      );

      const followUps = page.followUps;

      for (const fu of followUps) {
        if (fu.isPrivate || fu.type === "internal_note") {
          blockedParents.add(fu.id);
          continue;
        }
        // Filter: eligible types only get message copies
        if (!ELIGIBLE_TYPES.has(fu.type)) continue;

        // Key resolution: a per-follow-up keyWrap only exists for rows
        // written under a rotated key generation. Ordinary follow-ups
        // (key_generation null) decrypt under the ticket's current key,
        // so fall back to the ticket-level wrap from listForClient.
        const resolvedKeyWrap = fu.keyWrap ?? ticketKeyWrap ?? undefined;
        const portalWrap = fu.portalWrap ?? undefined;
        if (resolvedKeyWrap === undefined && portalWrap === undefined) {
          continue;
        }

        eligible.push({
          followUpId: fu.id,
          ciphertext: fu.encryptedContent,
          keyWrap: resolvedKeyWrap,
          portalWrap,
        });
      }

      // Pagination termination: empty page or returned fewer than limit
      if (followUps.length === 0 || followUps.length < FOLLOWUP_PAGE_SIZE) {
        done = true;
      } else {
        const lastFu = followUps[followUps.length - 1];
        if (lastFu === undefined) {
          done = true;
        } else {
          cursor = lastFu.id;
        }
      }
    }

    // Track itemsTotal growth
    itemsTotal += eligible.length;

    // Seal in batches of SEAL_BATCH_SIZE
    const sealedCopies: { followupId: string; copy: PortalCopyTriple }[] = [];

    for (const batch of chunk(eligible, SEAL_BATCH_SIZE)) {
      if (isCancelled()) return blockedParents;

      const result = await withRetry(async () =>
        bridge.sealFollowUpsToPublic(
          ticketId,
          clientPublic,
          batch.map((item) => ({
            followUpId: item.followUpId,
            ciphertext: item.ciphertext,
            keyWrap: item.keyWrap,
            portalWrap: item.portalWrap,
          })),
        ),
      );

      for (const item of result.items) {
        sealedCopies.push({ followupId: item.followUpId, copy: item.copy });
      }
      skippedCount += result.failed.length;
    }

    // Post to server in chunks of RESEED_MESSAGE_CHUNK
    for (const msgChunk of chunk(sealedCopies, RESEED_MESSAGE_CHUNK)) {
      if (isCancelled()) return blockedParents;

      const result = await withRetry(async () =>
        trpcClient.tickets.reseedPortalHistory.mutate({
          clientId,
          channelId,
          messages: msgChunk,
          attachmentWraps: [],
          recordingWraps: [],
        }),
      );

      itemsDone += result.inserted;
      skippedCount += result.skipped;
    }

    return blockedParents;
  }

  // ── Media ─────────────────────────────────────────────────────────

  async function processTicketMedia(
    ticketId: string,
    clientId: string,
    channelId: string,
    clientPublic: string,
    blockedParents: ReadonlySet<string>,
    ticketKeyWrap: KeyWrapTriple | null,
  ): Promise<void> {
    // Collect attachments and recordings
    const attachments = await paginateMedia<WireAttachment>(
      async (cursor) =>
        withRetry(async () =>
          trpcClient.tickets.listAttachments.query({
            ticketId,
            limit: MEDIA_PAGE_SIZE,
            cursor,
            direction: "newer",
          }),
        ),
      MEDIA_PAGE_SIZE,
    );

    const recordings = await paginateMedia<WireRecording>(
      async (cursor) =>
        withRetry(async () =>
          trpcClient.tickets.listRecordings.query({
            ticketId,
            limit: MEDIA_PAGE_SIZE,
            cursor,
            direction: "newer",
          }),
        ),
      MEDIA_PAGE_SIZE,
    );

    // Narrow to items with an eligible parent: orphaned media is
    // skipped, and media hanging off private or internal-note
    // follow-ups never reaches the portal (the server would reject
    // the whole chunk otherwise). The flatMap narrows followupId to
    // string (non-null) so downstream code needs no assertions.
    const validAttachments = attachments.flatMap((a) => {
      if (a.followupId === null || blockedParents.has(a.followupId)) return [];
      return [{ ...a, followupId: a.followupId }];
    });
    const validRecordings = recordings.flatMap((r) => {
      if (r.followupId === null || blockedParents.has(r.followupId)) return [];
      return [{ ...r, followupId: r.followupId }];
    });

    // Split by wrapping: fileKeyWrap present vs null
    const wrappedAttachments = validAttachments.flatMap((a) => {
      if (a.fileKeyWrap === null) return [];
      return [{ ...a, fileKeyWrap: a.fileKeyWrap }];
    });
    const directAttachments = validAttachments.filter(
      (a) => a.fileKeyWrap === null,
    );
    const wrappedRecordings = validRecordings.flatMap((r) => {
      if (r.fileKeyWrap === null) return [];
      return [{ ...r, fileKeyWrap: r.fileKeyWrap }];
    });
    const directRecordings = validRecordings.filter(
      (r) => r.fileKeyWrap === null,
    );

    // Track items
    const mediaCount =
      wrappedAttachments.length +
      directAttachments.length +
      wrappedRecordings.length +
      directRecordings.length;
    itemsTotal += mediaCount;

    // Warm-up key for file-key unwrapping: prefer the ticket-level wrap
    // (present for any ticket the caller can open), else fall back to a
    // per-follow-up wrap from the first page (rotated-generation rows).
    let warmUpKeyWrap: KeyWrapTriple | undefined = ticketKeyWrap ?? undefined;
    if (
      warmUpKeyWrap === undefined &&
      (wrappedAttachments.length > 0 || wrappedRecordings.length > 0)
    ) {
      const firstPage = await withRetry(async () =>
        trpcClient.tickets.listFollowUps.query({
          ticketId,
          limit: 1,
          direction: "newer",
          includeClientSource: true,
        }),
      );
      for (const fu of firstPage.followUps) {
        if (fu.keyWrap !== null) {
          warmUpKeyWrap = fu.keyWrap;
          break;
        }
      }
    }

    // Process wrapped attachments via sealFileKeysToPublic
    await processWrappedMedia(
      ticketId,
      clientId,
      channelId,
      clientPublic,
      wrappedAttachments.map((a) => ({
        kind: "attachment" as const,
        rowId: a.id,
        followupId: a.followupId,
        fileKeyWrap: a.fileKeyWrap,
        encryptedFilename: a.encryptedFilename ?? undefined,
      })),
      warmUpKeyWrap,
    );

    // Process wrapped recordings via sealFileKeysToPublic
    await processWrappedMedia(
      ticketId,
      clientId,
      channelId,
      clientPublic,
      wrappedRecordings.map((r) => ({
        kind: "recording" as const,
        rowId: r.id,
        followupId: r.followupId,
        fileKeyWrap: r.fileKeyWrap,
      })),
      warmUpKeyWrap,
    );

    // Process direct (null-wrap) attachments one at a time
    for (const att of directAttachments) {
      if (isCancelled()) return;
      await processDirectBlob(
        ticketId,
        clientId,
        channelId,
        clientPublic,
        "attachment",
        att.id,
        att.followupId,
        att.blobKey,
        att.encryptedFilename ?? undefined,
      );
    }

    // Process direct (null-wrap) recordings one at a time
    for (const rec of directRecordings) {
      if (isCancelled()) return;
      await processDirectBlob(
        ticketId,
        clientId,
        channelId,
        clientPublic,
        "recording",
        rec.id,
        rec.followupId,
        rec.blobKey,
      );
    }
  }

  async function paginateMedia<T extends { id: string }>(
    fetcher: (cursor: string | undefined) => Promise<T[]>,
    pageSize: number,
  ): Promise<T[]> {
    const all: T[] = [];
    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      if (isCancelled()) return all;

      const page = await fetcher(cursor);
      all.push(...page);

      if (page.length === 0 || page.length < pageSize) {
        hasMore = false;
      } else {
        const lastItem = page[page.length - 1];
        if (lastItem === undefined) {
          hasMore = false;
        } else {
          cursor = lastItem.id;
        }
      }
    }

    return all;
  }

  async function processWrappedMedia(
    ticketId: string,
    clientId: string,
    channelId: string,
    clientPublic: string,
    items: {
      kind: "attachment" | "recording";
      rowId: string;
      followupId: string;
      fileKeyWrap: string;
      encryptedFilename?: string;
    }[],
    warmUpKeyWrap?: KeyWrapTriple,
  ): Promise<void> {
    if (items.length === 0) return;

    // Seal file keys in batches
    const sealed: {
      kind: "attachment" | "recording";
      rowId: string;
      followupId: string;
      copy: PortalCopyTriple;
    }[] = [];

    for (const batch of chunk(items, FILE_KEY_BATCH_SIZE)) {
      if (isCancelled()) return;

      const result = await withRetry(async () =>
        bridge.sealFileKeysToPublic(
          ticketId,
          clientPublic,
          batch.map((item) => ({
            kind: item.kind,
            rowId: item.rowId,
            fileKeyWrap: item.fileKeyWrap,
            encryptedFilename: item.encryptedFilename,
          })),
          warmUpKeyWrap,
        ),
      );

      for (const item of result.items) {
        // Find the original item to get its followupId and kind
        const original = batch.find((b) => b.rowId === item.rowId);
        if (original) {
          sealed.push({
            kind: original.kind,
            rowId: item.rowId,
            followupId: original.followupId,
            copy: item.copy,
          });
        }
      }
      skippedCount += result.failed.length;
    }

    // Post to server: attachment wraps and recording wraps go in separate
    // reseedPortalHistory chunks for failure isolation. A server rejection
    // of one category cannot invalidate the other.
    const attachmentWraps = sealed.filter((s) => s.kind === "attachment");
    const recordingWraps = sealed.filter((s) => s.kind === "recording");

    for (const wrapsChunk of chunk(attachmentWraps, RESEED_MEDIA_CHUNK)) {
      if (isCancelled()) return;

      const result = await withRetry(async () =>
        trpcClient.tickets.reseedPortalHistory.mutate({
          clientId,
          channelId,
          messages: [],
          attachmentWraps: wrapsChunk.map((w) => ({
            attachmentId: w.rowId,
            followupId: w.followupId,
            copy: w.copy,
          })),
          recordingWraps: [],
        }),
      );

      itemsDone += result.inserted;
      skippedCount += result.skipped;
    }

    for (const wrapsChunk of chunk(recordingWraps, RESEED_MEDIA_CHUNK)) {
      if (isCancelled()) return;

      const result = await withRetry(async () =>
        trpcClient.tickets.reseedPortalHistory.mutate({
          clientId,
          channelId,
          messages: [],
          attachmentWraps: [],
          recordingWraps: wrapsChunk.map((w) => ({
            recordingId: w.rowId,
            followupId: w.followupId,
            copy: w.copy,
          })),
        }),
      );

      itemsDone += result.inserted;
      skippedCount += result.skipped;
    }
  }

  async function processDirectBlob(
    ticketId: string,
    clientId: string,
    channelId: string,
    clientPublic: string,
    kind: "attachment" | "recording",
    rowId: string,
    followupId: string,
    _blobKey: string,
    encryptedFilename?: string,
  ): Promise<void> {
    try {
      const blobPath =
        kind === "attachment"
          ? `/api/blobs/attachments/${rowId}`
          : `/api/blobs/recordings/${rowId}`;

      const ciphertext = await withRetry(async () => fetchBlobFn(blobPath));

      if (isCancelled()) return;

      const converted = await withRetry(async () =>
        bridge.convertBlobForPortal(
          ticketId,
          clientPublic,
          kind,
          rowId,
          ciphertext,
          encryptedFilename,
        ),
      );

      if (isCancelled()) return;

      // Encode the ArrayBuffer as base64url for the wire
      const encryptedData = encode(new Uint8Array(converted.encryptedData));

      await withRetry(async () =>
        trpcClient.tickets.convertBlobForReseed.mutate({
          clientId,
          channelId,
          kind,
          rowId,
          followupId,
          encryptedData,
          fileKeyWrap: converted.fileKeyWrap,
          copy: converted.copy,
        }),
      );

      itemsDone += 1;
    } catch (err: unknown) {
      // ALREADY_CONVERTED is a skip, not a failure
      if (isAlreadyConverted(err)) {
        skippedCount += 1;
        return;
      }
      throw err;
    }
  }

  function cancel(): void {
    if (phase !== "running") return;
    cancelled = true;
    cleanup();
  }

  return {
    get state(): PortalReseedState {
      return {
        phase,
        ticketsTotal,
        ticketsDone,
        itemsDone,
        itemsTotal,
        skippedCount,
      };
    },
    start,
    cancel,
  };
}
