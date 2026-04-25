<!--
  Preset reply content for the Sheet overlay.

  Renders a list of org preset replies (from tickets.listPresets).
  Tapping one calls onselect(decryptedBody) to fill the compose bar.
  Titles and bodies are org-key encrypted, decrypted via OrgDecryptCache.
-->
<script lang="ts">
  import { List, ListItem, Block, BlockTitle } from "konsta/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { presetKeys } from "$lib/query/keys";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import Skeleton from "$lib/components/Skeleton.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";

  interface PresetReplyContentProps {
    onselect: (body: string) => void;
    /** Optional queue ID to scope presets (global + queue-specific). */
    queueId?: string;
  }

  let { onselect, queueId }: PresetReplyContentProps = $props();

  if (!trpc.tickets) throw new RouterNotAvailableError("tickets");
  const ticketRouter = trpc.tickets;

  const orgCache = getOrgDecryptCache();

  const presetsQuery = createQuery(() => ({
    queryKey: presetKeys.byQueue(queueId),
    queryFn: async () => ticketRouter.listPresets.query({ queueId }),
    staleTime: 5 * 60 * 1000,
  }));

  const presets = $derived(presetsQuery.data ?? []);
  const isEmpty = $derived(!presetsQuery.isLoading && presets.length === 0);
</script>

<BlockTitle medium>{m.ticket_preset_replies()}</BlockTitle>

{#if presetsQuery.isLoading}
  <Block>
    <Skeleton lines={3} />
  </Block>
{:else if isEmpty}
  <Block>
    <p class="preset-muted">{m.empty_no_data()}</p>
  </Block>
{:else}
  <List>
    {#each presets as preset (preset.id)}
      {@const presetTitle = orgCache.decrypt(
        `preset:${preset.id}:title`,
        preset.encryptedTitle,
      )}
      {@const presetBody = orgCache.decrypt(
        `preset:${preset.id}:body`,
        preset.encryptedBody,
      )}
      <ListItem
        onclick={() => {
          if (presetBody !== null) onselect(presetBody);
        }}
      >
        {#snippet title()}
          <DecryptPlaceholder
            content={presetTitle}
            ciphertext={preset.encryptedTitle}
            length={20}
          />
        {/snippet}
        {#snippet subtitle()}
          <DecryptPlaceholder
            content={presetBody}
            ciphertext={preset.encryptedBody}
            length={40}
          >
            {presetBody?.slice(0, 80)}{(presetBody?.length ?? 0) > 80
              ? "..."
              : ""}
          </DecryptPlaceholder>
        {/snippet}
      </ListItem>
    {/each}
  </List>
{/if}

<style>
  .preset-muted {
    color: var(--muted);
    font-size: var(--text-sm);
  }
</style>
