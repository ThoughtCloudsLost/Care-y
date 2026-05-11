<!--
  SetupTelephony: wizard step 5 (telephony mode selection).

  Three choices: BYOT (bring your own Twilio), Managed, or Skip.
  BYOT reveals credential inputs. Credentials are sent over TLS and
  encrypted server-side with OPS_SECRETS_KEY before DB storage.
-->
<script lang="ts">
  import {
    List,
    ListItem,
    ListInput,
    Button,
    Block,
    Preloader,
    Radio,
  } from "konsta/svelte";
  import { createMutation } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { RouterNotAvailableError } from "$lib/errors.js";

  interface Props {
    oncomplete: (data: { telephonyMode: "byot" | "managed" | "skip" }) => void;
  }

  let { oncomplete }: Props = $props();

  const onboarding = trpc.onboarding;
  if (!onboarding) {
    throw new RouterNotAvailableError("onboarding");
  }

  type TelephonyMode = "byot" | "managed" | "skip";

  let mode = $state<TelephonyMode>("skip");
  let accountSid = $state("");
  let authToken = $state("");
  let error = $state("");

  const isByot = $derived(mode === "byot");

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

<Block>
  <h2 class="step-heading">{m.onboarding_telephony_heading()}</h2>
  <p class="step-subtext">{m.onboarding_telephony_subtext()}</p>
</Block>

<form onsubmit={handleSubmit}>
  {#if error}
    <Block>
      <p class="error-text" role="alert">{error}</p>
    </Block>
  {/if}

  <List strong inset>
    <ListItem
      label
      title={m.onboarding_telephony_byot_label()}
      text={m.onboarding_telephony_byot_description()}
    >
      {#snippet media()}
        <Radio
          component="div"
          name="telephony-mode"
          value="byot"
          checked={mode === "byot"}
          onChange={() => (mode = "byot")}
        />
      {/snippet}
    </ListItem>

    <ListItem
      label
      title={m.onboarding_telephony_managed_label()}
      text={m.onboarding_telephony_managed_description()}
    >
      {#snippet media()}
        <Radio
          component="div"
          name="telephony-mode"
          value="managed"
          checked={mode === "managed"}
          onChange={() => (mode = "managed")}
        />
      {/snippet}
    </ListItem>

    <ListItem
      label
      title={m.onboarding_telephony_skip_label()}
      text={m.onboarding_telephony_skip_description()}
    >
      {#snippet media()}
        <Radio
          component="div"
          name="telephony-mode"
          value="skip"
          checked={mode === "skip"}
          onChange={() => (mode = "skip")}
        />
      {/snippet}
    </ListItem>
  </List>

  {#if isByot}
    <List strong inset>
      <ListInput
        outline
        label={m.onboarding_telephony_sid_label()}
        type="text"
        placeholder={m.onboarding_telephony_sid_placeholder()}
        value={accountSid}
        onInput={(e: Event) => {
          if (e.target instanceof HTMLInputElement) accountSid = e.target.value;
        }}
        disabled={saveMut.isPending}
      />

      <ListInput
        outline
        label={m.onboarding_telephony_token_label()}
        type="password"
        placeholder={m.onboarding_telephony_token_placeholder()}
        value={authToken}
        onInput={(e: Event) => {
          if (e.target instanceof HTMLInputElement) authToken = e.target.value;
        }}
        disabled={saveMut.isPending}
      />
    </List>
  {/if}

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

<style>
  .step-heading {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--ink, #1f2937);
    margin: 0 0 0.25rem;
  }

  .step-subtext {
    font-size: 0.875rem;
    color: var(--muted, #6b7280);
    margin: 0;
  }

  .error-text {
    font-size: 0.875rem;
    color: var(--error, #dc2626);
  }
</style>
