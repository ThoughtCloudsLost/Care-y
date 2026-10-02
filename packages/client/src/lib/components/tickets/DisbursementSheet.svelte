<!--
  Record or correct a disbursement from a case. It has the same anatomy
  as InternalNoteSheet, a shell sheet with save in the header, a Note
  register saying who sees what, a RichSelect picker, then the inputs. Owns its
  encryption, mutation and dismiss lifecycle; callers provide ticketId,
  opened/ondismiss, and the disbursement when correcting one.

  Recording is one server call: the Org Key ledger entry (amount and
  fund, no case), the fund's next sealed balance, and an internal note on
  this case whose content is the disbursement envelope, encrypted under
  the ticket key exactly as InternalNoteSheet encrypts a note.

  Correcting is one server call too: a reversal of the entry the note
  names, a replacement entry, the rewritten note and the new balance,
  applied together or not at all. A correction stays in the entry's
  fund, because the server applies one fund's balance per write.

  A disbursement that takes the fund below zero shows a soft warning and
  still records.
-->
<script lang="ts">
  import { List, ListInput } from "konsta/svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { followupSlot } from "@care-y/crypto";
  import {
    newFollowupId,
    newFundLedgerId,
    type FundId,
    type FundLedgerId,
    type UserId,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { noteTypeKeys, ticketKeys } from "$lib/query/keys.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import {
    getCryptoBridge,
    getCurrentUserId,
    getFollowUpDecryptCache,
    getOrgKeyManager,
  } from "$lib/crypto/context.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { getErrorMessage } from "$lib/components/query-error-messages.js";
  import RichSelect from "$lib/components/inputs/RichSelect.svelte";
  import type { RichSelectOption } from "$lib/components/inputs/rich-select.js";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import Register from "$lib/components/Register.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import {
    createBalanceWriter,
    createCaseFund,
    createFundStore,
    invalidateFunds,
    type FundView,
  } from "$lib/funds/fund-store.svelte.js";
  import {
    disbursementNoteContent,
    disbursementPayload,
    disbursementRevision,
    recorderId,
    sealLedgerPayload,
  } from "$lib/funds/fund-payloads.js";
  import {
    balanceAfter,
    isBelowZero,
    minorToMajorInput,
    parseMajorAmount,
  } from "$lib/funds/balances.js";
  import { formatAmount } from "$lib/funds/fund-display.js";
  import type { DisbursementEdit } from "./disbursement-types.js";

  interface DisbursementSheetProps {
    opened: boolean;
    ondismiss: () => void;
    ticketId: string;
    /** The disbursement being corrected. Omit to record a new one. */
    edit?: DisbursementEdit;
  }

  let { opened, ondismiss, ticketId, edit }: DisbursementSheetProps = $props();

  const fundsRouter = requireRouter(trpc.funds, "funds");
  const cryptoBridge = getCryptoBridge();
  const orgKeyManager = getOrgKeyManager();
  const followUpCache = getFollowUpDecryptCache();
  const currentUserIdGetter = getCurrentUserId();
  const queryClient = useQueryClient();

  const fundStore = createFundStore();
  const caseFund = createCaseFund(() => ticketId, fundStore);
  const balanceWriter = createBalanceWriter(fundStore);

  const isEditMode = $derived(edit !== undefined);
  const title = $derived(
    isEditMode ? m.assist_edit_title() : m.assist_record(),
  );

  let selectedFundId = $state("");
  let amountText = $state("");
  let noteText = $state("");
  let saving = $state(false);
  let wasOpen = $state(false);

  /**
   * The corrected entry's fund; else the queue's fund when active; else
   * the first active fund.
   */
  function initialFundId(): string {
    if (edit !== undefined) return edit.envelope.fundId;
    const preferred = caseFund.fund;
    if (preferred?.isActive === true) return preferred.id;
    return fundStore.activeFunds[0]?.id ?? "";
  }

  // Reset or pre-fill each time the sheet opens. The fund starts unset so
  // the default below applies, even when funds finish decrypting late.
  $effect(() => {
    if (opened && !wasOpen) {
      selectedFundId = "";
      amountText =
        edit === undefined ? "" : minorToMajorInput(edit.envelope.amountMinor);
      noteText = edit?.envelope.note ?? "";
    }
    wasOpen = opened;
  });

  // The user's pick, falling back to the default. A correction ignores
  // the picker: it stays in the entry's fund.
  const effectiveFundId = $derived(
    edit === undefined && selectedFundId !== ""
      ? selectedFundId
      : initialFundId(),
  );
  const fund = $derived<FundView | undefined>(fundStore.fund(effectiveFundId));
  const currency = $derived(fund?.currency ?? edit?.envelope.currency ?? "");
  const amountMinor = $derived(parseMajorAmount(amountText));
  const amountError = $derived(
    amountText.trim() !== "" && amountMinor === null
      ? m.fund_amount_invalid()
      : undefined,
  );

  /** What this save does to the fund's balance, in signed minor units. */
  const deltaMinor = $derived.by((): number | null => {
    if (amountMinor === null) return null;
    if (edit === undefined) return -amountMinor;
    return Math.abs(edit.envelope.amountMinor) - amountMinor;
  });

  const balanceNow = $derived(fund?.balance?.balanceMinor ?? null);

  /** The fund's balance once this entry is saved. */
  const balanceAfterSave = $derived(
    balanceNow === null || deltaMinor === null
      ? null
      : balanceAfter(balanceNow, deltaMinor),
  );

  const showBelowZero = $derived(
    deltaMinor !== null &&
      deltaMinor < 0 &&
      balanceAfterSave !== null &&
      isBelowZero(balanceAfterSave),
  );

  const balanceLine = $derived.by((): string | undefined => {
    if (balanceNow === null || fund === undefined) return undefined;
    const amount = formatAmount(balanceNow, fund.currency);
    return isBelowZero(balanceNow)
      ? m.fund_available_below_zero({ amount })
      : m.fund_available_amount({ amount });
  });

  const fundOptions = $derived.by((): RichSelectOption[] => {
    const options = fundStore.activeFunds.map((f) => ({
      value: f.id,
      label: f.name,
    }));
    // A correction may name a fund deactivated since; keep it listed.
    const current = fundStore.fund(effectiveFundId);
    if (current !== undefined && !current.isActive) {
      options.push({ value: current.id, label: current.name });
    }
    return options;
  });

  const isDirty = $derived(
    edit === undefined ||
      amountMinor !== Math.abs(edit.envelope.amountMinor) ||
      noteText.trim() !== edit.envelope.note.trim(),
  );

  const canSave = $derived(
    fund !== undefined && amountMinor !== null && isDirty && !saving,
  );

  /** The case note for the entry, encrypted as InternalNoteSheet does. */
  async function encryptNote(
    followUpId: string,
    ledgerEntryId: FundLedgerId,
    fundId: FundId,
    minor: number,
  ): Promise<string> {
    return cryptoBridge.encrypt(
      ticketId,
      followupSlot(followUpId),
      disbursementNoteContent({
        ledgerEntryId,
        fundId,
        amountMinor: minor,
        currency,
        note: noteText,
      }),
    );
  }

  /**
   * Every disbursement note carries the org's disbursement note type. The
   * first save in an org creates it, sealed under the Org Key like any
   * other note type.
   */
  async function ensureNoteType(): Promise<void> {
    const result = await fundsRouter.ensureDisbursementNoteType.mutate({
      encryptedName: await orgKeyManager.encryptText(
        m.fund_disbursement_note_type_name(),
      ),
      encryptedIcon: await orgKeyManager.encryptText("hand-coins"),
    });
    if (result.created) {
      // The timeline resolves the new type's name and icon from this list.
      void queryClient.invalidateQueries({ queryKey: noteTypeKeys.all });
    }
  }

  async function recordNew(
    target: FundView,
    recordedBy: UserId,
    minor: number,
  ): Promise<void> {
    await ensureNoteType();
    const ledgerEntryId = newFundLedgerId();
    const followUpId = newFollowupId();
    const encryptedPayload = await sealLedgerPayload(
      orgKeyManager,
      disbursementPayload({
        fundId: target.id,
        recordedBy,
        amountMinor: minor,
      }),
    );
    const encryptedContent = await encryptNote(
      followUpId,
      ledgerEntryId,
      target.id,
      minor,
    );
    await balanceWriter.write(target.id, -minor, async (balance) =>
      fundsRouter.recordDisbursement.mutate({
        id: ledgerEntryId,
        encryptedPayload,
        balance,
        caseNote: { followUpId, ticketId, encryptedContent },
      }),
    );
  }

  async function revise(
    current: DisbursementEdit,
    recordedBy: UserId,
    minor: number,
  ): Promise<void> {
    await ensureNoteType();
    const { envelope } = current;
    const revision = disbursementRevision({
      envelope,
      amountMinor: minor,
      recordedBy,
    });
    const reversalId = newFundLedgerId();
    const replacementId = newFundLedgerId();
    const [reversalPayload, replacementPayload, encryptedContent] =
      await Promise.all([
        sealLedgerPayload(orgKeyManager, revision.reversal),
        sealLedgerPayload(orgKeyManager, revision.replacement),
        encryptNote(current.followUpId, replacementId, envelope.fundId, minor),
      ]);
    await balanceWriter.write(
      envelope.fundId,
      revision.deltaMinor,
      async (balance) =>
        fundsRouter.reviseDisbursement.mutate({
          reversal: { id: reversalId, encryptedPayload: reversalPayload },
          replacement: {
            id: replacementId,
            encryptedPayload: replacementPayload,
          },
          balance,
          caseNote: {
            followUpId: current.followUpId,
            ticketId,
            encryptedContent,
          },
        }),
    );
    // The note keeps its id, so drop the cached plaintext.
    followUpCache.deleteByPrefix(current.followUpId);
  }

  async function handleSave(): Promise<void> {
    if (fund === undefined || amountMinor === null) return;
    const recordedBy = recorderId(currentUserIdGetter());
    if (recordedBy === null) {
      toastStore.show(m.error_generic(), 3000);
      return;
    }

    saving = true;
    try {
      if (edit === undefined) {
        await recordNew(fund, recordedBy, amountMinor);
        toastStore.show(m.assist_saved());
        announceToLiveRegion("polite", m.assist_saved());
      } else {
        await revise(edit, recordedBy, amountMinor);
        toastStore.show(m.assist_updated());
        announceToLiveRegion("polite", m.assist_updated());
      }
      haptic();
      ondismiss();
      invalidateFunds(queryClient);
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.followUps(ticketId),
      });
    } catch (err: unknown) {
      // The note type request runs first and is idempotent. The record and
      // revise calls are each one transaction, so a failure there saves
      // nothing.
      toastStore.show(getErrorMessage(err), 3000);
    } finally {
      saving = false;
    }
  }
