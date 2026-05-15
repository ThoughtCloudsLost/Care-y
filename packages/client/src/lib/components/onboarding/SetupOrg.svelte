<!--
  SetupOrg: wizard step 2 (org basics).

  Collects org name, default language, and country calling code.
  Org name is encrypted via orgKeyManager before sending to the server.
  Language and country code are stored in plaintext (operational values
  the server needs for telephony routing and i18n selection).
-->
<script lang="ts">
  import {
    Card,
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
    TERMINOLOGY_DEFAULTS,
    TERMINOLOGY_DEFAULTS_EN,
    TERMINOLOGY_SUGGESTIONS,
    type TerminologyLabels,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";

  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { requireRouter } from "$lib/errors.js";
  import { isOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";

  interface Props {
    oncomplete: (data: {
      orgName: string;
      language: string;
      countryCode: string;
      terminology: TerminologyLabels;
    }) => void;
  }

  let { oncomplete }: Props = $props();

  const onboarding = requireRouter(trpc.onboarding, "onboarding");

  const orgKeyManager = getOrgKeyManager();

  const LANGUAGE_OPTIONS = [
    { tag: "en", label: m.onboarding_org_language_en() },
    { tag: "es", label: m.onboarding_org_language_es() },
  ] as const;

  let orgName = $state("");
  let language = $state("en");
  let countryCode = $state("");
  let error = $state("");

  function autoPlural(singular: string, lang: string): string {
    const s = singular.trim();
    if (s === "") return "";
    if (lang === "es") {
      if (/[aeiouáéíóú]$/i.test(s)) return s + "s";
      return s + "es";
    }
    if (/(?:s|sh|ch|x|z)$/i.test(s)) return s + "es";
    if (/[^aeiou]y$/i.test(s)) return s.slice(0, -1) + "ies";
    return s + "s";
  }

  function lowercase(s: string): string {
    return s.trim().toLowerCase();
  }

  const activeDefaults = $derived(
    // eslint-disable-next-line security/detect-object-injection -- language is a typed LangCode from a controlled select
    TERMINOLOGY_DEFAULTS[language] ?? TERMINOLOGY_DEFAULTS_EN,
  );

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

  let pluralTouchedVolunteers = $state(false);
  let pluralTouchedClients = $state(false);
  let pluralTouchedTickets = $state(false);
  let pluralTouchedManagers = $state(false);
  let pluralTouchedQueues = $state(false);

  $effect(() => {
    if (!pluralTouchedVolunteers)
      termVolunteers = autoPlural(termVolunteer, language);
  });
  $effect(() => {
    if (!pluralTouchedClients) termClients = autoPlural(termClient, language);
  });
  $effect(() => {
    if (!pluralTouchedTickets) termTickets = autoPlural(termTicket, language);
  });
  $effect(() => {
    if (!pluralTouchedManagers)
      termManagers = autoPlural(termManager, language);
  });
  $effect(() => {
    if (!pluralTouchedQueues) termQueues = autoPlural(termQueue, language);
  });

  let prevLang = language;
  $effect(() => {
    if (language !== prevLang) {
      const defaults =
        // eslint-disable-next-line security/detect-object-injection -- language is a typed LangCode from a controlled select
        TERMINOLOGY_DEFAULTS[language] ?? TERMINOLOGY_DEFAULTS_EN;
      termVolunteer = defaults.volunteer;
      termClient = defaults.client;
      termTicket = defaults.ticket;
      termManager = defaults.manager;
      termQueue = defaults.queue;
      termKnowledgeBase = defaults.knowledgeBase;
      pluralTouchedVolunteers = false;
      pluralTouchedClients = false;
      pluralTouchedTickets = false;
      pluralTouchedManagers = false;
      pluralTouchedQueues = false;
      prevLang = language;
    }
  });

  const hasCustomTerminology = $derived(
    termVolunteer !== activeDefaults.volunteer ||
      termClient !== activeDefaults.client ||
      termTicket !== activeDefaults.ticket ||
      termManager !== activeDefaults.manager ||
      termQueue !== activeDefaults.queue ||
      termKnowledgeBase !== activeDefaults.knowledgeBase,
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
        terminology: {
          volunteer: lowercase(termVolunteer) || activeDefaults.volunteer,
          volunteers: lowercase(termVolunteers) || activeDefaults.volunteers,
          client: lowercase(termClient) || activeDefaults.client,
          clients: lowercase(termClients) || activeDefaults.clients,
          ticket: lowercase(termTicket) || activeDefaults.ticket,
          tickets: lowercase(termTickets) || activeDefaults.tickets,
          manager: lowercase(termManager) || activeDefaults.manager,
          managers: lowercase(termManagers) || activeDefaults.managers,
          queue: lowercase(termQueue) || activeDefaults.queue,
          queues: lowercase(termQueues) || activeDefaults.queues,
          knowledgeBase:
            lowercase(termKnowledgeBase) || activeDefaults.knowledgeBase,
        },
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

    const encryptedOrgName = await orgKeyManager.encryptText(orgName.trim());

    let encryptedTerminology: string | undefined;
    if (hasCustomTerminology) {
      const labels: TerminologyLabels = {
        volunteer: lowercase(termVolunteer),
        volunteers: lowercase(termVolunteers),
        client: lowercase(termClient),
        clients: lowercase(termClients),
        ticket: lowercase(termTicket),
        tickets: lowercase(termTickets),
        manager: lowercase(termManager),
        managers: lowercase(termManagers),
        queue: lowercase(termQueue),
        queues: lowercase(termQueues),
        knowledgeBase: lowercase(termKnowledgeBase),
      };
      const config = { [language]: labels };
      encryptedTerminology = await orgKeyManager.encryptText(
        JSON.stringify(config),
      );
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
    <p class="step-desc admin-note">
      {m.onboarding_org_terminology_admin_note()}
    </p>
  </Block>

  <Card raised contentWrap={false} class="term-card">
    <div class="term-card-inner">
      <h4 class="term-group-title">{m.admin_terminology_group_volunteer()}</h4>
      <p class="term-desc">{m.admin_terminology_desc_volunteer()}</p>
      <List nested>
        <ListInput
          outline
          label={m.admin_terminology_singular()}
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
          label={m.admin_terminology_plural()}
          type="text"
          value={termVolunteers}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement) {
              termVolunteers = e.target.value;
              pluralTouchedVolunteers = true;
            }
          }}
          disabled={saveMut.isPending}
        />
      </List>
      <p class="term-suggestions">
        {m.admin_terminology_suggestions_label()}: {TERMINOLOGY_SUGGESTIONS.volunteer?.join(
          ", ",
        )}
      </p>
    </div>
  </Card>

  <Card raised contentWrap={false} class="term-card">
    <div class="term-card-inner">
      <h4 class="term-group-title">{m.admin_terminology_group_manager()}</h4>
      <p class="term-desc">{m.admin_terminology_desc_manager()}</p>
      <List nested>
        <ListInput
          outline
          label={m.admin_terminology_singular()}
          type="text"
          value={termManager}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement)
              termManager = e.target.value;
          }}
          disabled={saveMut.isPending}
        />
        <ListInput
          outline
          label={m.admin_terminology_plural()}
          type="text"
          value={termManagers}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement) {
              termManagers = e.target.value;
              pluralTouchedManagers = true;
            }
          }}
          disabled={saveMut.isPending}
        />
      </List>
      <p class="term-suggestions">
        {m.admin_terminology_suggestions_label()}: {TERMINOLOGY_SUGGESTIONS.manager?.join(
          ", ",
        )}
      </p>
    </div>
  </Card>

  <Card raised contentWrap={false} class="term-card">
    <div class="term-card-inner">
      <h4 class="term-group-title">{m.admin_terminology_group_client()}</h4>
      <p class="term-desc">{m.admin_terminology_desc_client()}</p>
      <List nested>
        <ListInput
          outline
          label={m.admin_terminology_singular()}
          type="text"
          value={termClient}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement)
              termClient = e.target.value;
          }}
          disabled={saveMut.isPending}
        />
        <ListInput
          outline
          label={m.admin_terminology_plural()}
          type="text"
          value={termClients}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement) {
              termClients = e.target.value;
              pluralTouchedClients = true;
            }
          }}
          disabled={saveMut.isPending}
        />
      </List>
      <p class="term-suggestions">
        {m.admin_terminology_suggestions_label()}: {TERMINOLOGY_SUGGESTIONS.client?.join(
          ", ",
        )}
      </p>
    </div>
  </Card>

  <Card raised contentWrap={false} class="term-card">
    <div class="term-card-inner">
      <h4 class="term-group-title">{m.admin_terminology_group_ticket()}</h4>
      <p class="term-desc">{m.admin_terminology_desc_ticket()}</p>
      <List nested>
        <ListInput
          outline
          label={m.admin_terminology_singular()}
          type="text"
          value={termTicket}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement)
              termTicket = e.target.value;
          }}
          disabled={saveMut.isPending}
        />
        <ListInput
          outline
          label={m.admin_terminology_plural()}
          type="text"
          value={termTickets}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement) {
              termTickets = e.target.value;
              pluralTouchedTickets = true;
            }
          }}
          disabled={saveMut.isPending}
        />
      </List>
      <p class="term-suggestions">
        {m.admin_terminology_suggestions_label()}: {TERMINOLOGY_SUGGESTIONS.ticket?.join(
          ", ",
        )}
      </p>
    </div>
  </Card>

  <Card raised contentWrap={false} class="term-card">
    <div class="term-card-inner">
      <h4 class="term-group-title">{m.admin_terminology_group_queue()}</h4>
      <p class="term-desc">{m.admin_terminology_desc_queue()}</p>
      <List nested>
        <ListInput
          outline
          label={m.admin_terminology_singular()}
          type="text"
          value={termQueue}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement)
              termQueue = e.target.value;
          }}
          disabled={saveMut.isPending}
        />
        <ListInput
          outline
          label={m.admin_terminology_plural()}
          type="text"
          value={termQueues}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement) {
              termQueues = e.target.value;
              pluralTouchedQueues = true;
            }
          }}
          disabled={saveMut.isPending}
        />
      </List>
      <p class="term-suggestions">
        {m.admin_terminology_suggestions_label()}: {TERMINOLOGY_SUGGESTIONS.queue?.join(
          ", ",
        )}
      </p>
    </div>
  </Card>

  <Card raised contentWrap={false} class="term-card">
    <div class="term-card-inner">
      <h4 class="term-group-title">{m.admin_terminology_group_kb()}</h4>
      <p class="term-desc">{m.admin_terminology_desc_kb()}</p>
      <List nested>
        <ListInput
          outline
          label={m.admin_terminology_singular()}
          type="text"
          value={termKnowledgeBase}
          onInput={(e: Event) => {
            if (e.target instanceof HTMLInputElement)
              termKnowledgeBase = e.target.value;
          }}
          disabled={saveMut.isPending}
        />
      </List>
      <p class="term-suggestions">
        {m.admin_terminology_suggestions_label()}: {TERMINOLOGY_SUGGESTIONS.knowledgeBase?.join(
          ", ",
        )}
      </p>
    </div>
  </Card>

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
  .admin-note {
    margin-top: var(--space-sm);
    font-size: var(--text-sm);
    font-style: italic;
  }

  :global(.term-card) {
    margin: var(--space-md) var(--page-pad-x) !important;
  }

  .term-card-inner {
    padding: var(--card-pad-y) var(--card-pad-x);
    display: flex;
    flex-direction: column;
  }

  .term-group-title {
    font-size: var(--text-sm);
    font-weight: 600;
    margin: 0 0 2px;
  }

  .term-desc {
    font-size: var(--text-sm);
    color: var(--muted);
    margin: 0 0 var(--space-sm);
    line-height: 1.4;
  }

  .term-card-inner :global(.k-list) {
    margin: 0;
  }

  .term-suggestions {
    font-size: var(--text-xs);
    color: var(--muted);
    margin: var(--space-xs) 0 0;
    line-height: 1.4;
  }
</style>
