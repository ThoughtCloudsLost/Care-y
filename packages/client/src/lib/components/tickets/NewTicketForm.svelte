<!--
  New ticket form content component.
  Validates inputs, encrypts via CryptoBridge, emits onsubmit with encrypted payload.
  Does NOT call tRPC (shell/content boundary). Parent handles mutation.
-->
<script lang="ts" module>
  export interface NewTicketPayload {
    encryptedTitle: string;
    encryptedDescription: string;
    queueId: string;
    priority: TicketPriority;
    keyGeneration: string;
    keyWrap: {
      ephemeralPoint: string;
      nonce: string;
      wrappedKey: string;
    };
    clientId?: string;
    clientToken?: string;
  }
</script>

<script lang="ts">
  /* eslint-disable @typescript-eslint/no-unsafe-assignment -- $state<Record> proxy assignments; types are correct */
  /* eslint-disable @typescript-eslint/strict-boolean-expressions -- $derived proxy values flagged as any */
  import { List, ListInput, Preloader } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import { ticketPrioritySchema, type TicketPriority } from "@care-y/shared";
  import type {
    ClientSelection,
    CollisionInfo,
    ClientSearchResult,
    PhoneLookupResult,
  } from "$lib/components/inputs/ClientSelect.svelte";
  import { ClientError } from "$lib/errors.js";

  interface Props {
    queues: { id: string; name: string }[];
    searchClients: (query: string) => Promise<ClientSearchResult[]>;
    phoneLookup?: (phone: string) => Promise<PhoneLookupResult>;
    onsubmit: (payload: NewTicketPayload) => void;
    oncollision?: (info: CollisionInfo) => void;
    submitting?: boolean;
    canSubmit?: boolean;
    formId: string;
  }

  let {
    queues,
    searchClients,
    phoneLookup,
    onsubmit,
    oncollision,
    submitting = false,
    canSubmit = $bindable(false),
    formId,
  }: Props = $props();

  let title = $state("");
  let description = $state("");
  let queueId = $state("");
  let clientSelection = $state<ClientSelection>(null);
  let priority = $state<TicketPriority>("normal");
  let encrypting = $state(false);
  let errors: Record<string, string> = $state({});

  function clearError(field: string): void {
    // eslint-disable-next-line security/detect-object-injection -- field is a known string literal from call sites
    if (errors[field] !== undefined) {
      const { [field]: _, ...rest } = errors;
      errors = rest;
    }
  }

  const bridge = getCryptoBridge();
  const busy = $derived(encrypting || submitting);

  const priorities: readonly { value: TicketPriority; label: string }[] = [
    { value: "low", label: m.ticket_new_priority_low() },
    { value: "normal", label: m.ticket_new_priority_normal() },
    { value: "high", label: m.ticket_new_priority_high() },
    { value: "urgent", label: m.ticket_new_priority_urgent() },
  ];

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = m.ticket_new_error_title_required();
    if (queueId === "")
      next.queue = m.ticket_new_error_queue_required(withTerms());
    if (!clientSelection)
      next.client = m.ticket_new_error_client_required(withTerms());
    errors = next;
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(): Promise<void> {
    if (!validate() || busy) return;
    encrypting = true;
    try {
      const fields: readonly { name: string; plaintext: string }[] = [
        { name: "title", plaintext: title.trim() },
        { name: "description", plaintext: description.trim() || "" },
      ];

      const result = await bridge.createTicketEncryption(fields);

      const find = (name: string): string => {
        const field = result.encryptedFields.find((f) => f.name === name);
        if (!field) throw new ClientError(`Missing encrypted field: ${name}`);
        return field.ciphertext;
      };

      if (clientSelection === null) return;
      const selection = clientSelection;
      onsubmit({
        encryptedTitle: find("title"),
        encryptedDescription: find("description"),
        queueId,
        priority,
        keyGeneration: result.keyGeneration,
        keyWrap: result.keyWrap,
        ...(selection.mode === "existing"
          ? { clientId: selection.clientId }
          : { clientToken: selection.token }),
      });
    } catch {
      errors = { form: m.ticket_new_error_encrypt_failed(withTerms()) };
    } finally {
      encrypting = false;
    }
  }

  $effect(() => {
    canSubmit = !busy && title.trim().length > 0;
  });

  function handleClientChange(value: ClientSelection): void {
    clientSelection = value;
    if (value !== null) clearError("client");
  }

  function handleQueueChange(value: string): void {
    queueId = value;
    if (value !== "") clearError("queue");
  }
