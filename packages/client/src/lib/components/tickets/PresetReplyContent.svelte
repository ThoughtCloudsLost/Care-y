<!--
  Preset reply content for the Sheet overlay.

  Renders a list of org preset replies (from tickets.listPresets).
  Tapping one calls onselect(decryptedBody) to fill the compose bar.
  Titles and bodies are org-key encrypted, decrypted via OrgDecryptCache.
-->
<script lang="ts">
  import { List, ListItem, Block, BlockTitle } from "konsta/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgDecryptCache } from "$lib/crypto/context.js";
  import { RouterNotAvailableError } from "$lib/errors.js";

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
    queryKey: ["presets", queueId],
    queryFn: async () => ticketRouter.listPresets.query({ queueId }),
    staleTime: 5 * 60 * 1000,
  }));

  const presets = $derived(presetsQuery.data ?? []);
  const isEmpty = $derived(!presetsQuery.isLoading && presets.length === 0);
</script>

<BlockTitle medium>{m.ticket_preset_replies()}</BlockTitle>

{#if presetsQuery.isLoading}
  <Block>
    <p class="preset-muted">{m.common_loading()}</p>
  </Block>
{:else if isEmpty}
  <Block>
    <p class="preset-muted">{m.empty_no_data()}</p>
  </Block>
{:else}
  <List>
    {#each presets as preset (preset.id)}
      {@const title = orgCache.decrypt(
        `preset:${preset.id}:title`,
        preset.encryptedTitle,
      )}
      {@const body = orgCache.decrypt(
        `preset:${preset.id}:body`,
        preset.encryptedBody,
      )}
      <ListItem
        title={title ?? "..."}
        subtitle={body !== null
          ? body.slice(0, 80) + (body.length > 80 ? "..." : "")
          : "..."}
        onclick={() => {
          if (body !== null) onselect(body);
        }}
      />
    {/each}
  </List>
{/if}

<style>
  .preset-muted {
    color: var(--muted);
    font-size: var(--text-sm);
  }
</style>
