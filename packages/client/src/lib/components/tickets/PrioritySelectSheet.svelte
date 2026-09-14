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
  import { ticketPrioritySchema, type TicketPriority } from "@care-y/shared";
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

  const priorities = ticketPrioritySchema.options;

  const labelMap = new Map<TicketPriority, () => string>([
    ["low", m.ticket_new_priority_low],
    ["normal", m.ticket_new_priority_normal],
    ["high", m.ticket_new_priority_high],
    ["urgent", m.ticket_new_priority_urgent],
  ]);

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
    {#each priorities as priority (priority)}
      <ListItem
        title={labelMap.get(priority)?.() ?? priority}
        aria-current={priority === currentPriority ? "true" : undefined}
        onclick={() => handleSelect(priority)}
      >
        {#snippet after()}
          {#if priority === currentPriority}
            <Check size={16} class="text-primary" aria-hidden="true" />
          {/if}
        {/snippet}
      </ListItem>
    {/each}
  </List>
</ShellSheet>
