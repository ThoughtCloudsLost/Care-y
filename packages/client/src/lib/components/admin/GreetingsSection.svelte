<script lang="ts">
  import {
    Card,
    List,
    ListInput,
    DialogButton,
    Segmented,
    SegmentedButton,
  } from "konsta/svelte";
  import { DIALOG_DESTRUCTIVE_CLASS } from "$lib/components/shared/konsta-classes.js";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { Plus, Pencil, Trash2, Save } from "@lucide/svelte";
  import type { GreetingType, GreetingAudioContentType } from "@care-y/shared";
  import { GREETING_AUDIO_MAX_BYTES } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { ClientError, requireRouter } from "$lib/errors.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import InlineSkeleton from "$lib/components/InlineSkeleton.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import GreetingAudioPreview from "./GreetingAudioPreview.svelte";
  import {
    needsConversion,
    convertToWav,
    isSupportedAudioType,
  } from "$lib/utils/audio-convert.js";
  import {
    LOCALE_OPTIONS,
    friendlyLocaleLabel,
  } from "$lib/admin/locale-options.js";

  // ── Router guards ──

  const telephonyContent = requireRouter(
    trpc.telephonyContent,
    "telephonyContent",
  );
  const telephonyAdmin = requireRouter(trpc.telephonyAdmin, "telephonyAdmin");

  const queryClient = useQueryClient();

  // ── Greeting type metadata ──

  const GREETING_TYPES: readonly {
    readonly value: GreetingType;
    readonly label: () => string;
    readonly help: () => string;
  }[] = [
    {
      value: "answer",
      label: () => m.admin_greetings_type_answer(),
      help: () => m.admin_greetings_type_answer_help(),
    },
    {
      value: "language_prompt",
      label: () => m.admin_greetings_type_language_prompt(),
      help: () => m.admin_greetings_type_language_prompt_help(),
    },
    {
      value: "new_client",
      label: () => m.admin_greetings_type_new_client(),
      help: () => m.admin_greetings_type_new_client_help(),
    },
    {
      value: "existing_client",
      label: () => m.admin_greetings_type_existing_client(),
      help: () => m.admin_greetings_type_existing_client_help(),
    },
    {
      value: "staff_menu",
      label: () => m.admin_greetings_type_staff_menu(),
      help: () => m.admin_greetings_type_staff_menu_help(withTerms()),
    },
  ];

  // ── Queries ──

  const phonesQuery = createQuery(() => ({
    queryKey: adminKeys.telephonyPhones(),
    queryFn: async () => telephonyAdmin.getProvisionedPhones.query(),
  }));

  const phones = $derived(phonesQuery.data ?? []);

  const greetingsQuery = createQuery(() => ({
    queryKey: adminKeys.greetings(),
    queryFn: async () => telephonyContent.listGreetings.query({}),
  }));

  type GreetingRecord = NonNullable<typeof greetingsQuery.data>[number];

  const greetingsByPhone = $derived.by(() => {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- ephemeral Map rebuilt each derivation, not persisted state
    const grouped = new Map<string, GreetingRecord[]>();
    for (const g of greetingsQuery.data ?? []) {
      const existing = grouped.get(g.phoneNumber);
      if (existing) {
        existing.push(g);
      } else {
        grouped.set(g.phoneNumber, [g]);
      }
    }
    return grouped;
  });

  // ── Sheet state ──

  let sheetOpen = $state(false);
  let editingGreeting = $state<GreetingRecord | null>(null);
  let formPhoneNumber = $state("");
  let formType = $state<GreetingType>("answer");
  let formLocale = $state("en");
  let formText = $state("");
  let formMode = $state<"text" | "audio">("text");
  let formAudioFile = $state<File | null>(null);
  let uploadPhase = $state<"converting" | "uploading" | null>(null);

  const AUDIO_CONTENT_TYPE_MAP: Record<string, GreetingAudioContentType> = {
    "audio/wav": "audio/wav",
    "audio/wave": "audio/wav",
    "audio/x-wav": "audio/wav",
    "audio/mpeg": "audio/mpeg",
    "audio/mp3": "audio/mpeg",
    "audio/ogg": "audio/ogg",
    "audio/vorbis": "audio/ogg",
  };

  function resolveAudioContentType(
    mimeType: string,
  ): GreetingAudioContentType | null {
    return AUDIO_CONTENT_TYPE_MAP[mimeType.toLowerCase()] ?? null;
  }

  function resetForm(): void {
    editingGreeting = null;
    formPhoneNumber = phones[0]?.number ?? "";
    formType = "answer";
    formLocale = "en";
    formText = "";
    formMode = "text";
    formAudioFile = null;
    uploadPhase = null;
  }

  function openAddSheet(phoneNumber?: string): void {
    resetForm();
    if (phoneNumber !== undefined && phoneNumber !== "")
      formPhoneNumber = phoneNumber;
    sheetOpen = true;
  }

  function openEditSheet(greeting: GreetingRecord): void {
    editingGreeting = greeting;
    formPhoneNumber = greeting.phoneNumber;
    const matchedType = GREETING_TYPES.find(
      (t) => t.value === greeting.greetingType,
    );
    if (matchedType) formType = matchedType.value;
    formLocale = greeting.locale;
    formText = greeting.text;
    formMode = greeting.isAudio ? "audio" : "text";
    formAudioFile = null;
    sheetOpen = true;
  }

  const isEditing = $derived(editingGreeting != null);

  const isDuplicate = $derived.by(() => {
    if (isEditing) return false;
    const greetings = greetingsQuery.data ?? [];
    return greetings.some(
      (g) =>
        g.phoneNumber === formPhoneNumber &&
        g.greetingType === formType &&
        g.locale === formLocale,
    );
  });

  const formValid = $derived.by(() => {
    if (formPhoneNumber.length === 0 || isDuplicate) return false;
    if (formMode === "text") return formText.trim().length > 0;
    if (
      isEditing &&
      editingGreeting?.isAudio === true &&
      formAudioFile === null
    ) {
      return true;
    }
    return formAudioFile !== null;
  });

  // ── Mutations ──

  const createMut = createMutation(() => ({
    mutationFn: async () =>
      telephonyContent.createGreeting.mutate({
        phoneNumber: formPhoneNumber,
        greetingType: formType,
        locale: formLocale,
        text: formText.trim(),
        isAudio: false,
      }),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_greetings_created());
      announceToLiveRegion("polite", m.admin_greetings_created());
      sheetOpen = false;
      resetForm();
      void queryClient.invalidateQueries({
        queryKey: adminKeys.greetings(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  const updateMut = createMutation(() => ({
    mutationFn: async () => {
      const current = editingGreeting;
      if (current === null) throw new TypeError("No greeting selected");
      const updates: {
        id: string;
        phoneNumber?: string;
        text?: string;
        isAudio?: boolean;
      } = { id: current.id };
      if (formText.trim() !== current.text) {
        updates.text = formText.trim();
      }
      if (formPhoneNumber !== current.phoneNumber) {
        updates.phoneNumber = formPhoneNumber;
      }
      if (formMode === "text" && current.isAudio) {
        updates.isAudio = false;
      }
      return telephonyContent.updateGreeting.mutate(updates);
    },
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_greetings_saved());
      announceToLiveRegion("polite", m.admin_greetings_saved());
      sheetOpen = false;
      resetForm();
      void queryClient.invalidateQueries({
        queryKey: adminKeys.greetings(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === "string" ? reader.result : "";
        const base64 = dataUrl.split(",")[1];
        if (base64 === undefined || base64 === "") {
          reject(new Error("Failed to encode file"));
          return;
        }
        resolve(base64);
      };
      reader.onerror = () =>
        reject(reader.error ?? new Error("FileReader failed"));
      reader.readAsDataURL(file);
    });
  }

  async function prepareAudioFile(
    file: File,
  ): Promise<{ base64: string; contentType: GreetingAudioContentType }> {
    let uploadFile = file;
    if (needsConversion(file.type)) {
      uploadPhase = "converting";
      uploadFile = await convertToWav(file);
    }
    const contentType = resolveAudioContentType(uploadFile.type);
    if (!contentType) throw new ClientError("Invalid audio format");
    if (uploadFile.size > GREETING_AUDIO_MAX_BYTES) {
      throw new ClientError("too_large");
    }
    uploadPhase = "uploading";
    const base64 = await fileToBase64(uploadFile);
    return { base64, contentType };
  }

  function handleAudioError(err: unknown): void {
    uploadPhase = null;
    if (err instanceof Error && err.message === "too_large") {
      toastStore.show(m.admin_greetings_audio_too_large());
    } else {
      toastStore.show(m.error_generic());
    }
  }

  function handleAudioSuccess(): void {
    uploadPhase = null;
    haptic();
    toastStore.show(m.admin_greetings_audio_uploaded());
    announceToLiveRegion("polite", m.admin_greetings_audio_uploaded());
    sheetOpen = false;
    resetForm();
    void queryClient.invalidateQueries({
      queryKey: adminKeys.greetings(),
    });
  }

  const uploadAudioMut = createMutation(() => ({
    mutationFn: async (greetingId: string) => {
      try {
        if (!formAudioFile) throw new ClientError("No file selected");
        const { base64, contentType } = await prepareAudioFile(formAudioFile);
        return await telephonyContent.uploadGreetingAudio.mutate({
          greetingId,
          audioBase64: base64,
          contentType,
        });
      } catch (err) {
        uploadPhase = null;
        throw err;
      }
    },
    onSuccess: handleAudioSuccess,
    onError: handleAudioError,
  }));

  const createAudioMut = createMutation(() => ({
    mutationFn: async () => {
      try {
        if (!formAudioFile) throw new ClientError("No file selected");
        const { base64, contentType } = await prepareAudioFile(formAudioFile);
        return await telephonyContent.createAudioGreeting.mutate({
          phoneNumber: formPhoneNumber,
          greetingType: formType,
          locale: formLocale,
          audioBase64: base64,
          contentType,
        });
      } catch (err) {
        uploadPhase = null;
        throw err;
      }
    },
    onSuccess: handleAudioSuccess,
    onError: handleAudioError,
  }));

  function handleSave(): void {
    if (!formValid) return;

    if (formMode === "audio" && formAudioFile) {
      if (!isSupportedAudioType(formAudioFile.type)) {
        toastStore.show(m.admin_greetings_audio_invalid());
        return;
      }

      if (isEditing && editingGreeting !== null) {
        uploadAudioMut.mutate(editingGreeting.id);
      } else {
        createAudioMut.mutate();
      }
      return;
    }

    if (isEditing) {
      updateMut.mutate();
    } else {
      createMut.mutate();
    }
  }

  const isSaving = $derived(
    createMut.isPending ||
      updateMut.isPending ||
      uploadAudioMut.isPending ||
      createAudioMut.isPending,
  );

  // ── Delete confirmation ──

  let deleteTarget = $state<GreetingRecord | null>(null);
  let deleteDialogOpen = $state(false);

  const deleteMut = createMutation(() => ({
    mutationFn: async (id: string) =>
      telephonyContent.deleteGreeting.mutate({ id }),
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_greetings_deleted());
      announceToLiveRegion("polite", m.admin_greetings_deleted());
      deleteDialogOpen = false;
      deleteTarget = null;
      sheetOpen = false;
      resetForm();
      void queryClient.invalidateQueries({
        queryKey: adminKeys.greetings(),
      });
    },
    onError: () => {
      toastStore.show(m.error_generic());
    },
  }));

  function startDelete(greeting: GreetingRecord): void {
    deleteTarget = greeting;
    deleteDialogOpen = true;
  }

  function confirmDelete(): void {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id);
  }
</script>

<div class="greetings-section">
  {#if phonesQuery.isLoading || greetingsQuery.isLoading}
    <div class="gr-content skeleton-pulse">
      <div class="gr-surface card-elevated">
        {#each { length: 3 } as _, i (i)}
          <div class="gr-row-skeleton">
            <span class="gr-badge"><InlineSkeleton width="6ch" /></span>
            <span class="gr-text"><InlineSkeleton width="20ch" /></span>
          </div>
        {/each}
      </div>
    </div>
  {:else if phonesQuery.isError}
    <QueryError
      error={phonesQuery.error}
      onretry={() => void phonesQuery.refetch()}
    />
  {:else if greetingsQuery.isError}
    <QueryError
      error={greetingsQuery.error}
      onretry={() => void greetingsQuery.refetch()}
    />
  {:else if phones.length === 0}
    <div class="gr-content">
      <p class="gr-empty">{m.admin_greetings_no_phones()}</p>
    </div>
  {:else}
    <div class="gr-content">
      {#each phones as phone (phone.sid)}
        {@const phoneGreetings = greetingsByPhone.get(phone.number) ?? []}
        <Card raised contentWrap={false} class="gr-phone-card">
          <div class="phone-card-inner">
            <p class="card-section-label">{phone.number}</p>
            <div class="section-divider" role="separator"></div>

            {#if phoneGreetings.length === 0}
              <div class="gr-empty-state">
                <p class="gr-empty">{m.admin_greetings_empty()}</p>
              </div>
            {:else}
              {@const populatedTypes = GREETING_TYPES.filter((t) =>
                phoneGreetings.some((g) => g.greetingType === t.value),
              )}
              {#each populatedTypes as typeInfo, visibleIdx (typeInfo.value)}
                {@const typeGreetings = phoneGreetings.filter(
                  (g) => g.greetingType === typeInfo.value,
                )}
                {#if visibleIdx > 0}
                  <div class="section-divider" role="separator"></div>
                {/if}
                <div class="gr-group">
                  <h4 class="gr-group-label">{typeInfo.label()}</h4>
                  {#each typeGreetings as greeting (greeting.id)}
                    <div class="gr-row">
                      <span class="gr-locale-badge">{greeting.locale}</span>
                      {#if greeting.isAudio && greeting.audioBlobKey}
                        <div class="gr-player-wrap">
                          <GreetingAudioPreview greetingId={greeting.id} />
                        </div>
                      {:else}
                        <span class="gr-text">{greeting.text}</span>
                      {/if}
                      <button
                        type="button"
                        class="gr-edit-btn touch-feedback"
                        onclick={() => openEditSheet(greeting)}
                        aria-label="{m.admin_greetings_edit_title()}: {typeInfo.label()}, {friendlyLocaleLabel(
                          greeting.locale,
                        )}"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  {/each}
                </div>
              {/each}
            {/if}

            <SoftButton onclick={() => openAddSheet(phone.number)} full>
              <Plus size={16} aria-hidden="true" />
              {m.admin_greetings_add_button()}
            </SoftButton>
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>

<!-- Add/Edit Greeting Sheet -->
<ShellSheet
  opened={sheetOpen}
  ondismiss={() => {
    sheetOpen = false;
    resetForm();
  }}
  ariaLabel={isEditing
    ? m.admin_greetings_edit_title()
    : m.admin_greetings_add_title()}
  title={isEditing
    ? m.admin_greetings_edit_title()
    : m.admin_greetings_add_title()}
>
  {#snippet headerRight()}
    <SoftButton onclick={handleSave} disabled={!formValid || isSaving}>
      {#if uploadPhase === "converting" || uploadPhase === "uploading" || isSaving}
        {m.common_loading()}
      {:else}
        <Save size={16} aria-hidden="true" />
        {isEditing
          ? m.admin_greetings_save_edit()
          : m.admin_greetings_save_create()}
      {/if}
    </SoftButton>
  {/snippet}
  <div class="sheet-content">
    <List nested>
      <ListInput
        type="select"
        dropdown
        label={m.admin_greetings_phone_number_label()}
        value={formPhoneNumber}
        onChange={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLSelectElement)
            formPhoneNumber = target.value;
        }}
      >
        {#each phones as phone (phone.sid)}
          <option value={phone.number}>{phone.number}</option>
        {/each}
      </ListInput>

      <ListInput
        type="select"
        dropdown
        label={m.admin_greetings_type_label()}
        value={formType}
        disabled={isEditing}
        onChange={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLSelectElement) {
            const match = GREETING_TYPES.find((t) => t.value === target.value);
            if (match) formType = match.value;
          }
        }}
      >
        {#each GREETING_TYPES as typeOpt (typeOpt.value)}
          <option value={typeOpt.value}>{typeOpt.label()}</option>
        {/each}
      </ListInput>

      <ListInput
        type="select"
        dropdown
        label={m.admin_greetings_locale_label()}
        value={formLocale}
        onChange={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLSelectElement) formLocale = target.value;
        }}
      >
        {#each LOCALE_OPTIONS as loc (loc.value)}
          <option value={loc.value}>{loc.label}</option>
        {/each}
      </ListInput>
    </List>

    <div
      class="mode-selector"
      role="radiogroup"
      aria-label={m.admin_greetings_type_label()}
    >
      <Segmented strong>
        <SegmentedButton
          active={formMode === "text"}
          onclick={() => {
            formMode = "text";
          }}
        >
          {m.admin_greetings_mode_text()}
        </SegmentedButton>
        <SegmentedButton
          active={formMode === "audio"}
          onclick={() => {
            formMode = "audio";
          }}
        >
          {m.admin_greetings_mode_audio()}
        </SegmentedButton>
      </Segmented>
    </div>

    {#if formMode === "text"}
      <List nested>
        <ListInput
          type="textarea"
          label={m.admin_greetings_text_label()}
          inputId="gr-text"
          placeholder={m.admin_greetings_text_placeholder()}
          value={formText}
          inputClass="resize-y min-h-[5rem]"
          onInput={(e: Event) => {
            const target = e.target;
            if (target instanceof HTMLTextAreaElement) formText = target.value;
            else if (target instanceof HTMLInputElement)
              formText = target.value;
          }}
        />
      </List>

      <p class="field-help">{m.admin_greetings_tts_hint()}</p>
    {:else}
      <div class="audio-upload-area">
        {#if isEditing && editingGreeting?.isAudio === true && editingGreeting.audioBlobKey !== null}
          <div class="audio-preview card-elevated">
            <GreetingAudioPreview greetingId={editingGreeting.id} />
          </div>
        {/if}

        <label class="file-input-label touch-feedback">
          <input
            type="file"
            accept="audio/wav,audio/mpeg,audio/mp3,audio/ogg,audio/mp4,audio/x-m4a,audio/aac,.wav,.mp3,.ogg,.m4a,.aac"
            class="file-input-hidden"
            onchange={(e: Event) => {
              const target = e.target;
              if (
                target instanceof HTMLInputElement &&
                target.files !== null &&
                target.files.length > 0
              ) {
                formAudioFile = target.files[0] ?? null;
              }
            }}
          />
          {#if formAudioFile}
            {formAudioFile.name}
          {:else if isEditing && editingGreeting?.isAudio === true}
            {m.admin_greetings_replace_audio()}
          {:else}
            {m.admin_greetings_upload_audio()}
          {/if}
        </label>

        <p class="field-help">{m.admin_greetings_audio_hint()}</p>
      </div>
    {/if}

    {#if !isEditing}
      {@const helpText = GREETING_TYPES.find(
        (t) => t.value === formType,
      )?.help()}
      {#if helpText}
        <p class="field-help">{helpText}</p>
      {/if}
    {/if}

    {#if isDuplicate}
      <p class="field-error" role="alert">
        {m.admin_greetings_duplicate()}
      </p>
    {/if}

    {#if isEditing}
      <div class="sheet-actions">
        <button
          type="button"
          class="delete-btn touch-feedback"
          onclick={() => {
            if (editingGreeting) startDelete(editingGreeting);
          }}
        >
          <Trash2 size={14} />
          {m.admin_greetings_delete()}
        </button>
      </div>
    {/if}
  </div>
</ShellSheet>

<!-- Delete Confirmation Dialog -->
<ShellDialog
  opened={deleteDialogOpen}
  ondismiss={() => {
    deleteDialogOpen = false;
    deleteTarget = null;
  }}
  title={m.admin_greetings_delete_title()}
>
  {#snippet content()}
    <p class="text-sm text-[--muted]">
      {m.admin_greetings_delete_confirm()}
    </p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton
      onclick={() => {
        deleteDialogOpen = false;
        deleteTarget = null;
      }}
    >
      {m.common_cancel()}
    </DialogButton>
    <DialogButton
      strong
      class={DIALOG_DESTRUCTIVE_CLASS}
      onclick={confirmDelete}
    >
      {m.admin_greetings_delete()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .greetings-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: 0.25rem 0 0;
  }

  .gr-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: 0 var(--page-pad-x) 0.25rem;
  }

  :global(.gr-phone-card) {
    margin: 0 !important;
  }

  .phone-card-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--card-pad-y) var(--card-pad-x);
  }

  .card-section-label {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }

  .section-divider {
    border-top: 1px solid var(--hair, var(--divider));
    margin: var(--space-sm) 0;
  }

  .gr-empty-state {
    text-align: center;
    padding: var(--space-lg) 0;
  }

  .gr-empty {
    text-align: center;
    color: var(--muted);
    font-size: var(--text-base);
    margin: 0;
  }

  .gr-surface {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .gr-group-label {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
    padding: 0 0 var(--space-xs);
    margin: 0;
  }

  .gr-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    width: 100%;
    font-size: var(--text-base);
    color: var(--ink);
    padding: var(--space-sm) 0;
    border-bottom: 1px solid
      color-mix(in srgb, var(--hair, var(--divider)) 50%, transparent);
  }

  .gr-row:last-child {
    border-bottom: none;
  }

  .gr-row-skeleton {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-lg) var(--page-pad-x);
    border-bottom: 1px solid var(--hair, var(--divider));
  }

  .gr-row-skeleton:last-child {
    border-bottom: none;
  }

  .gr-locale-badge {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    background: color-mix(in srgb, var(--brand-primary) 12%, transparent);
    color: var(--brand-text);
  }

  .gr-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.8;
  }

  .gr-player-wrap {
    flex: 1;
    min-width: 0;
  }

  .gr-edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border: none;
    background: transparent;
    color: var(--muted);
    border-radius: 50%;
    cursor: pointer;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .sheet-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg) var(--page-pad-x);
    flex: 1;
  }

  /* .field-help and .field-error come from the shared form primitives
     (shared.css) */

  .sheet-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding-top: var(--space-2xl);
  }

  .mode-selector {
    padding: 0 var(--space-xs);
  }

  .audio-upload-area {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: 0 var(--space-xs);
  }

  .audio-preview {
    padding: var(--space-sm);
  }

  .file-input-label {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem;
    border: 2px dashed color-mix(in srgb, var(--ink) 20%, transparent);
    border-radius: 0.5rem;
    color: var(--brand-text);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    text-align: center;
    -webkit-tap-highlight-color: transparent;
  }

  .file-input-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  .delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    width: 100%;
    padding: 0.625rem;
    border: none;
    background: transparent;
    color: var(--danger, var(--color-red-500));
    font-size: var(--text-sm);
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    border-radius: 0.5rem;
    -webkit-tap-highlight-color: transparent;
  }
</style>
