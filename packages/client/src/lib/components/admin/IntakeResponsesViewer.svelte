<!--
  Volunteer-facing intake form response viewer. Displays decrypted
  responses in a card-based layout keyed by fieldKey against the current
  form definition. Graceful per-row states: key not held, could not
  decrypt, unknown/stale field fallback.

  Decryption runs in the crypto Worker (never main thread). Lazy backfill
  wraps are minted in the Worker and submitted silently in the background
  when rows arrive with missingPrincipals.

  CSV export: assembles a CSV from decrypted rows client-side, records
  an audit event via logExport before offering the file for download.
  The confirmation dialog warns that the file contains plaintext PII
  and reports how many rows are skipped (key-not-held or failed).

  Props:
    formId - the intake form whose responses to list
-->
<script lang="ts">
  import { SvelteMap, SvelteSet } from "svelte/reactivity";
  import { Card, DialogButton, Preloader } from "konsta/svelte";
  import { createQuery, createMutation } from "@tanstack/svelte-query";
  import {
    Lock,
    TriangleAlert,
    CircleQuestionMark,
    Download,
  } from "@lucide/svelte";
  import { resolveLocalized, type LocalizedText } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { getLocale } from "$lib/paraglide/runtime.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { intakeFormKeys } from "$lib/query/keys.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { getCryptoBridge, getOrgKeyManager } from "$lib/crypto/context.js";
  import { decryptFieldContent } from "$lib/portal/intake-form-crypto.js";
  import type { DecryptedIntakeAnswer } from "$lib/workers/crypto-protocol.js";
  import { assembleIntakeCsv } from "$lib/export/intake-csv.js";
  import { triggerBlobDownload } from "$lib/components/shared/attachment-download.js";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import QueryError from "$lib/components/QueryError.svelte";

  let { formId }: { formId: string } = $props();

  const intakeFormsRouter = requireRouter(trpc.intakeForms, "intakeForms");
  const bridge = getCryptoBridge();
  const orgKeyManager = getOrgKeyManager();

  // Track which tickets we already fired backfill for (idempotent guard).
  const backfilledTickets = new SvelteSet<string>();

  // ── Form definition for field labels ────────────────────────────

  interface FieldDef {
    readonly fieldKey: string;
    readonly label: LocalizedText;
    readonly fieldType: string;
  }

  const formQuery = createQuery(() => ({
    queryKey: intakeFormKeys.detail(formId),
    queryFn: async () => intakeFormsRouter.get.query({ formId }),
  }));

  const fieldDefs = $derived.by((): ReadonlyMap<string, FieldDef> => {
    const data = formQuery.data;
    if (!data) return new SvelteMap();
    const orgPub = orgKeyManager.getPublicKey();
    if (!orgPub) return new SvelteMap();

    const map = new SvelteMap<string, FieldDef>();
    for (const field of data.fields) {
      try {
        const fieldContent = decryptFieldContent(
          {
            encryptedLabel: field.encryptedLabel,
            encryptedConfig: field.encryptedConfig,
          },
          orgPub,
        );
        map.set(field.fieldKey, {
          fieldKey: field.fieldKey,
          label: fieldContent.label,
          fieldType: field.fieldType,
        });
      } catch {
        map.set(field.fieldKey, {
          fieldKey: field.fieldKey,
          label: {},
          fieldType: field.fieldType,
        });
      }
    }
    return map;
  });

  // ── Paginated response listing ──────────────────────────────────

  let cursor = $state<string | null>(null);

  const responsesQuery = createQuery(() => ({
    queryKey: intakeFormKeys.responsePage(formId, cursor),
    queryFn: async () =>
      intakeFormsRouter.listResponses.query({
        formId,
        cursor,
        pageSize: 25,
      }),
  }));

  // Accumulate pages across pagination
  interface ResponseEntry {
    readonly ticketId: string;
    readonly submittedAt: string;
    readonly encryptedResponse: string;
    readonly callerKeyWrap: {
      readonly volunteerId: string;
      readonly ephemeralPoint: string;
      readonly nonce: string;
      readonly wrappedKey: string;
    } | null;
    readonly orgSealWrap: { readonly wrappedTk: string } | null;
    readonly missingPrincipals: readonly {
      readonly volunteerId: string;
      readonly volPublic: string;
    }[];
  }

  let allEntries = $state<ResponseEntry[]>([]);
  let totalCount = $state(0);
  let nextCursor = $state<string | null>(null);

  // Track decrypted answers per ticketId
  type DecryptState =
    | { status: "pending" }
    | { status: "decrypted"; answers: readonly DecryptedIntakeAnswer[] }
    | { status: "key-not-held" }
    | { status: "failed" };

  const rowStates = new SvelteMap<string, DecryptState>();

  // Set of ticket IDs we have already started decrypting so we do not
  // re-process rows on TanStack Query re-fetches.
  const processedTickets = new SvelteSet<string>();

  // Process new pages as they arrive. The $effect fires on each
  // responsesQuery.data change. Side-effects (async decrypt, state
  // mutation) are intentional: $derived cannot express async batch
  // decryption that accumulates across pages.
  $effect(() => {
    const data = responsesQuery.data;
    if (!data) return;

    totalCount = data.total;
    nextCursor = data.nextCursor;

    const newEntries: ResponseEntry[] = [];
    for (const row of data.rows) {
      if (processedTickets.has(row.ticketId)) continue;
      processedTickets.add(row.ticketId);
      newEntries.push(row);
    }

    if (newEntries.length > 0) {
      allEntries = [...allEntries, ...newEntries];
      void decryptBatch(newEntries);
    }
  });

  async function decryptBatch(
    entries: readonly ResponseEntry[],
  ): Promise<void> {
    for (const entry of entries) {
      const hasWrap = entry.callerKeyWrap !== null;
      const hasSeal = entry.orgSealWrap !== null;

      if (!hasWrap && !hasSeal) {
        rowStates.set(entry.ticketId, { status: "key-not-held" });
        continue;
      }

      rowStates.set(entry.ticketId, { status: "pending" });

      try {
        const answersJson = await bridge.decryptIntakeResponse(
          entry.ticketId,
          entry.encryptedResponse,
          entry.callerKeyWrap
            ? {
                ephemeralPoint: entry.callerKeyWrap.ephemeralPoint,
                nonce: entry.callerKeyWrap.nonce,
                wrappedKey: entry.callerKeyWrap.wrappedKey,
              }
            : null,
          entry.orgSealWrap,
        );

        const answers = parseAnswers(answersJson);
        // care-y-ignore-next-line no-plaintext-db-write -- in-memory SvelteMap of reactive UI state; a client component has no database access
        rowStates.set(entry.ticketId, {
          status: "decrypted",
          answers,
        });

        // Fire lazy backfill if there are missing principals
        if (
          entry.missingPrincipals.length > 0 &&
          !backfilledTickets.has(entry.ticketId)
        ) {
          backfilledTickets.add(entry.ticketId);
          void fireBackfill(entry.ticketId, entry.missingPrincipals);
        }
      } catch {
        rowStates.set(entry.ticketId, { status: "failed" });
      }
    }
  }

  // ── Lazy backfill ───────────────────────────────────────────────

  const backfillMutation = createMutation(() => ({
    mutationFn: async (input: {
      ticketId: string;
      wraps: {
        volunteerId: string;
        ephemeralPoint: string;
        nonce: string;
        wrappedKey: string;
      }[];
    }) => intakeFormsRouter.backfillWraps.mutate(input),
    onError: () => {
      toastStore.show(m.intake_responses_backfill_failed());
    },
  }));

  async function fireBackfill(
    ticketId: string,
    principals: readonly { volunteerId: string; volPublic: string }[],
  ): Promise<void> {
    try {
      const wraps = await bridge.mintBackfillWraps(ticketId, principals);
      if (wraps.length > 0) {
        backfillMutation.mutate({
          ticketId,
          wraps: wraps.map((w) => ({
            volunteerId: w.volunteerId,
            ephemeralPoint: w.ephemeralPoint,
            nonce: w.nonce,
            wrappedKey: w.wrappedKey,
          })),
        });
      }
    } catch {
      // Backfill is best-effort; do not block the viewer
    }
  }

  // ── Pagination ──────────────────────────────────────────────────

  function loadMore(): void {
    if (nextCursor !== null) {
      cursor = nextCursor;
    }
  }

  // ── CSV export ─────────────────────────────────────────────────

  let exportDialogOpen = $state(false);

  /** True while any row is still pending decryption. */
  const hasPendingRows = $derived.by((): boolean => {
    for (const [, state] of rowStates) {
      if (state.status === "pending") return true;
    }
    return false;
  });

  /** Counts of exportable vs skipped rows. */
  const exportCounts = $derived.by(
    (): {
      exportable: number;
      skipped: number;
    } => {
      let exportable = 0;
      let skipped = 0;
      for (const [, state] of rowStates) {
        if (state.status === "decrypted") {
          exportable++;
        } else if (
          state.status === "key-not-held" ||
          state.status === "failed"
        ) {
          skipped++;
        }
      }
      return { exportable, skipped };
    },
  );

  function openExportDialog(): void {
    if (exportCounts.exportable === 0) {
      toastStore.show(m.intake_responses_export_no_rows());
      return;
    }
    exportDialogOpen = true;
  }

  function dismissExportDialog(): void {
    exportDialogOpen = false;
  }

  async function confirmExport(): Promise<void> {
    exportDialogOpen = false;

    const locale = getLocale();
    const decryptedRows: {
      submittedAt: string;
      answers: readonly DecryptedIntakeAnswer[];
    }[] = [];

    for (const entry of allEntries) {
      const state = rowStates.get(entry.ticketId);
      if (state?.status === "decrypted") {
        decryptedRows.push({
          submittedAt: entry.submittedAt,
          answers: state.answers,
        });
      }
    }

    const result = assembleIntakeCsv(
      fieldDefs,
      decryptedRows,
      locale,
      m.intake_responses_csv_submitted_header(),
    );

    // Record audit event before offering the file (best-effort;
    // the download proceeds even if the mutation fails)
    try {
      await intakeFormsRouter.logExport.mutate({
        formId,
        exportedCount: result.exportedCount,
        skippedCount: exportCounts.skipped,
      });
    } catch {
      // Audit is best-effort; do not block the download
    }

    const encoder = new TextEncoder();
    const bytes = encoder.encode(result.csv);
    triggerBlobDownload(bytes, `intake-responses-${formId}.csv`);
  }

  // ── Parsing ─────────────────────────────────────────────────────

  /** Type guard for a single answer element from the Worker JSON. */
  function isAnswerShape(v: unknown): v is DecryptedIntakeAnswer {
    return (
      typeof v === "object" &&
      v !== null &&
      "fieldKey" in v &&
      typeof (v as Record<string, unknown>).fieldKey === "string"
    );
  }

  /**
   * Answers for a decrypted state, empty otherwise. Gives the template
   * each-block an explicitly typed source (the svelte-eslint type service
   * loses union narrowing across template branches).
   */
  function decryptedAnswers(
    state: DecryptState,
  ): readonly DecryptedIntakeAnswer[] {
    return state.status === "decrypted" ? state.answers : [];
  }

  /**
   * Parse the JSON string returned by the bridge into typed answers.
   * Invalid elements are silently dropped (graceful degradation).
   */
  function parseAnswers(json: string): readonly DecryptedIntakeAnswer[] {
    const raw: unknown = JSON.parse(json);
    if (!Array.isArray(raw)) return [];
    return raw.filter(isAnswerShape);
  }

  // ── Display helpers ─────────────────────────────────────────────

  function fieldLabel(fieldKey: string): string {
    const def = fieldDefs.get(fieldKey);
    if (!def) return m.intake_responses_unknown_field();
    const label = resolveLocalized(def.label, "en");
    return label ?? fieldKey;
  }

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  function formatAnswerValue(value: unknown): string {
    if (typeof value === "string") return value;
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") return String(value);
    if (Array.isArray(value)) {
      return (value as unknown[])
        .map((v) => (typeof v === "string" ? v : JSON.stringify(v)))
        .join(", ");
    }
    if (typeof value === "object" && value !== null) {
      // Availability data or other structured objects
      return JSON.stringify(value);
    }
    if (value == null) return "";
    // Remaining primitives (symbol, bigint) are not expected in form
    // responses but handled for exhaustiveness.
    return typeof value === "bigint" ? value.toString() : "";
  }
