<!--
  SetupBranding: wizard step 3 (branding, skippable).

  Logo upload, primary/accent color, client-facing text.
  Uses the dual-blob encryption pattern from BrandingSection:
    - Each field encrypted individually with orgKeyManager.encrypt() (org-tier)
    - All text fields combined into a client branding blob via
      encryptClientBranding() (public-key-derived, for unauthenticated portal)
    - Each saved via branding.saveBrandingField
-->
<script lang="ts">
  import {
    List,
    ListInput,
    Button,
    Block,
    BlockTitle,
    Preloader,
  } from "konsta/svelte";
  import { ImagePlus } from "@lucide/svelte";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { encryptClientBranding } from "@care-y/crypto";
  import type { BrandingField } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys } from "$lib/query/keys.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { uint8ArrayToBase64 } from "$lib/utils/buffer-encoding.js";
  import { isValidHexColor } from "$lib/branding/color-utils.js";
  import { DEFAULT_PRIMARY, DEFAULT_ACCENT } from "$lib/branding/index.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { RouterNotAvailableError } from "$lib/errors.js";
  import { isOrgKeyReady } from "$lib/crypto/org-key-ready.svelte.js";

  interface Props {
    orgName: string;
    oncomplete: () => void;
    onskip: () => void;
  }

  let { orgName, oncomplete, onskip }: Props = $props();

  if (!trpc.branding) {
    throw new RouterNotAvailableError("branding");
  }
  const brandingRouter = trpc.branding;

  const queryClient = useQueryClient();
  const orgKeyManager = getOrgKeyManager();
  const encoder = new TextEncoder();

  const MAX_LOGO_SIZE = 512 * 1024;
  const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/svg+xml"]);

  let primaryColor = $state(DEFAULT_PRIMARY);
  let accentColor = $state(DEFAULT_ACCENT);
  let clientText = $state("");
  let logoFile: File | null = $state(null);
  let logoPreviewUrl: string | null = $state(null);
  let logoError = $state("");

  const orgKeyLoaded = $derived(isOrgKeyReady());
  const hasAnyContent = $derived(
    orgName.trim().length > 0 ||
      primaryColor !== DEFAULT_PRIMARY ||
      accentColor !== DEFAULT_ACCENT ||
      clientText.trim().length > 0 ||
      logoFile !== null,
  );

  // ── Logo handling ──

  async function handleLogoSelect(e: Event): Promise<void> {
    logoError = "";
    const target = e.target;
    if (!(target instanceof HTMLInputElement)) return;

    const file = target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.has(file.type)) {
      logoError = m.onboarding_branding_logo_invalid_type();
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
        logoError = m.onboarding_branding_logo_too_large();
        target.value = "";
        return;
      }

      const processedBlob = new Blob([pngBuffer], { type: "image/png" });
      logoFile = new File([processedBlob], file.name, { type: "image/png" });
      if (logoPreviewUrl !== null) URL.revokeObjectURL(logoPreviewUrl);
      logoPreviewUrl = URL.createObjectURL(processedBlob);
    } catch {
      logoError = m.onboarding_branding_logo_invalid_type();
      target.value = "";
    }
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

  // ── Encrypt helpers ──

  async function encryptField(value: string): Promise<string> {
    const plainBytes = encoder.encode(value);
    const cipherBytes = await orgKeyManager.encrypt(plainBytes);
    return uint8ArrayToBase64(cipherBytes);
  }

  async function encryptLogo(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const cipherBytes = await orgKeyManager.encrypt(
      new Uint8Array(arrayBuffer),
    );
    return uint8ArrayToBase64(cipherBytes);
  }

  function buildClientBrandingBlob(
    name: string,
    color: string,
    accent: string,
    text: string,
  ): string {
    const orgPubKey = orgKeyManager.getPublicKey();
    if (!orgPubKey) {
      throw new Error("Org public key not available for client branding blob");
    }

    const payload = JSON.stringify({
      name,
      primaryColor: color,
      accentColor: accent,
      clientText: text,
    });
    const payloadBytes = encoder.encode(payload);
    const ciphertext = encryptClientBranding(payloadBytes, orgPubKey);
    return uint8ArrayToBase64(ciphertext);
  }

  // ── Save ──

  const saveMut = createMutation(() => ({
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
      toastStore.show(m.onboarding_branding_saved());
      announceToLiveRegion("polite", m.onboarding_branding_saved());
      void queryClient.invalidateQueries({ queryKey: adminKeys.branding() });
      oncomplete();
    },
    onError: () => {
      toastStore.show(m.onboarding_branding_error(), 3000);
      announceToLiveRegion("assertive", m.onboarding_branding_error());
    },
  }));

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    if (saveMut.isPending) return;

    const finalName = orgName.trim();
    const finalColor = isValidHexColor(primaryColor)
      ? primaryColor
      : DEFAULT_PRIMARY;
    const finalAccent = isValidHexColor(accentColor)
      ? accentColor
      : DEFAULT_ACCENT;
    const finalText = clientText.trim();

    let clientBlob: string;
    try {
      clientBlob = buildClientBrandingBlob(
        finalName,
        finalColor,
        finalAccent,
        finalText,
      );
    } catch {
      toastStore.show(m.onboarding_branding_error(), 3000);
      return;
    }

    const fields: {
      field: BrandingField;
      encryptedValue: string;
      clientEncryptedBranding: string;
    }[] = [];

    if (finalName.length > 0) {
      fields.push({
        field: "name",
        encryptedValue: await encryptField(finalName),
        clientEncryptedBranding: clientBlob,
      });
    }

    if (finalColor !== DEFAULT_PRIMARY) {
      fields.push({
        field: "primary_color",
        encryptedValue: await encryptField(finalColor),
        clientEncryptedBranding: clientBlob,
      });
    }

    if (finalAccent !== DEFAULT_ACCENT) {
      fields.push({
        field: "accent_color",
        encryptedValue: await encryptField(finalAccent),
        clientEncryptedBranding: clientBlob,
      });
    }

    if (finalText.length > 0) {
      fields.push({
        field: "client_text",
        encryptedValue: await encryptField(finalText),
        clientEncryptedBranding: clientBlob,
      });
    }

    if (logoFile) {
      fields.push({
        field: "logo",
        encryptedValue: await encryptLogo(logoFile),
        clientEncryptedBranding: clientBlob,
      });
    }

    if (fields.length === 0) {
      oncomplete();
      return;
    }

    saveMut.mutate(fields);
  }
