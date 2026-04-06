<!--
  Toast wrapper. Brief feedback message.
  No focus trap needed (toast is non-modal, auto-dismissed by caller).
-->
<script lang="ts">
  import { Toast } from "konsta/svelte";
  import type { ShellToastProps } from "./types";

  let {
    opened,
    position = "center",
    button,
    children,
  }: ShellToastProps = $props();
</script>

<Toast {opened} {position} {button}>
  {@render children()}
</Toast>
