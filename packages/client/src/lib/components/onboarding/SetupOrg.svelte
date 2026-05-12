<!--
  SetupOrg: wizard step 2 (org basics).

  Collects org name, default language, and country calling code.
  Org name is encrypted via orgKeyManager before sending to the server.
  Language and country code are stored in plaintext (operational values
  the server needs for telephony routing and i18n selection).
-->
<script lang="ts">
  import {
    List,
    ListInput,
    Button,
    Block,
    BlockTitle,
    Preloader,
  } from "konsta/svelte";
  import { createMutation } from "@tanstack/svelte-query";
  import {
    E164_COUNTRY_CODE_OPTIONS,
    TERMINOLOGY_DEFAULTS_EN,
    type TerminologyLabels,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { uint8ArrayToBase64 } from "$lib/utils/buffer-encoding.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { isOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";

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

  let termVolunteer = $state(TERMINOLOGY_DEFAULTS_EN.volunteer);
  let termVolunteers = $state(TERMINOLOGY_DEFAULTS_EN.volunteers);
  let termClient = $state(TERMINOLOGY_DEFAULTS_EN.client);
  let termClients = $state(TERMINOLOGY_DEFAULTS_EN.clients);
  let termTicket = $state(TERMINOLOGY_DEFAULTS_EN.ticket);
  let termTickets = $state(TERMINOLOGY_DEFAULTS_EN.tickets);
  let termManager = $state(TERMINOLOGY_DEFAULTS_EN.manager);
  let termManagers = $state(TERMINOLOGY_DEFAULTS_EN.managers);
  let termQueue = $state(TERMINOLOGY_DEFAULTS_EN.queue);
  let termQueues = $state(TERMINOLOGY_DEFAULTS_EN.queues);
  let termKnowledgeBase = $state(TERMINOLOGY_DEFAULTS_EN.knowledgeBase);

  const hasCustomTerminology = $derived(
    termVolunteer !== TERMINOLOGY_DEFAULTS_EN.volunteer ||
      termClient !== TERMINOLOGY_DEFAULTS_EN.client ||
      termTicket !== TERMINOLOGY_DEFAULTS_EN.ticket ||
      termManager !== TERMINOLOGY_DEFAULTS_EN.manager ||
      termQueue !== TERMINOLOGY_DEFAULTS_EN.queue ||
      termKnowledgeBase !== TERMINOLOGY_DEFAULTS_EN.knowledgeBase,
  );

  const nameValid = $derived(orgName.trim().length > 0);
  const languageValid = $derived(language.length > 0);
  const countryValid = $derived(countryCode.length > 0);

  const saveMut = createMutation(() => ({
    mutationFn: async (input: {
      encryptedOrgName: string;
      defaultLanguage: string;
      countryCode: string;
      encryptedTerminology?: string;
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

  const orgKeyLoaded = $derived(isOrgKeyReady());
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

    let encryptedTerminology: string | undefined;
    if (hasCustomTerminology) {
      const labels: TerminologyLabels = {
        volunteer: termVolunteer.trim(),
        volunteers: termVolunteers.trim(),
        client: termClient.trim(),
        clients: termClients.trim(),
        ticket: termTicket.trim(),
        tickets: termTickets.trim(),
        manager: termManager.trim(),
        managers: termManagers.trim(),
        queue: termQueue.trim(),
        queues: termQueues.trim(),
        knowledgeBase: termKnowledgeBase.trim(),
      };
      const config = { [language]: labels };
      const termBytes = encoder.encode(JSON.stringify(config));
      const termCipher = await orgKeyManager.encrypt(termBytes);
      encryptedTerminology = uint8ArrayToBase64(termCipher);
    }

    saveMut.mutate({
      encryptedOrgName,
      defaultLanguage: language,
      countryCode,
      encryptedTerminology,
    });
  }
</script>

<BlockTitle medium>{m.onboarding_org_heading()}</BlockTitle>
<Block>
  <p class="step-desc">{m.onboarding_org_subtext()}</p>
</Block>

<form onsubmit={handleSubmit}>
  {#if error}
    <Block>
      <p class="step-error" role="alert">{error}</p>
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

  <BlockTitle>{m.onboarding_org_terminology_heading()}</BlockTitle>
  <Block>
    <p class="step-desc">{m.onboarding_org_terminology_subtext()}</p>
  </Block>

  <List strong inset>
    <ListInput
      outline
      label={m.onboarding_org_term_volunteer_label()}
      type="text"
      value={termVolunteer}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement)
          termVolunteer = e.target.value;
      }}
      disabled={saveMut.isPending}
    />
    <ListInput
      outline
      label={m.onboarding_org_term_volunteers_label()}
      type="text"
      value={termVolunteers}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement)
          termVolunteers = e.target.value;
      }}
      disabled={saveMut.isPending}
    />
    <ListInput
      outline
      label={m.onboarding_org_term_client_label()}
      type="text"
      value={termClient}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) termClient = e.target.value;
      }}
      disabled={saveMut.isPending}
    />
    <ListInput
      outline
      label={m.onboarding_org_term_clients_label()}
      type="text"
      value={termClients}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) termClients = e.target.value;
      }}
      disabled={saveMut.isPending}
    />
    <ListInput
      outline
      label={m.onboarding_org_term_ticket_label()}
      type="text"
      value={termTicket}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) termTicket = e.target.value;
      }}
      disabled={saveMut.isPending}
    />
    <ListInput
      outline
      label={m.onboarding_org_term_tickets_label()}
      type="text"
      value={termTickets}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) termTickets = e.target.value;
      }}
      disabled={saveMut.isPending}
    />
    <ListInput
      outline
      label={m.onboarding_org_term_manager_label()}
      type="text"
      value={termManager}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) termManager = e.target.value;
      }}
      disabled={saveMut.isPending}
    />
    <ListInput
      outline
      label={m.onboarding_org_term_managers_label()}
      type="text"
      value={termManagers}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) termManagers = e.target.value;
      }}
      disabled={saveMut.isPending}
    />
    <ListInput
      outline
      label={m.onboarding_org_term_queue_label()}
      type="text"
      value={termQueue}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) termQueue = e.target.value;
      }}
      disabled={saveMut.isPending}
    />
    <ListInput
      outline
      label={m.onboarding_org_term_queues_label()}
      type="text"
      value={termQueues}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) termQueues = e.target.value;
      }}
      disabled={saveMut.isPending}
    />
    <ListInput
      outline
      label={m.onboarding_org_term_kb_label()}
      type="text"
      value={termKnowledgeBase}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement)
          termKnowledgeBase = e.target.value;
      }}
      disabled={saveMut.isPending}
    />
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
