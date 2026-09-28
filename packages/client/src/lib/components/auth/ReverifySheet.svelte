<!--
  ReverifySheet: second-factor challenge over the current page.

  Opens from reverifyStore when the server clears the session's verified
  flag mid-session. The page underneath stays mounted, so unsaved work is
  kept. Dismissing closes the sheet; the next call that fails with
  TWOFA_REQUIRED opens it again. Mounted once in the (app) layout, which
  handles the navigation for sign out and for a session the server ended.
-->
<script lang="ts">
  import { useQueryClient } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import TwoFactorChallenge from "$lib/components/auth/TwoFactorChallenge.svelte";
  import { reverifyStore } from "$lib/stores/reverify.svelte.js";

  interface ReverifySheetProps {
    /** The server destroyed the session after too many wrong guesses. */
    readonly onsessionended: () => void;
    readonly onsignout: () => void;
  }

  let { onsessionended, onsignout }: ReverifySheetProps = $props();

  const queryClient = useQueryClient();

  // Tells the tRPC interceptor a sheet is mounted to show the challenge.
  $effect(() => reverifyStore.register());

  async function handleSuccess(): Promise<void> {
    reverifyStore.close();
    await queryClient.invalidateQueries();
  }

  function handleSessionEnded(): void {
    reverifyStore.close();
    onsessionended();
  }

  function handleSignOut(): void {
    reverifyStore.close();
    onsignout();
  }
</script>

<!-- No title: TwoFactorChallenge renders its own heading with the same
     text, so the sheet names itself through ariaLabel instead. -->
<ShellSheet
  opened={reverifyStore.opened}
  ondismiss={() => {
    reverifyStore.close();
  }}
  ariaLabel={m.twofa_verify_title()}
>
  <div class="sheet-content">
    <TwoFactorChallenge
      methods={reverifyStore.methods}
      onsuccess={handleSuccess}
      onsessionended={handleSessionEnded}
    />
    <div class="text-center mt-6">
      <button type="button" class="back-link" onclick={handleSignOut}>
        {m.panel_logout()}
      </button>
    </div>
  </div>
</ShellSheet>

<style>
  .sheet-content {
    padding: var(--space-md) var(--space-lg) var(--space-lg);
  }

  .back-link {
    background: none;
    border: none;
    color: var(--brand-text);
    font-size: 0.875rem;
    cursor: pointer;
    padding: 0.5rem;
    min-height: 44px;
  }
</style>
