<!--
  Popover wrapper with focus trap and focus restore.
  Anchors to a target element. Closes on backdrop click or Escape.
-->
<script lang="ts">
  import { Popover } from "konsta/svelte";
  import type { ShellPopoverProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";

  let {
    opened,
    ondismiss,
    target,
    angle = false,
    placement,
    children,
  }: ShellPopoverProps = $props();

  const trap = useFocusTrap({
    get opened() {
      return opened;
    },
    get ondismiss() {
      return ondismiss;
    },
  });
</script>

<Popover
  {opened}
  {target}
  {angle}
  {placement}
  onBackdropClick={trap.handleDismiss}
>
  <div bind:this={trap.dialogEl} role="dialog" aria-modal="true" tabindex="-1">
    {@render children()}
  </div>
</Popover>
