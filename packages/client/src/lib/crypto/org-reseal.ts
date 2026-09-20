/**
 * Org key rotation reseal engine.
 *
 * After an org key rotation, this module drives the client-side
 * re-encryption of all org-sealed columns and the re-derivation of
 * blind-index hashes. It runs batched, sequential, and resumable:
 * closing the browser mid-sweep loses nothing.
 */

import type { ResealTableName, IndexTableName } from "@care-y/shared";
import { RESEAL_BLOB_TABLE_NAMES } from "@care-y/shared";
import {
  encryptClientBranding,
  decryptClientBranding,
  toCiphertext,
  encode,
  decode,
  requireSodium,
} from "@care-y/crypto";
import { trpc } from "$lib/trpc/index.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";

// ── Table lists ────────────────────────────────────────────────────

/**
 * Red tier: person-identifying tables resealed inline immediately
 * after rotation, per ADR-107. Order mirrors the ADR's enumeration.
 *
 * Excluded tables:
 * - intake_forms, intake_form_fields: branding-key encrypted, handled
 *   by a separate eager pass in a later task.
 * - voicemail_quarantine: rows carry both sealed columns and a sealed
 *   blob under one org_key_generation stamp. Resealing the columns
 *   alone would bump the stamp and permanently hide the still-old blob
 *   from the sweep. They reseal through a combined columns-plus-blob
 *   path in a later task.
 */
/**
 * phones is intentionally absent: its only org-sealed column
 * (encrypted_number) converged to OPS tier per ADR-005/069/096.
 * The phone_match_hash index sweep (INDEX_TABLE_NAMES) is unaffected.
 */
export const RED_TIER_TABLES: readonly ResealTableName[] = [
  "intake_key_wraps",
  "portal_reply_key_wraps",
  "clients",
  "consultants",
  "phone_blocklist",
  "users",
  "sessions",
  "invite_tokens",
] as const;

/**
 * Trailing tier: non-PII org config tables resealed under a persistent
 * banner after the red tier completes. Any MANAGE_KEYS login resumes.
 *
 * Excluded tables:
 * - intake_forms, intake_form_fields: branding-key encrypted (see above).
 * - voicemail_quarantine: mixed columns-plus-blob (see above).
 * - kb_attachments: rows carry both sealed columns and a sealed blob
 *   under one org_key_generation stamp. Same exclusion reason as
 *   voicemail_quarantine.
 */
export const TRAILING_TIER_TABLES: readonly ResealTableName[] = [
  "queues",
  "note_types",
  "kb_categories",
  "kb_items",
  "preset_replies",
  "org_config",
  "merge_candidate_dismissals",
  "client_merge_events",
  "saved_filters",
] as const;

// ── Progress callback ──────────────────────────────────────────────

export interface ResealProgress {
  readonly table: string;
  readonly done: number;
  readonly total: number;
}

// ── Summary ────────────────────────────────────────────────────────

export interface ResealSummary {
  readonly resealed: number;
  readonly skipped: number;
  readonly reindexed: number;
  readonly indexPendingTables: readonly IndexTableName[];
}

// ── Dependencies ───────────────────────────────────────────────────

export interface ResealDeps {
  readonly bridge: CryptoBridge;
  /** Awaited between batches so background sweeps yield to the UI.
   *  The inline rotation pass omits it. */
  readonly pace?: () => Promise<void>;
}

// ── Constants ──────────────────────────────────────────────────────

const BATCH_SIZE = 40;

// The reindexPending/resealPending schemas cap excludeIds at 500.
// When accumulated skips reach this limit the loop stops for that table;
// remaining rows stay counted by resealStatus and resume on next login.
const EXCLUDE_IDS_CAP = 500;

// ── Per-batch helper ───────────────────────────────────────────────

interface BatchResult {
  resealed: number;
  skipped: number;
  reindexed: number;
  batchSkippedIds: (string | number)[];
}

