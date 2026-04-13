<!--
  Notification wrapper. Push-style banner at top of screen.
  No focus trap (non-modal, auto-dismissed by caller with timeout).
-->
<script lang="ts">
  import { Notification } from "konsta/svelte";
  import type { ShellNotificationProps } from "./types";

  let {
    opened,
    onclose,
    title,
    subtitle,
    text,
    titleRightText,
  }: ShellNotificationProps = $props();
</script>

<Notification
  {opened}
  {title}
  {subtitle}
  {text}
  {titleRightText}
  onClose={onclose}
/>