</script>

<div class="irv-root" role="region" aria-label={m.intake_responses_title()}>
  <!-- Total count -->
  {#if totalCount > 0}
    <p class="irv-count">
      {m.intake_responses_count({ count: String(totalCount) })}
    </p>
  {/if}

  <!-- Default form note -->
  <p class="irv-note">{m.intake_responses_default_form_note()}</p>

  <!-- Export CSV button -->
  {#if allEntries.length > 0}
    <button
      type="button"
      class="irv-export-btn"
      data-testid="export-csv-btn"
      disabled={hasPendingRows}
      onclick={openExportDialog}
      aria-label={m.intake_responses_export_csv()}
    >
      <Download size={16} aria-hidden="true" />
      {m.intake_responses_export_csv()}
    </button>
  {/if}

  {#if responsesQuery.isLoading && allEntries.length === 0}
    <div class="irv-loading" aria-busy="true">
      <Preloader />
      <p>{m.intake_responses_loading()}</p>
    </div>
  {:else if responsesQuery.isError && allEntries.length === 0}
    <QueryError
      error={responsesQuery.error}
      onretry={() => void responsesQuery.refetch()}
    />
  {:else if allEntries.length === 0}
    <p class="irv-empty">{m.intake_responses_empty()}</p>
  {:else}
    {#each allEntries as entry (entry.ticketId)}
      {@const decryptState = rowStates.get(entry.ticketId)}
      <Card raised class="irv-card">
        <div class="irv-card-inner">
          <p class="irv-submitted">
            {m.intake_responses_submitted_at({
              date: formatDate(entry.submittedAt),
            })}
          </p>

          {#if !decryptState || decryptState.status === "pending"}
            <div class="irv-pending" aria-busy="true">
              <Preloader class="w-5 h-5" />
              <span>{m.intake_responses_loading()}</span>
            </div>
          {:else if decryptState.status === "key-not-held"}
            <div class="irv-state-row">
              <Lock size={16} aria-hidden="true" class="irv-state-icon" />
              <div class="irv-state-text">
                <span class="irv-state-title"
                  >{m.intake_responses_key_not_held()}</span
                >
                <span class="irv-state-hint"
                  >{m.intake_responses_key_not_held_hint()}</span
                >
              </div>
            </div>
          {:else if decryptState.status === "failed"}
            <div class="irv-state-row">
              <TriangleAlert
                size={16}
                aria-hidden="true"
                class="irv-state-icon irv-warn-icon"
              />
              <div class="irv-state-text">
                <span class="irv-state-title"
                  >{m.intake_responses_decrypt_failed()}</span
                >
                <span class="irv-state-hint"
                  >{m.intake_responses_decrypt_failed_hint()}</span
                >
              </div>
            </div>
          {:else if decryptState.status === "decrypted"}
            <dl class="irv-answers">
              {#each decryptedAnswers(decryptState) as answer (answer.fieldKey)}
                {@const knownField = fieldDefs.has(answer.fieldKey)}
                <div class="irv-answer-row">
                  <dt
                    class="irv-field-label"
                    class:irv-unknown-field={!knownField}
                  >
                    {#if !knownField}
                      <CircleQuestionMark
                        size={12}
                        aria-hidden="true"
                        class="irv-unknown-icon"
                      />
                    {/if}
                    {fieldLabel(answer.fieldKey)}
                  </dt>
                  <dd class="irv-field-value">
                    {formatAnswerValue(answer.value)}
                  </dd>
                </div>
              {/each}
            </dl>
          {/if}
        </div>
      </Card>
    {/each}

    <!-- Load more -->
    {#if nextCursor !== null}
      <button
        type="button"
        class="irv-load-more"
        disabled={responsesQuery.isFetching}
        onclick={loadMore}
        aria-label={m.intake_responses_load_more()}
      >
        {#if responsesQuery.isFetching}
          <Preloader class="w-4 h-4" />
        {/if}
        {m.intake_responses_load_more()}
      </button>
    {/if}
  {/if}
</div>

<!-- Export confirmation dialog -->
<ShellDialog
  opened={exportDialogOpen}
  ondismiss={dismissExportDialog}
  title={m.intake_responses_export_confirm_title()}
>
  {#snippet content()}
    <p class="irv-dialog-text">
      {m.intake_responses_export_confirm_body({
        exportedCount: String(exportCounts.exportable),
      })}
    </p>
    {#if exportCounts.skipped > 0}
      <p class="irv-dialog-text irv-dialog-skipped">
        {m.intake_responses_export_confirm_skipped({
          skippedCount: String(exportCounts.skipped),
        })}
      </p>
    {/if}
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={dismissExportDialog}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton strong onclick={() => void confirmExport()}>
      {m.intake_responses_export_confirm_action()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .irv-root {
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .irv-count {
    font-size: var(--text-sm);
    color: var(--muted);
    text-align: center;
  }

  .irv-note {
    font-size: var(--text-xs);
    color: var(--muted);
    text-align: center;
    padding: 0 var(--space-md);
    line-height: 1.5;
  }

  .irv-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-xl) 0;
    color: var(--muted);
    font-size: var(--text-sm);
  }

  .irv-empty {
    color: var(--muted);
    font-size: var(--text-sm);
    text-align: center;
    padding: var(--space-xl) 0;
  }

  :global(.irv-card) {
    margin: 0 !important;
  }

  .irv-card-inner {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .irv-submitted {
    font-size: var(--text-xs);
    color: var(--muted);
    font-weight: 500;
  }

  .irv-pending {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--muted);
    font-size: var(--text-sm);
    padding: var(--space-sm) 0;
  }

  .irv-state-row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    padding: var(--space-sm) 0;
  }

  :global(.irv-state-icon) {
    color: var(--muted);
    flex-shrink: 0;
    margin-top: 2px;
  }

  :global(.irv-warn-icon) {
    color: var(--urgent, var(--danger));
  }

  .irv-state-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .irv-state-title {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--ink);
  }

  .irv-state-hint {
    font-size: var(--text-xs);
    color: var(--muted);
    line-height: 1.4;
  }

  .irv-answers {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 4px);
    margin: 0;
    padding: 0;
  }

  .irv-answer-row {
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: var(--space-xs, 4px) 0;
  }

  .irv-answer-row + .irv-answer-row {
    border-top: 1px solid var(--hair, var(--paper-deep));
  }

  .irv-field-label {
    font-size: var(--text-xs);
    color: var(--muted);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .irv-unknown-field {
    font-style: italic;
  }

  :global(.irv-unknown-icon) {
    color: var(--muted);
    flex-shrink: 0;
  }

  .irv-field-value {
    font-size: var(--text-sm);
    color: var(--ink);
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .irv-load-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    width: 100%;
    padding: 0.75rem 1.25rem;
    border-radius: 0.75rem;
    border: none;
    background: color-mix(in srgb, var(--ink) 8%, transparent);
    color: var(--ink);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    min-height: 44px;
    -webkit-tap-highlight-color: transparent;
  }

  .irv-load-more:active {
    background: color-mix(in srgb, var(--ink) 15%, transparent);
  }

  .irv-load-more:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .irv-load-more:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }

  .irv-export-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    align-self: center;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    border: none;
    background: color-mix(in srgb, var(--ink) 8%, transparent);
    color: var(--ink);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    min-height: 44px;
    -webkit-tap-highlight-color: transparent;
  }

  .irv-export-btn:active {
    background: color-mix(in srgb, var(--ink) 15%, transparent);
  }

  .irv-export-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .irv-export-btn:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }

  .irv-dialog-text {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
  }

  .irv-dialog-skipped {
    margin-top: var(--space-sm);
    font-weight: 500;
  }
</style>
