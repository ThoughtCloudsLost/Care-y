<!--
  Test child that registers a page state with onrevoke through the client
  shell context. Used by ClientShell.test.ts to verify that onrevoke is
  forwarded to QuickExit.
-->
<script lang="ts">
  import { getClientShellCtx } from "$lib/client-shell/context.js";

  interface Props {
    readonly ondestroy: () => void;
    readonly onrevoke: () => void;
  }

  let { ondestroy, onrevoke }: Props = $props();

  const shellContainer = getClientShellCtx();

  $effect(() => {
    shellContainer.current = {
      ondestroy,
      onrevoke,
      actions: [],
    };
    return () => {
      shellContainer.current = undefined;
    };
  });
</script>

<div data-testid="revoke-child"></div>
