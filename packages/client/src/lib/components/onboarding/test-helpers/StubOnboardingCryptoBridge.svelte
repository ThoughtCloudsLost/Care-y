<script lang="ts">
  import type { Snippet } from "svelte";

  let { adminUserId, children }: { adminUserId: string; children: Snippet } =
    $props();
</script>

<!-- Renders the received prop so tests can assert what the host
     component passed across the bridge boundary. -->
<div data-testid="stub-crypto-bridge" data-admin-user-id={adminUserId}>
  {@render children()}
</div>
