<!--
  Email compose sheet for the ticket detail page.

  Subject input + ProseMirror body (emailSchema, reduced toolbar:
  bold, italic, link, bullet list, ordered list). Send fires the
  email relay then writes the encrypted follow-up.
-->
<script lang="ts">
  import { List, ListInput, Preloader } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { emailDocToHtml, emailDocToText } from "$lib/editor/email-schema.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import Register from "$lib/components/Register.svelte";
  import EmailBodyEditor from "./EmailBodyEditor.svelte";
  import {
    proseMirrorDocSchema,
    type ProseMirrorDocJSON,
  } from "@care-y/shared";

  interface EmailComposeSheetProps {
    opened: boolean;
    ondismiss: () => void;
    sending: boolean;
    onsend: (
      subject: string,
      html: string,
      text: string,
      doc: ProseMirrorDocJSON,
    ) => void;
    /** Recipient address as delivered by the server (masked per role). */
    recipientEmail?: string | null;
  }

  let {
    opened,
    ondismiss,
    sending,
    onsend,
    recipientEmail = null,
  }: EmailComposeSheetProps = $props();

  let subject = $state("");
  let wasOpen = $state(false);

  // The body editor lives in a child component because ShellSheet does not
  // render its children until the sheet opens. Reported upward on change so
  // the send button here can gate on it.
  let bodyDoc = $state<unknown>(null);
  let bodyHasContent = $state(false);

  const canSend = $derived(
    subject.trim().length > 0 && bodyHasContent && !sending,
  );

  const sheetLabel = $derived(
    recipientEmail !== null && recipientEmail !== ""
      ? m.ticket_email_title({ client: recipientEmail })
      : m.ticket_email_sheet_title(),
  );

  // Reset subject when the sheet opens.
  $effect(() => {
    if (opened && !wasOpen) {
      subject = "";
    }
    wasOpen = opened;
  });

  function handleSend(): void {
    if (!canSend || bodyDoc === null) return;
    const parsed = proseMirrorDocSchema.safeParse(bodyDoc);
    if (!parsed.success) return;
    const doc: ProseMirrorDocJSON = parsed.data;
    const html = emailDocToHtml(doc);
    const text = emailDocToText(doc);
    onsend(subject.trim(), html, text, doc);
  }
</script>

<ShellSheet {opened} {ondismiss} ariaLabel={sheetLabel} title={sheetLabel}>
  {#snippet headerRight()}
    <SoftButton onclick={handleSend} disabled={!canSend}>
      {#if sending}
        <Preloader class="w-4 h-4" />
        {m.ticket_email_sending()}
      {:else}
        {m.ticket_email_send()}
      {/if}
    </SoftButton>
  {/snippet}

  <div class="email-compose-body">
    <Register kind="note">
      <p class="email-plaintext-warning">
        {m.ticket_email_plaintext_warning()}
      </p>
    </Register>

    {#if recipientEmail}
      <p class="email-recipient" data-testid="email-recipient">
        {m.ticket_email_recipient({ email: recipientEmail })}
      </p>
    {/if}

    <List nested class="email-subject-list">
      <ListInput
        label={m.ticket_email_subject_placeholder()}
        type="text"
        value={subject}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLInputElement) {
            subject = target.value;
          }
        }}
        disabled={sending}
        inputClass="email-subject-input"
      />
    </List>

    <EmailBodyEditor
      onchange={(doc: unknown, hasText: boolean) => {
        bodyDoc = doc;
        bodyHasContent = hasText;
      }}
    />
  </div>
</ShellSheet>

<style>
  .email-compose-body {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .email-plaintext-warning {
    margin: 0;
    font-size: 0.75rem;
    color: var(--muted);
  }

  .email-recipient {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--ink-2);
    word-break: break-all;
  }

  :global(.email-subject-list) {
    margin: 0 !important;
  }
</style>
