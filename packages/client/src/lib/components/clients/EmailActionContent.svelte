<!--
  Email action popover content: copy and edit actions for a client email
  address. Rendered inside a ShellPopover by the ticket detail orchestrator.

  "Copy to clipboard" is only shown when the caller has the full address
  (admin sees the full address, others see a masked local part). The
  canCopy prop controls visibility; the parent derives it from the value
  the server sent.

  "Edit email address" is always shown. The parent provides the onedit
  callback which opens the EmailEditSheet.
-->
<script lang="ts">
  import { List as KList, ListItem } from "konsta/svelte";
  import { Copy, Pencil } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface EmailActionContentProps {
    /** Whether the "Copy to clipboard" action is visible. */
    canCopy: boolean;
    /** Called when the user taps "Copy to clipboard". */
    oncopy: () => void;
    /** Called when the user taps "Edit email address". */
    onedit: () => void;
  }

  let { canCopy, oncopy, onedit }: EmailActionContentProps = $props();
</script>

<KList nested>
  {#if canCopy}
    <ListItem title={m.email_copy_clipboard()} onclick={oncopy}>
      {#snippet media()}
        <Copy size={20} aria-hidden="true" />
      {/snippet}
    </ListItem>
  {/if}
  <ListItem title={m.client_email_edit()} onclick={onedit}>
    {#snippet media()}
      <Pencil size={20} aria-hidden="true" />
    {/snippet}
  </ListItem>
</KList>
