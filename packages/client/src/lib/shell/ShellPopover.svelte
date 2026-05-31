<!--
  Popover wrapper with focus trap and focus restore.
  Anchors to a target element. Closes on backdrop click or Escape.
  Portaled to .k-page so it escapes any parent stacking contexts.
-->
<script lang="ts">
  import { Popover } from "konsta/svelte";
  import type { ShellPopoverProps } from "./types";
  import { useFocusTrap } from "./use-focus-trap.svelte";
  import { portal } from "./portal";

  let {
    opened,
    ondismiss,
    target,
    angle = false,
    placement,
    ariaLabel,
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

<div use:portal={".k-page"}>
  <Popover
    {opened}
    {target}
    {angle}
    {placement}
    onBackdropClick={trap.handleDismiss}
  >
    <div
      bind:this={trap.dialogEl}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? undefined}
      tabindex="-1"
    >
      {@render children()}
    </div>
  </Popover>
</div>
