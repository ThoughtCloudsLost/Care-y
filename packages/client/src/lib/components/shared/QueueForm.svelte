<script lang="ts">
  import { untrack } from "svelte";
  import { List, ListInput, Block, Button, Preloader } from "konsta/svelte";
  import Register from "$lib/components/Register.svelte";
  import ColorPicker from "$lib/components/inputs/ColorPicker.svelte";
  import IconPicker from "$lib/components/inputs/IconPicker.svelte";
  import {
    PICKER_COLORS,
    PICKER_ICONS,
  } from "$lib/components/inputs/picker-options.js";
  import {
    QUEUE_DEFAULT_COLOR,
    QUEUE_DEFAULT_ICON,
  } from "$lib/utils/queue-appearance.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { isOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";
  import { MAX_ESCALATION_DAYS } from "@care-y/shared";

  interface QueueFormProps {
    readonly mode: "create" | "edit";
    readonly initialName?: string;
    readonly initialEscalation?: number;
    readonly initialColor?: string;
    readonly initialIcon?: string;
    readonly disabled?: boolean;
    readonly formId?: string;
    readonly submitLabel?: string;
    readonly onsubmit: (data: {
      encryptedName: string;
      encryptedColor: string;
      encryptedIcon: string;
      escalateDays: number;
    }) => void | Promise<void>;
    readonly onstatechange?: (state: {
      canSubmit: boolean;
      isPending: boolean;
    }) => void;
  }

  let {
    mode,
    initialName = "",
    initialEscalation,
    initialColor,
    initialIcon,
    disabled = false,
    formId,
    submitLabel,
    onsubmit,
    onstatechange,
  }: QueueFormProps = $props();

  const orgKeyManager = getOrgKeyManager();

  let queueName = $state("");
  let escalationDays = $state("");
  let queueColor = $state<string>(QUEUE_DEFAULT_COLOR);
  let queueIcon = $state<string>(QUEUE_DEFAULT_ICON);
  let error = $state("");
  let submitting = $state(false);

  const isCreate = $derived(mode === "create");
  const minDays = $derived(isCreate ? 1 : 0);
  const defaultPlaceholder = $derived(isCreate ? "7" : "0");

  let prevInitName: string | undefined;
  let prevInitEsc: number | undefined;
  let prevInitColor: string | undefined;
  let prevInitIcon: string | undefined;

  $effect(() => {
    const name = initialName;
    const esc = initialEscalation;
    const color = initialColor;
    const icon = initialIcon;
    const pn = untrack(() => prevInitName);
    const pe = untrack(() => prevInitEsc);
    const pc = untrack(() => prevInitColor);
    const pi = untrack(() => prevInitIcon);
    if (name !== pn || esc !== pe || color !== pc || icon !== pi) {
      queueName = name;
      escalationDays = esc !== undefined ? String(esc) : "";
      queueColor = color ?? QUEUE_DEFAULT_COLOR;
      queueIcon = icon ?? QUEUE_DEFAULT_ICON;
      prevInitName = name;
      prevInitEsc = esc;
      prevInitColor = color;
      prevInitIcon = icon;
    }
  });

  const nameEmpty = $derived(queueName.trim().length === 0);

  const parsedDays = $derived.by((): number => {
    const trimmed = escalationDays.trim();
    if (trimmed === "") return isCreate ? 7 : 0;
    const n = Number(trimmed);
    if (!Number.isInteger(n) || n < minDays || n > MAX_ESCALATION_DAYS)
      return -1;
    return n;
  });

  const daysValid = $derived(parsedDays >= minDays);

  const hasChanges = $derived(
    isCreate ||
      queueName !== initialName ||
      escalationDays !==
        (initialEscalation !== undefined ? String(initialEscalation) : "") ||
      queueColor !== (initialColor ?? QUEUE_DEFAULT_COLOR) ||
      queueIcon !== (initialIcon ?? QUEUE_DEFAULT_ICON),
  );

  const orgKeyLoaded = $derived(isOrgKeyReady());

  const canSubmit = $derived(
    orgKeyLoaded && !nameEmpty && daysValid && hasChanges && !submitting,
  );

  $effect(() => {
    onstatechange?.({ canSubmit, isPending: submitting });
  });

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    if (!canSubmit || disabled) return;

    error = "";

    if (nameEmpty) {
      error = m.admin_queue_editor_name_required(withTerms());
      return;
    }
    if (!daysValid) {
      error = m.admin_queue_editor_escalation_range({ min: String(minDays) });
      return;
    }

    submitting = true;
    try {
      const [encryptedName, encryptedColor, encryptedIcon] = await Promise.all([
        orgKeyManager.encryptText(queueName.trim()),
        orgKeyManager.encryptText(queueColor),
        orgKeyManager.encryptText(queueIcon),
      ]);
      await onsubmit({
        encryptedName,
        encryptedColor,
        encryptedIcon,
        escalateDays: parsedDays,
      });
    } catch {
      error = m.error_generic();
    } finally {
      submitting = false;
    }
  }
</script>

<form onsubmit={handleSubmit} id={formId} data-testid="queue-form">
  {#if error}
    <Block>
      <p class="text-sm text-[--color-red-500]" role="alert">{error}</p>
    </Block>
  {/if}

  {#if !orgKeyLoaded}
    <Block>
      <Register kind="careful" role="alert">
        {m.admin_queue_editor_no_org_key(withTerms())}
      </Register>
    </Block>
  {/if}

  <List strong inset>
    <ListInput
      label={m.admin_queue_editor_name_label(withTerms())}
      type="text"
      placeholder={m.admin_queue_editor_name_placeholder()}
      value={queueName}
      oninput={(e: Event) => {
        if (e.target instanceof HTMLInputElement) queueName = e.target.value;
      }}
      disabled={!orgKeyLoaded || disabled || submitting}
    />

    <ListInput
      label={m.admin_queue_editor_escalation_label()}
      type="number"
      placeholder={defaultPlaceholder}
      value={escalationDays}
      oninput={(e: Event) => {
        if (e.target instanceof HTMLInputElement)
          escalationDays = e.target.value;
      }}
      info={m.admin_queue_editor_escalation_hint(withTerms())}
      disabled={!orgKeyLoaded || disabled || submitting}
    />
  </List>

  <Block>
    <div class="picker-section">
      <span class="picker-label">{m.admin_queue_editor_color_label()}</span>
      <ColorPicker
        options={PICKER_COLORS}
        bind:value={queueColor}
        label={m.admin_queue_editor_color_label()}
        disabled={!orgKeyLoaded || disabled || submitting}
      />
    </div>

    <div class="picker-section">
      <span class="picker-label">{m.admin_queue_editor_icon_label()}</span>
      <IconPicker
        options={PICKER_ICONS}
        bind:value={queueIcon}
        label={m.admin_queue_editor_icon_label()}
        disabled={!orgKeyLoaded || disabled || submitting}
      />
    </div>
  </Block>

  <Block>
    <Register kind="careful">
      {m.admin_queue_editor_pii_warning(withTerms())}
    </Register>
  </Block>

  {#if submitLabel}
    <Block>
      <Button large type="submit" disabled={!canSubmit || disabled}>
        {#if submitting}
          <Preloader class="w-5 h-5" />
        {:else}
          {submitLabel}
        {/if}
      </Button>
    </Block>
  {/if}
</form>

<style>
  .picker-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .picker-section + .picker-section {
    margin-top: var(--space-lg);
  }

  .picker-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
</style>