</script>

<BlockTitle medium>{m.onboarding_branding_heading()}</BlockTitle>
<Block>
  <p class="step-desc">{m.onboarding_branding_subtext(withTerms())}</p>
</Block>

<form onsubmit={handleSubmit}>
  <Block>
    <div class="branding-form">
      <!-- Logo -->
      <div class="form-section-label">{m.onboarding_branding_logo_label()}</div>
      <label class="logo-row file-label">
        <input
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          class="file-input"
          onchange={(e) => void handleLogoSelect(e)}
          disabled={saveMut.isPending}
        />
        {#if logoPreviewUrl}
          <img
            src={logoPreviewUrl}
            alt={m.onboarding_branding_logo_preview_alt()}
            class="logo-preview"
          />
        {:else}
          <div class="logo-empty">
            <ImagePlus size={32} aria-hidden="true" />
          </div>
        {/if}
        <div class="logo-meta">
          <span class="file-btn touch-feedback">
            {m.onboarding_branding_logo_choose()}
          </span>
          <span class="field-hint">{m.onboarding_branding_logo_hint()}</span>
          {#if logoError}
            <span class="field-error" role="alert">{logoError}</span>
          {/if}
        </div>
      </label>

      <div class="form-divider"></div>

      <!-- Colors -->
      <div class="color-edit-row">
        <div class="color-picker-group">
          <div class="form-section-label">
            {m.onboarding_branding_primary_label()}
          </div>
          <div class="color-picker-row">
            <input
              type="color"
              value={primaryColor}
              oninput={(e: Event) => {
                if (e.target instanceof HTMLInputElement)
                  primaryColor = e.target.value;
              }}
              class="color-input"
              disabled={saveMut.isPending}
              aria-label={m.onboarding_branding_primary_label()}
            />
            <span class="color-hex">{primaryColor}</span>
          </div>
        </div>

        <div class="color-picker-group">
          <div class="form-section-label">
            {m.onboarding_branding_accent_label()}
          </div>
          <div class="color-picker-row">
            <input
              type="color"
              value={accentColor}
              oninput={(e: Event) => {
                if (e.target instanceof HTMLInputElement)
                  accentColor = e.target.value;
              }}
              class="color-input"
              disabled={saveMut.isPending}
              aria-label={m.onboarding_branding_accent_label()}
            />
            <span class="color-hex">{accentColor}</span>
          </div>
        </div>
      </div>

      <div class="form-divider"></div>

      <!-- Client text -->
      <div class="form-section-label">
        {m.onboarding_branding_text_label(withTerms())}
      </div>
    </div>
  </Block>

  <List strong inset>
    <ListInput
      outline
      label={m.onboarding_branding_text_label(withTerms())}
      type="textarea"
      placeholder={m.onboarding_branding_text_placeholder(withTerms())}
      value={clientText}
      onInput={(e: Event) => {
        if (e.target instanceof HTMLTextAreaElement)
          clientText = e.target.value;
      }}
      disabled={saveMut.isPending}
      inputClass="min-h-[80px]"
    />
  </List>

  <Block>
    <Button
      large
      type="submit"
      disabled={!orgKeyLoaded || !hasAnyContent || saveMut.isPending}
    >
      {#if saveMut.isPending}
        <Preloader class="w-5 h-5" />
      {:else}
        {m.onboarding_branding_submit()}
      {/if}
    </Button>
  </Block>
  <Block>
    <Button
      large
      outline
      type="button"
      onclick={onskip}
      disabled={saveMut.isPending}
    >
      {m.onboarding_branding_skip()}
    </Button>
  </Block>
</form>

<style>
  .branding-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .form-section-label {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
  }

  .form-divider {
    border-top: 1px solid color-mix(in srgb, var(--ink) 8%, transparent);
    margin: var(--space-xs) 0;
  }

  .logo-row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-xl);
    cursor: pointer;
  }

  .logo-preview {
    width: 80px;
    height: 80px;
    border-radius: var(--card-radius);
    object-fit: contain;
    background: color-mix(in srgb, var(--ink) 5%, transparent);
    flex-shrink: 0;
  }

  .logo-empty {
    width: 80px;
    height: 80px;
    border-radius: var(--card-radius);
    background: color-mix(in srgb, var(--ink) 5%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--muted);
  }

  .logo-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    flex: 1;
    min-width: 0;
  }

  .file-label {
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
    padding: var(--space-lg) var(--space-xl);
    border-radius: var(--card-radius);
    background: color-mix(in srgb, var(--ink) 8%, transparent);
    color: var(--ink);
    font-size: var(--text-sm);
    font-weight: 500;
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
    color: var(--error);
    font-weight: 500;
  }

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
    border-radius: var(--card-radius);
    cursor: pointer;
    padding: 2px;
    background: transparent;
  }

  .color-hex {
    font-family: ui-monospace, monospace;
    font-size: var(--text-sm);
    color: var(--ink);
  }
</style>
