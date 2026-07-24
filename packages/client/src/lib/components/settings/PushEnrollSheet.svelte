<script lang="ts">
  import { Preloader, Button } from "konsta/svelte";
  import FieldError from "$lib/components/FieldError.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { ErrorCode } from "@care-y/shared";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  interface PushEnrollSheetProps {
    readonly opened: boolean;
    readonly ondismiss: () => void;
    readonly onenrolled: () => void;
  }

  let { opened, ondismiss, onenrolled }: PushEnrollSheetProps = $props();

  let verifying = $state(false);
  let error = $state("");
  let wasOpen = $state(false);

  $effect(() => {
    if (opened && !wasOpen) {
      error = "";
      verifying = false;
    }
    wasOpen = opened;
  });

  function isNoSubscriptionError(err: unknown): boolean {
    if (err instanceof Error) {
      return err.message.includes(ErrorCode.NO_PUSH_SUBSCRIPTIONS);
    }
    return false;
  }

  async function handleVerify(): Promise<void> {
    verifying = true;
    error = "";
    try {
      const result = await trpc.twoFactor.enroll.pushVerify.mutate();
      if (result.success) {
        haptic();
        const msg = m.twofa_method_added();
        toastStore.show(msg);
        announceToLiveRegion("polite", msg);
        onenrolled();
      }
    } catch (err: unknown) {
      if (isNoSubscriptionError(err)) {
        error = m.twofa_push_no_subscription();
      } else {
        error = m.twofa_error_invalid_code();
      }
      announceToLiveRegion("assertive", error);
    } finally {
      verifying = false;
    }
  }
</script>

<ShellSheet
  {opened}
  {ondismiss}
  ariaLabel={m.twofa_push_enroll_title()}
  title={m.twofa_push_enroll_title()}
>
  <div class="sheet-content">
    <p class="instruction-text">{m.twofa_push_enroll_desc()}</p>

    <Button
      large
      onclick={() => {
        void handleVerify();
      }}
      disabled={verifying}
    >
      {#if verifying}
        <span class="verifying-row">
          <Preloader class="w-5 h-5" />
          {m.twofa_push_waiting()}
        </span>
      {:else}
        {m.twofa_push_enroll_verify()}
      {/if}
    </Button>

    {#if error !== ""}
      <div class="error-slot">
        <FieldError message={error} />
      </div>
    {/if}
  </div>
</ShellSheet>

<style>
  .sheet-content {
    padding: var(--space-md) var(--space-lg) var(--space-lg);
  }

  .instruction-text {
    font-size: 0.9rem;
    color: var(--ink);
    margin-bottom: var(--space-lg);
  }

  .verifying-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .error-slot {
    text-align: center;
    margin-top: var(--space-md);
  }
</style>
