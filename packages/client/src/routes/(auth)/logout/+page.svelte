<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { trpc } from "$lib/trpc/index.js";
  import { getCryptoBridge } from "$lib/crypto/context.js";
  import { clearAllDecryptedData } from "$lib/auth/cleanup.js";
  import { setOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";

  const queryClient = useQueryClient();

  if (browser) {
    const bridge = getCryptoBridge();

    void (async () => {
      try {
        await trpc.auth.logout.mutate();
      } catch {
        // Session may already be expired; proceed with cleanup
      }
      queryClient.clear();
      clearAllDecryptedData();
      setOrgKeyReady(false);
      await bridge.zeroAll();
      await goto(resolve("/login"));
    })();
  }
</script>
