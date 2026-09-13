<!--
  Edit sheet for ticket title and description. Self-contained: owns its
  own detail query, decrypt scope, encrypt calls, and mutation. Callers
  provide ticketId + opened/ondismiss only (InternalNoteSheet pattern).

  Encrypts changed fields through cryptoBridge (Worker), sends only
  changed fields to the server, and seeds the decrypt cache on success
  rather than clearing it (see plan anti-patterns for why).
-->
<script lang="ts">
  import { List, ListInput } from "konsta/svelte";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { ticketKeys, ticketsKeys } from "$lib/query/keys";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import {
    getCryptoBridge,
    getTicketDecryptCache,
    getFollowUpDecryptCache,
    getOrgDecryptCache,
  } from "$lib/crypto/context.js";
  import { createTicketDecryptScope } from "$lib/crypto/ticket-decrypt-scope.js";
  import { isDecryptReady } from "$lib/crypto/decrypt-result.js";
  import type { DecryptResult } from "$lib/crypto/decrypt-result.js";
  import { requireRouter } from "$lib/errors.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { ErrorCode } from "@care-y/shared";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";

  interface TicketContentEditSheetProps {
    opened: boolean;
    ondismiss: () => void;
    ticketId: string;
  }

  let { opened, ondismiss, ticketId }: TicketContentEditSheetProps = $props();

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const cryptoBridge = getCryptoBridge();
  const ticketCache = getTicketDecryptCache();
  const followUpCache = getFollowUpDecryptCache();
  const orgCache = getOrgDecryptCache();
  const queryClient = useQueryClient();

  // ---- Detail query (cache hit from CaseHeader) ----

  const ticketQuery = createQuery(() => ({
    queryKey: ticketKeys.detail(ticketId),
    queryFn: async () => ticketRouter.get.query({ ticketId }),
  }));

  const ticket = $derived(ticketQuery.data);

  // ---- Decrypt scope ----

  const decrypt = $derived(
    ticket != null
      ? createTicketDecryptScope({
          ticketCache,
          followUpCache,
          orgCache,
          ticketId: ticket.id,
          keyWrap: ticket.keyWrap,
          intakeWrap: ticket.intakeWrap,
        })
      : null,
  );

  const titleResult: DecryptResult | undefined = $derived(
    ticket != null && decrypt != null
      ? decrypt.title(ticket.encryptedTitle)
      : undefined,
  );

  const descriptionResult: DecryptResult | undefined = $derived(
    ticket != null && decrypt != null
      ? decrypt.description(ticket.encryptedDescription)
      : undefined,
  );

  // ---- Edit state ----

  let titleText = $state("");
  let descriptionText = $state("");
  let originalTitle = $state("");
  let originalDescription = $state("");
  let saving = $state(false);
  let wasOpen = $state(false);
  let prefilled = $state(false);

  // Determine whether both decrypts have resolved to usable values.
  const titleReady = $derived(
    titleResult != null && isDecryptReady(titleResult),
  );
  const descriptionReady = $derived(
    descriptionResult != null && isDecryptReady(descriptionResult),
  );
  const bothReady = $derived(titleReady && descriptionReady);

  // Detect permanent decrypt failures (denied or error).
  const decryptFailed = $derived(
    (titleResult != null &&
      (titleResult.status === "denied" || titleResult.status === "error")) ||
      (descriptionResult != null &&
        (descriptionResult.status === "denied" ||
          descriptionResult.status === "error")),
  );

  // Prefill once per open when both decrypts are ready (wasOpen guard).
  $effect(() => {
    if (opened && !wasOpen) {
      prefilled = false;
      titleText = "";
      descriptionText = "";
      originalTitle = "";
      originalDescription = "";
    }
    wasOpen = opened;
  });

  $effect(() => {
    if (
      opened &&
      bothReady &&
      !prefilled &&
      titleResult != null &&
      isDecryptReady(titleResult) &&
      descriptionResult != null &&
      isDecryptReady(descriptionResult)
    ) {
      titleText = titleResult.value;
      descriptionText = descriptionResult.value;
      originalTitle = titleResult.value;
      originalDescription = descriptionResult.value;
      prefilled = true;
    }
  });

  const isDirty = $derived(
    titleText.trim() !== originalTitle ||
      descriptionText.trim() !== originalDescription,
  );
  const canSave = $derived(
    isDirty && titleText.trim().length > 0 && !saving && prefilled,
  );

  // ---- Save handler ----

  async function handleSave(): Promise<void> {
    const kw = ticket?.keyWrap;
    if (ticket == null || kw == null) return;
    saving = true;
    try {
      // Re-derive the ticket key before encrypting. The Worker tkCache is
      // keyed by ticketId alone and nothing evicts it when another session
      // reopens the ticket. Evict the stale tk, then decrypt through this
      // snapshot's keyWrap to cache the matching tk.
      await cryptoBridge.evictTk(ticketId);
      await cryptoBridge.decrypt(
        ticketId,
        "title",
        ticketId,
        kw.ephemeralPoint,
        kw.nonce,
        kw.wrappedKey,
        ticket.encryptedTitle,
      );

      const titleChanged = titleText.trim() !== originalTitle;
      const descriptionChanged = descriptionText.trim() !== originalDescription;

      // Send only changed fields so the audit trail records no-op snapshots
      // for unchanged fields.
      const encryptedTitle = titleChanged
        ? await cryptoBridge.encrypt(ticketId, "title", titleText.trim())
        : undefined;
      const encryptedDescription = descriptionChanged
        ? await cryptoBridge.encrypt(
            ticketId,
            "description",
            descriptionText.trim(),
          )
        : undefined;

      await ticketRouter.updateContent.mutate({
        ticketId,
        encryptedTitle,
        encryptedDescription,
        keyGeneration: ticket.keyGeneration,
      });

      // Seed the decrypt cache with the new plaintext. The cache keys have
      // no ciphertext component, so invalidation alone would serve the stale
      // plaintext forever (the same ciphertext-free key would hit the old
      // cache entry). Seeding is targeted and instant.
      if (titleChanged) ticketCache.seed(ticketId, titleText.trim());
      if (descriptionChanged)
        ticketCache.seed(`desc:${ticketId}`, descriptionText.trim());

      ondismiss();
      haptic();
      toastStore.show(m.ticket_content_saved(withTerms()));
      announceToLiveRegion("polite", m.ticket_content_saved(withTerms()));
      void queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(ticketId),
      });
      void queryClient.invalidateQueries({ queryKey: ticketsKeys.lists() });
    } catch (err: unknown) {
      const isStale =
        err instanceof Error &&
        err.message === ErrorCode.TICKET_KEY_GENERATION_STALE;
      toastStore.show(
        isStale
          ? m.error_ticket_key_generation_stale(withTerms())
          : m.error_generic(),
        3000,
      );
    } finally {
      saving = false;
    }
  }

  // ---- Auto-grow textarea handler ----

  function handleDescriptionInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLTextAreaElement) {
      descriptionText = target.value;
      target.style.height = "auto";
      target.style.height = `${String(target.scrollHeight)}px`;
    }
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.ticket_content_edit_title(withTerms())}
  title={m.ticket_content_edit_title(withTerms())}
