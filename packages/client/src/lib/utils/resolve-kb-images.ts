/**
 * Svelte action that resolves kb-attachment:// image URIs in rendered
 * article HTML. Finds <img> elements with the custom scheme, fetches
 * the encrypted blob from the server, decrypts with the org key, and
 * replaces the src with a blob URL.
 *
 * Shows a DecryptPlaceholder-style scramble animation while loading.
 * Revokes all blob URLs on destroy.
 *
 * Usage:
 * ```svelte
 * <article use:resolveKbImages={resolverDeps}>
 *   {@html renderedBody}
 * </article>
 * ```
 */

const KB_PREFIX = "kb-attachment://";

export interface KbImageResolverDeps {
  downloadBlob: (attachmentId: string) => Promise<ArrayBuffer>;
  decrypt: (ciphertext: Uint8Array) => Promise<Uint8Array>;
  /** Change this value to trigger a re-scan (e.g. pass renderedBody). */
  contentKey?: string | null;
}

export function resolveKbImages(
  el: HTMLElement,
  deps: KbImageResolverDeps,
): { update: (deps: KbImageResolverDeps) => void; destroy: () => void } {
  const blobUrls: string[] = [];

  function resolve(d: KbImageResolverDeps): void {
    const imgs = el.querySelectorAll<HTMLImageElement>("img");

    for (const img of imgs) {
      const rawSrc = img.getAttribute("src") ?? "";
      if (!rawSrc.startsWith(KB_PREFIX)) continue;

      // Skip images already being resolved or already resolved
      if (img.dataset.kbResolving === "true") continue;
      img.dataset.kbResolving = "true";

      const attachmentId = rawSrc.slice(KB_PREFIX.length);

      // Insert decrypt placeholder before the img, hide the img
      img.style.display = "none";
      const placeholder = document.createElement("span");
      placeholder.className = "kb-img-decrypt";
      placeholder.setAttribute("role", "img");
      placeholder.setAttribute("aria-busy", "true");
      placeholder.setAttribute("aria-label", img.alt || "Decrypting image");
      const scramble = document.createElement("span");
      scramble.className = "kb-img-scramble";
      scramble.setAttribute("aria-hidden", "true");
      placeholder.appendChild(scramble);
      img.parentElement?.insertBefore(placeholder, img);

      void (async (): Promise<void> => {
        try {
          const buf = await d.downloadBlob(attachmentId);
          const raw = new Uint8Array(buf);
          const decrypted = await d.decrypt(raw);
          const blob = new Blob([new Uint8Array(decrypted)]);
          const url = URL.createObjectURL(blob);
          blobUrls.push(url);
          img.src = url;
          img.style.display = "";
          placeholder.remove();
        } catch (err: unknown) {
          console.error("[resolveKbImages] Decrypt failed", {
            attachmentId,
            err,
          });
          placeholder.className = "kb-img-error";
          placeholder.textContent = img.alt || "Image could not be loaded";
        }
      })();
    }
  }

  resolve(deps);

  return {
    update(newDeps: KbImageResolverDeps): void {
      resolve(newDeps);
    },
    destroy(): void {
      for (const url of blobUrls) {
        URL.revokeObjectURL(url);
      }
    },
  };
}
