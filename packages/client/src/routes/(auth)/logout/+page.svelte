<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { getCryptoBridge, getOrgKeyManager } from "$lib/crypto/context.js";
  import { endStaffSession } from "$lib/auth/end-staff-session.js";

  const queryClient = useQueryClient();

  if (browser) {
    const bridge = getCryptoBridge();
    const orgKeyManager = getOrgKeyManager();

    void (async () => {
      const { serverConfirmed } = await endStaffSession({
        queryClient,
        bridge,
        orgKeyManager,
      });
      await goto(
        resolve(serverConfirmed ? "/login" : "/login?signout=unconfirmed"),
      );
    })();
  }
</script>