/**
 * Process one batch of pending rows: build worker items, call
 * orgResealBatch, assemble per-row submission data, submit resealed
 * rows and alias index hashes. Shared by resealTables and
 * resealRowsById so both paths produce identical server mutations.
 */
async function processResealBatch(
  deps: ResealDeps,
  table: ResealTableName,
  rows: readonly { id: string | number; columns: Record<string, string> }[],
  currentGeneration: number,
): Promise<BatchResult> {
  const { bridge } = deps;

  // Build worker items (alias index only for clients)
  const workerItems: {
    cacheKey: string;
    ciphertext: string;
    index?: "alias" | "phone" | "email";
  }[] = [];

  const rowIdToColumns = new Map<
    string | number,
    { colName: string; cacheKey: string }[]
  >();

  for (const row of rows) {
    const entries: { colName: string; cacheKey: string }[] = [];
    for (const [colName, ciphertext] of Object.entries(row.columns)) {
      const cacheKey = `${String(row.id)}::${colName}`;
      const item: {
        cacheKey: string;
        ciphertext: string;
        index?: "alias" | "phone" | "email";
      } = { cacheKey, ciphertext };

      // Only alias index is computed during reseal. Phone and email
      // indexes rebuild via the viewer-plaintext path exclusively.
      if (table === "clients" && colName === "encrypted_alias") {
        item.index = "alias";
      }

      workerItems.push(item);
      entries.push({ colName, cacheKey });
    }
    rowIdToColumns.set(row.id, entries);
  }

  // Send to worker
  const workerResults = await bridge.orgResealBatch(workerItems);

  // Build a lookup from cacheKey to worker result
  const resultByCacheKey = new Map<
    string,
    {
      resealed: string | null;
      fromGeneration: number | null;
      indexHash: string | null;
    }
  >();
  for (const r of workerResults) {
    resultByCacheKey.set(r.cacheKey, r);
  }

  // Assemble per-row submission data
  const rowsToSubmit: {
    id: string | number;
    columns: Record<string, string>;
  }[] = [];
  const batchSkippedIds: (string | number)[] = [];

  // Collect alias index hashes from this batch
  const aliasHashes: { id: string | number; hash: string }[] = [];

  for (const row of rows) {
    const entries = rowIdToColumns.get(row.id);
    if (!entries) continue;

    let anyUndecryptable = false;

    for (const entry of entries) {
      const wr = resultByCacheKey.get(entry.cacheKey);
      if (!wr || (wr.resealed === null && wr.fromGeneration === null)) {
        anyUndecryptable = true;
        break;
      }
    }

    if (anyUndecryptable) {
      // A column of this row failed to decrypt. Skip the WHOLE row.
      // Partial submission would bump the stamp while a column stays
      // old-sealed, hiding it from the sweep forever.
      batchSkippedIds.push(row.id);
      continue;
    }

    // Build column map for this row
    const columns: Record<string, string> = {};
    for (const entry of entries) {
      const wr = resultByCacheKey.get(entry.cacheKey);
      if (!wr) continue;

      if (wr.resealed !== null) {
        columns[entry.colName] = wr.resealed;
      } else if (wr.fromGeneration === currentGeneration) {
        // Already sealed under current generation. Submit the
        // original fetched ciphertext unchanged so the stamp bump
        // is honest.
        const originalCt = row.columns[entry.colName];
        if (originalCt !== undefined) {
          columns[entry.colName] = originalCt;
        }
      }

      // Collect alias index hashes for submission
      if (
        wr.indexHash !== null &&
        entry.colName === "encrypted_alias" &&
        table === "clients"
      ) {
        aliasHashes.push({ id: row.id, hash: wr.indexHash });
      }
    }

    if (Object.keys(columns).length > 0) {
      rowsToSubmit.push({ id: row.id, columns });
    }
  }

  let resealed = 0;
  let skipped = 0;
  let reindexed = 0;

  // Submit resealed rows
  if (rowsToSubmit.length > 0) {
    const result = await trpc.keys.resealRows.mutate({
      table,
      rows: rowsToSubmit,
      skippedIds: batchSkippedIds,
    });
    resealed += result.resealed;
    skipped += result.skipped;
  } else if (batchSkippedIds.length > 0) {
    // All rows in this batch were skipped, but we still need to
    // tell the server so the audit trail is honest.
    // The server requires at least one row, so just record skips.
    skipped += batchSkippedIds.length;
  }

  // Submit alias index hashes, pre-filtered to only pending ids.
  // Uses onlyIds to ask the server which of this batch's ids are
  // still index-pending. The server rejects the whole batch on
  // any conflict, so we cannot submit without checking.
  if (aliasHashes.length > 0) {
    const batchRowIds = aliasHashes.map((h) => h.id);
    const pendingCheck = await trpc.keys.reindexPending.query({
      table: "clients",
      limit: 100,
      excludeIds: [],
      onlyIds: batchRowIds,
    });
    const pendingIdSet = new Set(pendingCheck.rows.map((r) => r.id));

    const pendingAliases = aliasHashes.filter((h) => pendingIdSet.has(h.id));
    const skippedAliasIds = aliasHashes
      .filter((h) => !pendingIdSet.has(h.id))
      .map((h) => h.id);

    if (pendingAliases.length > 0) {
      const reindexResult = await trpc.keys.reindexRows.mutate({
        table: "clients",
        rows: pendingAliases,
        skippedIds: skippedAliasIds,
      });
      reindexed += reindexResult.reindexed;
    }
  }

  return { resealed, skipped, reindexed, batchSkippedIds };
}

