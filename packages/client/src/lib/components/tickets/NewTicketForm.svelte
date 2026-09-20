<!--
  New ticket form content component.
  Validates inputs, encrypts via CryptoBridge, emits onsubmit with encrypted payload.
  Does NOT call tRPC (shell/content boundary). Parent handles mutation.
-->
<script lang="ts" module>
  export interface NewTicketPayload {
    /** Ticket id the content was encrypted against (minted or reopen target). */
    id: string;
    encryptedTitle: string;
    encryptedDescription: string;
    queueId: string;
    priority: TicketPriority;
    keyGeneration: string;
    keyWraps: readonly {
      volunteerId: string;
      ephemeralPoint: string;
      nonce: string;
      wrappedKey: string;
    }[];
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
  import { getCryptoBridge, getCurrentUserId } from "$lib/crypto/context.js";
  import {
    ticketPrioritySchema,
    newTicketId,
    type TicketPriority,
  } from "@care-y/shared";
  import type {
    ClientSelection,
    CollisionInfo,
    ClientSearchResult,
    PhoneLookupResult,
  } from "$lib/components/inputs/ClientSelect.svelte";
  import { ClientError } from "$lib/errors.js";
  import { PRIORITY_OPTIONS } from "$lib/tickets/priority-labels.js";
  import type { QueueAppearance } from "$lib/utils/queue-appearance.js";
  import QueueGlyph from "$lib/components/shared/QueueGlyph.svelte";
  import RichSelect from "$lib/components/inputs/RichSelect.svelte";
  import type { RichSelectOption } from "$lib/components/inputs/rich-select.js";

  interface Props {
    queues: { id: string; name: string; appearance: QueueAppearance }[];
    searchClients: (query: string) => Promise<ClientSearchResult[]>;
    phoneLookup?: (phone: string) => Promise<PhoneLookupResult>;
    /**
     * Resolves what ticket the create will land on for an existing client
     * (open ticket blocks, closed ticket reopens under its old id). The
     * AAD binds the ticket id at encrypt time, so the form must know the
     * target id before encrypting (ADR-053).
     */
    resolveCreateTarget: (clientId: string) => Promise<{
      openTicketId: string | null;
      reopenTicketId: string | null;
    }>;
    /** Fetches active, onboarded queue members with their vol_public keys
     *  so the worker can wrap tk for the full recipient set. */
    fetchQueueMemberKeys: (
      queueId: string,
    ) => Promise<readonly { volunteerId: string; volPublic: string }[]>;
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
    resolveCreateTarget,
    fetchQueueMemberKeys,
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
      if (clientSelection === null) return;
      const selection = clientSelection;

      let ticketId: string;
      if (selection.mode === "existing") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- ClientSelection is exported from a .svelte module script; eslint cannot resolve it and types clientId as error
        const target = await resolveCreateTarget(selection.clientId);
        if (target.openTicketId !== null) {
          oncollision?.({
            clientId: selection.clientId,
            alias: selection.displayAlias,
            openTicketId: target.openTicketId,
          });
          return;
        }
        ticketId = target.reopenTicketId ?? newTicketId();
      } else {
        ticketId = newTicketId();
      }

      const fields: readonly { name: string; plaintext: string }[] = [
        { name: "title", plaintext: title.trim() },
        { name: "description", plaintext: description.trim() || "" },
      ];

      // Fetch queue member public keys so tk wraps to the full set.
      // The endpoint returns all active, onboarded members. The creator
      // is typically among them. If not (edge case), the worker's
      // self-wrap in the legacy fallback path covers it, but for the
      // new path we rely on the server including the creator.
      const recipients = await fetchQueueMemberKeys(queueId);

      const result = await bridge.createTicketEncryption(
        ticketId,
        fields,
        recipients,
      );

      const find = (name: string): string => {
        const field = result.encryptedFields.find((f) => f.name === name);
        if (!field) throw new ClientError(`Missing encrypted field: ${name}`);
        return field.ciphertext;
      };

      onsubmit({
        id: ticketId,
        encryptedTitle: find("title"),
        encryptedDescription: find("description"),
        queueId,
        priority,
        keyGeneration: result.keyGeneration,
        keyWraps: result.keyWraps,
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

  <List nested>
    <ListInput
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
      {#each PRIORITY_OPTIONS as option (option.value)}
        <option value={option.value}>{option.label()}</option>
      {/each}
    </ListInput>
  </List>

  <RichSelect
    label={m.ticket_new_field_queue(withTerms())}
    value={queueId}
    options={queues.map((q) => ({ value: q.id, label: q.name }))}
    onchange={handleQueueChange}
    placeholder={m.ticket_new_field_queue_placeholder(withTerms())}
    error={errors.queue}
    disabled={busy}
  >
    {#snippet leading(option: RichSelectOption)}
      {@const q = queues.find((x) => x.id === option.value)}
      {#if q}
        <QueueGlyph appearance={q.appearance} />
      {/if}
    {/snippet}
  </RichSelect>

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

  .form-error {
    color: var(--danger, var(--k-color-red, #ff3b30));
    font-size: 0.875rem;
    text-align: center;
    margin: 0;
    padding: 0 var(--space-lg);
  }
</style>
