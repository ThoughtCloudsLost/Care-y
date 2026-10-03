<!--
  Fund administration: create and edit funds (name, currency and the
  donation provider fund each one is linked to), deactivate them, record
  adjustments, choose whether fund managers hear about every ledger
  entry, and connect or remove donation provider accounts.

  Anatomy follows NoteTypesSection (card of tappable rows, create/edit
  sheet with a deactivate action at the foot) and the ChannelPolicySection
  toggle row. Fund names, amounts and each fund's running balance are
  sealed in the browser; the server stores ciphertext and a
  day-granularity date only. A new fund starts with a sealed zero
  balance, and an adjustment carries the next one.
-->
<script lang="ts">
  import {
    BlockTitle,
    Card,
    DialogButton,
    List,
    ListInput,
    Preloader,
    Segmented,
    SegmentedButton,
    Toggle,
  } from "konsta/svelte";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import {
    BellRing,
    CircleCheckBig,
    HandCoins,
    Pencil,
    Plus,
    Save,
    Scale,
    TriangleAlert,
  } from "@lucide/svelte";
  import {
    ErrorCode,
    currencyCodeSchema,
    newFundLedgerId,
    saveGivebutterConnectionInputSchema,
    type DonationConnectionId,
    type FundProviderLink,
    type InflowProviderId,
    type RemoveDonationConnectionInput,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { donationKeys, fundKeys } from "$lib/query/keys.js";
  import {
    getCurrentPermissions,
    getCurrentUserId,
    getOrgKeyManager,
  } from "$lib/crypto/context.js";
  import { canCall } from "$lib/auth/procedure-gates.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { getErrorMessage } from "$lib/components/query-error-messages.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import Register from "$lib/components/Register.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import PasswordInput from "$lib/components/inputs/PasswordInput.svelte";
  import RichSelect from "$lib/components/inputs/RichSelect.svelte";
  import type { RichSelectOption } from "$lib/components/inputs/rich-select.js";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import {
    createBalanceWriter,
    createFundStore,
    invalidateFunds,
    providerLinkKey,
    type FundView,
  } from "$lib/funds/fund-store.svelte.js";
  import {
    adjustmentPayload,
    recorderId,
    sealBalancePayload,
    sealFundPayload,
    sealLedgerPayload,
  } from "$lib/funds/fund-payloads.js";
  import { isBelowZero, parseMajorAmount } from "$lib/funds/balances.js";
  import { formatAmount } from "$lib/funds/fund-display.js";
  import { formatShortDate } from "$lib/utils/time.js";

  const fundsRouter = requireRouter(trpc.funds, "funds");
  const queryClient = useQueryClient();
  const orgKeyManager = getOrgKeyManager();
  const currentUserIdGetter = getCurrentUserId();
  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());
  const canRecordAdjustment = $derived(
    canCall(permissions, "funds.recordAdjustment"),
  );
  const canReadSettings = $derived(canCall(permissions, "funds.getSettings"));
  // The demo build declines the donations router.
  const donationsMounted = trpc.donations !== undefined;
  const canManageDonations = $derived(
    donationsMounted && canCall(permissions, "donations.listConnections"),
  );
  const canReadProviderFunds = $derived(
    donationsMounted && canCall(permissions, "donations.listProviderFunds"),
  );

  const fundStore = createFundStore();
  const balanceWriter = createBalanceWriter(fundStore);

  // ── Notify setting ──

  const settingsQuery = createQuery(() => ({
    queryKey: fundKeys.settings(),
    queryFn: async () => fundsRouter.getSettings.query(),
    enabled: canReadSettings,
  }));

  const notifyFundManagers = $derived(
    settingsQuery.data?.notifyFundManagers ?? true,
  );

  const settingsMutation = createMutation(() => ({
    mutationFn: async (input: { notifyFundManagers: boolean }) =>
      fundsRouter.updateSettings.mutate(input),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_funds_settings_saved());
      announceToLiveRegion("polite", m.admin_funds_settings_saved());
      void queryClient.invalidateQueries({ queryKey: fundKeys.settings() });
    },
    onError: (err: unknown) => {
      toastStore.show(getErrorMessage(err), 3000);
    },
  }));

  // ── Donation providers ──

  const connectionsQuery = createQuery(() => ({
    queryKey: donationKeys.connections(),
    queryFn: async () =>
      requireRouter(trpc.donations, "donations").listConnections.query(),
    enabled: canManageDonations,
  }));

  const connections = $derived(connectionsQuery.data?.connections ?? []);

  const PROVIDER_NAMES = new Map<InflowProviderId, () => string>([
    ["givebutter", m.admin_donations_provider_givebutter],
  ]);

  function providerName(provider: InflowProviderId): string {
    return PROVIDER_NAMES.get(provider)?.() ?? provider;
  }

  function invalidateDonations(): void {
    void queryClient.invalidateQueries({
      queryKey: donationKeys.connections(),
    });
    void queryClient.invalidateQueries({ queryKey: fundKeys.providerFunds() });
  }

  // Connect sheet. The typed key lives only in this field, and only
  // until the sheet closes.
  let connectSheetOpen = $state(false);
  let apiKeyInput = $state("");

  function openConnectSheet(): void {
    apiKeyInput = "";
    connectSheetOpen = true;
  }

  function closeConnectSheet(): void {
    connectSheetOpen = false;
    apiKeyInput = "";
  }

  // The key is read from the field when the request is built, not passed
  // as mutation variables, so the mutation cache never holds it.
  const saveConnectionMutation = createMutation(() => ({
    mutationFn: async () =>
      requireRouter(
        trpc.donations,
        "donations",
      ).saveGivebutterConnection.mutate({ apiKey: apiKeyInput.trim() }),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_donations_connection_saved());
      announceToLiveRegion("polite", m.admin_donations_connection_saved());
      closeConnectSheet();
      invalidateDonations();
    },
    onError: (err: unknown) => {
      toastStore.show(getErrorMessage(err), 3000);
      // The provider may have refused the webhook after the server stored
      // the key. The connection exists in that case, so the list refetches
      // and the sheet closes either way: the saved card shows the
      // remove-and-retry sentence, and the key never lingers in the field.
      if (isDonationWebhookNotRegistered(err)) {
        closeConnectSheet();
      }
      invalidateDonations();
    },
  }));

  function isDonationWebhookNotRegistered(err: unknown): boolean {
    return (
      err instanceof Error &&
      err.message === ErrorCode.DONATION_WEBHOOK_NOT_REGISTERED
    );
  }

  const canSaveConnection = $derived(
    saveGivebutterConnectionInputSchema.safeParse({
      apiKey: apiKeyInput.trim(),
    }).success && !saveConnectionMutation.isPending,
  );

  function handleSaveConnection(): void {
    if (!canSaveConnection) return;
    saveConnectionMutation.mutate();
  }

  // Remove confirm.
  let removeDialogOpen = $state(false);
  let removeTarget = $state<DonationConnectionId | null>(null);

  function startRemove(connectionId: DonationConnectionId): void {
    removeTarget = connectionId;
    removeDialogOpen = true;
  }

  function closeRemoveDialog(): void {
    removeDialogOpen = false;
    removeTarget = null;
  }

  const removeConnectionMutation = createMutation(() => ({
    mutationFn: async (input: RemoveDonationConnectionInput) =>
      requireRouter(trpc.donations, "donations").removeConnection.mutate(input),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_donations_connection_removed());
      announceToLiveRegion("polite", m.admin_donations_connection_removed());
      invalidateDonations();
    },
    onError: (err: unknown) => {
      toastStore.show(getErrorMessage(err), 3000);
    },
  }));

  function confirmRemove(): void {
    if (removeTarget === null) return;
    removeConnectionMutation.mutate({ connectionId: removeTarget });
    closeRemoveDialog();
  }

  // ── Provider funds (for linking) ──

  const providerFundsQuery = createQuery(() => ({
    queryKey: fundKeys.providerFunds(),
    queryFn: async () =>
      requireRouter(trpc.donations, "donations").listProviderFunds.query(),
    enabled: canReadProviderFunds,
  }));

  function linkValue(link: FundProviderLink | null): string {
    return link === null ? "" : providerLinkKey(link);
  }

  // A connection id is a uuid and holds no ":", so the first one ends it;
  // the external id after it is taken whole.
  function linkFromValue(value: string): FundProviderLink | null {
    const separator = value.indexOf(":");
    if (separator <= 0) return null;
    return {
      connectionId: value.slice(0, separator),
      externalFundId: value.slice(separator + 1),
    };
  }

  // ── Fund create/edit sheet ──

  let fundSheetOpen = $state(false);
  let editingFund = $state<FundView | null>(null);
  let editName = $state("");
  let editCurrency = $state("");
  let editLink = $state("");
  let fundSaving = $state(false);

  const savedLink = $derived(linkValue(editingFund?.providerLink ?? null));
  const linkOptions = $derived.by((): RichSelectOption[] => {
    const options: RichSelectOption[] = [
      { value: "", label: m.fund_link_none() },
    ];
    for (const providerFund of providerFundsQuery.data?.funds ?? []) {
      const value = providerLinkKey({
        connectionId: providerFund.connectionId,
        externalFundId: providerFund.externalId,
      });
      if (options.some((o) => o.value === value)) continue;
      options.push({
        value,
        label:
          providerFund.code === null
            ? providerFund.name
            : `${providerFund.name} (${providerFund.code})`,
      });
    }
    // A link the provider does not list stays selectable, so saving the
    // sheet never drops it without the admin choosing to.
    if (!options.some((o) => o.value === savedLink)) {
      options.push({
        value: savedLink,
        label: providerFundsQuery.isLoading
          ? m.common_loading()
          : m.fund_link_missing(),
      });
    }
    return options;
  });

  const isCreateMode = $derived(editingFund === null);
  const fundSheetTitle = $derived(
    isCreateMode ? m.admin_funds_add() : m.admin_funds_edit(),
  );
  const normalizedCurrency = $derived(editCurrency.trim().toUpperCase());
  const currencyValid = $derived(
    currencyCodeSchema.safeParse(normalizedCurrency).success,
  );
  const currencyError = $derived(
    editCurrency.trim() !== "" && !currencyValid
      ? m.admin_funds_currency_invalid()
      : undefined,
  );
  const fundDirty = $derived(
    editName.trim() !== editingFund?.name ||
      normalizedCurrency !== editingFund.currency ||
      editLink !== savedLink,
  );
  const canSaveFund = $derived(
    editName.trim().length > 0 && currencyValid && fundDirty && !fundSaving,
  );

  function openCreateSheet(): void {
    editingFund = null;
    editName = "";
    editCurrency = "";
    editLink = "";
    fundSheetOpen = true;
  }

  function openEditSheet(fund: FundView): void {
    editingFund = fund;
    editName = fund.name;
    editCurrency = fund.currency;
    editLink = linkValue(fund.providerLink);
    fundSheetOpen = true;
  }

  function dismissFundSheet(): void {
    fundSheetOpen = false;
  }

  function fundSaved(message: string): void {
    haptic();
    toastStore.show(message);
    announceToLiveRegion("polite", message);
    invalidateFunds(queryClient);
    dismissFundSheet();
  }

  async function handleFundSave(): Promise<void> {
    if (!canSaveFund) return;
    fundSaving = true;
    try {
      const encryptedPayload = await sealFundPayload(orgKeyManager, {
        name: editName,
        currency: normalizedCurrency,
        providerLink: linkFromValue(editLink),
      });
      if (editingFund === null) {
        await fundsRouter.create.mutate({
          encryptedPayload,
          encryptedBalance: await sealBalancePayload(orgKeyManager, 0),
        });
        fundSaved(m.admin_funds_created());
      } else {
        await fundsRouter.update.mutate({
          fundId: editingFund.id,
          encryptedPayload,
        });
        fundSaved(m.admin_funds_updated());
      }
    } catch (err: unknown) {
      toastStore.show(getErrorMessage(err), 3000);
    } finally {
      fundSaving = false;
    }
  }

  async function handleActiveToggle(): Promise<void> {
    if (editingFund === null) return;
    fundSaving = true;
    try {
      const nextActive = !editingFund.isActive;
      await fundsRouter.update.mutate({
        fundId: editingFund.id,
        isActive: nextActive,
      });
      fundSaved(
        nextActive ? m.admin_funds_reactivated() : m.admin_funds_deactivated(),
      );
    } catch (err: unknown) {
      toastStore.show(getErrorMessage(err), 3000);
    } finally {
      fundSaving = false;
    }
  }

  // ── Adjustment sheet ──

  let adjustSheetOpen = $state(false);
  let adjustFundId = $state("");
  let adjustDirection = $state<"add" | "remove">("add");
  let adjustAmount = $state("");
  let adjustSaving = $state(false);

  const adjustMinor = $derived(parseMajorAmount(adjustAmount));
  const adjustAmountError = $derived(
    adjustAmount.trim() !== "" && adjustMinor === null
      ? m.fund_amount_invalid()
      : undefined,
  );
  const adjustFund = $derived(fundStore.fund(adjustFundId));
  const canSaveAdjustment = $derived(
    adjustFund !== undefined && adjustMinor !== null && !adjustSaving,
  );

  function openAdjustSheet(): void {
    adjustFundId = fundStore.activeFunds[0]?.id ?? "";
    adjustDirection = "add";
    adjustAmount = "";
    adjustSheetOpen = true;
  }

  function dismissAdjustSheet(): void {
    adjustSheetOpen = false;
  }

  async function handleAdjustmentSave(): Promise<void> {
    if (adjustFund === undefined || adjustMinor === null) return;
    const recordedBy = recorderId(currentUserIdGetter());
    if (recordedBy === null) {
      toastStore.show(m.error_generic(), 3000);
      return;
    }
    adjustSaving = true;
    try {
      const amountMinor =
        adjustDirection === "add" ? adjustMinor : -adjustMinor;
      const id = newFundLedgerId();
      const encryptedPayload = await sealLedgerPayload(
        orgKeyManager,
        adjustmentPayload({ fundId: adjustFund.id, recordedBy, amountMinor }),
      );
      await balanceWriter.write(adjustFund.id, amountMinor, async (balance) =>
        fundsRouter.recordAdjustment.mutate({ id, encryptedPayload, balance }),
      );
      haptic();
      toastStore.show(m.admin_funds_adjustment_saved());
      announceToLiveRegion("polite", m.admin_funds_adjustment_saved());
      invalidateFunds(queryClient);
      dismissAdjustSheet();
    } catch (err: unknown) {
      toastStore.show(getErrorMessage(err), 3000);
    } finally {
      adjustSaving = false;
    }
  }

  function balanceLine(fund: FundView): string {
    const { available } = fund;
    switch (available.kind) {
      case "pending":
        return fund.currency;
      case "unavailable":
        return m.fund_balance_raised_unavailable();
      case "amount": {
        const amount = formatAmount(available.minor, fund.currency);
        return isBelowZero(available.minor)
          ? m.fund_available_below_zero({ amount })
          : m.fund_available_amount({ amount });
      }
    }
  }