// ── Reseal tables ──────────────────────────────────────────────────

/**
 * Re-encrypt all old-generation rows for the given tables under the
 * current org public key. Collects blind-index hashes for clients
 * (alias) inline and submits them via reindexRows. Phone and email
 * indexes rebuild only via the viewer-plaintext path in
 * reindexViewerTables (per ADR-107). Sequential, one batch at a time,
 * resumable.
 */
export async function resealTables(
  deps: ResealDeps,
  tables: readonly ResealTableName[],
  onProgress?: (p: ResealProgress) => void,
): Promise<{ resealed: number; skipped: number; reindexed: number }> {
  // Fetch totals per table for progress reporting
  const status = await trpc.keys.resealStatus.query();
  const pendingByTable = new Map<string, number>();
  for (const row of status.tables) {
    pendingByTable.set(row.table, row.pending);
  }

  let totalResealed = 0;
  let totalSkipped = 0;
  let totalReindexed = 0;

  for (const table of tables) {
    const skippedIds: (string | number)[] = [];
    const total = pendingByTable.get(table) ?? 0;
    let done = 0;

    onProgress?.({ table, done, total });

    for (;;) {
      // Schema caps excludeIds at 500; stop if we have hit the limit
      if (skippedIds.length >= EXCLUDE_IDS_CAP) break;

      const pending = await trpc.keys.resealPending.query({
        table,
        limit: BATCH_SIZE,
        excludeIds: skippedIds,
      });

      if (pending.rows.length === 0) break;

      const batch = await processResealBatch(
        deps,
        table,
        pending.rows,
        pending.currentGeneration,
      );

      totalResealed += batch.resealed;
      totalSkipped += batch.skipped;
      totalReindexed += batch.reindexed;

      // Accumulate skipped ids so the next fetch excludes them
      skippedIds.push(...batch.batchSkippedIds);

      done += pending.rows.length;
      onProgress?.({ table, done, total });
      await deps.pace?.();
    }
  }

  return {
    resealed: totalResealed,
    skipped: totalSkipped,
    reindexed: totalReindexed,
  };
}

// ── Targeted reseal by id ─────────────────────────────────────────

/**
 * Re-encrypt specific rows identified by their ids. Used by the
 * read-path write-back to reseal rows that a stale-generation decrypt
 * reported. Chunks ids into groups of at most BATCH_SIZE and fetches
 * each chunk via resealPending with onlyIds. Rows already resealed
 * elsewhere come back empty (a harmless no-op).
 */
