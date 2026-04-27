<script lang="ts">
  import { Card, ListInput, Preloader } from "konsta/svelte";
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { Palette, ImagePlus, Save } from "@lucide/svelte";
  import { encryptClientBranding } from "@care-y/crypto";
  import { generateIconVariants } from "$lib/branding/icon-generator.js";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { getOrgDecryptCache, getOrgKeyManager } from "$lib/crypto/context.js";
  import { isValidHexColor } from "$lib/branding/color-utils.js";
  import { applyKonstaPalette } from "$lib/branding/konsta-palette.js";
  import {
    updateBrandingCache,
    DEFAULT_PRIMARY,
    DEFAULT_ACCENT,
  } from "$lib/branding/index.js";
  import { setBrandingTitle } from "$lib/branding/title.svelte.js";
  import { setAppleTouchIconHref } from "$lib/branding/icon-link.svelte.js";
  import { getOrgSlug } from "$lib/utils/org-slug.js";
  import {
    uint8ArrayToBase64,
    base64ToUint8Array,
  } from "$lib/utils/buffer-encoding.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import type { BrandingField } from "@care-y/shared";
  import QueryError from "$lib/components/QueryError.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import SoftButton from "$lib/components/SoftButton.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";

  if (!trpc.branding) throw new RouterNotAvailableError("branding");
  const brandingRouter = trpc.branding;

  const queryClient = useQueryClient();
  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();

  const encoder = new TextEncoder();

  const MAX_LOGO_SIZE = 512 * 1024;
  const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/svg+xml"]);

  // ── Query ──

  const brandingQuery = createQuery(() => ({
    queryKey: adminKeys.branding(),
    queryFn: async () => brandingRouter.getBranding.query(),
  }));

  // ── Decrypted values (main-thread org-key tier, not PII) ──
  // Server returns base64 strings; OrgDecryptCache expects Uint8Array.

  function b64Field(value: string | null): Uint8Array | null {
    return value !== null && value !== "" ? base64ToUint8Array(value) : null;
  }

  const decryptedName = $derived(
    orgCache.decrypt(
      "branding:name",
      b64Field(brandingQuery.data?.encryptedName ?? null),
    ),
  );

  const decryptedColor = $derived(
    orgCache.decrypt(
      "branding:color",
      b64Field(brandingQuery.data?.encryptedPrimaryColor ?? null),
    ),
  );

  const decryptedAccent = $derived(
    orgCache.decrypt(
      "branding:accent",
      b64Field(brandingQuery.data?.encryptedAccentColor ?? null),
    ),
  );

  const decryptedText = $derived(
    orgCache.decrypt(
      "branding:text",
      b64Field(brandingQuery.data?.encryptedClientText ?? null),
    ),
  );

  // Logo decrypted as binary, displayed via blob URL
  let logoBlobUrl = $state<string | null>(null);

  $effect(() => {
    if (
      brandingQuery.data?.encryptedLogo === null ||
      brandingQuery.data?.encryptedLogo === undefined ||
      !orgKeyManager.isLoaded
    ) {
      logoBlobUrl = null;
      return;
    }
    try {
      const raw = brandingQuery.data.encryptedLogo;
      const ciphertext =
        typeof raw === "string"
          ? Uint8Array.from(atob(raw), (c) => c.charCodeAt(0))
          : new Uint8Array((raw as { data: number[] }).data);
      const plainBytes = orgKeyManager.decrypt(ciphertext);
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(plainBytes).buffer]),
      );
      logoBlobUrl = url;
      return () => URL.revokeObjectURL(url);
    } catch {
      logoBlobUrl = null;
    }
  });

  // ── Sheet state ──

  let sheetOpened = $state(false);

  let editName = $state("");
  let editColor = $state(DEFAULT_PRIMARY);
  let editAccent = $state(DEFAULT_ACCENT);
  let editText = $state("");
  let editLogoFile = $state<File | null>(null);
  let editLogoPreviewUrl = $state<string | null>(null);
  let logoError = $state<string | null>(null);

  function currentColor(): string {
    return decryptedColor !== null &&
      decryptedColor !== "" &&
      isValidHexColor(decryptedColor)
      ? decryptedColor
      : DEFAULT_PRIMARY;
  }

  function currentAccent(): string {
    return decryptedAccent !== null &&
      decryptedAccent !== "" &&
      isValidHexColor(decryptedAccent)
      ? decryptedAccent
      : DEFAULT_ACCENT;
  }

  function openSheet(): void {
    editName = decryptedName ?? "";
    editColor = currentColor();
    editAccent = currentAccent();
    editText = decryptedText ?? "";
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

  const nameChanged = $derived(editName !== (decryptedName ?? ""));
  const colorChanged = $derived(editColor !== currentColor());
  const accentChanged = $derived(editAccent !== currentAccent());
  const textChanged = $derived(editText !== (decryptedText ?? ""));
  const logoChanged = $derived(editLogoFile !== null);
  const hasChanges = $derived(
    nameChanged || colorChanged || accentChanged || textChanged || logoChanged,
  );

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

  // ── Encrypt helpers ──

  function encryptField(value: string): string {
    const plainBytes = encoder.encode(value);
    const cipherBytes = orgKeyManager.encrypt(plainBytes);
    return uint8ArrayToBase64(cipherBytes);
  }

  async function encryptLogo(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const cipherBytes = orgKeyManager.encrypt(new Uint8Array(arrayBuffer));
    return uint8ArrayToBase64(cipherBytes);
  }

  async function rasterizeSvg(svgBuffer: ArrayBuffer): Promise<ArrayBuffer> {
    const svgBlob = new Blob([svgBuffer], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    try {
      const img = await createImageBitmap(svgBlob);
      return await renderToCanvas(img);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function rasterizeImage(
    buffer: ArrayBuffer,
    type: string,
  ): Promise<ArrayBuffer> {
    const blob = new Blob([buffer], { type });
    const img = await createImageBitmap(blob);
    return renderToCanvas(img);
  }

  async function renderToCanvas(img: ImageBitmap): Promise<ArrayBuffer> {
    const maxDim = Math.max(img.width, img.height, 512);
    const scale = Math.min(1, 512 / maxDim);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      throw new Error("Failed to get 2d context from OffscreenCanvas");
    }
    ctx.drawImage(img, 0, 0, w, h);
    img.close();
    const blob = await canvas.convertToBlob({ type: "image/png" });
    return await blob.arrayBuffer();
  }

  /**
   * Build the client-side branding blob (SOG-14 dual-blob).
   *
   * Contains all text branding fields as JSON, encrypted with the
   * client branding key (derived from org public key via BLAKE2b).
   * Client portal pages decrypt this without authentication.
   */
  function buildClientBrandingBlob(
    name: string,
    primaryColor: string,
    accentColor: string,
    clientText: string,
  ): string {
    const orgPubKey = orgKeyManager.getPublicKey();
    if (!orgPubKey) {
      throw new Error("Org public key not available for client branding blob");
    }

    const payload = JSON.stringify({
      name,
      primaryColor,
      accentColor,
      clientText,
    });
    const payloadBytes = encoder.encode(payload);
    const ciphertext = encryptClientBranding(payloadBytes, orgPubKey);
    return uint8ArrayToBase64(ciphertext);
  }

  // ── Mutations ──

  const saveMutation = createMutation(() => ({
    mutationFn: async (
      fields: {
        field: BrandingField;
        encryptedValue: string;
        clientEncryptedBranding: string;
      }[],
    ) => {
      for (const f of fields) {
        await brandingRouter.saveBrandingField.mutate({
          field: f.field,
          encryptedValue: f.encryptedValue,
          clientEncryptedBranding: f.clientEncryptedBranding,
        });
      }
    },
    onSuccess: () => {
      haptic();
      orgCache.delete("branding:name");
      orgCache.delete("branding:color");
      orgCache.delete("branding:accent");
      orgCache.delete("branding:text");
      toastStore.show(m.admin_branding_saved());
      announceToLiveRegion("polite", m.admin_branding_saved());
      closeSheet(false);
      void queryClient.invalidateQueries({ queryKey: adminKeys.branding() });
    },
    onError: () => {
      toastStore.show(m.admin_branding_error(), 3000);
    },
  }));

  // PWA icon generation: runs after logo save (ADR-024, H-037)
  let iconUploadInFlight = $state(false);

  async function uploadPwaIcons(logoFile: File): Promise<void> {
    if (iconUploadInFlight) return;
    iconUploadInFlight = true;

    try {
      const orgPubKey = orgKeyManager.getPublicKey();
      if (!orgPubKey) return;

      const variants = await generateIconVariants(logoFile);

      let icon192 = "";
      let icon512 = "";
      let iconMaskable = "";

      for (const variant of variants) {
        const arrayBuffer = await variant.blob.arrayBuffer();
        const encrypted = encryptClientBranding(
          new Uint8Array(arrayBuffer),
          orgPubKey,
        );
        const b64 = uint8ArrayToBase64(encrypted);

        if (variant.purpose === "maskable") {
          iconMaskable = b64;
        } else if (variant.size === 192) {
          icon192 = b64;
        } else {
          icon512 = b64;
        }
      }

      await brandingRouter.uploadIcons.mutate({
        icon192,
        icon512,
        iconMaskable,
      });
      const newVersion = String(Date.now());
      void updateBrandingCache({ hasIcons: true, iconVersion: newVersion });
      const slug = getOrgSlug();
      if (slug !== null)
        setAppleTouchIconHref(
          `/api/branding/${slug}/icon-192.png?v=${newVersion}`,
        );
    } catch {
      toastStore.show(m.admin_branding_icons_error(), 3000);
    } finally {
      iconUploadInFlight = false;
    }
  }

  async function handleSave(): Promise<void> {
    if (!hasChanges) return;

    // Resolve final values for all fields (current or edited)
    const finalName = nameChanged ? editName : (decryptedName ?? "");
    const finalColor =
      colorChanged && isValidHexColor(editColor) ? editColor : currentColor();
    const finalAccent =
      accentChanged && isValidHexColor(editAccent)
        ? editAccent
        : currentAccent();
    const finalText = textChanged ? editText : (decryptedText ?? "");

    // SOG-14: build the client branding blob with all current values
    let clientBlob: string;
    try {
      clientBlob = buildClientBrandingBlob(
        finalName,
        finalColor,
        finalAccent,
        finalText,
      );
    } catch {
      toastStore.show(m.admin_branding_error(), 3000);
      return;
    }

    const fields: {
      field: BrandingField;
      encryptedValue: string;
      clientEncryptedBranding: string;
    }[] = [];

    if (nameChanged) {
      fields.push({
        field: "name",
        encryptedValue: encryptField(editName),
        clientEncryptedBranding: clientBlob,
      });
    }

    if (colorChanged && isValidHexColor(editColor)) {
      fields.push({
        field: "primary_color",
        encryptedValue: encryptField(editColor),
        clientEncryptedBranding: clientBlob,
      });
    }

    if (accentChanged && isValidHexColor(editAccent)) {
      fields.push({
        field: "accent_color",
        encryptedValue: encryptField(editAccent),
        clientEncryptedBranding: clientBlob,
      });
    }

    if (textChanged) {
      fields.push({
        field: "client_text",
        encryptedValue: encryptField(editText),
        clientEncryptedBranding: clientBlob,
      });
    }

    if (logoChanged && editLogoFile) {
      const encryptedLogo = await encryptLogo(editLogoFile);
      fields.push({
        field: "logo",
        encryptedValue: encryptedLogo,
        clientEncryptedBranding: clientBlob,
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

        // Fire PWA icon generation in background (ADR-024, H-037)
        if (logoFileForIcons !== null) {
          void uploadPwaIcons(logoFileForIcons);
        }
      },
    });
  }
</script>

<div class="branding-section">
  {#if brandingQuery.isLoading}
    <Card raised contentWrap={false} class="branding-card">
      <div class="branding-inner">
        <div class="card-section-label">
          {m.admin_branding_card_logo_label()}
        </div>
        <div class="logo-row">
          <div class="logo-placeholder">
            <DecryptPlaceholder mode="media" />
          </div>
          <div class="logo-meta">
            <DecryptPlaceholder length={18} />
          </div>
        </div>
        <div class="section-divider"></div>
        <div class="card-section-label">
          {m.admin_branding_card_color_label()}
        </div>
        <div class="color-row">
          <DecryptPlaceholder length={7} />
        </div>
        <div class="section-divider"></div>
        <div class="card-section-label">
          {m.admin_branding_card_name_label()}
        </div>
        <DecryptPlaceholder length={24} />
        <div class="section-divider"></div>
        <div class="card-section-label">
          {m.admin_branding_card_text_label()}
        </div>
        <DecryptPlaceholder length={40} />
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
        <!-- Logo -->
        <div class="card-section-label">
          {m.admin_branding_card_logo_label()}
        </div>
        <div class="logo-row">
          {#if logoBlobUrl}
            <img
              src={logoBlobUrl}
              alt={decryptedName ?? "Organization logo"}
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

        <!-- Name -->
        <div class="card-section-label">
          {m.admin_branding_card_name_label()}
        </div>
        {#if brandingQuery.data?.encryptedName}
          <DecryptPlaceholder content={decryptedName}>
            <span class="field-value">{decryptedName}</span>
          </DecryptPlaceholder>
        {:else}
          <span class="text-[--muted] text-sm">-</span>
        {/if}

        <div class="section-divider"></div>

        <!-- Client text -->
        <div class="card-section-label">
          {m.admin_branding_card_text_label()}
        </div>
        {#if brandingQuery.data?.encryptedClientText}
          <DecryptPlaceholder content={decryptedText}>
            <span class="field-value text-truncate">{decryptedText}</span>
          </DecryptPlaceholder>
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
          {#if brandingQuery.data?.encryptedPrimaryColor !== null && brandingQuery.data?.encryptedPrimaryColor !== undefined && decryptedColor !== null && decryptedColor !== "" && isValidHexColor(decryptedColor)}
            <span
              class="color-swatch"
              role="img"
              aria-label={m.admin_branding_color_swatch_label({
                color: decryptedColor,
              })}
              style="background: {decryptedColor}"
            ></span>
            <span class="color-hex">{decryptedColor}</span>
          {:else if brandingQuery.data?.encryptedPrimaryColor !== null && brandingQuery.data?.encryptedPrimaryColor !== undefined}
            <DecryptPlaceholder length={7} />
          {:else}
            <span class="text-[--muted] text-sm">-</span>
          {/if}
          {#if decryptedAccent !== null && decryptedAccent !== "" && isValidHexColor(decryptedAccent)}
            <span class="color-dot"></span>
            <span
              class="color-swatch"
              role="img"
              aria-label={m.admin_branding_accent_swatch_label({
                color: decryptedAccent,
              })}
              style="background: {decryptedAccent}"
            ></span>
            <span class="color-hex">{decryptedAccent}</span>
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
            alt={decryptedName ?? "Current logo"}
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
          <span class="field-hint">{m.admin_branding_logo_accept()}</span>
          {#if logoError}
            <span class="field-error" role="alert">{logoError}</span>
          {/if}
          <span class="field-hint">{m.admin_branding_logo_hint()}</span>
        </div>
      </div>
    </div>

    <div class="section-divider"></div>

    <!-- Organization Name -->
    <div class="sheet-field">
      <ListInput
        outline
        label={m.admin_branding_card_name_label()}
        type="text"
        value={editName}
        onchange={(e: Event) => {
          if (e.target instanceof HTMLInputElement) editName = e.target.value;
        }}
        info={m.admin_branding_name_hint()}
      />
    </div>

    <!-- Client Welcome Text -->
    <div class="sheet-field">
      <ListInput
        outline
        label={m.admin_branding_card_text_label()}
        type="textarea"
        value={editText}
        onchange={(e: Event) => {
          if (e.target instanceof HTMLTextAreaElement)
            editText = e.target.value;
        }}
        info={m.admin_branding_text_hint()}
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
          <span class="field-hint">{m.admin_branding_color_hint()}</span>
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
          <span class="field-hint">{m.admin_branding_accent_hint()}</span>
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
    font-family: ui-monospace, monospace;
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

  .field-hint {
    font-size: var(--text-xs);
    color: var(--muted);
    line-height: 1.4;
  }

  .field-error {
    font-size: var(--text-xs);
    color: var(--color-red-500);
    font-weight: 500;
  }

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
    font-family: ui-monospace, monospace;
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
