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
  import {
    List,
    ListInput,
    Segmented,
    SegmentedButton,
    Button,
    Block,
    BlockTitle,
    Preloader,
  } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import type { TicketPriority } from "@care-y/shared";
  import type { ClientSelection, CollisionInfo } from "./ClientSelect.svelte";
  import { ClientError } from "$lib/errors.js";

  interface Props {
    queues: { id: string; name: string }[];
    onsubmit: (payload: NewTicketPayload) => void;
    oncancel: () => void;
    oncollision?: (info: CollisionInfo) => void;
    submitting?: boolean;
  }

  let {
    queues,
    onsubmit,
    oncancel,
    oncollision,
    submitting = false,
  }: Props = $props();

  let title = $state("");
  let description = $state("");
  let queueId = $state("");
  let clientSelection = $state<ClientSelection>(null);
  let priority = $state<TicketPriority>("normal");
  let encrypting = $state(false);
  let errors: Record<string, string> = $state({});

  const bridge = getCryptoBridge();
  const busy = $derived(encrypting || submitting);

  const priorities: readonly {
    value: TicketPriority;
    label: string;
    color: string;
  }[] = [
    {
      value: "low",
      label: m.ticket_new_priority_low(),
      color: "var(--k-color-green, #34c759)",
    },
    {
      value: "normal",
      label: m.ticket_new_priority_normal(),
      color: "var(--k-color-blue, #007aff)",
    },
    {
      value: "high",
      label: m.ticket_new_priority_high(),
      color: "var(--k-color-orange, #ff9500)",
    },
    {
      value: "urgent",
      label: m.ticket_new_priority_urgent(),
      color: "var(--k-color-red, #ff3b30)",
    },
  ];

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = m.ticket_new_error_title_required();
    if (queueId === "") next.queue = m.ticket_new_error_queue_required();
    if (!clientSelection) next.client = m.ticket_new_error_client_required();
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
      errors = { form: m.ticket_new_error_encrypt_failed() };
    } finally {
      encrypting = false;
    }
  }

  function handleClientChange(value: ClientSelection): void {
    clientSelection = value;
    if (errors.client !== undefined && value !== null) {
      const { client: _, ...rest } = errors;
      errors = rest;
    }
  }

  function handleQueueChange(value: string): void {
    queueId = value;
    if (errors.queue !== undefined && value !== "") {
      const { queue: _, ...rest } = errors;
      errors = rest;
    }
  }
</script>

<!-- QueueSelect and ClientSelect are imported lazily by the parent
     to keep Bits UI out of this Konsta-only file. They render via
     dedicated slots in the form layout. -->
<form
  onsubmit={(e: SubmitEvent) => {
    e.preventDefault();
    void handleSubmit();
  }}
  class="new-ticket-form"
>
  <List strongIos outlineIos>
    <ListInput
      label={m.ticket_new_field_title()}
      type="text"
      placeholder={m.ticket_new_field_title_placeholder()}
      value={title}
      onInput={(e: Event) => {
        const target = e.target;
        if (target instanceof HTMLInputElement) {
          title = target.value;
          if (errors.title !== undefined && title.trim() !== "") {
            const { title: _, ...rest } = errors;
            errors = rest;
          }
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

  <BlockTitle>{m.ticket_new_field_priority()}</BlockTitle>
  <Block>
    <Segmented strong>
      {#each priorities as p (p.value)}
        <SegmentedButton
          active={priority === p.value}
          onclick={() => {
            if (!busy) priority = p.value;
          }}
        >
          <span
            class="priority-label"
            style:--priority-color={p.color}
            class:priority-active={priority === p.value}
          >
            {p.label}
          </span>
        </SegmentedButton>
      {/each}
    </Segmented>
  </Block>

  {#await import("./QueueSelect.svelte")}
    <div class="import-loading"><Preloader /></div>
  {:then QueueSelectModule}
    <QueueSelectModule.default
      {queues}
      value={queueId}
      onchange={handleQueueChange}
      error={errors.queue}
      disabled={busy}
    />
  {:catch}
    <Block><p class="form-error" role="alert">{m.error_generic()}</p></Block>
  {/await}

  {#await import("./ClientSelect.svelte")}
    <div class="import-loading"><Preloader /></div>
  {:then ClientSelectModule}
    <ClientSelectModule.default
      onchange={handleClientChange}
      {oncollision}
      error={errors.client}
      disabled={busy}
    />
  {:catch}
    <Block><p class="form-error" role="alert">{m.error_generic()}</p></Block>
  {/await}

  {#if errors.form}
    <Block>
      <p class="form-error" role="alert">{errors.form}</p>
    </Block>
  {/if}

  <Block class="new-ticket-actions">
    <Button large tonal disabled={busy} onclick={oncancel}>
      {m.common_cancel()}
    </Button>
    <Button large type="submit" disabled={busy}>
      {#if encrypting}
        {m.ticket_new_submitting()}
      {:else if submitting}
        {m.ticket_new_submitting()}
      {:else}
        {m.ticket_new_submit()}
      {/if}
    </Button>
  </Block>
</form>

<style>
  .new-ticket-form {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding-bottom: env(safe-area-inset-bottom);
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

  .priority-label {
    font-size: 0.8125rem;
    transition: color 0.15s;
  }

  .priority-active {
    color: var(--priority-color);
    font-weight: 600;
  }

  .form-error {
    color: var(--k-color-red, #ff3b30);
    font-size: 0.875rem;
    text-align: center;
  }

  :global(.new-ticket-actions) {
    display: flex;
    gap: 0.75rem;
  }

  :global(.new-ticket-actions > :first-child) {
    flex: 1;
  }

  :global(.new-ticket-actions > :last-child) {
    flex: 2;
  }
</style>
