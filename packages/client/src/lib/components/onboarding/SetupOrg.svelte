<!--
  SetupOrg: wizard step 2 (org basics).

  Collects org name, default language, and country calling code.
  Org name is encrypted via orgKeyManager before sending to the server.
  Language and country code are stored in plaintext (operational values
  the server needs for telephony routing and i18n selection).
-->
<script lang="ts">
  import { List, ListInput, Button, Block, Preloader } from "konsta/svelte";
  import { createMutation } from "@tanstack/svelte-query";
  import { E164_COUNTRY_CODE_OPTIONS } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { uint8ArrayToBase64 } from "$lib/utils/buffer-encoding.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { RouterNotAvailableError } from "$lib/errors.js";

  interface Props {
    oncomplete: (data: {
      orgName: string;
      language: string;
      countryCode: string;
    }) => void;
  }

  let { oncomplete }: Props = $props();

  if (!trpc.onboarding) {
    throw new RouterNotAvailableError("onboarding");
  }
  const onboarding: NonNullable<typeof trpc.onboarding> = trpc.onboarding;

  const orgKeyManager = getOrgKeyManager();
  const encoder = new TextEncoder();

  const LANGUAGE_OPTIONS = [
    { tag: "en", label: m.onboarding_org_language_en() },
    { tag: "es", label: m.onboarding_org_language_es() },
  ] as const;

  let orgName = $state("");
  let language = $state("en");
  let countryCode = $state("");
  let error = $state("");

  const nameValid = $derived(orgName.trim().length > 0);
  const languageValid = $derived(language.length > 0);
  const countryValid = $derived(countryCode.length > 0);

  const saveMut = createMutation(() => ({
    mutationFn: async (input: {
      encryptedOrgName: string;
      defaultLanguage: string;
      countryCode: string;
    }) => onboarding.updateOrgBasics.mutate(input),
    onSuccess: () => {
      haptic();
      toastStore.show(m.onboarding_org_saved());
      announceToLiveRegion("polite", m.onboarding_org_saved());
      oncomplete({
        orgName: orgName.trim(),
        language,
        countryCode,
      });
    },
    onError: () => {
      error = m.onboarding_org_error();
      toastStore.show(m.onboarding_org_error(), 3000);
      announceToLiveRegion("assertive", m.onboarding_org_error());
    },
  }));

  const orgKeyLoaded = $derived(orgKeyManager.isLoaded);
  const canSubmit = $derived(
    orgKeyLoaded &&
      nameValid &&
      languageValid &&
      countryValid &&
      !saveMut.isPending,
  );

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    error = "";

    if (!nameValid) {
      error = m.onboarding_org_error_name_required();
      return;
    }
    if (!languageValid) {
      error = m.onboarding_org_error_language_required();
      return;
    }
    if (!countryValid) {
      error = m.onboarding_org_error_country_required();
      return;
    }

    const plainBytes = encoder.encode(orgName.trim());
    const cipherBytes = await orgKeyManager.encrypt(plainBytes);
    const encryptedOrgName = uint8ArrayToBase64(cipherBytes);

    saveMut.mutate({
      encryptedOrgName,
      defaultLanguage: language,
      countryCode,
    });
  }
</script>

<Block>
  <h2 class="step-heading">{m.onboarding_org_heading()}</h2>
  <p class="step-subtext">{m.onboarding_org_subtext()}</p>
</Block>

<form onsubmit={handleSubmit}>
  {#if error}
    <Block>
      <p class="error-text" role="alert">{error}</p>
    </Block>
  {/if}

  <List strong inset>
    <ListInput
      outline
      label={m.onboarding_org_name_label()}
      type="text"
      placeholder={m.onboarding_org_name_placeholder()}
      value={orgName}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) orgName = e.target.value;
      }}
      disabled={saveMut.isPending}
    />

    <ListInput
      outline
      dropdown
      label={m.onboarding_org_language_label()}
      type="select"
      value={language}
      onChange={(e: Event) => {
        if (e.target instanceof HTMLSelectElement) language = e.target.value;
      }}
      disabled={saveMut.isPending}
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
      value={countryCode}
      onChange={(e: Event) => {
        if (e.target instanceof HTMLSelectElement) countryCode = e.target.value;
      }}
      disabled={saveMut.isPending}
    >
      <option value="" disabled>{m.onboarding_org_country_placeholder()}</option
      >
      {#each E164_COUNTRY_CODE_OPTIONS as opt (opt.code)}
        <option value={opt.code}>{opt.name} ({opt.code})</option>
      {/each}
    </ListInput>
  </List>

  <Block>
    <Button large type="submit" disabled={!canSubmit}>
      {#if saveMut.isPending}
        <Preloader class="w-5 h-5" />
      {:else}
        {m.onboarding_org_submit()}
      {/if}
    </Button>
  </Block>
</form>

<style>
  .step-heading {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--ink, #1f2937);
    margin: 0 0 0.25rem;
  }

  .step-subtext {
    font-size: 0.875rem;
    color: var(--muted, #6b7280);
    margin: 0;
  }

  .error-text {
    font-size: 0.875rem;
    color: var(--error, #dc2626);
  }
</style>