</script>

{#if fundStore.isError}
  <QueryError error={fundStore.error} onretry={() => fundStore.refetch()} />
{:else}
  <Card raised contentWrap={false} class="funds-card">
    <div class="funds-card-inner">
      <p class="section-desc">{m.admin_funds_description()}</p>

      {#if fundStore.unreadableCount > 0}
        <Register kind="careful" role="status">
          {m.funds_incomplete()}
        </Register>
      {/if}

      {#if fundStore.isLoading}
        {#each { length: 2 } as _, i (i)}
          <div class="funds-row">
            <DecryptPlaceholder length={12} />
          </div>
        {/each}
      {:else if fundStore.funds.length === 0 && !fundStore.decrypting}
        <p class="funds-empty">{m.admin_funds_empty()}</p>
      {:else}
        {#each fundStore.funds as fund (fund.id)}
          <button
            type="button"
            class="funds-row funds-row-interactive touch-feedback"
            class:funds-row-inactive={!fund.isActive}
            onclick={() => openEditSheet(fund)}
          >
            <span class="funds-row-label">
              <HandCoins size={16} aria-hidden="true" class="funds-icon" />
              <span class="funds-row-text">
                <span class="funds-row-name">
                  <span>{fund.name}</span>
                  {#if !fund.isActive}
                    <span class="inactive-badge"
                      >{m.admin_status_inactive()}</span
                    >
                  {/if}
                </span>
                <span class="funds-row-sub num">{balanceLine(fund)}</span>
              </span>
            </span>
            <span class="funds-edit-btn" aria-hidden="true">
              <Pencil size={14} />
            </span>
          </button>
        {/each}
      {/if}

      <SoftButton onclick={openCreateSheet} full>
        <Plus size={16} aria-hidden="true" />
        {m.admin_funds_add()}
      </SoftButton>

      {#if canRecordAdjustment && fundStore.activeFunds.length > 0}
        <SoftButton onclick={openAdjustSheet} full>
          <Scale size={16} aria-hidden="true" />
          {m.admin_funds_record_adjustment()}
        </SoftButton>
      {/if}

      {#if canReadSettings}
        <div class="section-divider" role="separator"></div>
        <div class="funds-row">
          <span class="funds-row-label">
            <BellRing size={16} aria-hidden="true" class="funds-icon" />
            <span class="funds-row-text">
              <span>{m.admin_funds_notify_label()}</span>
              {#if !notifyFundManagers}
                <span class="funds-row-sub">
                  {m.admin_funds_notify_off_hint()}
                </span>
              {/if}
            </span>
          </span>
          <Toggle
            checked={notifyFundManagers}
            disabled={settingsQuery.isLoading || settingsMutation.isPending}
            onChange={() =>
              settingsMutation.mutate({
                notifyFundManagers: !notifyFundManagers,
              })}
            aria-label={m.admin_funds_notify_label()}
          />
        </div>
      {/if}
    </div>
  </Card>
{/if}

{#if canManageDonations}
  <BlockTitle>{m.admin_donations_title()}</BlockTitle>
  {#if connectionsQuery.isLoading}
    <Card raised contentWrap={false} class="funds-card">
      <div class="donation-card-inner">
        <div class="status-row">
          <div class="status-icon status-attention">
            <HandCoins size={24} aria-hidden="true" />
          </div>
          <div class="status-text">
            <InlineSkeleton width="10rem" />
            <InlineSkeleton width="6rem" />
          </div>
        </div>
      </div>
    </Card>
  {:else if connectionsQuery.isError}
    <QueryError
      error={connectionsQuery.error}
      onretry={() => void connectionsQuery.refetch()}
    />
  {:else}
    {#each connections as connection (connection.id)}
      <Card raised contentWrap={false} class="funds-card">
        <div class="donation-card-inner">
          <div class="status-row">
            <div
              class="status-icon"
              class:ok={connection.webhookRegistered}
              class:status-attention={!connection.webhookRegistered}
            >
              {#if connection.webhookRegistered}
                <CircleCheckBig size={24} aria-hidden="true" />
              {:else}
                <TriangleAlert size={24} aria-hidden="true" />
              {/if}
            </div>
            <div class="status-text">
              <p class="status-headline">
                {providerName(connection.provider)}
              </p>
              <p class="status-detail">
                {m.admin_donations_key_ending({ hint: connection.keyHint })}
              </p>
              <p class="status-detail">
                {connection.webhookRegistered
                  ? m.admin_donations_webhook_registered()
                  : m.admin_donations_webhook_not_registered()}
              </p>
            </div>
          </div>
          <SoftButton
            onclick={() => startRemove(connection.id)}
            disabled={removeConnectionMutation.isPending}
            aria-label={m.admin_donations_remove() +
              " " +
              m.admin_donations_key_ending({ hint: connection.keyHint })}
            full
          >
            {m.admin_donations_remove()}
          </SoftButton>
        </div>
      </Card>
    {/each}
    <div class="donations-actions">
      <SoftButton onclick={openConnectSheet} full>
        <Plus size={16} aria-hidden="true" />
        {m.admin_donations_connect_givebutter()}
      </SoftButton>
    </div>
  {/if}
{/if}

<!-- Create / edit sheet -->
<ShellSheet
  opened={fundSheetOpen}
  ondismiss={dismissFundSheet}
  ariaLabel={fundSheetTitle}
  title={fundSheetTitle}
>
  {#snippet headerRight()}
    <SoftButton onclick={() => void handleFundSave()} disabled={!canSaveFund}>
      {fundSaving ? m.common_loading() : m.common_save()}
    </SoftButton>
  {/snippet}

  <div class="edit-sheet-body">
    <List nested class="edit-sheet-list">
      <ListInput
        label={m.admin_funds_name_label()}
        type="text"
        placeholder={m.admin_funds_name_placeholder()}
        value={editName}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLInputElement) editName = target.value;
        }}
        disabled={fundSaving}
      />
      <ListInput
        label={m.admin_funds_currency_label()}
        type="text"
        placeholder={m.admin_funds_currency_placeholder()}
        maxlength={3}
        value={editCurrency}
        info={m.admin_funds_currency_hint()}
        error={currencyError}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLInputElement) editCurrency = target.value;
        }}
        disabled={fundSaving}
        inputClass="funds-currency-input"
      />
    </List>

    {#if canReadProviderFunds}
      <RichSelect
        label={m.fund_link_label()}
        value={editLink}
        options={linkOptions}
        onchange={(value: string) => {
          editLink = value;
        }}
        disabled={fundSaving ||
          providerFundsQuery.isLoading ||
          providerFundsQuery.isError}
        listClass="edit-sheet-list"
      />
      {#if providerFundsQuery.isError}
        <Register kind="careful" role="status">
          {m.fund_link_unavailable()}
        </Register>
      {/if}
    {/if}

    <Register kind="protected">
      {m.admin_funds_protected()}
    </Register>

    {#if editingFund !== null}
      <div class="deactivate-action">
        <time class="fund-created" datetime={editingFund.createdAt}>
          {m.admin_funds_created_on({
            date: formatShortDate(editingFund.createdAt),
          })}
        </time>
        <button
          type="button"
          class="deactivate-btn"
          onclick={() => void handleActiveToggle()}
          disabled={fundSaving}
        >
          {editingFund.isActive ? m.admin_deactivate() : m.admin_reactivate()}
        </button>
      </div>
    {/if}
  </div>
</ShellSheet>

<!-- Adjustment sheet -->
<ShellSheet
  opened={adjustSheetOpen}
  ondismiss={dismissAdjustSheet}
  ariaLabel={m.admin_funds_record_adjustment()}
  title={m.admin_funds_record_adjustment()}
>
  {#snippet headerRight()}
    <SoftButton
      onclick={() => void handleAdjustmentSave()}
      disabled={!canSaveAdjustment}
    >
      {adjustSaving ? m.common_loading() : m.common_save()}
    </SoftButton>
  {/snippet}

  <div class="edit-sheet-body">
    <Register kind="note">
      {m.admin_funds_adjustment_hint()}
    </Register>

    <RichSelect
      label={m.fund_picker_label()}
      value={adjustFundId}
      options={fundStore.activeFunds.map((f) => ({
        value: f.id,
        label: f.name,
      }))}
      onchange={(value: string) => {
        adjustFundId = value;
      }}
      disabled={adjustSaving}
      listClass="edit-sheet-list"
    />

    <div class="edit-sheet-section">
      <span class="edit-sheet-label">
        {m.admin_funds_adjustment_direction()}
      </span>
      <Segmented strong class="adjust-direction-seg">
        <SegmentedButton
          active={adjustDirection === "add"}
          onclick={() => {
            adjustDirection = "add";
          }}
        >
          {m.admin_funds_adjustment_add()}
        </SegmentedButton>
        <SegmentedButton
          active={adjustDirection === "remove"}
          onclick={() => {
            adjustDirection = "remove";
          }}
        >
          {m.admin_funds_adjustment_remove()}
        </SegmentedButton>
      </Segmented>
    </div>

    <List nested class="edit-sheet-list">
      <ListInput
        label={m.fund_amount_label()}
        type="text"
        inputmode="decimal"
        placeholder={m.fund_amount_placeholder()}
        value={adjustAmount}
        info={adjustFund === undefined
          ? undefined
          : m.fund_amount_currency_hint({ currency: adjustFund.currency })}
        error={adjustAmountError}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLInputElement) adjustAmount = target.value;
        }}
        disabled={adjustSaving}
      />
    </List>
  </div>
</ShellSheet>

<!-- Connect Givebutter sheet -->
<ShellSheet
  opened={connectSheetOpen}
  ondismiss={closeConnectSheet}
  ariaLabel={m.admin_donations_connect_givebutter()}
  title={m.admin_donations_connect_givebutter()}
>
  {#snippet headerRight()}
    <SoftButton onclick={handleSaveConnection} disabled={!canSaveConnection}>
      {#if saveConnectionMutation.isPending}
        <Preloader class="w-4 h-4" />
      {:else}
        <Save size={16} aria-hidden="true" />
      {/if}
      {m.common_save()}
    </SoftButton>
  {/snippet}

  <div class="edit-sheet-body">
    <List nested class="edit-sheet-list">
      <PasswordInput
        label={m.admin_donations_api_key_label()}
        autocomplete="off"
        bind:value={apiKeyInput}
        disabled={saveConnectionMutation.isPending}
      />
    </List>

    <Register kind="note">
      {m.admin_donations_api_key_hint()}
    </Register>
  </div>
</ShellSheet>

<!-- Remove connection confirmation -->
<ShellDialog
  opened={removeDialogOpen}
  ondismiss={closeRemoveDialog}
  title={m.admin_donations_remove()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.admin_donations_remove_confirm()}
    </p>
    <Register kind="note">
      {m.admin_donations_remove_webhook_note()}
    </Register>
  {/snippet}
  {#snippet buttons()}
    <!-- care-y-ignore-next-line no-click-without-keyboard -- DialogButton renders a native <button> -->
    <DialogButton onclick={closeRemoveDialog}>
      {m.common_cancel()}
    </DialogButton>
    <!-- care-y-ignore-next-line no-click-without-keyboard -- DialogButton renders a native <button> -->
    <DialogButton
      strong
      class={DIALOG_DESTRUCTIVE_CLASS}
      onclick={confirmRemove}
    >
      {m.admin_donations_remove()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  :global(.funds-card) {
    margin: var(--space-sm) var(--space-md) !important;
  }

  .funds-card-inner {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .section-desc {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
    margin-bottom: var(--space-sm);
  }

  .section-divider {
    height: 1px;
    background: var(--paper-deep, var(--surface-2));
    margin: var(--space-md) 0 var(--space-sm);
  }

  .funds-empty {
    font-size: var(--text-sm);
    color: var(--muted);
    margin: 0 0 var(--space-sm);
  }

  .funds-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    padding: 0.5rem 0;
    min-height: 2.5rem;
  }

  .funds-row-interactive {
    width: 100%;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    border-radius: 0.375rem;
    padding: 0.5rem 0.25rem;
    margin: 0 -0.25rem;
    font: inherit;
    color: inherit;
  }

  .funds-row-inactive {
    opacity: 0.5;
  }

  .funds-row-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .funds-row-name {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  /* A deactivated fund is a records fact, not an alarm. */
  .inactive-badge {
    font-size: var(--text-xs);
    color: var(--muted);
    font-weight: 600;
    flex-shrink: 0;
  }

  .funds-row-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .funds-row-sub {
    font-size: 0.6875rem;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .num {
    font-variant-numeric: tabular-nums;
  }

  :global(.funds-icon) {
    color: var(--brand-accent, var(--brand-primary));
    flex-shrink: 0;
  }

  .funds-edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    min-width: 2.75rem;
    min-height: 2.75rem;
    border-radius: 50%;
    color: var(--muted);
    flex-shrink: 0;
  }

  .edit-sheet-body {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .edit-sheet-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .edit-sheet-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
  }

  :global(.edit-sheet-list) {
    margin: 0 !important;
  }

  :global(.funds-currency-input) {
    text-transform: uppercase;
  }

  :global(.adjust-direction-seg) {
    width: 100%;
  }

  /* ── Donation providers ── */

  .donation-card-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--card-pad-y) var(--card-pad-x);
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .status-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .status-headline {
    font-weight: 600;
    font-size: var(--text-base);
  }

  .status-detail {
    font-size: var(--text-sm);
    color: var(--muted);
  }

  .donations-actions {
    margin: var(--space-sm) var(--space-md);
  }

  /* The fund's start date sits with the action that ends it. */
  .fund-created {
    display: block;
    margin-bottom: var(--space-sm);
    font-size: var(--text-xs);
    color: var(--muted);
    text-align: center;
  }

  .deactivate-action {
    padding: var(--space-2xl) var(--space-lg) 0;
  }

  .deactivate-btn {
    display: block;
    width: 100%;
    padding: 0.625rem;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--danger, var(--color-red-500));
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
    min-height: 44px;
  }
</style>
