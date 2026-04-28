<!--
  Client search/create selector using Bits UI Combobox.
  Separate file: Bits UI cannot coexist with Konsta imports (no-mixed-konsta-bits).

  Two modes:
  - "search" (default): alias-based combobox search via trpc.tickets.searchClients
  - "create": phone input for relay phone-lookup (find-or-create)
-->
<script lang="ts">
  import { Combobox } from "bits-ui";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { DEV_ORG_SLUG } from "$lib/utils/org-slug.js";

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  export type ClientSelection =
    | { mode: "existing"; clientId: string; displayAlias: string }
    | { mode: "new"; token: string }
    | null;

  export interface CollisionInfo {
    clientId: string;
    alias: string;
    openTicketId: string;
  }

  interface Props {
    onchange: (value: ClientSelection) => void;
    oncollision?: (info: CollisionInfo) => void;
    error?: string;
    disabled?: boolean;
  }

  let { onchange, oncollision, error, disabled = false }: Props = $props();

  const labelId = `client-label-${crypto.randomUUID().slice(0, 8)}`;

  type ViewMode = "search" | "create";
  let viewMode = $state<ViewMode>("search");
  let searchQuery = $state("");
  let searchResults: { id: string; alias: string; maskedPhone: string }[] =
    $state([]);
  let searching = $state(false);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Create mode state
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
      const results = await ticketRouter.searchClients.query({
        query,
        limit: 10,
      });
      searchResults = results;
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
    const cleaned = phoneInput.replace(/[\s\-().]/g, "");
    if (!validatePhone(cleaned)) return;

    lookingUp = true;
    lookupMessage = "";

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (import.meta.env.DEV) {
        headers["x-org-slug"] = DEV_ORG_SLUG;
      }

      const res = await fetch("/relay/phone-lookup", {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ phone: cleaned }),
      });

      if (!res.ok) {
        lookupMessage = m.ticket_new_error_submit_failed();
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- relay JSON shape validated by server
      const data = (await res.json()) as PhoneLookupResponse;

      if (!data.found) {
        onchange({ mode: "new", token: data.token });
        lookupMessage = m.ticket_new_success();
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
      lookupMessage = m.ticket_new_error_submit_failed();
    } finally {
      lookingUp = false;
    }
  }

  type PhoneLookupResponse =
    | { found: false; token: string }
    | {
        found: true;
        clientId: string;
        alias: string;
        openTicketId: string | null;
      };
</script>

<div class="client-select" class:client-select-error={Boolean(error)}>
  <span class="client-select-label" id={labelId}>
    {m.ticket_new_field_client()}
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
          placeholder={m.ticket_new_field_client_placeholder()}
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
        {/if}
      </div>

      <Combobox.Content class="client-select-dropdown" sideOffset={4}>
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

        <button
          type="button"
          class="client-select-create-btn"
          onclick={switchToCreate}
          {disabled}
        >
          {m.ticket_new_create_client()}
        </button>
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
          placeholder={m.ticket_new_field_phone_placeholder()}
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
          aria-label={m.ticket_new_field_phone()}
          aria-invalid={Boolean(error)}
        />
        {#if lookingUp}
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
        {m.ticket_new_back_to_search()}
      </button>
    </div>
  {/if}

  {#if error}
    <p class="client-select-error-text" role="alert">{error}</p>
  {/if}
</div>

<style>
  .client-select {
    padding: 0.75rem 1rem;
  }

  .client-select-label {
    display: block;
    font-size: var(--k-list-item-label-font-size, 0.75rem);
    color: var(
      --k-list-input-label-text-color,
      var(--k-color-md-light-on-surface-variant)
    );
    margin-bottom: 0.25rem;
    font-weight: 500;
  }

  .client-select-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  :global(.client-select-input) {
    width: 100%;
    min-height: 2.75rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--k-hairline-color, rgba(0, 0, 0, 0.12));
    border-radius: 0.5rem;
    background: var(--k-bars-bg-color, #fff);
    font-size: 1rem;
    color: var(--k-text-color, #000);
  }

  :global(.client-select-input:focus-visible) {
    outline: 2px solid var(--k-color-primary, #007aff);
    outline-offset: 1px;
  }

  .client-select-error :global(.client-select-input),
  .client-select-error .client-create-input {
    border-color: var(--k-color-red, #ff3b30);
  }

  :global(.client-select-input::placeholder) {
    color: var(--k-list-input-placeholder-color, rgba(0, 0, 0, 0.35));
  }

  .client-select-spinner {
    position: absolute;
    right: 0.75rem;
    color: var(--k-list-input-placeholder-color, rgba(0, 0, 0, 0.35));
  }

  :global(.client-select-dropdown) {
    z-index: 50;
    max-height: 200px;
    overflow-y: auto;
    border-radius: 0.5rem;
    background: var(--k-bars-bg-color, #fff);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    border: 1px solid var(--k-hairline-color, rgba(0, 0, 0, 0.12));
  }

  :global(.client-select-item) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 0.75rem;
    font-size: 1rem;
    cursor: pointer;
    color: var(--k-text-color, #000);
    transition: background-color 0.1s;
  }

  :global(.client-select-item:hover),
  :global(.client-select-item[data-highlighted]) {
    background: var(--k-list-button-pressed-bg-color, rgba(0, 0, 0, 0.05));
  }

  .client-alias {
    font-weight: 500;
  }

  .client-phone-mask {
    font-size: 0.875rem;
    color: var(--k-list-input-placeholder-color, rgba(0, 0, 0, 0.35));
    margin-left: 0.5rem;
    flex-shrink: 0;
  }

  .client-select-empty {
    padding: 0.625rem 0.75rem;
    font-size: 0.875rem;
    color: var(--k-list-input-placeholder-color, rgba(0, 0, 0, 0.35));
    text-align: center;
  }

  .client-select-create-btn {
    display: block;
    width: 100%;
    padding: 0.625rem 0.75rem;
    font-size: 0.9375rem;
    color: var(--k-color-primary, #007aff);
    background: none;
    border: none;
    border-top: 1px solid var(--k-hairline-color, rgba(0, 0, 0, 0.12));
    cursor: pointer;
    text-align: left;
    font-weight: 500;
  }

  .client-select-create-btn:hover {
    background: var(--k-list-button-pressed-bg-color, rgba(0, 0, 0, 0.05));
  }

  .client-select-selected {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--k-color-primary, #007aff);
    font-weight: 500;
  }

  /* Create mode */

  .client-create-fields {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .client-create-phone-row {
    position: relative;
    display: flex;
    align-items: center;
  }

  .client-create-input {
    width: 100%;
    min-height: 2.75rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--k-hairline-color, rgba(0, 0, 0, 0.12));
    border-radius: 0.5rem;
    background: var(--k-bars-bg-color, #fff);
    font-size: 1rem;
    color: var(--k-text-color, #000);
  }

  .client-create-input:focus-visible {
    outline: 2px solid var(--k-color-primary, #007aff);
    outline-offset: 1px;
  }

  .client-create-input::placeholder {
    color: var(--k-list-input-placeholder-color, rgba(0, 0, 0, 0.35));
  }

  .client-lookup-msg {
    font-size: 0.875rem;
    color: var(--k-color-primary, #007aff);
  }

  .client-select-back-btn {
    background: none;
    border: none;
    color: var(--k-color-primary, #007aff);
    font-size: 0.875rem;
    cursor: pointer;
    padding: 0;
    text-align: left;
  }

  .client-select-error-text {
    margin-top: 0.25rem;
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