</script>

<ShellSheet {opened} {ondismiss} ariaLabel={title} {title}>
  {#snippet headerRight()}
    <SoftButton onclick={() => void handleSave()} disabled={!canSave}>
      {saving
        ? m.common_loading()
        : isEditMode
          ? m.common_update()
          : m.common_save()}
    </SoftButton>
  {/snippet}

  <div class="disbursement-sheet-body">
    <Register kind="note">
      <p class="disbursement-description">
        {m.assist_visibility(withTerms())}
      </p>
    </Register>

    {#if fundOptions.length > 0}
      <RichSelect
        label={m.fund_picker_label()}
        value={effectiveFundId}
        options={fundOptions}
        onchange={(value: string) => {
          selectedFundId = value;
        }}
        disabled={saving || isEditMode}
        listClass="disbursement-select-list"
      />
      {#if isEditMode}
        <p class="disbursement-hint">{m.assist_edit_fund_fixed()}</p>
      {/if}
      {#if balanceLine !== undefined}
        <p
          class="disbursement-balance num"
          class:disbursement-balance-below={balanceNow !== null &&
            isBelowZero(balanceNow)}
        >
          {balanceLine}
        </p>
      {/if}
    {:else}
      <p class="disbursement-hint">{m.assist_no_funds()}</p>
    {/if}

    <List nested class="disbursement-input-list">
      <ListInput
        label={m.fund_amount_label()}
        type="text"
        inputmode="decimal"
        placeholder={m.fund_amount_placeholder()}
        value={amountText}
        info={currency === ""
          ? undefined
          : m.fund_amount_currency_hint({ currency })}
        error={amountError}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLInputElement) amountText = target.value;
        }}
        disabled={saving}
      />
    </List>

    {#if showBelowZero && fund !== undefined && balanceAfterSave !== null}
      <Register kind="careful" role="status">
        {m.assist_below_zero({
          fund: fund.name,
          amount: formatAmount(balanceAfterSave, fund.currency),
        })}
      </Register>
    {/if}

    <List nested class="disbursement-input-list">
      <ListInput
        type="textarea"
        placeholder={m.assist_note_placeholder()}
        value={noteText}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLTextAreaElement) {
            noteText = target.value;
            target.style.height = "auto";
            target.style.height = `${String(target.scrollHeight)}px`;
          }
        }}
        disabled={saving}
        inputClass="disbursement-textarea"
      />
    </List>
  </div>
</ShellSheet>

<style>
  .disbursement-sheet-body {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  /* The hint speaks with the Note register's voice; only spacing is ours. */
  .disbursement-description {
    margin: 0;
  }

  /* Same treatment InternalNoteSheet gives its "no types" line. */
  .disbursement-hint {
    font-size: 0.75rem;
    color: var(--muted);
    margin: 0;
    font-style: italic;
  }

  .disbursement-balance {
    font-size: var(--text-sm);
    color: var(--ink-2);
    margin: 0;
  }

  /* Below zero is distinct but neutral: muted italic, never a red alarm.
     The words carry the meaning, so hue is not the only signal. */
  .disbursement-balance-below {
    color: var(--muted);
    font-style: italic;
  }

  .num {
    font-variant-numeric: tabular-nums;
  }

  :global(.disbursement-textarea) {
    min-height: calc(3lh) !important;
    resize: none;
    overflow: hidden;
  }

  :global(.disbursement-input-list),
  :global(.disbursement-select-list) {
    margin: 0 !important;
  }
</style>
