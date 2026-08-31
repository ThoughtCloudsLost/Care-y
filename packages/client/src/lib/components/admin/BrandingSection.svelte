<script lang="ts">
  import { Card, ListInput, Preloader } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { Palette, ImagePlus, Save } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { isValidHexColor } from "$lib/branding/color-utils.js";
  import {
    applyKonstaPalette,
    checkBrandProximity,
    type BrandProximity,
  } from "$lib/branding/konsta-palette.js";
  import Register from "$lib/components/Register.svelte";
  import {
    updateBrandingCache,
    DEFAULT_PRIMARY,
    DEFAULT_ACCENT,
  } from "$lib/branding/index.js";
  import { setBrandingTitle } from "$lib/branding/title.svelte.js";
  import { rasterizeSvg, rasterizeImage } from "$lib/branding/rasterize.js";
  import { uploadPwaIcons } from "$lib/branding/icon-upload.js";
  import { getOrgSlug } from "$lib/utils/org-slug.js";
  import { requireRouter } from "$lib/errors.js";
  import type { BrandingField } from "@care-y/shared";
  import QueryError from "$lib/components/QueryError.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  interface Props {
    externalSave?: boolean;
  }

  let { externalSave: _externalSave = false }: Props = $props();

  export function isDirty(): boolean {
    return hasChanges;
  }

  export async function save(): Promise<void> {
    await handleSave();
  }

  const brandingRouter = requireRouter(trpc.branding, "branding");

  const queryClient = useQueryClient();

  const MAX_LOGO_SIZE = 512 * 1024;
  const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/svg+xml"]);

  // ── Query ──

  const brandingQuery = createQuery(() => ({
    queryKey: adminKeys.branding(),
    queryFn: async () => brandingRouter.getBranding.query(),
  }));

  // ── Plaintext values straight off the query ──

  const serverName = $derived(brandingQuery.data?.name ?? null);
  const serverColor = $derived(brandingQuery.data?.primaryColor ?? null);
  const serverAccent = $derived(brandingQuery.data?.accentColor ?? null);
  const serverText = $derived(brandingQuery.data?.clientText ?? null);

  // Logo: base64 from server, displayed via data URL
  const logoBlobUrl = $derived.by((): string | null => {
    const logo = brandingQuery.data?.logo;
    if (logo === null || logo === undefined) return null;
    return `data:image/png;base64,${logo}`;
  });

  // ── Sheet state ──

  let sheetOpened = $state(false);

  let editColor = $state(DEFAULT_PRIMARY);
  let editAccent = $state(DEFAULT_ACCENT);
  let editText = $state("");
  let editLogoFile = $state<File | null>(null);
  let editLogoPreviewUrl = $state<string | null>(null);
  let logoError = $state<string | null>(null);

  function currentColor(): string {
    return serverColor !== null &&
      serverColor !== "" &&
      isValidHexColor(serverColor)
      ? serverColor
      : DEFAULT_PRIMARY;
  }

  function currentAccent(): string {
    return serverAccent !== null &&
      serverAccent !== "" &&
      isValidHexColor(serverAccent)
      ? serverAccent
      : DEFAULT_ACCENT;
  }

  function openSheet(): void {
    editColor = currentColor();
    editAccent = currentAccent();
    editText = serverText ?? "";
    editLogoFile = null;
    editLogoPreviewUrl = null;
    logoError = null;
    sheetOpened = true;
    void applyKonstaPalette({ primary: editColor, accent: editAccent });
  }

  function closeSheet(revertPalette = true): void {
    sheetOpened = false;
    if (editLogoPreviewUrl !== null) {
      URL.revokeObjectURL(editLogoPreviewUrl);
      editLogoPreviewUrl = null;
    }
    if (revertPalette) {
      void applyKonstaPalette({
        primary: currentColor(),
        accent: currentAccent(),
      });
    }
  }

  // ── Change detection ──

  const colorChanged = $derived(editColor !== currentColor());
  const accentChanged = $derived(editAccent !== currentAccent());
  const textChanged = $derived(editText !== (serverText ?? ""));
  const logoChanged = $derived(editLogoFile !== null);
  const hasChanges = $derived(
    colorChanged || accentChanged || textChanged || logoChanged,
  );

  // ── Semantic-hue proximity (the OKLCH nudge) ──
  // Offered, never enforced: save stays available with any valid hex.

  const NO_COLLISION: BrandProximity = { collides: false };

  const primaryProximity = $derived(
    isValidHexColor(editColor) ? checkBrandProximity(editColor) : NO_COLLISION,
  );
  const accentProximity = $derived(
    isValidHexColor(editAccent)
      ? checkBrandProximity(editAccent)
      : NO_COLLISION,
  );

  function proximityMessage(p: BrandProximity): string {
    return p.conflict === "care"
      ? m.branding_color_near_care(withTerms())
      : m.branding_color_near_urgent(withTerms());
  }

  function applyNudgedPrimary(): void {
    if (primaryProximity.nudgedHex === undefined) return;
    editColor = primaryProximity.nudgedHex;
    void applyKonstaPalette({ primary: editColor, accent: editAccent });
  }

  function applyNudgedAccent(): void {
    if (accentProximity.nudgedHex === undefined) return;
    editAccent = accentProximity.nudgedHex;
    void applyKonstaPalette({ primary: editColor, accent: editAccent });
  }

  // ── Color preview ──

  function handleColorChange(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      editColor = target.value;
      if (isValidHexColor(editColor)) {
        void applyKonstaPalette({ primary: editColor, accent: editAccent });
      }
    }
  }

  function handleAccentChange(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      editAccent = target.value;
      if (isValidHexColor(editAccent)) {
        void applyKonstaPalette({ primary: editColor, accent: editAccent });
      }
    }
  }

  // ── Logo handling ──

  async function handleLogoSelect(e: Event): Promise<void> {
    const target = e.target;
    if (
      !(target instanceof HTMLInputElement) ||
      target.files === null ||
      target.files.length === 0
    )
      return;

    const file = target.files[0];
    if (file === undefined) return;
    logoError = null;

    if (!ACCEPTED_TYPES.has(file.type)) {
      logoError = m.admin_branding_logo_invalid_type();
      target.value = "";
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      let pngBuffer: ArrayBuffer;
      if (file.type === "image/svg+xml") {
        pngBuffer = await rasterizeSvg(arrayBuffer);
      } else {
        pngBuffer = await rasterizeImage(arrayBuffer, file.type);
      }

      if (pngBuffer.byteLength > MAX_LOGO_SIZE) {
        logoError = m.admin_branding_logo_too_large();
        target.value = "";
        return;
      }

      const processedBlob = new Blob([pngBuffer], { type: "image/png" });
      editLogoFile = new File([processedBlob], file.name, {
        type: "image/png",
      });
      if (editLogoPreviewUrl !== null) URL.revokeObjectURL(editLogoPreviewUrl);
      editLogoPreviewUrl = URL.createObjectURL(processedBlob);
    } catch {
      logoError = m.admin_branding_logo_invalid_type();
      target.value = "";
    }
  }

  /** Base64url-encode raw bytes for the logo field wire format. */
  async function fileToBase64(file: File): Promise<string> {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  // ── Mutations ──

  const saveMutation = createMutation(() => ({
    mutationFn: async (
      fields: {
        field: BrandingField;
        value: string;
      }[],
    ) => {
      for (const f of fields) {
        await brandingRouter.saveBrandingField.mutate({
          field: f.field,
          value: f.value,
        });
      }
    },
    onSuccess: () => {
      haptic();
      toastStore.show(m.admin_branding_saved());
      announceToLiveRegion("polite", m.admin_branding_saved());
      closeSheet(false);
      void queryClient.invalidateQueries({ queryKey: adminKeys.branding() });
    },
    onError: () => {
      toastStore.show(m.admin_branding_error(), 3000);
    },
  }));

  let iconUploadInFlight = $state(false);

  async function handleSave(): Promise<void> {
    if (!hasChanges) return;

    const finalColor =
      colorChanged && isValidHexColor(editColor) ? editColor : currentColor();
    const finalAccent =
      accentChanged && isValidHexColor(editAccent)
        ? editAccent
        : currentAccent();
    const finalName = serverName ?? "";

    const fields: {
      field: BrandingField;
      value: string;
    }[] = [];

    if (colorChanged && isValidHexColor(editColor)) {
      fields.push({
        field: "primary_color",
        value: editColor,
      });
    }

    if (accentChanged && isValidHexColor(editAccent)) {
      fields.push({
        field: "accent_color",
        value: editAccent,
      });
    }

    if (textChanged) {
      fields.push({
        field: "client_text",
        value: editText,
      });
    }

    if (logoChanged && editLogoFile) {
      const logoBase64 = await fileToBase64(editLogoFile);
      fields.push({
        field: "logo",
        value: logoBase64,
      });
    }

    if (fields.length === 0) return;

    // Store file reference for PWA icon generation in onSuccess
    const logoFileForIcons = logoChanged ? editLogoFile : null;

    saveMutation.mutate(fields, {
      onSuccess: () => {
        // Update reactive title and palette immediately
        setBrandingTitle(finalName || "CARE-Y");
        void applyKonstaPalette({
          primary: finalColor,
          accent: finalAccent || undefined,
        });

        // Update SW branding cache for manifest + apple-touch-icon
        void updateBrandingCache({
          orgName: finalName || "CARE-Y",
          primaryColor: finalColor,
          accentColor: finalAccent || null,
          orgSlug: getOrgSlug(),
          hasIcons: brandingQuery.data?.hasIcons ?? false,
        });

        if (logoFileForIcons !== null && !iconUploadInFlight) {
          iconUploadInFlight = true;
          void uploadPwaIcons(logoFileForIcons, brandingRouter)
            .catch(() => {
              toastStore.show(m.admin_branding_icons_error(), 3000);
            })
            .finally(() => {
              iconUploadInFlight = false;
            });
        }
      },
    });
  }
</script>

<div class="branding-section">
  {#if brandingQuery.isLoading}
    <Card raised contentWrap={false} class="branding-card">
      <div class="branding-inner">
        <p class="section-desc">{m.admin_branding_description(withTerms())}</p>
        <div class="card-section-label">
          {m.admin_branding_card_logo_label()}
        </div>
        <div class="logo-row">
          <div class="logo-placeholder">
            <Preloader />
          </div>
        </div>
        <div class="section-divider"></div>
        <div class="card-section-label">
          {m.admin_branding_card_color_label()}
        </div>
        <div class="color-row">
          <Preloader class="w-4 h-4" />
        </div>
        <div class="section-divider"></div>
        <div class="card-section-label">
          {m.admin_branding_card_text_label(withTerms())}
        </div>
        <Preloader class="w-4 h-4" />
      </div>
    </Card>
  {:else if brandingQuery.isError}
    <QueryError
      error={brandingQuery.error}
      onretry={() => void brandingQuery.refetch()}
    />
  {:else}
    <Card raised contentWrap={false} class="branding-card">
      <div
        class="branding-inner"
        role="region"
        aria-label={m.admin_branding_overview_label()}
      >
        <p class="section-desc">{m.admin_branding_description(withTerms())}</p>
        <!-- Logo -->
        <div class="card-section-label">
          {m.admin_branding_card_logo_label()}
        </div>
        <div class="logo-row">
          {#if logoBlobUrl}
            <img
              src={logoBlobUrl}
              alt={serverName ?? "Organization logo"}
              class="logo-preview"
            />
          {:else}
            <div class="logo-empty" aria-hidden="true">
              <ImagePlus size={32} />
            </div>
          {/if}
          <div class="logo-meta">
            {#if logoBlobUrl == null}
              <span class="text-[--muted] text-sm">
                {m.admin_branding_card_no_logo()}
              </span>
            {/if}
          </div>
        </div>

        <div class="section-divider"></div>

        <!-- Client text -->
        <div class="card-section-label">
          {m.admin_branding_card_text_label(withTerms())}
        </div>
        {#if serverText}
          <span class="field-value text-truncate">{serverText}</span>
        {:else}
          <span class="text-[--muted] text-sm">
            {m.admin_branding_card_no_text()}
          </span>
        {/if}

        <div class="section-divider"></div>

        <!-- Colors -->
        <div class="card-section-label">
          {m.admin_branding_card_color_label()}
        </div>
        <div class="color-row">
          {#if serverColor !== null && serverColor !== "" && isValidHexColor(serverColor)}
            <span
              class="color-swatch"
              role="img"
              aria-label={m.admin_branding_color_swatch_label({
                color: serverColor,
              })}
              style="background: {serverColor}"
            ></span>
            <span class="color-hex">{serverColor}</span>
          {:else}
            <span class="text-[--muted] text-sm">-</span>
          {/if}
          {#if serverAccent !== null && serverAccent !== "" && isValidHexColor(serverAccent)}
            <span class="color-dot"></span>
            <span
              class="color-swatch"
              role="img"
              aria-label={m.admin_branding_accent_swatch_label({
                color: serverAccent,
              })}
              style="background: {serverAccent}"
            ></span>
            <span class="color-hex">{serverAccent}</span>
          {/if}
        </div>

        <!-- Edit button -->
        <div class="edit-action">
          <SoftButton onclick={openSheet} full>
            <Palette size={18} aria-hidden="true" />
            {m.admin_branding_edit_button()}
          </SoftButton>
        </div>
      </div>
    </Card>
  {/if}
</div>

<!-- Edit Branding Sheet -->
<ShellSheet
  opened={sheetOpened}
  ondismiss={closeSheet}
  title={m.admin_branding_sheet_title()}
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
      {m.admin_branding_save()}
    </SoftButton>
  {/snippet}
  <div class="sheet-inner">
    <!-- Logo -->
    <div class="sheet-field">
      <div class="card-section-label">
        {m.admin_branding_card_logo_label()}
      </div>
      <div class="logo-edit-row">
        {#if editLogoPreviewUrl}
          <img
            src={editLogoPreviewUrl}
            alt={m.admin_branding_new_logo_alt()}
            class="logo-preview"
          />
        {:else if logoBlobUrl}
          <img
            src={logoBlobUrl}
            alt={serverName ?? "Current logo"}
            class="logo-preview"
          />
        {:else}
          <div class="logo-empty-sheet" aria-hidden="true">
            <ImagePlus size={24} />
          </div>
        {/if}
        <div class="logo-edit-meta">
          <label class="file-label">
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              class="file-input"
              onchange={(e) => void handleLogoSelect(e)}
            />
            <span class="file-btn">
              {m.admin_branding_logo_change()}
            </span>
          </label>
          <span class="field-help">{m.admin_branding_logo_accept()}</span>
          {#if logoError}
            <span class="field-error" role="alert">{logoError}</span>
          {/if}
          <span class="field-help"
            >{m.admin_branding_logo_hint(withTerms())}</span
          >
        </div>
      </div>
    </div>

    <div class="section-divider"></div>

    <!-- Client Welcome Text -->
    <div class="sheet-field">
      <ListInput
        label={m.admin_branding_card_text_label(withTerms())}
        type="textarea"
        value={editText}
        onchange={(e: Event) => {
          if (e.target instanceof HTMLTextAreaElement)
            editText = e.target.value;
        }}
        info={m.admin_branding_text_hint(withTerms())}
      />
    </div>

    <div class="section-divider"></div>

    <!-- Colors -->
    <div class="sheet-field">
      <div class="color-edit-row">
        <div class="color-picker-group">
          <div class="card-section-label">
            {m.admin_branding_card_color_label()}
          </div>
          <div class="color-picker-row">
            <input
              type="color"
              value={editColor}
              oninput={handleColorChange}
              class="color-input"
              aria-label={m.admin_branding_color_primary()}
            />
            <span class="color-hex-edit">{editColor}</span>
          </div>
          <span class="field-help">{m.admin_branding_color_hint()}</span>
          {#if primaryProximity.collides}
            <Register kind="careful" role="status">
              <p class="nudge-text">{proximityMessage(primaryProximity)}</p>
              {#if primaryProximity.nudgedHex !== undefined}
                <button
                  type="button"
                  class="nudge-action"
                  onclick={applyNudgedPrimary}
                >
                  <span
                    class="nudge-swatch"
                    style="background: {primaryProximity.nudgedHex}"
                    aria-hidden="true"
                  ></span>
                  {m.branding_color_use_nudged()}
                </button>
              {/if}
            </Register>
          {/if}
        </div>

        <div class="color-picker-group">
          <div class="card-section-label">
            {m.admin_branding_accent_label()}
          </div>
          <div class="color-picker-row">
            <input
              type="color"
              value={editAccent}
              oninput={handleAccentChange}
              class="color-input"
              aria-label={m.admin_branding_accent_label()}
            />
            <span class="color-hex-edit">{editAccent}</span>
          </div>
          <span class="field-help">{m.admin_branding_accent_hint()}</span>
          {#if accentProximity.collides}
            <Register kind="careful" role="status">
              <p class="nudge-text">{proximityMessage(accentProximity)}</p>
              {#if accentProximity.nudgedHex !== undefined}
                <button
                  type="button"
                  class="nudge-action"
                  onclick={applyNudgedAccent}
                >
                  <span
                    class="nudge-swatch"
                    style="background: {accentProximity.nudgedHex}"
                    aria-hidden="true"
                  ></span>
                  {m.branding_color_use_nudged()}
                </button>
              {/if}
            </Register>
          {/if}
        </div>

        <div class="palette-preview">
          <div class="preview-chip">
            <span class="preview-swatch" style="background: var(--brand-fill)"
            ></span>
            <span class="preview-name"
              >{m.admin_branding_preview_buttons()}</span
            >
          </div>
          <div class="preview-chip">
            <span class="preview-swatch" style="background: var(--brand-text)"
            ></span>
            <span class="preview-name">{m.admin_branding_preview_links()}</span>
          </div>
          <div class="preview-chip">
            <span
              class="preview-swatch"
              style="background: var(--brand-accent, var(--brand-fill))"
            ></span>
            <span class="preview-name">{m.admin_branding_preview_icons()}</span>
          </div>
          <div class="preview-chip">
            <span
              class="preview-swatch"
              style="background: var(--brand-accent-fill, var(--brand-fill))"
            ></span>
            <span class="preview-name">{m.admin_branding_preview_badges()}</span
            >
          </div>
        </div>
        <span class="contrast-note"
          >{m.admin_branding_color_contrast_note()}</span
        >
      </div>
    </div>
  </div>
</ShellSheet>

<style>
  .branding-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: 0.25rem var(--page-pad-x) 0;
  }

  :global(.branding-card) {
    margin: 0 !important;
  }

  .branding-inner {
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

  .card-section-label {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
  }

  .section-divider {
    border-top: 1px solid color-mix(in srgb, var(--ink) 8%, transparent);
    margin: var(--space-xs) 0;
  }

  .logo-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .logo-preview {
    width: 128px;
    height: 128px;
    border-radius: 0.75rem;
    object-fit: contain;
    background: color-mix(in srgb, var(--ink) 5%, transparent);
  }

  .logo-empty,
  .logo-empty-sheet {
    width: 128px;
    height: 128px;
    border-radius: 0.75rem;
    background: color-mix(in srgb, var(--ink) 5%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
  }

  .logo-placeholder {
    width: 128px;
    height: 128px;
    border-radius: 0.75rem;
    overflow: hidden;
  }

  .logo-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .color-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .color-swatch {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.375rem;
    border: 1px solid color-mix(in srgb, var(--ink) 15%, transparent);
    flex-shrink: 0;
  }

  .color-hex {
    font-family: var(--theme-font-mono);
    font-size: var(--text-sm);
    color: var(--ink);
  }

  .color-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--muted);
    flex-shrink: 0;
  }

  .field-value {
    font-size: var(--text-sm);
    color: var(--ink);
    line-height: 1.5;
  }

  .text-truncate {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .edit-action {
    padding-top: var(--space-sm);
  }

  /* ── Sheet ── */

  .sheet-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    padding-bottom: calc(var(--space-xl) + env(safe-area-inset-bottom, 0px));
  }

  .sheet-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  /* Logo: preview beside upload controls */
  .logo-edit-row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .logo-edit-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    flex: 1;
    min-width: 0;
  }

  .file-label {
    display: inline-flex;
    cursor: pointer;
  }

  .file-input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }

  .file-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--ink) 8%, transparent);
    color: var(--ink);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    min-height: 44px;
  }

  .file-btn:active {
    background: color-mix(in srgb, var(--ink) 15%, transparent);
  }

  /* .field-help and .field-error come from the shared form primitives
     (shared.css) */

  /* Color: pickers and preview in a compact grid */
  .color-edit-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
  }

  .color-picker-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .nudge-text {
    margin: 0 0 var(--space-sm);
  }

  .nudge-action {
    display: inline-flex;
    align-items: center;
    gap: var(--space-md);
    padding: 0;
    border: none;
    background: none;
    font-family: inherit;
    font-size: var(--text-base);
    font-weight: 700;
    color: var(--brand-text);
    cursor: pointer;
  }

  .nudge-swatch {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid var(--hair-2);
    flex-shrink: 0;
  }

  .color-picker-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .color-input {
    width: 44px;
    height: 44px;
    border: 1px solid color-mix(in srgb, var(--ink) 15%, transparent);
    border-radius: 0.5rem;
    cursor: pointer;
    padding: 2px;
    background: transparent;
  }

  .color-hex-edit {
    font-family: var(--theme-font-mono);
    font-size: var(--text-sm);
    color: var(--ink);
  }

  .palette-preview {
    grid-column: 1 / -1;
    display: flex;
    gap: var(--space-md);
    align-items: flex-end;
  }

  .preview-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .preview-swatch {
    width: 100%;
    height: 1.75rem;
    border-radius: 0.375rem;
    border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
  }

  .preview-name {
    font-size: var(--text-xs);
    color: var(--muted);
    white-space: nowrap;
  }

  .contrast-note {
    grid-column: 1 / -1;
    font-size: var(--text-xs);
    color: var(--muted);
    line-height: 1.4;
    font-style: italic;
  }
</style>
