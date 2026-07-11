<script lang="ts">
  import { List, ListInput, Button, Block } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import Register from "$lib/components/Register.svelte";

  interface SmsComposeContentProps {
    onsend: (body: string) => void;
    oncancel: () => void;
    sending?: boolean;
    error?: string | null;
  }

  let {
    onsend,
    oncancel,
    sending = false,
    error = null,
  }: SmsComposeContentProps = $props();

  let body = $state("");
  const charCount = $derived(body.length);
  const overLimit = $derived(charCount > 1600);
</script>

<Block>
  <Register kind="careful">
    {m.ticket_sms_plaintext_warning()}
  </Register>
</Block>

<List strong inset>
  <ListInput
    type="textarea"
    placeholder={m.ticket_sms_placeholder()}
    value={body}
    onInput={(e: Event) => {
      const target = e.target;
      if (target instanceof HTMLTextAreaElement) body = target.value;
    }}
    inputClass="min-h-[80px]"
  />
</List>

<Block class="sms-footer">
  <span class="sms-char-count" class:sms-over-limit={overLimit}>
    {m.ticket_sms_char_count({ count: String(charCount) })}
  </span>
  <div class="sms-actions">
    <Button small outline onclick={oncancel} disabled={sending}>
      {m.common_cancel()}
    </Button>
    <Button
      small
      onclick={() => onsend(body)}
      disabled={!body.trim() || overLimit || sending}
    >
      {sending ? m.ticket_sms_sending() : m.ticket_sms_send()}
    </Button>
  </div>
</Block>

{#if error}
  <Block>
    <p class="sms-error" role="alert">{error}</p>
  </Block>
{/if}

<style>
  :global(.sms-footer) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sms-char-count {
    font-size: 0.75rem;
  }

  .sms-over-limit {
    color: var(--danger);
  }

  .sms-actions {
    display: flex;
    gap: 0.5rem;
  }

  .sms-error {
    font-size: 0.875rem;
    color: var(--danger);
  }
</style>