export async function resealRowsById(
  deps: ResealDeps,
  table: ResealTableName,
  ids: readonly (string | number)[],
): Promise<{ resealed: number; skipped: number; reindexed: number }> {
  let totalResealed = 0;
  let totalSkipped = 0;
  let totalReindexed = 0;

  for (let offset = 0; offset < ids.length; offset += BATCH_SIZE) {
    const chunk = ids.slice(offset, offset + BATCH_SIZE);

    const pending = await trpc.keys.resealPending.query({
      table,
      limit: chunk.length,
      excludeIds: [],
      onlyIds: chunk,
    });

    if (pending.rows.length > 0) {
      const batch = await processResealBatch(
        deps,
        table,
        pending.rows,
        pending.currentGeneration,
      );
      totalResealed += batch.resealed;
      totalSkipped += batch.skipped;
      totalReindexed += batch.reindexed;
    }

    await deps.pace?.();
  }

  return {
    resealed: totalResealed,
    skipped: totalSkipped,
    reindexed: totalReindexed,
  };
}

// ── Reindex viewer tables ──────────────────────────────────────────

/**
 * Re-derive blind-index hashes for phones and emails using OPS-tier
 * plaintext the server returns to sessions holding VIEW_CLIENT_PII.
 * Also handles remaining clients alias reindex for rows not covered
 * by the reseal pass.
 *
 * When `piiUnmasked` is false for a table, that table is left pending
 * (no error). The next dual-permission session picks it up.
 */
