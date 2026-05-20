<script lang="ts">
  import { Card, List, ListInput, Preloader } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { Building2, Save } from "@lucide/svelte";
  import { E164_COUNTRY_CODE_OPTIONS } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { getOrgDecryptCache, getOrgKeyManager } from "$lib/crypto/context.js";
  import { base64ToUint8Array } from "$lib/utils/buffer-encoding.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  interface Props {
    externalSave?: boolean;
    onnamechange?: () => void;
  }

  let { externalSave = false, onnamechange }: Props = $props();

  export function isDirty(): boolean {
    return hasChanges;
  }

  export async function save(): Promise<void> {
    await handleSave();
  }

  export function hasOrgName(): boolean {
    return (decryptedName ?? "").trim().length > 0;
  }

  const orgRouter = trpc.org;
  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();

  const LANGUAGE_OPTIONS = [
    { tag: "en", label: m.onboarding_org_language_en() },
    { tag: "es", label: m.onboarding_org_language_es() },
  ] as const;

  const basicsQuery = createQuery(() => ({
    queryKey: adminKeys.orgBasics(),
    queryFn: async () => orgRouter.getOrgBasics.query(),
  }));

  function b64Field(value: string | null): Uint8Array | null {
    return value !== null && value !== "" ? base64ToUint8Array(value) : null;
  }

  const decryptedName = $derived(
    orgCache.decrypt(
      "org:name",
      b64Field(basicsQuery.data?.encryptedName ?? null),
    ),
  );

  const serverLanguage = $derived(basicsQuery.data?.defaultLanguage ?? "en");
  const serverCountry = $derived(basicsQuery.data?.countryCode ?? "");

  let sheetOpened = $state(false);
  let editName = $state("");
  let editLanguage = $state("en");
  let editCountry = $state("");

  function openSheet(): void {
    editName = decryptedName ?? "";
    editLanguage = serverLanguage;
    editCountry = serverCountry;
    sheetOpened = true;
  }

  function closeSheet(): void {
    sheetOpened = false;
  }

  const nameChanged = $derived(editName !== (decryptedName ?? ""));
  const languageChanged = $derived(editLanguage !== serverLanguage);
  const countryChanged = $derived(editCountry !== serverCountry);
  const hasChanges = $derived(nameChanged || languageChanged || countryChanged);

  const saveMutation = createMutation(() => ({
    mutationFn: async (input: {
      encryptedOrgName: string;
      defaultLanguage: string;
      countryCode: string;
    }) => orgRouter.updateOrgBasics.mutate(input),
    onSuccess: () => {
      haptic();
      orgCache.delete("org:name");
      toastStore.show(m.admin_org_basics_saved());
      announceToLiveRegion("polite", m.admin_org_basics_saved());
      closeSheet();
      void queryClient.invalidateQueries({ queryKey: adminKeys.orgBasics() });
      if (nameChanged) {
        orgCache.delete("branding:name");
        void queryClient.invalidateQueries({ queryKey: adminKeys.branding() });
        onnamechange?.();
      }
    },
    onError: () => {
      toastStore.show(m.admin_org_basics_error(), 3000);
    },
  }));

  async function handleSave(): Promise<void> {
    if (!hasChanges) return;

    const encryptedOrgName = await orgKeyManager.encryptText(editName.trim());

    saveMutation.mutate({
      encryptedOrgName,
      defaultLanguage: editLanguage,
      countryCode: editCountry,
    });
  }

  function countryLabel(code: string): string {
    const opt = E164_COUNTRY_CODE_OPTIONS.find((o) => o.code === code);
    return opt ? `${opt.name} (${opt.code})` : code;
  }

  function languageLabel(tag: string): string {
    const opt = LANGUAGE_OPTIONS.find((o) => o.tag === tag);
    return opt?.label ?? tag;
  }
</script>

