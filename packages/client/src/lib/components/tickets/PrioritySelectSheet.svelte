<!--
  Priority picker sheet, used from both the ticket detail panel and the
  bulk action bar. Stateless: receives the currently selected priority
  (optional, omitted in bulk context) and fires a callback with the
  chosen value.
-->
<script lang="ts">
  import { List, ListItem } from "konsta/svelte";
  import { Check } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import type { TicketPriority } from "@care-y/shared";
  import { PRIORITY_OPTIONS } from "$lib/tickets/priority-labels.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  interface PrioritySelectSheetProps {
    opened: boolean;
    currentPriority?: TicketPriority | undefined;
    ondismiss: () => void;
    onselect: (priority: TicketPriority) => void;
  }

  let {
    opened,
    currentPriority,
    ondismiss,
    onselect,
  }: PrioritySelectSheetProps = $props();

  function handleSelect(priority: TicketPriority): void {
    onselect(priority);
    ondismiss();
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.ticket_priority_sheet_title()}
  title={m.ticket_priority_sheet_title()}
>
  <List nested aria-label={m.ticket_priority_sheet_title()}>
    {#each PRIORITY_OPTIONS as option (option.value)}
      <ListItem
        title={option.label()}
        aria-current={option.value === currentPriority ? "true" : undefined}
        onclick={() => handleSelect(option.value)}
      >
        {#snippet after()}
          {#if option.value === currentPriority}
            <Check size={16} class="text-primary" aria-hidden="true" />
          {/if}
        {/snippet}
      </ListItem>
    {/each}
  </List>
</ShellSheet>