</script>

<form
  id={formId}
  class="new-ticket-body"
  onsubmit={(e: SubmitEvent) => {
    e.preventDefault();
    void handleSubmit();
  }}
>
  {#await import("$lib/components/inputs/ClientSelect.svelte")}
    <div class="import-loading"><Preloader /></div>
  {:then ClientSelectModule}
    <ClientSelectModule.default
      label={m.ticket_new_field_client(withTerms())}
      placeholder={m.ticket_new_field_client_placeholder()}
      search={searchClients}
      {phoneLookup}
      onchange={handleClientChange}
      {oncollision}
      error={errors.client}
      disabled={busy}
    />
  {:catch}
    <p class="form-error" role="alert">{m.error_generic()}</p>
  {/await}

  <List nested>
    <ListInput
      outline
      label={m.ticket_new_field_title()}
      type="text"
      placeholder={m.ticket_new_field_title_placeholder()}
      value={title}
      onInput={(e: Event) => {
        const target = e.target;
        if (target instanceof HTMLInputElement) {
          title = target.value;
          if (title.trim() !== "") clearError("title");
        }
      }}
      error={errors.title}
      disabled={busy}
      required
    />

    <ListInput
      outline
      label={m.ticket_new_field_description()}
      type="textarea"
      placeholder={m.ticket_new_field_description_placeholder()}
      value={description}
      onInput={(e: Event) => {
        const target = e.target;
        if (target instanceof HTMLTextAreaElement) {
          description = target.value;
        }
      }}
      disabled={busy}
      inputClass="new-ticket-description"
    />
  </List>

  <List nested class="new-ticket-priority-list">
    <ListInput
      outline
      dropdown
      label={m.ticket_new_field_priority()}
      type="select"
      value={priority}
      onChange={(e: Event) => {
        const target = e.target;
        if (target instanceof HTMLSelectElement) {
          const parsed = ticketPrioritySchema.safeParse(target.value);
          if (parsed.success) priority = parsed.data;
        }
      }}
      disabled={busy}
    >
      {#each priorities as p (p.value)}
        <option value={p.value}>{p.label}</option>
      {/each}
    </ListInput>
  </List>

  <List nested class="new-ticket-queue-list">
    <ListInput
      outline
      dropdown
      label={m.ticket_new_field_queue(withTerms())}
      type="select"
      value={queueId}
      onChange={(e: Event) => {
        const target = e.target;
        if (target instanceof HTMLSelectElement) {
          handleQueueChange(target.value);
        }
      }}
      error={errors.queue}
      disabled={busy}
    >
      <option value="" disabled
        >{m.ticket_new_field_queue_placeholder(withTerms())}</option
      >
      {#each queues as q (q.id)}
        <option value={q.id}>{q.name}</option>
      {/each}
    </ListInput>
  </List>

  {#if errors.form}
    <p class="form-error" role="alert">{errors.form}</p>
  {/if}
</form>

<style>
  .new-ticket-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-md) 0;
  }

  .import-loading {
    display: flex;
    justify-content: center;
    padding: 1rem;
  }

  :global(.new-ticket-description) {
    min-height: 5rem;
    resize: vertical;
  }

  :global(.new-ticket-priority-list),
  :global(.new-ticket-queue-list) {
    margin: 0 !important;
  }

  .form-error {
    color: var(--k-color-red, #ff3b30);
    font-size: 0.875rem;
    text-align: center;
    margin: 0;
    padding: 0 var(--space-lg);
  }
</style>