<div class="org-basics-section">
  {#if basicsQuery.isLoading}
    <Card raised contentWrap={false} class="org-basics-card">
      <div class="org-basics-inner">
        <p class="section-desc">{m.admin_org_basics_description()}</p>
        <div class="field-row">
          <span class="field-label">{m.onboarding_org_name_label()}</span>
          <DecryptPlaceholder length={18} />
        </div>
        <div class="field-row">
          <span class="field-label">{m.onboarding_org_language_label()}</span>
          <DecryptPlaceholder length={8} />
        </div>
        <div class="field-row">
          <span class="field-label">{m.onboarding_org_country_label()}</span>
          <DecryptPlaceholder length={12} />
        </div>
      </div>
    </Card>
  {:else if basicsQuery.isError}
    <QueryError
      error={basicsQuery.error}
      onretry={() => void basicsQuery.refetch()}
    />
  {:else}
    <Card raised contentWrap={false} class="org-basics-card">
      <div
        class="org-basics-inner"
        role="region"
        aria-label={m.admin_tab_org_basics()}
      >
        <p class="section-desc">{m.admin_org_basics_description()}</p>

        <div class="field-row">
          <span class="field-label">{m.onboarding_org_name_label()}</span>
          {#if basicsQuery.data?.encryptedName}
            <DecryptPlaceholder content={decryptedName}>
              <span class="field-value">{decryptedName}</span>
            </DecryptPlaceholder>
          {:else}
            <span class="text-[--muted] text-sm">-</span>
          {/if}
        </div>

        <div class="field-row">
          <span class="field-label">{m.onboarding_org_language_label()}</span>
          <span class="field-value">{languageLabel(serverLanguage)}</span>
        </div>

        <div class="field-row">
          <span class="field-label">{m.onboarding_org_country_label()}</span>
          <span class="field-value">
            {serverCountry ? countryLabel(serverCountry) : "-"}
          </span>
        </div>

        <div class="edit-action">
          <SoftButton onclick={openSheet} full>
            <Building2 size={18} aria-hidden="true" />
            {m.admin_org_basics_edit_button()}
          </SoftButton>
        </div>
      </div>
    </Card>
  {/if}
</div>

<ShellSheet
  opened={sheetOpened}
  ondismiss={closeSheet}
  title={m.admin_tab_org_basics()}
>
  {#snippet headerRight()}
    <SoftButton
      disabled={!hasChanges || saveMutation.isPending}
      onclick={() => void handleSave()}
    >
      {#if saveMutation.isPending}
        <Preloader class="w-4 h-4" />
      {:else}
        <Save size={16} aria-hidden="true" />
      {/if}
      {m.admin_org_basics_save()}
    </SoftButton>
  {/snippet}

  <div class="sheet-inner">
    <List strong inset>
      <ListInput
        outline
        label={m.onboarding_org_name_label()}
        type="text"
        placeholder={m.onboarding_org_name_placeholder()}
        value={editName}
        onInput={(e: Event) => {
          if (e.target instanceof HTMLInputElement) editName = e.target.value;
        }}
        disabled={saveMutation.isPending}
      />

      <ListInput
        outline
        dropdown
        label={m.onboarding_org_language_label()}
        type="select"
        value={editLanguage}
        onChange={(e: Event) => {
          if (e.target instanceof HTMLSelectElement)
            editLanguage = e.target.value;
        }}
        disabled={saveMutation.isPending}
      >
        {#each LANGUAGE_OPTIONS as opt (opt.tag)}
          <option value={opt.tag}>{opt.label}</option>
        {/each}
      </ListInput>

      <ListInput
        outline
        dropdown
        label={m.onboarding_org_country_label()}
        type="select"
        value={editCountry}
        onChange={(e: Event) => {
          if (e.target instanceof HTMLSelectElement)
            editCountry = e.target.value;
        }}
        disabled={saveMutation.isPending}
      >
        <option value="" disabled
          >{m.onboarding_org_country_placeholder()}</option
        >
        {#each E164_COUNTRY_CODE_OPTIONS as opt (opt.code)}
          <option value={opt.code}>{opt.name} ({opt.code})</option>
        {/each}
      </ListInput>
    </List>
  </div>
</ShellSheet>

<style>
  .org-basics-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) 0;
  }

  :global(.org-basics-card) {
    margin: 0 !important;
  }

  .org-basics-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--card-pad-y) var(--card-pad-x);
  }

  .section-desc {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
  }

  .field-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    padding: 0.25rem 0;
  }

  .field-label {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
  }

  .field-value {
    font-size: var(--text-sm);
    color: var(--ink);
  }

  .edit-action {
    padding-top: var(--space-sm);
  }

  .sheet-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
  }
</style>