export async function reindexViewerTables(
  deps: ResealDeps,
  onProgress?: (p: ResealProgress) => void,
): Promise<{
  reindexed: number;
  indexPendingTables: readonly IndexTableName[];
}> {
  const { bridge } = deps;
  let totalReindexed = 0;
  const pendingTables: IndexTableName[] = [];

  // Fetch totals for progress
  const status = await trpc.keys.resealStatus.query();
  const indexPendingByTable = new Map<string, number>();
  for (const row of status.indexTables) {
    indexPendingByTable.set(row.table, row.pending);
  }

  // --- Phones ---
  {
    const total = indexPendingByTable.get("phones") ?? 0;
    let done = 0;
    onProgress?.({ table: "phones (index)", done, total });

    const skippedIds: (string | number)[] = [];
    let firstFetch = true;
    let piiUnmasked = true;

    for (;;) {
      // Schema caps excludeIds at 500
      if (skippedIds.length >= EXCLUDE_IDS_CAP) {
        if (!pendingTables.includes("phones")) pendingTables.push("phones");
        break;
      }

      const result = await trpc.keys.reindexPending.query({
        table: "phones",
        limit: BATCH_SIZE,
        excludeIds: skippedIds,
      });

      if (firstFetch) {
        piiUnmasked = result.piiUnmasked;
        firstFetch = false;
      }

      if (!piiUnmasked) {
        pendingTables.push("phones");
        break;
      }

      if (result.rows.length === 0) break;

      const hashRows: { id: string | number; hash: string }[] = [];
      const batchSkippedIds: (string | number)[] = [];

      for (const row of result.rows) {
        if (!("plaintext" in row) || row.plaintext == null) {
          batchSkippedIds.push(row.id);
          continue;
        }
        const computed = await bridge.phoneMatchHash(row.plaintext);
        if (computed == null) {
          batchSkippedIds.push(row.id);
        } else {
          hashRows.push({ id: row.id, hash: computed });
        }
      }

      if (hashRows.length > 0) {
        const reindexResult = await trpc.keys.reindexRows.mutate({
          table: "phones",
          rows: hashRows,
          skippedIds: batchSkippedIds,
        });
        totalReindexed += reindexResult.reindexed;
      }

      skippedIds.push(...batchSkippedIds);
      done += result.rows.length;
      onProgress?.({ table: "phones (index)", done, total });
      await deps.pace?.();
    }
  }

  // --- Emails ---
  {
    const total = indexPendingByTable.get("emails") ?? 0;
    let done = 0;
    onProgress?.({ table: "emails (index)", done, total });

    const skippedIds: (string | number)[] = [];
    let firstFetch = true;
    let piiUnmasked = true;

    for (;;) {
      // Schema caps excludeIds at 500
      if (skippedIds.length >= EXCLUDE_IDS_CAP) {
        if (!pendingTables.includes("emails")) pendingTables.push("emails");
        break;
      }

      const result = await trpc.keys.reindexPending.query({
        table: "emails",
        limit: BATCH_SIZE,
        excludeIds: skippedIds,
      });

      if (firstFetch) {
        piiUnmasked = result.piiUnmasked;
        firstFetch = false;
      }

      if (!piiUnmasked) {
        pendingTables.push("emails");
        break;
      }

      if (result.rows.length === 0) break;

      const hashRows: { id: string | number; hash: string }[] = [];
      const batchSkippedIds: (string | number)[] = [];

      for (const row of result.rows) {
        if (!("plaintext" in row) || row.plaintext == null) {
          batchSkippedIds.push(row.id);
          continue;
        }
        const computed = await bridge.emailMatchHash(row.plaintext);
        if (computed == null) {
          batchSkippedIds.push(row.id);
        } else {
          hashRows.push({ id: row.id, hash: computed });
        }
      }

      if (hashRows.length > 0) {
        const reindexResult = await trpc.keys.reindexRows.mutate({
          table: "emails",
          rows: hashRows,
          skippedIds: batchSkippedIds,
        });
        totalReindexed += reindexResult.reindexed;
      }

      skippedIds.push(...batchSkippedIds);
      done += result.rows.length;
      onProgress?.({ table: "emails (index)", done, total });
      await deps.pace?.();
    }
  }

  // --- Clients alias (remaining rows not covered by reseal pass) ---
  {
    const total = indexPendingByTable.get("clients") ?? 0;
    let done = 0;
    onProgress?.({ table: "clients (index)", done, total });

    const skippedIds: (string | number)[] = [];

    for (;;) {
      // Schema caps excludeIds at 500
      if (skippedIds.length >= EXCLUDE_IDS_CAP) break;

      const result = await trpc.keys.reindexPending.query({
        table: "clients",
        limit: BATCH_SIZE,
        excludeIds: skippedIds,
      });

      if (result.rows.length === 0) break;

      // Build worker items for the whole batch (one orgResealBatch call)
      const workerItems: {
        cacheKey: string;
        ciphertext: string;
        index: "alias";
      }[] = [];
      const validRows: { id: string | number; cacheKey: string }[] = [];
      const batchSkippedIds: (string | number)[] = [];

      for (const row of result.rows) {
        if (!("encryptedAlias" in row) || row.encryptedAlias == null) {
          batchSkippedIds.push(row.id);
          continue;
        }
        const cacheKey = `reindex::${String(row.id)}::alias`;
        workerItems.push({
          cacheKey,
          ciphertext: row.encryptedAlias,
          index: "alias",
        });
        validRows.push({ id: row.id, cacheKey });
      }

      if (workerItems.length > 0) {
        // Decrypt and hash the whole batch in one worker call
        const workerResults = await bridge.orgResealBatch(workerItems);
        const resultByKey = new Map<string, string | null>();
        for (const wr of workerResults) {
          resultByKey.set(wr.cacheKey, wr.indexHash);
        }

        const hashRows: { id: string | number; hash: string }[] = [];
        for (const vr of validRows) {
          const indexHash = resultByKey.get(vr.cacheKey);
          if (indexHash == null) {
            batchSkippedIds.push(vr.id);
          } else {
            hashRows.push({ id: vr.id, hash: indexHash });
          }
        }

        if (hashRows.length > 0) {
          const reindexResult = await trpc.keys.reindexRows.mutate({
            table: "clients",
            rows: hashRows,
            skippedIds: batchSkippedIds,
          });
          totalReindexed += reindexResult.reindexed;
        }
      }

      skippedIds.push(...batchSkippedIds);
      done += result.rows.length;
      onProgress?.({ table: "clients (index)", done, total });
      await deps.pace?.();
    }
  }

  return { reindexed: totalReindexed, indexPendingTables: pendingTables };
}

