<!--
  Phone action popover content: copy and edit actions for a phone number.
  Rendered inside a ShellPopover by the ticket detail orchestrator.

  "Copy to clipboard" is only shown when the caller has a full number
  (admin sees the formatted number, others see a mask). The canCopy
  prop controls visibility; the parent derives it from the caller's
  role or the phone value.

  "Edit phone number" is always shown. The parent provides the onedit
  callback which opens the PhoneEditSheet.
-->
<script lang="ts">
  import { List as KList, ListItem } from "konsta/svelte";
  import { Copy, Pencil } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";

  interface PhoneActionContentProps {
    /** Whether the "Copy to clipboard" action is visible. */
    canCopy: boolean;
    /** Called when the user taps "Copy to clipboard". */
    oncopy: () => void;
    /** Called when the user taps "Edit phone number". */
    onedit: () => void;
  }

  let { canCopy, oncopy, onedit }: PhoneActionContentProps = $props();
</script>

<KList nested>
  {#if canCopy}
    <ListItem title={m.phone_copy_clipboard()} onclick={oncopy}>
      {#snippet media()}
        <Copy size={20} aria-hidden="true" />
      {/snippet}
    </ListItem>
  {/if}
  <ListItem title={m.phone_edit()} onclick={onedit}>
    {#snippet media()}
      <Pencil size={20} aria-hidden="true" />
    {/snippet}
  </ListItem>
</KList>
