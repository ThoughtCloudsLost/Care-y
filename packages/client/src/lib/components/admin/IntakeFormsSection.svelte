<!--
  Admin intake forms list section (Organization page). Mirrors the follow-up
  types card anatomy (raised card, section description, icon rows with
  name/sub lines, divider, tonal add action). Rows link to the intake form
  editor page; the active toggle sits outside the link so both stay
  independently operable. When web intake is enabled and no active custom
  form is marked default, a read-only row surfaces the built-in default form
  that /intake serves.

  Supports duplication: loads an existing form, mints fresh field and option
  keys, suffixes the name, clears the slug, and saves as a new form.
-->
<script lang="ts">
  import { resolve } from "$app/paths";
  import { Card, Toggle } from "konsta/svelte";
  import {
    createMutation,
    createQuery,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { ClipboardList, FileText, Globe, Plus, Copy } from "@lucide/svelte";
  import {
    intakeFieldTypeSchema,
    intakeFieldRoleSchema,
    intakeFieldConfigSchema,
    type IntakeFieldConfig,
    type IntakeOption,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { intakeFormKeys } from "$lib/query/keys.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { getErrorMessage } from "$lib/components/query-error-messages.js";
  import { getOrgKeyManager, getOrgDecryptCache } from "$lib/crypto/context.js";
  import {
    decryptFieldContent,
    decryptFormMeta,
    encryptFieldContent,
    encryptFormMeta,
  } from "$lib/portal/intake-form-crypto.js";
  import { haptic } from "$lib/utils/haptic.js";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import QueryError from "$lib/components/QueryError.svelte";

  const intakeFormsRouter = requireRouter(trpc.intakeForms, "intakeForms");
  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();

  let duplicatingFormId = $state<string | null>(null);

  const formsQuery = createQuery(() => ({
    queryKey: intakeFormKeys.list(),
    queryFn: async () => {
      const result = await intakeFormsRouter.list.query();
      return result.forms;
    },
  }));

  // Queue list for resolving destination queue names
  const queuesQuery = createQuery(() => ({
    queryKey: ["queues"] as const,
    queryFn: async () => ticketRouter.listQueues.query(),
  }));

  function getQueueName(queueId: string): string {
    const queues = queuesQuery.data;
    if (!queues) return queueId.slice(0, 8);
    const queue = queues.find((q: { id: string }) => q.id === queueId);
    if (!queue) return queueId.slice(0, 8);
    return (
      orgCache.decrypt(`queue:${queue.id}`, queue.encryptedName) ??
      queueId.slice(0, 8)
    );
  }

  // Web intake enabled toggle
  const webIntakeQuery = createQuery(() => ({
    queryKey: [...intakeFormKeys.all, "webIntakeEnabled"] as const,
    queryFn: async () => {
      const result = await intakeFormsRouter.getWebIntakeEnabled.query();
      return result.enabled;
    },
  }));

  const webIntakeEnabled = $derived(webIntakeQuery.data ?? true);

  const webIntakeToggleMutation = createMutation(() => ({
    mutationFn: async (enabled: boolean) =>
      intakeFormsRouter.setWebIntakeEnabled.mutate({ enabled }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: intakeFormKeys.all,
      });
    },
    onError: (err: unknown) => {
      toastStore.show(getErrorMessage(err));
    },
  }));

  const setActiveMutation = createMutation(() => ({
    mutationFn: async (input: { formId: string; active: boolean }) =>
      intakeFormsRouter.setActive.mutate(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: intakeFormKeys.all,
      });
    },
    onError: (err: unknown) => {
      toastStore.show(getErrorMessage(err));
    },
  }));

  /** The built-in form serves /intake only while no active custom form is default. */
  const showBuiltinDefault = $derived(
    webIntakeEnabled &&
      !(formsQuery.data ?? []).some((f) => f.isDefault && f.isActive),
  );

  function formSubtitle(form: {
    fieldCount: number;
    slug: string | null;
    destinationQueueId: string | null;
    isDefault: boolean;
  }): string {
    const parts: string[] = [];
    if (form.isDefault) parts.push(m.intake_forms_default_toggle());
    parts.push(m.intake_forms_field_count({ count: String(form.fieldCount) }));
    if (form.slug !== null && form.slug !== "") parts.push(`/${form.slug}`);
    if (form.destinationQueueId !== null && form.destinationQueueId !== "")
      parts.push(getQueueName(form.destinationQueueId));
    return parts.join(" · ");
  }

  /**
   * Mint fresh option keys for a config, preserving labels and remapping
   * any role mappings to the new keys. The result is validated through
   * intakeFieldConfigSchema so branded types (QueueId, TicketPriority)
   * are preserved rather than widened to plain strings.
   */
  function freshOptionKeys(config: IntakeFieldConfig): IntakeFieldConfig {
    if (config.type !== "select" && config.type !== "multiselect") {
      return config;
    }

    // Pair each old option key with its replacement UUID.
    const keyPairs: [string, string][] = [];
    const newOptions: IntakeOption[] = config.options.map((o) => {
      const newKey = crypto.randomUUID();
      keyPairs.push([o.key, newKey]);
      return { key: newKey, label: { ...o.label } };
    });

    // Remap mapping record keys from old option keys to new ones.
    // Values pass through unchanged, preserving branded types from
    // the parsed source config. Object.fromEntries avoids computed-key
    // assignment.
    function remapKeys<V>(rec: Record<string, V>): Record<string, V> {
      const entries: [string, V][] = [];
      for (const [oldKey, value] of Object.entries(rec)) {
        const pair = keyPairs.find(([k]) => k === oldKey);
        if (pair != null) {
          entries.push([pair[1], value]);
        }
      }
      return Object.fromEntries(entries);
    }

    // Build the raw remapped config, then parse through the schema
    // to validate branded mapping value types (QueueId, TicketPriority).
    let raw: Record<string, unknown>;
    if (config.type === "select") {
      raw = {
        ...config,
        options: newOptions,
        ...(config.queueRoutingMapping != null
          ? { queueRoutingMapping: remapKeys(config.queueRoutingMapping) }
          : {}),
        ...(config.urgencyMapping != null
          ? { urgencyMapping: remapKeys(config.urgencyMapping) }
          : {}),
        ...(config.escalationMapping != null
          ? { escalationMapping: remapKeys(config.escalationMapping) }
          : {}),
      };
    } else {
      raw = {
        ...config,
        options: newOptions,
        ...(config.queueRoutingMapping != null
          ? { queueRoutingMapping: remapKeys(config.queueRoutingMapping) }
          : {}),
      };
    }

    // Parse recovers branded types. On validation failure (should not
    // happen with well-formed source data), return the original config
    // unchanged and let the save mutation surface the error.
    const parsed = intakeFieldConfigSchema.safeParse(raw);
    if (!parsed.success) return config;
    return parsed.data;
  }

  /**
   * Duplicate a form: load, decrypt, mint fresh keys, re-encrypt, save as new.
   * Name is suffixed with " (copy)", slug is cleared, isDefault set to false.
   */
  async function duplicateForm(sourceFormId: string): Promise<void> {
    const orgPub = orgKeyManager.getPublicKey();
    if (!orgPub) {
      toastStore.show(m.error_generic());
      return;
    }

    duplicatingFormId = sourceFormId;

    try {
      const formDetail = await intakeFormsRouter.get.query({
        formId: sourceFormId,
      });

      // Decrypt and rebuild fields with fresh keys
      const encryptedFields = formDetail.fields.map(
        (field: {
          fieldKey: string;
          encryptedLabel: string;
          encryptedConfig: string;
          isRequired: boolean;
          fieldType: string;
          role: string | null;
          routingQueueIds: readonly string[] | null;
          escalationRecipientIds: readonly string[] | null;
        }) => {
          const decrypted = decryptFieldContent(
            {
              encryptedLabel: field.encryptedLabel,
              encryptedConfig: field.encryptedConfig,
            },
            orgPub,
          );

          // Mint fresh config with new option keys
          const freshConfig = freshOptionKeys(decrypted.config);
          // Re-encrypt with fresh field key
          const encrypted = encryptFieldContent(
            { label: decrypted.label, config: freshConfig },
            orgPub,
          );

          return {
            fieldKey: crypto.randomUUID(),
            fieldType: intakeFieldTypeSchema.parse(field.fieldType),
            encryptedLabel: encrypted.encryptedLabel,
            encryptedConfig: encrypted.encryptedConfig,
            isRequired: field.isRequired,
            role:
              field.role != null
                ? intakeFieldRoleSchema.parse(field.role)
                : undefined,
            routingQueueIds:
              field.routingQueueIds != null
                ? [...field.routingQueueIds]
                : undefined,
            escalationRecipientIds:
              field.escalationRecipientIds != null
                ? [...field.escalationRecipientIds]
                : undefined,
          };
        },
      );

      // Decrypt and re-encrypt form meta (preserving all locale content)
      let encryptedFormMeta: string | undefined;
      if (
        "encryptedFormMeta" in formDetail &&
        typeof formDetail.encryptedFormMeta === "string"
      ) {
        try {
          const meta = decryptFormMeta(formDetail.encryptedFormMeta, orgPub);
          encryptedFormMeta = encryptFormMeta(meta, orgPub) ?? undefined;
        } catch {
          // Non-fatal: duplicate works without metadata
        }
      }

      const newName = `${formDetail.name} ${m.intake_forms_duplicate_suffix()}`;

      await intakeFormsRouter.save.mutate({
        formId: null,
        name: newName,
        slug: null,
        isDefault: false,
        destinationQueueId: formDetail.destinationQueueId ?? null,
        ...(encryptedFormMeta != null ? { encryptedFormMeta } : {}),
        fields: encryptedFields,
      });

      haptic();
      toastStore.show(m.intake_forms_duplicated());
      announceToLiveRegion("polite", m.intake_forms_duplicated());
      void queryClient.invalidateQueries({
        queryKey: intakeFormKeys.all,
      });
    } catch (err: unknown) {
      toastStore.show(getErrorMessage(err));
    } finally {
      duplicatingFormId = null;
    }
  }