// ── Blob table reseal ─────────────────────────────────────────────

const BLOB_BATCH_SIZE = 3;

/**
 * Re-encrypt blob-carrying tables (voicemail_quarantine, kb_attachments).
 * Each row carries sealed columns AND a sealed blob under one
 * org_key_generation stamp, so both must reseal in one operation.
 * One row per mutation call because blobs are large.
 */
export async function resealBlobTables(
  deps: ResealDeps,
  onProgress?: (p: ResealProgress) => void,
): Promise<{ resealed: number; skipped: number }> {
  const { bridge } = deps;

  // Fetch totals for progress
  const status = await trpc.keys.resealStatus.query();
  const pendingByTable = new Map<string, number>();
  for (const row of status.tables) {
    pendingByTable.set(row.table, row.pending);
  }

  let totalResealed = 0;
  let totalSkipped = 0;

  for (const table of RESEAL_BLOB_TABLE_NAMES) {
    const skippedIds: (string | number)[] = [];
    const total = pendingByTable.get(table) ?? 0;
    let done = 0;

    onProgress?.({ table, done, total });

    for (;;) {
      if (skippedIds.length >= EXCLUDE_IDS_CAP) break;

      const pending = await trpc.keys.resealBlobPending.query({
        table,
        limit: BLOB_BATCH_SIZE,
        excludeIds: skippedIds,
      });

      if (pending.rows.length === 0) break;

      const currentGeneration = pending.currentGeneration;

      for (const row of pending.rows) {
        // Build worker items for both the blob and all column ciphertexts
        const workerItems: {
          cacheKey: string;
          ciphertext: string;
          index?: "alias" | "phone" | "email";
        }[] = [];

        const blobCacheKey = `${row.id}::__blob__`;
        workerItems.push({ cacheKey: blobCacheKey, ciphertext: row.blob });

        const columnEntries: { colName: string; cacheKey: string }[] = [];
        for (const [colName, ciphertext] of Object.entries(row.columns)) {
          const cacheKey = `${row.id}::${colName}`;
          workerItems.push({ cacheKey, ciphertext });
          columnEntries.push({ colName, cacheKey });
        }

        const workerResults = await bridge.orgResealBatch(workerItems);

        const resultByCacheKey = new Map<
          string,
          {
            resealed: string | null;
            fromGeneration: number | null;
            indexHash: string | null;
          }
        >();
        for (const r of workerResults) {
          resultByCacheKey.set(r.cacheKey, r);
        }

        // Check if ANY item is undecryptable (skip the whole row)
        const blobResult = resultByCacheKey.get(blobCacheKey);
        let anyUndecryptable =
          !blobResult ||
          (blobResult.resealed === null && blobResult.fromGeneration === null);

        if (!anyUndecryptable) {
          for (const entry of columnEntries) {
            const wr = resultByCacheKey.get(entry.cacheKey);
            if (!wr || (wr.resealed === null && wr.fromGeneration === null)) {
              anyUndecryptable = true;
              break;
            }
          }
        }

        if (anyUndecryptable || blobResult === undefined) {
          skippedIds.push(row.id);
          totalSkipped++;
          continue;
        }

        // Build the resealed blob
        let resealedBlob: string;
        if (blobResult.resealed !== null) {
          resealedBlob = blobResult.resealed;
        } else if (blobResult.fromGeneration === currentGeneration) {
          resealedBlob = row.blob;
        } else {
          skippedIds.push(row.id);
          totalSkipped++;
          continue;
        }

        // Build the resealed columns
        const columns: Record<string, string> = {};
        for (const entry of columnEntries) {
          const wr = resultByCacheKey.get(entry.cacheKey);
          if (!wr) continue;
          if (wr.resealed !== null) {
            columns[entry.colName] = wr.resealed;
          } else if (wr.fromGeneration === currentGeneration) {
            const originalCt = row.columns[entry.colName];
            if (originalCt !== undefined) {
              columns[entry.colName] = originalCt;
            }
          }
        }

        await trpc.keys.resealBlobRow.mutate({
          table,
          id: row.id,
          columns,
          blob: resealedBlob,
        });
        totalResealed++;
      }

      done += pending.rows.length;
      onProgress?.({ table, done, total });
      await deps.pace?.();
    }
  }

  return { resealed: totalResealed, skipped: totalSkipped };
}

