<script lang="ts">
  /* eslint-disable security/detect-object-injection -- all Record access uses typed LangCode/keyof TerminologyLabels constants, not user input */
  import { SvelteSet } from "svelte/reactivity";
  import {
    Card,
    List,
    ListInput,
    Preloader,
    Segmented,
    SegmentedButton,
  } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { Save, Languages, RotateCcw } from "@lucide/svelte";
  import {
    TERMINOLOGY_DEFAULTS,
    TERMINOLOGY_DEFAULTS_EN,
    TERMINOLOGY_SUGGESTIONS,
    terminologyConfigSchema,
    type TerminologyConfig,
    type TerminologyLabels,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { getOrgDecryptCache, getOrgKeyManager } from "$lib/crypto/context.js";
  import { base64ToUint8Array } from "$lib/utils/buffer-encoding.js";
  import { cacheTerminology, normalizeLabels } from "$lib/terminology/index.js";
  import { capitalize } from "$lib/terminology/with-terms.js";
  import { requireRouter } from "$lib/errors.js";
  import type { BrandingField } from "@care-y/shared";
  import QueryError from "$lib/components/QueryError.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  interface Props {
    externalSave?: boolean;
  }

  let { externalSave = false }: Props = $props();

  export function isDirty(): boolean {
    return hasChanges;
  }

  export async function save(): Promise<void> {
    await handleSave();
  }

  const brandingRouter = requireRouter(trpc.branding, "branding");

  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();

  const LANGS = ["en", "es"] as const;
  type LangCode = (typeof LANGS)[number];

  const LANG_LABELS: Record<LangCode, () => string> = {
    en: m.admin_terminology_lang_en,
    es: m.admin_terminology_lang_es,
  };

  interface TermGroup {
    readonly key: string;
    readonly singularField: keyof TerminologyLabels;
    readonly pluralField: keyof TerminologyLabels | null;
    readonly label: () => string;
    readonly desc: () => string;
  }

  const TERM_GROUPS: readonly TermGroup[] = [
    {
      key: "volunteer",
      singularField: "volunteer",
      pluralField: "volunteers",
      label: m.admin_terminology_group_volunteer,
      desc: m.admin_terminology_desc_volunteer,
    },
    {
      key: "manager",
      singularField: "manager",
      pluralField: "managers",
      label: m.admin_terminology_group_manager,
      desc: m.admin_terminology_desc_manager,
    },
    {
      key: "client",
      singularField: "client",
      pluralField: "clients",
      label: m.admin_terminology_group_client,
      desc: m.admin_terminology_desc_client,
    },
    {
      key: "ticket",
      singularField: "ticket",
      pluralField: "tickets",
      label: m.admin_terminology_group_ticket,
      desc: m.admin_terminology_desc_ticket,
    },
    {
      key: "queue",
      singularField: "queue",
      pluralField: "queues",
      label: m.admin_terminology_group_queue,
      desc: m.admin_terminology_desc_queue,
    },
    {
      key: "knowledgeBase",
      singularField: "knowledgeBase",
      pluralField: null,
      label: m.admin_terminology_group_kb,
      desc: m.admin_terminology_desc_kb,
    },
  ];

  // ── Query ──

  const brandingQuery = createQuery(() => ({
    queryKey: adminKeys.branding(),
    queryFn: async () => brandingRouter.getBranding.query(),
  }));

  function base64FieldToBytes(value: string | null): Uint8Array | null {
    return value !== null && value !== "" ? base64ToUint8Array(value) : null;
  }

  const decryptedTerminologyJson = $derived(
    orgCache.decrypt(
      "branding:terminology",
      base64FieldToBytes(brandingQuery.data?.encryptedTerminology ?? null),
    ),
  );

  const serverConfig = $derived.by((): TerminologyConfig | null => {
    if (decryptedTerminologyJson === null) return null;
    try {
      const parsed: unknown = JSON.parse(decryptedTerminologyJson);
      const result = terminologyConfigSchema.safeParse(parsed);
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  });

  function displayLabel(
    field: keyof TerminologyLabels,
    lang: LangCode,
  ): string {
    let value: string;
    if (serverConfig !== null) {
      const langLabels = serverConfig[lang];
      value = langLabels ? langLabels[field] : TERMINOLOGY_DEFAULTS_EN[field];
    } else {
      const defaults = TERMINOLOGY_DEFAULTS[lang];
      value = defaults ? defaults[field] : TERMINOLOGY_DEFAULTS_EN[field];
    }
    return capitalize(value);
  }

  // ── Auto-pluralization ──

  function autoPlural(singular: string, lang: string): string {
    const s = singular.trim();
    if (s === "") return "";
    if (lang === "es") {
      if (/[aeiouáéíóú]$/i.test(s)) return s + "s";
      return s + "es";
    }
    if (/(?:s|sh|ch|x|z)$/i.test(s)) return s + "es";
    if (/[^aeiou]y$/i.test(s)) return s.slice(0, -1) + "ies";
    return s + "s";
  }

  const pluralTouched = new SvelteSet<string>();

  function pluralKey(lang: LangCode, field: string): string {
    return `${lang}:${field}`;
  }

  // ── Sheet state ──

  let sheetOpened = $state(false);
  let activeLang = $state<LangCode>("en");

  type EditState = Record<LangCode, TerminologyLabels>;

  const esDefaults = TERMINOLOGY_DEFAULTS.es ?? TERMINOLOGY_DEFAULTS_EN;
  let editState = $state<EditState>({
    en: { ...TERMINOLOGY_DEFAULTS_EN },
    es: { ...esDefaults },
  });

  function openSheet(): void {
    pluralTouched.clear();
    for (const lang of LANGS) {
      if (serverConfig?.[lang]) {
        editState[lang] = { ...serverConfig[lang] };
        for (const group of TERM_GROUPS) {
          if (group.pluralField === null) continue;
          const singular = serverConfig[lang][group.singularField];
          const plural = serverConfig[lang][group.pluralField];
          if (plural !== autoPlural(singular, lang)) {
            pluralTouched.add(pluralKey(lang, group.key));
          }
        }
      } else {
        const defaults = TERMINOLOGY_DEFAULTS[lang];
        editState[lang] = defaults
          ? { ...defaults }
          : { ...TERMINOLOGY_DEFAULTS_EN };
      }
    }
    activeLang = "en";
    sheetOpened = true;
  }

  function closeSheet(): void {
    sheetOpened = false;
  }

  // ── Change detection ──

  const hasChanges = $derived.by(() => {
    for (const lang of LANGS) {
      const current =
        serverConfig?.[lang] ??
        TERMINOLOGY_DEFAULTS[lang] ??
        TERMINOLOGY_DEFAULTS_EN;
      const edited = editState[lang];
      for (const group of TERM_GROUPS) {
        if (edited[group.singularField] !== current[group.singularField])
          return true;
        if (
          group.pluralField !== null &&
          edited[group.pluralField] !== current[group.pluralField]
        )
          return true;
      }
    }
    return false;
  });

  function suggestionsHint(
    key: keyof typeof TERMINOLOGY_SUGGESTIONS,
  ): string | undefined {
    const suggestions = TERMINOLOGY_SUGGESTIONS[key];
    if (!suggestions || suggestions.length === 0) return undefined;
    return `${m.admin_terminology_suggestions_label()}: ${suggestions.join(", ")}`;
  }

  // ── Encrypt + save ──

  const saveMutation = createMutation(() => ({
    mutationFn: async (
      fields: {
        field: BrandingField;
        encryptedValue: string;
      }[],
    ) => {
      for (const f of fields) {
        await brandingRouter.saveBrandingField.mutate({
          field: f.field,
          encryptedValue: f.encryptedValue,
        });
      }
    },
    onSuccess: () => {
      haptic();
      orgCache.delete("branding:terminology");
      toastStore.show(m.admin_terminology_saved());
      announceToLiveRegion("polite", m.admin_terminology_saved());

      const newConfig: TerminologyConfig = {};
      for (const lang of LANGS) {
        newConfig[lang] = { ...editState[lang] };
      }
      cacheTerminology(newConfig);

      closeSheet();
      void queryClient.invalidateQueries({ queryKey: adminKeys.branding() });
    },
    onError: () => {
      toastStore.show(m.admin_terminology_error(), 3000);
    },
  }));

  async function handleSave(): Promise<void> {
    if (!hasChanges) return;

    const config: TerminologyConfig = {};
    for (const lang of LANGS) {
      config[lang] = normalizeLabels(editState[lang]);
    }

    const json = JSON.stringify(config);
    const encryptedValue = await orgKeyManager.encryptText(json);

    saveMutation.mutate([{ field: "terminology", encryptedValue }]);
  }

  function handleResetLang(): void {
    const defaults = TERMINOLOGY_DEFAULTS[activeLang];
    editState[activeLang] = defaults
      ? { ...defaults }
      : { ...TERMINOLOGY_DEFAULTS_EN };
    for (const group of TERM_GROUPS) {
      pluralTouched.delete(pluralKey(activeLang, group.key));
    }
  }
</script>

<div class="terminology-section">
  {#if brandingQuery.isLoading}
    <Card raised contentWrap={false} class="terminology-card">
      <div class="terminology-inner">
        <p class="section-desc">{m.admin_terminology_description()}</p>
        {#each TERM_GROUPS as group (group.key)}
          <div class="term-row">
            <span class="term-label">{group.label()}</span>
            <DecryptPlaceholder length={12} />
          </div>
        {/each}
      </div>
    </Card>
  {:else if brandingQuery.isError}
    <QueryError
      error={brandingQuery.error}
      onretry={() => void brandingQuery.refetch()}
    />
  {:else}
    <Card raised contentWrap={false} class="terminology-card">
      <div
        class="terminology-inner"
        role="region"
        aria-label={m.admin_terminology_title()}
      >
        <p class="section-desc">{m.admin_terminology_description()}</p>

        {#each TERM_GROUPS as group (group.key)}
          <div class="term-row">
            <span class="term-label">{group.label()}</span>
            <span class="term-value">
              {displayLabel(group.singularField, "en")}
              {#if group.pluralField !== null}
                / {displayLabel(group.pluralField, "en")}
              {/if}
            </span>
          </div>
        {/each}

        <div class="edit-action">
          <SoftButton onclick={openSheet} full>
            <Languages size={18} aria-hidden="true" />
            {m.admin_terminology_edit_button()}
          </SoftButton>
        </div>
      </div>
    </Card>
  {/if}
</div>

<!-- Edit Terminology Sheet -->
<ShellSheet
  opened={sheetOpened}
  ondismiss={closeSheet}
  title={m.admin_terminology_sheet_title()}
>
  {#snippet headerRight()}
    <SoftButton
      disabled={!hasChanges || saveMutation.isPending}
      onclick={() => void handleSave()}
    >
      {#if saveMutation.isPending}
        <Preloader class="w-4 h-4" />
      {:else}
        <Save size={16} aria-hidden="true" />
      {/if}
      {m.admin_terminology_save()}
    </SoftButton>
  {/snippet}

  <div class="sheet-inner">
    <!-- Language tabs -->
    <Segmented strong class="lang-tabs">
      {#each LANGS as lang (lang)}
        <SegmentedButton
          active={activeLang === lang}
          onclick={() => {
            activeLang = lang;
          }}
        >
          {LANG_LABELS[lang]()}
        </SegmentedButton>
      {/each}
    </Segmented>

    <div class="reset-row">
      <button
        type="button"
        class="reset-btn touch-feedback"
        onclick={handleResetLang}
      >
        <RotateCcw size={14} aria-hidden="true" />
        {m.admin_terminology_reset({ language: LANG_LABELS[activeLang]() })}
      </button>
    </div>

    <!-- Term groups -->
    {#each TERM_GROUPS as group (group.key)}
      <div class="sheet-group">
        <span class="group-label">{group.label()}</span>
        <span class="group-desc">{group.desc()}</span>
        <List nested class="term-list">
          <ListInput
            outline
            label={m.admin_terminology_singular()}
            type="text"
            value={editState[activeLang][group.singularField]}
            onInput={(e: Event) => {
              if (e.target instanceof HTMLInputElement) {
                editState[activeLang][group.singularField] = e.target.value;
                if (
                  group.pluralField !== null &&
                  !pluralTouched.has(pluralKey(activeLang, group.key))
                ) {
                  editState[activeLang][group.pluralField] = autoPlural(
                    e.target.value,
                    activeLang,
                  );
                }
              }
            }}
            disabled={saveMutation.isPending}
          />
          {#if group.pluralField !== null}
            <ListInput
              outline
              label={m.admin_terminology_plural()}
              type="text"
              value={editState[activeLang][group.pluralField]}
              onInput={(e: Event) => {
                if (
                  e.target instanceof HTMLInputElement &&
                  group.pluralField !== null
                ) {
                  editState[activeLang][group.pluralField] = e.target.value;
                  pluralTouched.add(pluralKey(activeLang, group.key));
                }
              }}
              disabled={saveMutation.isPending}
            />
          {/if}
        </List>
        {#if suggestionsHint(group.key)}
          <span class="group-suggestions">{suggestionsHint(group.key)}</span>
        {/if}
      </div>
    {/each}
  </div>
</ShellSheet>

<style>
  .terminology-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) 0;
  }

  :global(.terminology-card) {
    margin: 0 !important;
  }

  .terminology-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--card-pad-y) var(--card-pad-x);
  }

  .section-desc {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
  }

  .term-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    padding: 0.25rem 0;
  }

  .term-label {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
  }

  .term-value {
    font-size: var(--text-sm);
    color: var(--ink);
  }

  .edit-action {
    padding-top: var(--space-sm);
  }

  /* ── Sheet ── */

  .sheet-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: var(--space-md) var(--space-lg);
    padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
  }

  :global(.lang-tabs) {
    width: 100%;
  }

  .reset-row {
    display: flex;
    justify-content: flex-end;
  }

  .reset-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: var(--text-xs);
    color: var(--muted);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    min-height: 32px;
  }

  .reset-btn:active {
    background: color-mix(in srgb, var(--ink) 8%, transparent);
  }

  .sheet-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .group-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
  }

  .group-desc {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.4;
  }

  .group-suggestions {
    font-size: var(--text-xs);
    color: var(--muted);
    line-height: 1.4;
  }

  :global(.term-list) {
    margin: 0 !important;
  }
</style>
