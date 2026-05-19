<script lang="ts">
  import { Button, Block, BlockTitle, Preloader } from "konsta/svelte";
  import { createMutation } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { requireRouter } from "$lib/errors.js";
  import TelephonyModePicker from "$lib/components/shared/TelephonyModePicker.svelte";

  interface Props {
    oncomplete: (data: { telephonyMode: "byot" | "managed" | "skip" }) => void;
  }

  let { oncomplete }: Props = $props();

  const onboarding = requireRouter(trpc.onboarding, "onboarding");

  type TelephonyMode = "byot" | "managed" | "skip";

  let mode = $state<TelephonyMode>("skip");
  let accountSid = $state("");
  let authToken = $state("");
  let error = $state("");

  const byotValid = $derived(
    accountSid.trim().length > 0 && authToken.trim().length > 0,
  );

  const saveMut = createMutation(() => ({
    mutationFn: async (
      input:
        | { mode: "byot"; accountSid: string; authToken: string }
        | { mode: "managed" }
        | { mode: "skip" },
    ) => onboarding.saveTelephonyChoice.mutate(input),
    onSuccess: (_data, variables) => {
      haptic();
      toastStore.show(m.onboarding_telephony_saved());
      announceToLiveRegion("polite", m.onboarding_telephony_saved());
      oncomplete({ telephonyMode: variables.mode });
    },
    onError: () => {
      error = m.onboarding_telephony_error();
      toastStore.show(m.onboarding_telephony_error(), 3000);
      announceToLiveRegion("assertive", m.onboarding_telephony_error());
    },
  }));

  const canSubmit = $derived(
    !saveMut.isPending && (mode !== "byot" || byotValid),
  );

  function handleSubmit(e: SubmitEvent): void {
    e.preventDefault();
    error = "";

    if (mode === "byot") {
      if (accountSid.trim().length === 0) {
        error = m.onboarding_telephony_error_sid_required();
        return;
      }
      if (authToken.trim().length === 0) {
        error = m.onboarding_telephony_error_token_required();
        return;
      }
    }

    if (mode === "skip") {
      oncomplete({ telephonyMode: "skip" });
      return;
    }

    if (mode === "byot") {
      saveMut.mutate({
        mode: "byot",
        accountSid: accountSid.trim(),
        authToken: authToken.trim(),
      });
    } else {
      saveMut.mutate({ mode: "managed" });
    }
  }
</script>

<BlockTitle medium>{m.onboarding_telephony_heading()}</BlockTitle>
<Block>
  <p class="step-desc">{m.onboarding_telephony_subtext()}</p>
</Block>

<form onsubmit={handleSubmit}>
  {#if error}
    <Block>
      <p class="step-error" role="alert">{error}</p>
    </Block>
  {/if}

  <TelephonyModePicker
    {mode}
    onmodechange={(v: TelephonyMode) => (mode = v)}
    {accountSid}
    onsidchange={(v: string) => (accountSid = v)}
    {authToken}
    ontokenchange={(v: string) => (authToken = v)}
    disabled={saveMut.isPending}
  />

  <Block>
    <Button large type="submit" disabled={!canSubmit}>
      {#if saveMut.isPending}
        <Preloader class="w-5 h-5" />
      {:else}
        {m.onboarding_telephony_submit()}
      {/if}
    </Button>
  </Block>
</form>