</script>

<Card raised contentWrap={false} class="ifs-card">
  <div class="ifs-card-inner">
    <p class="section-desc">{m.hub_intake_forms_subtitle()}</p>

    <div class="ifs-row">
      <span class="ifs-row-label">
        <Globe size={16} aria-hidden="true" class="ifs-cfg-icon" />
        <span class="ifs-row-text">
          <span>{m.intake_forms_web_intake_enabled()}</span>
          {#if !webIntakeEnabled}
            <span class="ifs-row-sub">
              {m.intake_forms_web_intake_disabled_hint()}
            </span>
          {/if}
        </span>
      </span>
      <Toggle
        checked={webIntakeEnabled}
        onChange={() => webIntakeToggleMutation.mutate(!webIntakeEnabled)}
        aria-label={m.intake_forms_web_intake_enabled()}
      />
    </div>

    <div class="section-divider" role="separator"></div>

    {#if formsQuery.isLoading}
      {#each { length: 2 } as _, i (i)}
        <div class="ifs-row">
          <DecryptPlaceholder length={12} />
        </div>
      {/each}
    {:else if formsQuery.isError}
      <QueryError
        error={formsQuery.error}
        onretry={() => void formsQuery.refetch()}
      />
    {:else if formsQuery.data}
      {#each formsQuery.data as form (form.id)}
        <div class="ifs-row" class:ifs-row-inactive={!form.isActive}>
          <a
            class="ifs-row-link touch-feedback"
            href={resolve(`/admin/forms?id=${encodeURIComponent(form.id)}`)}
          >
            <ClipboardList size={16} aria-hidden="true" class="ifs-cfg-icon" />
            <span class="ifs-row-text">
              <span class="ifs-row-name">
                {form.name}
                {#if !form.isActive}
                  <span class="inactive-badge">{m.intake_forms_inactive()}</span
                  >
                {/if}
              </span>
              <span class="ifs-row-sub">{formSubtitle(form)}</span>
            </span>
          </a>
          <div class="ifs-row-actions">
            <button
              type="button"
              class="ifs-dup-btn"
              disabled={duplicatingFormId === form.id}
              onclick={() => void duplicateForm(form.id)}
              aria-label={m.intake_forms_duplicate_label()}
            >
              <Copy size={14} />
            </button>
            <Toggle
              checked={form.isActive}
              onChange={() =>
                setActiveMutation.mutate({
                  formId: form.id,
                  active: !form.isActive,
                })}
              aria-label={`${form.name} ${form.isActive ? m.intake_forms_active() : m.intake_forms_inactive()}`}
            />
          </div>
        </div>
      {/each}

      {#if showBuiltinDefault}
        <div class="ifs-row">
          <span class="ifs-row-label">
            <FileText size={16} aria-hidden="true" class="ifs-sys-icon" />
            <span class="ifs-row-text">
              <span>{m.intake_forms_default_toggle()}</span>
              <span class="ifs-row-sub">{m.intake_forms_default_hint()}</span>
            </span>
          </span>
        </div>
      {/if}

      {#if formsQuery.data.length === 0 && !showBuiltinDefault}
        <p class="empty-message">{m.intake_forms_empty()}</p>
      {/if}
    {/if}

    <a class="ifs-add-btn touch-feedback" href={resolve("/admin/forms")}>
      <Plus size={16} aria-hidden="true" />
      {m.intake_forms_create()}
    </a>
  </div>
</Card>

<style>
  :global(.ifs-card) {
    margin: var(--space-sm) var(--space-md) !important;
  }

  .ifs-card-inner {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .section-desc {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
    margin-bottom: var(--space-sm);
  }

  .section-divider {
    height: 1px;
    background: var(--paper-deep, var(--surface-2));
    margin: var(--space-md) 0 var(--space-sm);
  }

  .ifs-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    padding: 0.5rem 0;
    min-height: 2.5rem;
  }

  .ifs-row-inactive {
    opacity: 0.5;
  }

  .ifs-row-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    flex: 1;
    color: inherit;
    text-decoration: none;
    border-radius: 0.375rem;
    padding: 0.5rem 0.25rem;
    margin: 0 -0.25rem;
  }

  .ifs-row-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .ifs-row-name {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  /* A deactivated form is a records fact, not an alarm. */
  .inactive-badge {
    font-size: var(--text-xs);
    color: var(--muted);
    font-weight: 600;
    flex-shrink: 0;
  }

  .ifs-row-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .ifs-row-sub {
    font-size: 0.6875rem;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ifs-row-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 4px);
    flex-shrink: 0;
  }

  .ifs-dup-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    color: var(--muted);
    cursor: pointer;
    border-radius: 50%;
    padding: 0;
  }

  .ifs-dup-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .ifs-dup-btn:not(:disabled):active {
    background: color-mix(in srgb, var(--ink) 10%, transparent);
  }

  :global(.ifs-cfg-icon) {
    color: var(--brand-accent, var(--brand-primary));
    flex-shrink: 0;
  }

  :global(.ifs-sys-icon) {
    color: var(--muted);
    flex-shrink: 0;
  }

  .empty-message {
    color: var(--muted);
    font-size: var(--text-sm);
    text-align: center;
    padding: var(--space-md) 0;
  }

  /* Link twin of SoftButton's tonal anatomy (SoftButton is button-only;
     navigation from a content component stays declarative). */
  .ifs-add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm, 8px);
    width: 100%;
    margin-top: var(--space-sm);
    padding: 0.625rem 1.25rem;
    border-radius: 0.75rem;
    background: color-mix(in srgb, var(--ink) 8%, transparent);
    color: var(--ink);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 500;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
    min-height: 44px;
  }

  .ifs-add-btn:active {
    background: color-mix(in srgb, var(--ink) 15%, transparent);
  }

  .ifs-add-btn:focus-visible {
    outline: 2px solid var(--brand-text);
    outline-offset: 2px;
  }
</style>
