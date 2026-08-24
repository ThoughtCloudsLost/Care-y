<!--
  Volunteer compose sheet for sending one-time share links.
  Content is encrypted under a fresh random key (share-crypto); the key
  lives only in the URL fragment. A copy of the content is also encrypted
  under the ticket key (via CryptoBridge) and stored as a share_link
  follow-up so the case record stays complete.

  SMS mode: sends the link by text. Copy mode: copies to clipboard.
  Structural reference: InternalNoteSheet.svelte.
-->
<script lang="ts">
  import { List, ListInput } from "konsta/svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { ticketKeys } from "$lib/query/keys";
  import * as m from "$lib/paraglide/messages.js";
  import { followupSlot } from "@care-y/crypto";
  import { newShareId, newFollowupId } from "@care-y/shared";
  import { trpc } from "$lib/trpc/index.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import { requireRouter } from "$lib/errors.js";
  import { RateLimitError, RelayError } from "$lib/errors.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { encryptShare } from "$lib/portal/share-crypto.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import Register from "$lib/components/Register.svelte";
  import FieldError from "$lib/components/FieldError.svelte";

  interface ShareLinkSheetProps {
    opened: boolean;
    ondismiss: () => void;
    ticketId: string;
    clientPhone: string | null;
  }

  let { opened, ondismiss, ticketId, clientPhone }: ShareLinkSheetProps =
    $props();

  const portalRouter = requireRouter(trpc.clientPortal, "clientPortal");
  const cryptoBridge = getCryptoBridge();
  const queryClient = useQueryClient();

  const MAX_CONTENT_BYTES = 64_000;
  const textEncoder = new TextEncoder();

  let text = $state("");
  let sending = $state(false);
  let wasOpen = $state(false);

  // Reset text each time the sheet opens.
  $effect(() => {
    if (opened && !wasOpen) {
      text = "";
    }
    wasOpen = opened;
  });

  const contentByteLength = $derived(textEncoder.encode(text).length);
  const isOverLimit = $derived(contentByteLength > MAX_CONTENT_BYTES);
  const canSend = $derived(text.trim().length > 0 && !isOverLimit && !sending);
  const isSmsMode = $derived(clientPhone !== null);

  async function handleSend(): Promise<void> {
    const trimmed = text.trim();
    if (trimmed.length === 0 || isOverLimit || sending) return;

    sending = true;
    try {
      const shareId = newShareId();
      const followUpId = newFollowupId();

      // Encrypt under a fresh share key (main thread, key zeroed in finally).
      const { ciphertext, fragmentKey } = encryptShare(shareId, trimmed);

      // Encrypt the same text under the ticket key for the case record.
      const encryptedFollowUp = await cryptoBridge.encrypt(
        ticketId,
        followupSlot(followUpId),
        trimmed,
      );

      // Persist the share row and follow-up BEFORE sending/copying.
      await portalRouter.createShare.mutate({
        shareId,
        ticketId,
        ciphertext,
        followUpId,
        encryptedFollowUp,
      });

      const url = `${window.location.origin}/share/${shareId}#${fragmentKey}`;

      if (isSmsMode) {
        // Send the link via SMS through the relay.
        const resp = await fetch("/relay/sms", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketId,
            body: m.share_sms_body({ url }),
          }),
        });

        if (resp.status === 429) {
          const retryAfter = resp.headers.get("Retry-After");
          const seconds = retryAfter !== null ? parseInt(retryAfter, 10) : 30;
          throw new RateLimitError(seconds);
        }
        if (!resp.ok) throw new RelayError("SMS_FAILED", resp.status);
      } else {
        // Copy mode: write the link to the clipboard.
        await navigator.clipboard.writeText(url);
      }

      // Success path: dismiss, haptic, toast, announce, invalidate.
      ondismiss();
      haptic();
      const successMsg = isSmsMode
        ? m.share_sheet_sent()
        : m.share_sheet_copied();
      toastStore.show(successMsg);
      announceToLiveRegion("polite", successMsg);
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.followUps(ticketId),
      });
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.shares(ticketId),
      });
    } catch (err: unknown) {
      if (err instanceof RateLimitError) {
        toastStore.show(
          m.ticket_sms_rate_limited({
            seconds: String(err.retryAfterSeconds),
          }),
          5000,
        );
      } else if (err instanceof RelayError) {
        // Share row and follow-up exist at this point; only the SMS failed.
        console.error("[ShareLinkSheet] SMS relay failed:", err);
        toastStore.show(m.ticket_sms_error_send(), 3000);
      } else {
        console.error("[ShareLinkSheet] send failed before relay:", err);
        toastStore.show(m.error_generic(), 3000);
      }
    } finally {
      sending = false;
    }
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.share_sheet_title()}
  title={m.share_sheet_title()}
>
  {#snippet headerRight()}
    <SoftButton onclick={() => void handleSend()} disabled={!canSend}>
      {#if sending}
        {m.share_sheet_sending()}
      {:else if isSmsMode}
        {m.share_sheet_send()}
      {:else}
        {m.share_sheet_copy()}
      {/if}
    </SoftButton>
  {/snippet}

  <div class="share-sheet-body">
    <Register kind="note">
      <p class="share-note">
        {isSmsMode ? m.share_sheet_note_sms() : m.share_sheet_note_copy()}
      </p>
    </Register>

    <List nested class="share-input-list">
      <ListInput
        type="textarea"
        label={m.share_sheet_content_label()}
        placeholder={m.share_sheet_placeholder()}
        value={text}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLTextAreaElement) {
            text = target.value;
            target.style.height = "auto";
            target.style.height = `${String(target.scrollHeight)}px`;
          }
        }}
        disabled={sending}
        inputClass="share-textarea"
      />
    </List>

    {#if isOverLimit}
      <FieldError message={m.share_sheet_too_long()} />
    {/if}
  </div>
</ShellSheet>

<style>
  .share-sheet-body {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .share-note {
    margin: 0;
  }

  :global(.share-textarea) {
    min-height: calc(3lh) !important;
    resize: none;
    overflow: hidden;
  }

  :global(.share-input-list) {
    margin: 0 !important;
  }
</style>
