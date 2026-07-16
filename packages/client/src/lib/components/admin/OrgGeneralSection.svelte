<script lang="ts">
  import { Card, List, ListInput, Preloader } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { Building2, Save } from "@lucide/svelte";
  import { dev } from "$app/environment";
  import { E164_COUNTRY_CODE_OPTIONS } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { getOrgDecryptCache, getOrgKeyManager } from "$lib/crypto/context.js";
  import { base64ToUint8Array } from "$lib/utils/buffer-encoding.js";
  import { buildClientBrandingBlob } from "$lib/branding/encrypt.js";
  import { requireRouter } from "$lib/errors.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  interface Props {
    externalSave?: boolean;
    onnamechange?: () => void;
  }

  let { externalSave: _externalSave = false, onnamechange }: Props = $props();

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

  const generalQuery = createQuery(() => ({
    queryKey: adminKeys.orgGeneral(),
    queryFn: async () => orgRouter.getOrgGeneral.query(),
  }));

  function b64Field(value: string | null): Uint8Array | null {
    return value !== null && value !== "" ? base64ToUint8Array(value) : null;
  }

  const decryptedName = $derived(
    orgCache.decrypt(
      "org:name",
      b64Field(generalQuery.data?.encryptedName ?? null),
    ),
  );

  const serverLanguage = $derived(generalQuery.data?.defaultLanguage ?? "en");
  const serverCountry = $derived(generalQuery.data?.countryCode ?? "");

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

  const brandingRouter = trpc.branding
    ? requireRouter(trpc.branding, "branding")
    : null;

  // The public-page blob is rebuilt client-side by design: it is derived
  // from org-key material the server never holds, so the server cannot
  // rebuild it after a rename. A failure leaves the public login page
  // showing the old name until branding is saved again.
  async function rebuildClientBlob(newName: string): Promise<void> {
    if (brandingRouter === null) return;
    const branding = await brandingRouter.getBranding.query();

    function b64(v: string | null): Uint8Array | null {
      return v !== null && v !== "" ? base64ToUint8Array(v) : null;
    }

    // Trigger cache population, then wait for all pending decrypts.
    orgCache.decrypt("branding:color", b64(branding.encryptedPrimaryColor));
    orgCache.decrypt("branding:accent", b64(branding.encryptedAccentColor));
    orgCache.decrypt(
      "branding:text",
      b64(branding.encryptedClientText ?? null),
    );
    await orgCache.whenSettled();

    // Re-read after settlement.
    const color =
      orgCache.decrypt("branding:color", b64(branding.encryptedPrimaryColor)) ??
      "#636366";
    const accent =
      orgCache.decrypt("branding:accent", b64(branding.encryptedAccentColor)) ??
      "";
    const text =
      orgCache.decrypt(
        "branding:text",
        b64(branding.encryptedClientText ?? null),
      ) ?? "";

    const clientBlob = buildClientBrandingBlob(
      {
        name: newName,
        primaryColor: color,
        accentColor: accent,
        clientText: text,
      },
      orgKeyManager,
    );

    const encryptedValue = await orgKeyManager.encryptText(newName);
    await brandingRouter.saveBrandingField.mutate({
      field: "name",
      encryptedValue,
      clientEncryptedBranding: clientBlob,
    });
  }

  const saveMutation = createMutation(() => ({
    mutationFn: async (input: {
      encryptedOrgName: string;
      defaultLanguage: string;
      countryCode: string;
    }) => orgRouter.updateOrgGeneral.mutate(input),
    onSuccess: () => {
      haptic();
      orgCache.delete("org:name");
      toastStore.show(m.admin_org_general_saved());
      announceToLiveRegion("polite", m.admin_org_general_saved());
      closeSheet();
      void queryClient.invalidateQueries({ queryKey: adminKeys.orgGeneral() });
      if (nameChanged) {
        orgCache.delete("branding:name");
        void queryClient.invalidateQueries({ queryKey: adminKeys.branding() });
        rebuildClientBlob(editName.trim()).catch((err: unknown) => {
          // Longer than the success toast: this failure needs reading time.
          toastStore.show(m.admin_org_general_client_blob_error(), 6000);
          announceToLiveRegion(
            "polite",
            m.admin_org_general_client_blob_error(),
          );
          if (dev) console.error(err);
        });
        onnamechange?.();
      }
    },
    onError: () => {
      toastStore.show(m.admin_org_general_error(), 3000);
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

<div class="org-general-section">
  {#if generalQuery.isLoading}
    <Card raised contentWrap={false} class="org-general-card">
      <div class="org-general-inner">
        <p class="section-desc">{m.admin_org_general_description()}</p>
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
  {:else if generalQuery.isError}
    <QueryError
      error={generalQuery.error}
      onretry={() => void generalQuery.refetch()}
    />
  {:else}
    <Card raised contentWrap={false} class="org-general-card">
      <div
        class="org-general-inner"
        role="region"
        aria-label={m.admin_tab_org_general()}
      >
        <p class="section-desc">{m.admin_org_general_description()}</p>

        <div class="field-row">
          <span class="field-label">{m.onboarding_org_name_label()}</span>
          {#if generalQuery.data?.encryptedName}
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
            {m.admin_org_general_edit_button()}
          </SoftButton>
        </div>
      </div>
    </Card>
  {/if}
</div>

<ShellSheet
  opened={sheetOpened}
  ondismiss={closeSheet}
  title={m.admin_tab_org_general()}
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
      {m.admin_org_general_save()}
    </SoftButton>
  {/snippet}

  <div class="sheet-inner">
    <List strong inset>
      <ListInput
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
  .org-general-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) 0;
  }

  :global(.org-general-card) {
    margin: 0 !important;
  }

  .org-general-inner {
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

  /* .field-label comes from the shared form primitives (shared.css) */

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
