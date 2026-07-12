<script lang="ts">
  import { untrack } from "svelte";
  import { List, ListInput, Block, Button, Preloader } from "konsta/svelte";
  import Register from "$lib/components/Register.svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { isOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";
  import { MAX_ESCALATION_DAYS } from "@care-y/shared";

  interface QueueFormProps {
    readonly mode: "create" | "edit";
    readonly initialName?: string;
    readonly initialEscalation?: number;
    readonly disabled?: boolean;
    readonly formId?: string;
    readonly submitLabel?: string;
    readonly onsubmit: (data: {
      encryptedName: string;
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
    disabled = false,
    formId,
    submitLabel,
    onsubmit,
    onstatechange,
  }: QueueFormProps = $props();

  const orgKeyManager = getOrgKeyManager();

  let queueName = $state("");
  let escalationDays = $state("");
  let error = $state("");
  let submitting = $state(false);

  const isCreate = $derived(mode === "create");
  const minDays = $derived(isCreate ? 1 : 0);
  const defaultPlaceholder = $derived(isCreate ? "7" : "0");

  let prevInitName: string | undefined;
  let prevInitEsc: number | undefined;

  $effect(() => {
    const name = initialName;
    const esc = initialEscalation;
    const pn = untrack(() => prevInitName);
    const pe = untrack(() => prevInitEsc);
    if (name !== pn || esc !== pe) {
      queueName = name;
      escalationDays = esc !== undefined ? String(esc) : "";
      prevInitName = name;
      prevInitEsc = esc;
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
        (initialEscalation !== undefined ? String(initialEscalation) : ""),
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
      const encryptedName = await orgKeyManager.encryptText(queueName.trim());
      await onsubmit({ encryptedName, escalateDays: parsedDays });
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
