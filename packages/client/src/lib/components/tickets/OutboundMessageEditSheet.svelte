<!--
  Sheet for editing volunteer outbound in-app messages.

  Prefills with decrypted content, enforces 5000-char cap with a counter
  past 4500, re-encrypts via crypto bridge (same slot, cached tk) plus
  eciesEncrypt to clientPublic when the portal channel is active.
-->
<script lang="ts">
  import { Block, Button, ListInput } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import {
    followupSlot,
    eciesEncrypt,
    encode,
    decode,
    toRistrettoPoint,
  } from "@care-y/crypto";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { ticketKeys } from "$lib/query/keys.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";

  const MAX_CHARS = 5000;
  const COUNTER_THRESHOLD = 4500;

  interface OutboundMessageEditSheetProps {
    opened: boolean;
    ticketId: string;
    followUpId: string;
    initialContent: string;
    /** Base64-encoded client public key from the active portal channel, if any. */
    clientPublic: string | null;
    ondismiss: () => void;
  }

  let {
    opened,
    ticketId,
    followUpId,
    initialContent,
    clientPublic,
    ondismiss,
  }: OutboundMessageEditSheetProps = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const cryptoBridge = getCryptoBridge();
  const queryClient = useQueryClient();

  let text = $state("");
  let saving = $state(false);

  const charCount = $derived(text.length);
  const showCounter = $derived(charCount > COUNTER_THRESHOLD);
  const isOverLimit = $derived(charCount > MAX_CHARS);
  const canSave = $derived(
    text.trim().length > 0 &&
      !isOverLimit &&
      !saving &&
      text !== initialContent,
  );

  // Sync the text when the sheet opens with new content.
  $effect(() => {
    if (opened) {
      text = initialContent;
    }
  });

  async function handleSave(): Promise<void> {
    if (!canSave) return;
    saving = true;

    try {
      const encryptedContent = await cryptoBridge.encrypt(
        ticketId,
        followupSlot(followUpId),
        text.trim(),
      );

      let portalCopy:
        | { ephemeralPoint: string; nonce: string; ciphertext: string }
        | undefined;

      if (clientPublic != null && clientPublic !== "") {
        const pubBytes = toRistrettoPoint(decode(clientPublic));
        const textBytes = new TextEncoder().encode(text.trim());
        const ecies = eciesEncrypt(textBytes, pubBytes);
        portalCopy = {
          ephemeralPoint: encode(ecies.ephemeralPoint),
          nonce: encode(ecies.nonce),
          ciphertext: encode(ecies.ciphertext),
        };
      }

      await ticketRouter.updateOutboundMessage.mutate({
        followUpId,
        encryptedContent,
        portalCopy,
      });

      haptic();
      toastStore.show(m.ticket_toast_message_saved());
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.followUps(ticketId),
      });
      ondismiss();
    } catch {
      toastStore.show(m.error_generic(), 3000);
    } finally {
      saving = false;
    }
  }
</script>

<ShellSheet {opened} {ondismiss} title={m.ticket_edit_message_title()}>
  <Block class="!my-2">
    <ListInput
      type="textarea"
      inputId="edit-message-textarea"
      value={text}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLTextAreaElement) text = e.target.value;
      }}
      inputClass="edit-textarea"
    />
    <label for="edit-message-textarea" class="sr-only">
      {m.ticket_edit_message_title()}
    </label>

    {#if showCounter}
      <p
        class="char-counter"
        class:over-limit={isOverLimit}
        aria-live={isOverLimit ? "assertive" : undefined}
      >
        {#if isOverLimit}
          {m.ticket_edit_message_too_long()}
        {:else}
          {m.ticket_edit_message_counter({
            count: String(charCount),
            max: String(MAX_CHARS),
          })}
        {/if}
      </p>
    {/if}
  </Block>

  <Block class="!my-3">
    <Button large onclick={() => void handleSave()} disabled={!canSave}>
      {m.common_save()}
    </Button>
  </Block>
</ShellSheet>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  :global(.edit-textarea) {
    min-height: 120px;
    resize: vertical;
  }

  .char-counter {
    color: var(--muted);
    font-size: var(--text-sm);
    text-align: right;
    margin: 0.25rem 0 0;
  }

  .char-counter.over-limit {
    color: var(--danger);
    font-weight: 500;
  }
</style>
