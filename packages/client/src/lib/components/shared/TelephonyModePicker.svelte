<script lang="ts">
  import { List, ListItem, ListInput, Radio } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  type TelephonyMode = "byot" | "managed" | "skip";

  interface TelephonyModePickerProps {
    readonly mode: TelephonyMode;
    readonly onmodechange: (mode: TelephonyMode) => void;
    readonly accountSid?: string;
    readonly onsidchange?: (sid: string) => void;
    readonly authToken?: string;
    readonly ontokenchange?: (token: string) => void;
    readonly showSkip?: boolean;
    readonly disabled?: boolean;
  }

  let {
    mode,
    onmodechange,
    accountSid = "",
    onsidchange,
    authToken = "",
    ontokenchange,
    showSkip = true,
    disabled = false,
  }: TelephonyModePickerProps = $props();

  const isByot = $derived(mode === "byot");
</script>

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
        onChange={() => onmodechange("byot")}
        {disabled}
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
        onChange={() => onmodechange("managed")}
        {disabled}
      />
    {/snippet}
  </ListItem>

  {#if showSkip}
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
          onChange={() => onmodechange("skip")}
          {disabled}
        />
      {/snippet}
    </ListItem>
  {/if}
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
        if (e.target instanceof HTMLInputElement) onsidchange?.(e.target.value);
      }}
      {disabled}
    />

    <ListInput
      outline
      label={m.onboarding_telephony_token_label()}
      type="password"
      placeholder={m.onboarding_telephony_token_placeholder()}
      value={authToken}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLInputElement)
          ontokenchange?.(e.target.value);
      }}
      {disabled}
    />
  </List>
{/if}
