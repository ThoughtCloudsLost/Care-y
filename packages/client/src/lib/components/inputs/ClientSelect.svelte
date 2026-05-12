<!--
  Client search/create selector using Bits UI Combobox.
  Separate file: Bits UI cannot coexist with Konsta imports (no-mixed-konsta-bits).

  Reusable: parent provides the search function and optional phone lookup.
  Dropdown styled to match Konsta Popover (glass backdrop, rounded corners).
-->
<script lang="ts" module>
  export type ClientSelection =
    | { mode: "existing"; clientId: string; displayAlias: string }
    | { mode: "new"; token: string }
    | null;

  export interface CollisionInfo {
    clientId: string;
    alias: string;
    openTicketId: string;
  }

  export interface ClientSearchResult {
    id: string;
    alias: string;
    maskedPhone: string;
  }

  export type PhoneLookupResult =
    | { found: false; token: string }
    | {
        found: true;
        clientId: string;
        alias: string;
        openTicketId: string | null;
      };
</script>

<script lang="ts">
  import { Combobox } from "bits-ui";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";

  interface Props {
    label: string;
    placeholder: string;
    search: (query: string) => Promise<ClientSearchResult[]>;
    onchange: (value: ClientSelection) => void;
    phoneLookup?: (phone: string) => Promise<PhoneLookupResult>;
    oncollision?: (info: CollisionInfo) => void;
    createLabel?: string;
    backLabel?: string;
    phonePlaceholder?: string;
    phoneLabel?: string;
    error?: string;
    disabled?: boolean;
  }

  let {
    label,
    placeholder,
    search,
    onchange,
    phoneLookup,
    oncollision,
    createLabel,
    backLabel,
    phonePlaceholder,
    phoneLabel,
    error,
    disabled = false,
  }: Props = $props();

  const labelId = `client-label-${crypto.randomUUID().slice(0, 8)}`;

  type ViewMode = "search" | "create";
  let viewMode = $state<ViewMode>("search");
  let searchQuery = $state("");
  let searchResults: ClientSearchResult[] = $state([]);
  let searching = $state(false);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  let phoneInput = $state("");
  let lookingUp = $state(false);
  let lookupMessage = $state("");
  let selectedDisplay = $state("");

  function debounceSearch(query: string): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (query.trim().length === 0) {
      searchResults = [];
      searching = false;
      return;
    }
    searching = true;
    debounceTimer = setTimeout(() => {
      void runSearch(query.trim());
    }, 300);
  }

  async function runSearch(query: string): Promise<void> {
    try {
      searchResults = await search(query);
    } catch {
      searchResults = [];
    } finally {
      searching = false;
    }
  }

  function selectExistingClient(client: { id: string; alias: string }): void {
    selectedDisplay = client.alias;
    searchQuery = client.alias;
    onchange({
      mode: "existing",
      clientId: client.id,
      displayAlias: client.alias,
    });
  }

  function switchToCreate(): void {
    viewMode = "create";
    phoneInput = "";
    lookupMessage = "";
    onchange(null);
  }

  function switchToSearch(): void {
    viewMode = "search";
    searchQuery = "";
    searchResults = [];
    selectedDisplay = "";
    lookupMessage = "";
    onchange(null);
  }

  function validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-().]/g, "");
    return /^\+\d{7,15}$/.test(cleaned);
  }

  async function handlePhoneLookup(): Promise<void> {
    if (!phoneLookup) return;
    const cleaned = phoneInput.replace(/[\s\-().]/g, "");
    if (!validatePhone(cleaned)) return;

    lookingUp = true;
    lookupMessage = "";

    try {
      const data = await phoneLookup(cleaned);

      if (!data.found) {
        onchange({ mode: "new", token: data.token });
        lookupMessage = m.ticket_new_success(withTerms());
        return;
      }

      if (data.openTicketId !== null && oncollision !== undefined) {
        oncollision({
          clientId: data.clientId,
          alias: data.alias,
          openTicketId: data.openTicketId,
        });
        return;
      }

      onchange({
        mode: "existing",
        clientId: data.clientId,
        displayAlias: data.alias,
      });
      lookupMessage = data.alias;
      selectedDisplay = data.alias;
    } catch {
      lookupMessage = m.ticket_new_error_submit_failed(withTerms());
    } finally {
      lookingUp = false;
    }
  }
