<!--
  Test harness for verifying onrevoke forwarding through ClientShell.
  Wraps the shell with a child that registers page state including an
  onrevoke callback.
-->
<script lang="ts">
  import { App } from "konsta/svelte";
  import ClientShell from "../ClientShell.svelte";
  import ClientShellRevokeChild from "./ClientShellRevokeChild.svelte";

  interface Props {
    readonly ondestroy: () => void;
    readonly onrevoke: () => void;
  }

  let { ondestroy, onrevoke }: Props = $props();
</script>

<App theme="ios">
  <ClientShell>
    <ClientShellRevokeChild {ondestroy} {onrevoke} />
  </ClientShell>
</App>