>
  {#snippet headerRight()}
    <SoftButton onclick={() => void handleSave()} disabled={!canSave}>
      {saving ? m.ticket_note_saving() : m.common_save()}
    </SoftButton>
  {/snippet}

  <div class="edit-sheet-body">
    {#if decryptFailed}
      <div class="decrypt-failed">
        <DecryptPlaceholder length={20} />
      </div>
    {:else}
      <List nested class="edit-input-list">
        <ListInput
          type="text"
          label={m.ticket_content_title_label()}
          value={prefilled ? titleText : ""}
          onInput={(e: Event) => {
            const target = e.target;
            if (target instanceof HTMLInputElement) {
              titleText = target.value;
            }
          }}
          disabled={saving || !prefilled}
          inputClass="edit-title-input"
        />
        <ListInput
          type="textarea"
          label={m.ticket_content_description_label()}
          value={prefilled ? descriptionText : ""}
          onInput={handleDescriptionInput}
          disabled={saving || !prefilled}
          inputClass="edit-description-input"
        />
      </List>
    {/if}
  </div>
</ShellSheet>

<style>
  .edit-sheet-body {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .decrypt-failed {
    padding: var(--space-lg);
    text-align: center;
    color: var(--muted);
  }

  :global(.edit-description-input) {
    min-height: calc(3lh) !important;
    resize: none;
    overflow: hidden;
  }

  :global(.edit-input-list) {
    margin: 0 !important;
  }
</style>
