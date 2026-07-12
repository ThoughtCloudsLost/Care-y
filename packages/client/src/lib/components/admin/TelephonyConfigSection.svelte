<script lang="ts">
  import {
    Card,
    List,
    ListItem,
    ListInput,
    Preloader,
    DialogButton,
  } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import {
    CircleCheckBig,
    TriangleAlert,
    Info,
    Save,
    Phone,
    PhoneOutgoing,
    BotMessageSquare,
    RefreshCw,
    Settings2,
    ArrowRightLeft,
  } from "@lucide/svelte";
  import {
    telephonyProviderSchema,
    type ChangeTelephonyModeInput,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys } from "$lib/query/keys.js";
  import { requireRouter } from "$lib/errors.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import PasswordInput from "$lib/components/inputs/PasswordInput.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import TelephonyModePicker from "$lib/components/shared/TelephonyModePicker.svelte";

  const telephonyAdmin = requireRouter(trpc.telephonyAdmin, "telephonyAdmin");

  const queryClient = useQueryClient();

  // ── Queries ──

  const configQuery = createQuery(() => ({
    queryKey: adminKeys.telephonyConfig(),
    queryFn: async () => telephonyAdmin.getConfig.query(),
  }));

  const phonesQuery = createQuery(() => ({
    queryKey: adminKeys.telephonyPhones(),
    queryFn: async () => telephonyAdmin.getProvisionedPhones.query(),
    enabled: configQuery.data != null,
  }));

  const purposeQuery = createQuery(() => ({
    queryKey: adminKeys.telephonyPhonePurpose(),
    queryFn: async () => telephonyAdmin.getPhonePurpose.query(),
    enabled: configQuery.data != null,
  }));

  const config = $derived(configQuery.data);
  const isByot = $derived(config?.mode === "byot");
  const isManaged = $derived(config?.mode === "managed");
  const provisionedPhones = $derived(phonesQuery.data ?? []);
  const currentPurpose = $derived(purposeQuery.data);

  // ── Credential sheet ──

  let credSheetOpen = $state(false);
  let accountIdInput = $state("");
  let authTokenInput = $state("");

  function openCredSheet(): void {
    credSheetOpen = true;
  }

  function closeCredSheet(): void {
    credSheetOpen = false;
    accountIdInput = "";
    authTokenInput = "";
  }

  const saveCredentialsMutation = createMutation(() => ({
    mutationFn: async () => {
      if (!config) return;
      return telephonyAdmin.saveConfig.mutate({
        provider: telephonyProviderSchema.parse(config.provider),
        accountId: accountIdInput,
        authToken: authTokenInput,
      });
    },
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_telephony_credentials_saved());
      announceToLiveRegion("polite", m.admin_telephony_credentials_saved());
      closeCredSheet();
      void queryClient.invalidateQueries({
        queryKey: adminKeys.telephonyConfig(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  function handleSaveCredentials(): void {
    if (!accountIdInput || !authTokenInput || saveCredentialsMutation.isPending)
      return;
    saveCredentialsMutation.mutate();
  }

  // ── Provision ──

  const provisionMutation = createMutation(() => ({
    mutationFn: async () => telephonyAdmin.provisionWebhooks.mutate(),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_telephony_numbers_refreshed());
      announceToLiveRegion("polite", m.admin_telephony_numbers_refreshed());
      void queryClient.invalidateQueries({
        queryKey: adminKeys.telephony(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  // ── Phone purpose assignment ──

  let outboundSid = $state<string | null>(null);
  let systemSid = $state<string | null>(null);
  let purposeInitialized = $state(false);

  $effect(() => {
    if (currentPurpose && !purposeInitialized) {
      outboundSid = currentPurpose.outboundSid;
      systemSid = currentPurpose.systemSid;
      purposeInitialized = true;
    }
  });

  const purposeChanged = $derived(
    purposeInitialized &&
      currentPurpose !== undefined &&
      (outboundSid !== currentPurpose.outboundSid ||
        systemSid !== currentPurpose.systemSid),
  );

  const setPurposeMutation = createMutation(() => ({
    mutationFn: async () =>
      telephonyAdmin.setPhonePurpose.mutate({
        outboundSid,
        systemSid,
      }),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_telephony_purpose_saved());
      announceToLiveRegion("polite", m.admin_telephony_purpose_saved());
      void queryClient.invalidateQueries({
        queryKey: adminKeys.telephonyPhonePurpose(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  function handleSavePurpose(): void {
    if (!purposeChanged || setPurposeMutation.isPending) return;
    setPurposeMutation.mutate();
  }

  // ── Roles sheet ──

  let rolesSheetOpen = $state(false);

  // ── Derived status ──

  const hasPhones = $derived((config?.phoneNumbers.length ?? 0) > 0);
  const providerName = $derived(config?.provider ?? "twilio");

  function getPhoneRole(phone: {
    number: string;
    sid?: string;
  }): "outbound" | "system" | null {
    const matchedSid = provisionedPhones.find(
      (p) => p.number === phone.number,
    )?.sid;
    if (matchedSid === undefined) return null;
    if (matchedSid === outboundSid) return "outbound";
    if (matchedSid === systemSid) return "system";
    return null;
  }

  // ── Mode change ──

  type TelephonyMode = "byot" | "managed" | "skip";

  let changeModeDialogOpen = $state(false);
  let changeModeSheetOpen = $state(false);
  let newMode = $state<TelephonyMode>("byot");
  let newAccountSid = $state("");
  let newAuthToken = $state("");

  function openChangeModeDialog(): void {
    changeModeDialogOpen = true;
  }

  function confirmChangeMode(): void {
    changeModeDialogOpen = false;
    newMode = isByot ? "managed" : "byot";
    newAccountSid = "";
    newAuthToken = "";
    changeModeSheetOpen = true;
  }

  function closeChangeModeSheet(): void {
    changeModeSheetOpen = false;
    newAccountSid = "";
    newAuthToken = "";
  }

  const changeModeMutation = createMutation(() => ({
    mutationFn: async (input: ChangeTelephonyModeInput) =>
      telephonyAdmin.changeMode.mutate(input),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_telephony_mode_changed());
      announceToLiveRegion("polite", m.admin_telephony_mode_changed());
      closeChangeModeSheet();
      void queryClient.invalidateQueries({
        queryKey: adminKeys.telephony(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const canSubmitModeChange = $derived(
    !changeModeMutation.isPending &&
      (newMode !== "byot" ||
        (newAccountSid.trim().length > 0 && newAuthToken.trim().length > 0)),
  );

  function handleModeChangeSubmit(): void {
    if (!canSubmitModeChange) return;

    if (newMode === "byot") {
      changeModeMutation.mutate({
        mode: "byot",
        provider: "twilio",
        accountId: newAccountSid.trim(),
        authToken: newAuthToken.trim(),
      });
    } else {
      changeModeMutation.mutate({ mode: "managed" });
    }
  }
</script>

<div class="telephony-section">
  {#if configQuery.isLoading}
    <!-- Loading skeleton -->
    <Card raised contentWrap={false} class="telephony-status-card">
      <div class="status-card-inner">
        <div class="status-row">
          <div class="status-icon pending">
            <Phone size={24} aria-hidden="true" />
          </div>
          <div class="status-text">
            <InlineSkeleton width="10rem" />
            <InlineSkeleton width="6rem" />
          </div>
        </div>
      </div>
    </Card>
  {:else if configQuery.isError}
    <QueryError
      error={configQuery.error}
      onretry={() => void configQuery.refetch()}
    />
  {:else if config === null}
    <!-- Not configured -->
    <Card raised contentWrap={false} class="telephony-status-card">
      <div class="status-card-inner">
        <div class="status-row">
          <div class="status-icon pending">
            <Phone size={24} aria-hidden="true" />
          </div>
          <div class="status-text">
            <p class="status-headline">{m.admin_telephony_not_configured()}</p>
          </div>
        </div>
        <SoftButton
          onclick={() => {
            newMode = "byot";
            changeModeSheetOpen = true;
          }}
          full
        >
          {m.admin_telephony_go_to_setup()}
        </SoftButton>
      </div>
    </Card>
  {:else if config}
    <!-- Zone 1: Status Card -->
    <Card raised contentWrap={false} class="telephony-status-card">
      <div class="status-card-inner">
        <div class="status-row">
          <div
            class="status-icon"
            class:ok={hasPhones}
            class:pending={!hasPhones}
          >
            {#if hasPhones}
              <CircleCheckBig size={24} aria-hidden="true" />
            {:else}
              <TriangleAlert size={24} aria-hidden="true" />
            {/if}
          </div>
          <div class="status-text">
            <p class="status-headline">
              {hasPhones
                ? m.admin_telephony_status_ready()
                : m.admin_telephony_status_pending()}
            </p>
            <p class="status-detail">
              {isByot
                ? m.admin_telephony_mode_byot({ provider: providerName })
                : m.admin_telephony_mode_managed()}
            </p>
            {#if isByot && config.maskedAccountId}
              <p class="status-detail">
                {m.admin_telephony_account_id()}: {config.maskedAccountId}
              </p>
            {/if}
          </div>
        </div>

        {#if isManaged}
          <div class="info-block info-block--muted">
            <Info size={18} aria-hidden="true" />
            <p>{m.admin_telephony_managed_note()}</p>
          </div>
        {/if}

        {#if isByot}
          <div class="status-actions">
            <SoftButton onclick={openCredSheet}>
              {m.admin_telephony_update_credentials()}
            </SoftButton>
            <SoftButton
              onclick={() => provisionMutation.mutate()}
              disabled={provisionMutation.isPending}
            >
              {#if provisionMutation.isPending}
                <Preloader class="w-5 h-5" />
              {:else}
                <RefreshCw size={18} aria-hidden="true" />
                {m.admin_telephony_refresh_numbers()}
              {/if}
            </SoftButton>
          </div>
        {/if}

        <SoftButton onclick={openChangeModeDialog} full>
          <ArrowRightLeft size={16} aria-hidden="true" />
          {m.admin_telephony_change_mode()}
        </SoftButton>
      </div>
    </Card>

    <!-- Zone 3: Phone Numbers Card -->
    <Card raised contentWrap={false} class="telephony-phones-card">
      <div class="phones-card-inner">
        <p class="card-section-label">
          {m.admin_telephony_connected_numbers()}
        </p>

        {#if config.phoneNumbers.length === 0}
          <div class="empty-phones">
            <Phone size={20} class="text-[--muted]" aria-hidden="true" />
            <p class="empty-text">{m.admin_telephony_no_phones_friendly()}</p>
            {#if isByot}
              <p class="empty-hint">
                {m.admin_telephony_no_phones_hint({ provider: providerName })}
              </p>
            {/if}
          </div>
        {:else}
          <List class="phones-list">
            {#each config.phoneNumbers as phone (phone.number)}
              {@const role = getPhoneRole(phone)}
              <ListItem title={phone.number} subtitle={phone.label ?? ""}>
                {#snippet media()}
                  <Phone size={16} class="text-[--muted]" aria-hidden="true" />
                {/snippet}
                {#snippet after()}
                  {#if role === "outbound"}
                    <span class="role-badge role-badge--outbound">
                      <PhoneOutgoing size={12} aria-hidden="true" />
                      {m.admin_telephony_outbound_calls()}
                    </span>
                  {:else if role === "system"}
                    <span class="role-badge role-badge--system">
                      <BotMessageSquare size={12} aria-hidden="true" />
                      {m.admin_telephony_system_messages()}
                    </span>
                  {/if}
                {/snippet}
              </ListItem>
            {/each}
          </List>

          {#if provisionedPhones.length > 0}
            <SoftButton onclick={() => (rolesSheetOpen = true)} full>
              <Settings2 size={18} aria-hidden="true" />
              {m.admin_telephony_edit_roles()}
            </SoftButton>
          {/if}
        {/if}

        <!-- Data retention disclosure -->
        <div class="section-divider"></div>
        <div class="info-block info-block--amber" role="note">
          <TriangleAlert
            size={18}
            class="info-icon--amber"
            aria-hidden="true"
          />
          <div>
            <p class="info-title">{m.admin_telephony_data_retention_title()}</p>
            <p class="info-body">{m.admin_telephony_data_retention_body()}</p>
          </div>
        </div>
      </div>
    </Card>
  {/if}
</div>

<!-- Zone 2: Credentials Sheet (BYOT only) -->
<ShellSheet
  opened={credSheetOpen}
  ondismiss={closeCredSheet}
  ariaLabel={m.admin_telephony_credentials_heading({ provider: providerName })}
  title={m.admin_telephony_credentials_heading({ provider: providerName })}
>
  {#snippet headerRight()}
    <SoftButton
      onclick={handleSaveCredentials}
      disabled={!accountIdInput ||
        !authTokenInput ||
        saveCredentialsMutation.isPending}
    >
      {#if saveCredentialsMutation.isPending}
        <Preloader class="w-4 h-4" />
      {:else}
        <Save size={16} aria-hidden="true" />
      {/if}
      {m.admin_telephony_save_credentials()}
    </SoftButton>
  {/snippet}
  <div class="sheet-content">
    <List nested class="cred-list">
      <ListInput
        label={m.admin_telephony_account_id()}
        type="text"
        placeholder={config?.maskedAccountId ?? ""}
        value={accountIdInput}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLInputElement) accountIdInput = target.value;
        }}
        info={m.admin_telephony_account_id_helper({ provider: providerName })}
      />
      <PasswordInput
        label={m.admin_telephony_auth_token()}
        placeholder={config?.maskedAuthToken ?? ""}
        bind:value={authTokenInput}
        info={m.admin_telephony_auth_token_helper({ provider: providerName })}
      />
    </List>

    <div class="info-block info-block--muted">
      <Info size={18} aria-hidden="true" />
      <p>{m.admin_telephony_grace_period()}</p>
    </div>
  </div>
</ShellSheet>

<!-- Roles Sheet -->
<ShellSheet
  opened={rolesSheetOpen}
  ondismiss={() => (rolesSheetOpen = false)}
  ariaLabel={m.admin_telephony_number_roles()}
  title={m.admin_telephony_number_roles()}
>
  {#snippet headerRight()}
    <SoftButton
      onclick={handleSavePurpose}
      disabled={!purposeChanged || setPurposeMutation.isPending}
    >
      {#if setPurposeMutation.isPending}
        <Preloader class="w-4 h-4" />
      {:else}
        <Save size={16} aria-hidden="true" />
      {/if}
      {m.admin_telephony_save_purpose()}
    </SoftButton>
  {/snippet}
  <div class="sheet-content">
    <p class="section-description">
      {m.admin_telephony_number_roles_description()}
    </p>

    <List nested class="purpose-list">
      <ListInput
        label={m.admin_telephony_outbound_calls()}
        type="select"
        dropdown
        value={outboundSid ?? ""}
        disabled={setPurposeMutation.isPending}
        info={m.admin_telephony_outbound_calls_helper(withTerms())}
        onChange={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLSelectElement) {
            outboundSid = target.value || null;
          }
        }}
      >
        <option value="">{m.admin_telephony_purpose_none()}</option>
        {#each provisionedPhones as phone (phone.sid)}
          <option value={phone.sid}>{phone.number}</option>
        {/each}
      </ListInput>

      <ListInput
        label={m.admin_telephony_system_messages()}
        type="select"
        dropdown
        value={systemSid ?? ""}
        disabled={setPurposeMutation.isPending}
        info={m.admin_telephony_system_messages_helper()}
        onChange={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLSelectElement) {
            systemSid = target.value || null;
          }
        }}
      >
        <option value="">{m.admin_telephony_purpose_none()}</option>
        {#each provisionedPhones as phone (phone.sid)}
          <option value={phone.sid}>{phone.number}</option>
        {/each}
      </ListInput>
    </List>
  </div>
</ShellSheet>

<!-- Change Mode Confirmation Dialog -->
<ShellDialog
  opened={changeModeDialogOpen}
  ondismiss={() => (changeModeDialogOpen = false)}
  title={m.admin_telephony_change_mode_confirm_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.admin_telephony_change_mode_confirm_body()}
    </p>
  {/snippet}
  {#snippet buttons()}
    <!-- care-y-ignore-next-line no-click-without-keyboard -- DialogButton renders a native <button> -->
    <DialogButton onclick={() => (changeModeDialogOpen = false)}>
      {m.common_cancel()}
    </DialogButton>
    <!-- care-y-ignore-next-line no-click-without-keyboard -- DialogButton renders a native <button> -->
    <DialogButton strong onclick={confirmChangeMode}>
      {m.admin_telephony_change_mode_confirm()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<!-- Change Mode Sheet -->
<ShellSheet
  opened={changeModeSheetOpen}
  ondismiss={closeChangeModeSheet}
  ariaLabel={m.admin_telephony_change_mode()}
  title={m.admin_telephony_change_mode()}
>
  {#snippet headerRight()}
    <SoftButton
      onclick={handleModeChangeSubmit}
      disabled={!canSubmitModeChange}
    >
      {#if changeModeMutation.isPending}
        <Preloader class="w-4 h-4" />
      {:else}
        <Save size={16} aria-hidden="true" />
      {/if}
      {m.admin_telephony_save_credentials()}
    </SoftButton>
  {/snippet}
  <div class="sheet-content">
    <TelephonyModePicker
      mode={newMode}
      onmodechange={(v: TelephonyMode) => (newMode = v)}
      accountSid={newAccountSid}
      onsidchange={(v: string) => (newAccountSid = v)}
      authToken={newAuthToken}
      ontokenchange={(v: string) => (newAuthToken = v)}
      showSkip={false}
      disabled={changeModeMutation.isPending}
    />
  </div>
</ShellSheet>

<style>
  .telephony-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) 0;
  }

  :global(.telephony-status-card),
  :global(.telephony-phones-card) {
    margin: 0 !important;
  }

  /* ── Status card ── */

  .status-card-inner {
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

  .status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-icon.ok {
    background: color-mix(in srgb, var(--color-green-500) 15%, transparent);
    color: var(--color-green-500);
  }

  .status-icon.pending {
    background: color-mix(in srgb, var(--color-amber-500) 15%, transparent);
    color: var(--color-amber-500);
  }

  .status-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .status-headline {
    font-weight: 600;
    font-size: var(--text-base);
  }

  .status-detail {
    font-size: var(--text-sm);
    color: var(--muted);
  }

  .status-actions {
    display: flex;
    gap: var(--space-sm);
    padding-top: var(--space-xs);
  }

  .status-actions :global(.soft-btn) {
    flex: 1;
  }

  /* ── Phones card ── */

  .phones-card-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--card-pad-y) var(--card-pad-x);
  }

  :global(.phones-list),
  :global(.purpose-list),
  :global(.cred-list) {
    margin: 0 !important;
  }

  .card-section-label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ── Role badges ── */

  .role-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-xs);
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 1rem;
    white-space: nowrap;
  }

  .role-badge--outbound {
    background: color-mix(in srgb, var(--color-blue-500) 12%, transparent);
    color: var(--color-blue-500);
  }

  .role-badge--system {
    background: color-mix(in srgb, var(--color-green-500) 12%, transparent);
    color: var(--color-green-500);
  }

  .section-description {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.4;
    margin: 0;
  }

  .section-divider {
    border-top: 1px solid var(--divider);
    margin: var(--space-sm) 0;
  }

  .empty-phones {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-lg) 0;
  }

  .empty-text {
    font-size: var(--text-base);
    color: var(--muted);
    text-align: center;
    margin: 0;
  }

  .empty-hint {
    font-size: var(--text-sm);
    color: var(--muted);
    text-align: center;
    opacity: 0.7;
    margin: 0;
  }

  /* ── Info blocks ── */

  .info-block {
    display: flex;
    gap: var(--space-sm);
    align-items: flex-start;
    padding: var(--space-md);
    border-radius: 0.5rem;
    font-size: var(--text-sm);
    line-height: 1.5;
  }

  .info-block--muted {
    background: color-mix(in srgb, var(--ink) 5%, transparent);
    color: var(--muted);
  }

  .info-block--amber {
    background: color-mix(in srgb, var(--color-amber-500) 10%, transparent);
    color: var(--ink);
  }

  .info-block p {
    margin: 0;
  }

  .info-title {
    font-weight: 600;
    color: var(--color-amber-500);
  }

  .info-body {
    color: var(--muted);
    margin-top: var(--space-xs);
  }

  :global(.info-icon--amber) {
    color: var(--color-amber-500);
    flex-shrink: 0;
    margin-top: 2px;
  }

  /* ── Credential sheet ── */

  .sheet-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg) var(--page-pad-x);
  }
</style>