</script>

{#snippet spinner()}
  <div class="client-select-spinner" aria-label={m.common_loading()}>
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      class="spin"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-dasharray="20 12"
      />
    </svg>
  </div>
{/snippet}

<div class="client-select" class:client-select-error={Boolean(error)}>
  <span class="client-select-label" id={labelId}>
    {label}
  </span>

  {#if viewMode === "search"}
    <Combobox.Root
      type="single"
      inputValue={searchQuery}
      onValueChange={(v: string) => {
        const match = searchResults.find((r) => r.id === v);
        if (match) selectExistingClient(match);
      }}
      {disabled}
    >
      <div class="client-select-input-wrapper">
        <Combobox.Input
          class="client-select-input"
          {placeholder}
          aria-invalid={Boolean(error)}
          aria-labelledby={labelId}
          oninput={(e: Event) => {
            const target = e.target;
            if (target instanceof HTMLInputElement) {
              searchQuery = target.value;
              selectedDisplay = "";
              onchange(null);
              debounceSearch(target.value);
            }
          }}
        />
        {#if searching}
          {@render spinner()}
        {/if}
      </div>

      <Combobox.Content class="client-select-popover glass" sideOffset={4}>
        {#each searchResults as client (client.id)}
          <Combobox.Item
            value={client.id}
            class="client-select-item"
            label={client.alias}
          >
            <span class="client-alias">{client.alias}</span>
            <span class="client-phone-mask">{client.maskedPhone}</span>
          </Combobox.Item>
        {/each}

        {#if searchResults.length === 0 && searchQuery.trim().length > 0 && !searching}
          <div class="client-select-empty">{m.empty_no_results()}</div>
        {/if}

        {#if phoneLookup}
          <button
            type="button"
            class="client-select-create-btn"
            onclick={switchToCreate}
            {disabled}
          >
            {createLabel ?? m.ticket_new_create_client(withTerms())}
          </button>
        {/if}
      </Combobox.Content>
    </Combobox.Root>

    {#if selectedDisplay}
      <p class="client-select-selected">{selectedDisplay}</p>
    {/if}
  {:else}
    <div class="client-create-fields">
      <div class="client-create-phone-row">
        <input
          class="client-create-input"
          type="tel"
          placeholder={phonePlaceholder ??
            m.ticket_new_field_phone_placeholder()}
          value={phoneInput}
          oninput={(e: Event) => {
            const target = e.target;
            if (target instanceof HTMLInputElement) {
              phoneInput = target.value;
              lookupMessage = "";
            }
          }}
          onblur={() => {
            if (validatePhone(phoneInput.replace(/[\s\-().]/g, ""))) {
              void handlePhoneLookup();
            }
          }}
          {disabled}
          aria-label={phoneLabel ?? m.ticket_new_field_phone()}
          aria-invalid={Boolean(error)}
        />
        {#if lookingUp}
          {@render spinner()}
        {/if}
      </div>

      {#if lookupMessage}
        <p class="client-lookup-msg">{lookupMessage}</p>
      {/if}

      <button
        type="button"
        class="client-select-back-btn"
        onclick={switchToSearch}
        {disabled}
      >
        {backLabel ?? m.ticket_new_back_to_search()}
      </button>
    </div>
  {/if}

  {#if error}
    <p class="client-select-error-text" role="alert">{error}</p>
  {/if}
</div>

<style>
  .client-select {
    padding: 0 1rem;
  }

  .client-select-label {
    display: block;
    font-size: var(--k-list-item-label-font-size, 0.75rem);
    color: var(--k-list-input-label-text-color, var(--muted));
    margin-bottom: var(--space-xs, 0.25rem);
    font-weight: 500;
  }

  .client-select-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  :global(.client-select-input),
  .client-create-input {
    width: 100%;
    min-height: 2.75rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--k-hairline-color, rgba(0, 0, 0, 0.12));
    border-radius: var(--k-list-input-outline-border-radius, 0.75rem);
    background: transparent;
    font-family: inherit;
    font-size: 1rem;
    color: var(--ink);
  }

  :global(.client-select-input:focus-visible),
  .client-create-input:focus-visible {
    outline: 2px solid var(--k-color-primary, #007aff);
    outline-offset: 1px;
  }

  .client-select-error :global(.client-select-input),
  .client-select-error .client-create-input {
    border-color: var(--k-color-red, #ff3b30);
  }

  :global(.client-select-input::placeholder),
  .client-create-input::placeholder {
    color: var(--k-list-input-placeholder-color, var(--muted));
  }

  .client-select-spinner {
    position: absolute;
    right: 0.75rem;
    color: var(--muted);
  }

  /* Popover dropdown (matches Konsta Popover via .glass utility) */

  :global(.client-select-popover) {
    z-index: 50;
    max-height: 256px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: var(--k-popover-border-radius, 0.8125rem);
    box-shadow: var(--k-popover-box-shadow, 0 0.25rem 1rem rgba(0, 0, 0, 0.12));
  }

  :global(.client-select-item) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 0.75rem;
    font-size: 1rem;
    cursor: pointer;
    color: var(--ink);
    min-height: 44px;
  }

  :global(.client-select-item:hover),
  :global(.client-select-item[data-highlighted]) {
    background: color-mix(in srgb, var(--ink) 5%, transparent);
  }

  .client-alias {
    font-weight: 500;
  }

  .client-phone-mask {
    font-size: var(--text-sm);
    color: var(--muted);
    margin-left: var(--space-sm);
    flex-shrink: 0;
  }

  .client-select-empty {
    padding: 0.625rem 0.75rem;
    font-size: var(--text-sm);
    color: var(--muted);
    text-align: center;
  }

  .client-select-create-btn {
    display: block;
    width: 100%;
    padding: 0.625rem 0.75rem;
    font-size: var(--text-base);
    color: var(--brand-text, var(--k-color-primary, #007aff));
    background: none;
    border: none;
    border-top: 1px solid var(--k-hairline-color, rgba(0, 0, 0, 0.12));
    cursor: pointer;
    text-align: left;
    font-weight: 500;
    font-family: inherit;
    min-height: 44px;
  }

  .client-select-create-btn:active {
    background: color-mix(in srgb, var(--ink) 5%, transparent);
  }

  .client-select-selected {
    margin-top: var(--space-xs, 0.25rem);
    font-size: var(--text-sm);
    color: var(--brand-text, var(--k-color-primary, #007aff));
    font-weight: 500;
  }

  /* Create mode */

  .client-create-fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .client-create-phone-row {
    position: relative;
    display: flex;
    align-items: center;
  }

  .client-lookup-msg {
    font-size: var(--text-sm);
    color: var(--brand-text, var(--k-color-primary, #007aff));
    margin: 0;
  }

  .client-select-back-btn {
    background: none;
    border: none;
    color: var(--brand-text, var(--k-color-primary, #007aff));
    font-size: var(--text-sm);
    font-family: inherit;
    cursor: pointer;
    padding: 0;
    text-align: left;
    min-height: 44px;
  }

  .client-select-error-text {
    margin-top: var(--space-xs, 0.25rem);
    font-size: 0.75rem;
    color: var(--k-color-red, #ff3b30);
  }

  .spin {
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