// ── Branding-key reseal ───────────────────────────────────────────

/**
 * Tables whose columns are encrypted under the branding key derived from the
 * org public key. The reseal engine fetches these through the standard
 * resealPending/resealRows pipeline, but crypto happens on the main thread
 * using deriveClientBrandingKey / encryptClientBranding / decryptClientBranding.
 */
const BRANDING_TABLES: readonly ResealTableName[] = [
  "intake_forms",
  "intake_form_fields",
] as const;

/**
 * Re-encrypt branding-key-encrypted tables (intake_forms, intake_form_fields)
 * and form assets under the current org public key's derived branding key.
 *
 * Branding crypto runs on the main thread because the branding key is derived
 * from the (public) org public key, not from the org secret key.
 */
export async function resealBrandingClasses(
  deps: ResealDeps,
  onProgress?: (p: ResealProgress) => void,
): Promise<{ resealed: number; skipped: number }> {
  const { bridge } = deps;

  // Fetch totals for progress
  const status = await trpc.keys.resealStatus.query();
  const pendingByTable = new Map<string, number>();
  for (const row of status.tables) {
    pendingByTable.set(row.table, row.pending);
  }

  const currentGeneration = status.currentGeneration;

  // Build a map of generation -> org public key (Uint8Array) by walking
  // down from current to 1. The bridge returns base64-encoded public keys.
  const publicKeyByGen = new Map<number, Uint8Array>();
  for (let gen = currentGeneration; gen >= 1; gen--) {
    try {
      const pubKeyB64 = await bridge.getOrgPublicKey(gen);
      publicKeyByGen.set(gen, decode(pubKeyB64));
    } catch {
      // Generation not available (may not exist for very old gens). Stop walking.
      break;
    }
  }

  let totalResealed = 0;
  let totalSkipped = 0;

  // Get the current org public key for re-encryption
  const currentPubKey = publicKeyByGen.get(currentGeneration);
  if (!currentPubKey) {
    // Cannot proceed without the current public key
    return { resealed: 0, skipped: 0 };
  }

  // (a) Reseal intake_forms and intake_form_fields via resealPending/resealRows
  for (const table of BRANDING_TABLES) {
    const skippedIds: (string | number)[] = [];
    const total = pendingByTable.get(table) ?? 0;
    let done = 0;

    onProgress?.({ table: `${table} (branding)`, done, total });

    for (;;) {
      if (skippedIds.length >= EXCLUDE_IDS_CAP) break;

      const pending = await trpc.keys.resealPending.query({
        table,
        limit: BATCH_SIZE,
        excludeIds: skippedIds,
      });

      if (pending.rows.length === 0) break;

      const rowsToSubmit: {
        id: string | number;
        columns: Record<string, string>;
      }[] = [];
      const batchSkippedIds: (string | number)[] = [];

      for (const row of pending.rows) {
        let anyUndecryptable = false;
        // Entries collected as pairs; the Object materializes once at the
        // end so no request-derived string is a computed key mid-loop.
        const resealedEntries: [string, string][] = [];

        for (const [colName, ciphertextB64] of Object.entries(row.columns)) {
          const ctBytes = decode(ciphertextB64);
          const decrypted = tryDecryptWithPublicKeys(
            ctBytes,
            publicKeyByGen,
            currentGeneration,
          );

          if (!decrypted) {
            anyUndecryptable = true;
            break;
          }

          if (decrypted.generation === currentGeneration) {
            // Already under current key. Submit original ciphertext.
            resealedEntries.push([colName, ciphertextB64]);
            zeroBytes(decrypted.plaintext);
          } else {
            // Re-encrypt under current public key
            const reEncrypted = encryptClientBranding(
              decrypted.plaintext,
              currentPubKey,
            );
            resealedEntries.push([colName, encode(reEncrypted)]);
            zeroBytes(decrypted.plaintext);
          }
        }

        if (anyUndecryptable) {
          batchSkippedIds.push(row.id);
          continue;
        }

        if (resealedEntries.length > 0) {
          rowsToSubmit.push({
            id: row.id,
            columns: Object.fromEntries(resealedEntries),
          });
        }
      }

      if (rowsToSubmit.length > 0) {
        const result = await trpc.keys.resealRows.mutate({
          table,
          rows: rowsToSubmit,
          skippedIds: batchSkippedIds,
        });
        totalResealed += result.resealed;
        totalSkipped += result.skipped;
      } else if (batchSkippedIds.length > 0) {
        totalSkipped += batchSkippedIds.length;
      }

      skippedIds.push(...batchSkippedIds);
      done += pending.rows.length;
      onProgress?.({ table: `${table} (branding)`, done, total });
      await deps.pace?.();
    }
  }

  // (b) Form assets: fetch list, download each, try-decrypt, skip if
  // already current, re-encrypt and replace.
  const formAssets = await trpc.keys.listFormAssetsForReseal.query({});

  if (formAssets.length > 0) {
    let assetDone = 0;
    onProgress?.({
      table: "form_assets (branding)",
      done: 0,
      total: formAssets.length,
    });

    for (const asset of formAssets) {
      const blobResult = await trpc.keys.getFormAssetBlob.query({
        blobId: asset.blobId,
      });
      const blobBytes = decode(blobResult.blob);

      // Try decrypt with current key first. If it works, no rewrite needed.
      let alreadyCurrent = false;
      try {
        const probe = decryptClientBranding(
          toCiphertext(blobBytes),
          currentPubKey,
        );
        alreadyCurrent = true;
        zeroBytes(probe);
      } catch {
        // Not decryptable with current key, proceed to try older keys
      }

      if (!alreadyCurrent) {
        const decrypted = tryDecryptWithPublicKeys(
          blobBytes,
          publicKeyByGen,
          currentGeneration,
        );

        if (decrypted) {
          const reEncrypted = encryptClientBranding(
            decrypted.plaintext,
            currentPubKey,
          );
          zeroBytes(decrypted.plaintext);

          await trpc.keys.replaceFormAssetBlob.mutate({
            blobId: asset.blobId,
            blob: encode(reEncrypted),
          });
          totalResealed++;
        } else {
          totalSkipped++;
        }
      }

      assetDone++;
      onProgress?.({
        table: "form_assets (branding)",
        done: assetDone,
        total: formAssets.length,
      });
      await deps.pace?.();
    }
  }

  return { resealed: totalResealed, skipped: totalSkipped };
}

// ── Branding helpers ──────────────────────────────────────────────

/**
 * Try to decrypt ciphertext using org public keys from different generations,
 * newest first. Returns the plaintext and the generation that succeeded, or
 * null if none worked.
 */
function tryDecryptWithPublicKeys(
  ciphertext: Uint8Array,
  publicKeyByGen: ReadonlyMap<number, Uint8Array>,
  currentGeneration: number,
): { plaintext: Uint8Array; generation: number } | null {
  for (let gen = currentGeneration; gen >= 1; gen--) {
    const pubKey = publicKeyByGen.get(gen);
    if (!pubKey) continue;
    try {
      const plaintext = decryptClientBranding(toCiphertext(ciphertext), pubKey);
      return { plaintext, generation: gen };
    } catch {
      // Wrong key, try next generation
    }
  }
  return null;
}

function zeroBytes(bytes: Uint8Array): void {
  requireSodium().memzero(bytes);
}
