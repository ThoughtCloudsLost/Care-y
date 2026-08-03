/**
 * ProseMirror NodeView for KB article images.
 *
 * Resolves `kb-attachment://{id}` URIs by fetching the encrypted blob
 * from the server, decrypting with the org key, and displaying via a
 * blob URL. Revokes the blob URL on destroy or when the src changes.
 *
 * For newly-uploaded images (src is already a blob: URL), no fetch
 * is needed. The NodeView detects this and displays directly.
 *
 * Shows a loading placeholder while fetch+decrypt is in progress,
 * and an error state if decryption fails. Displays an "alt missing"
 * badge when the image has no alt text (ATAG Part B visual cue).
 */

import type { Node as PMNode } from "prosemirror-model";
import type { EditorView, NodeView } from "prosemirror-view";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";

const KB_ATTACHMENT_PREFIX = "kb-attachment://";

export interface ImageViewDeps {
  /** Fetches the encrypted attachment blob by ID. */
  readonly downloadBlob: (attachmentId: string) => Promise<ArrayBuffer>;
  /** Org key manager for decrypting the blob. */
  readonly orgKeyManager: OrgKeyManager;
}

/**
 * Factory function that returns a ProseMirror NodeView constructor.
 * Pass this to EditorView's `nodeViews` option:
 *
 * ```ts
 * nodeViews: { image: createImageNodeView(deps) }
 * ```
 */
export function createImageNodeView(
  deps: ImageViewDeps,
): (
  node: PMNode,
  view: EditorView,
  getPos: () => number | undefined,
) => NodeView {
  return (node, _view, _getPos) => new KbImageView(node, deps);
}

class KbImageView implements NodeView {
  readonly dom: HTMLElement;
  private readonly img: HTMLImageElement;
  private readonly altBadge: HTMLSpanElement;
  private readonly loadingEl: HTMLDivElement;
  private readonly errorEl: HTMLDivElement;
  private blobUrl: string | null = null;
  private aborted = false;
  private readonly deps: ImageViewDeps;

  constructor(node: PMNode, deps: ImageViewDeps) {
    this.deps = deps;

    // Outer wrapper
    this.dom = document.createElement("span");
    this.dom.classList.add("pm-image-view");
    this.dom.contentEditable = "false";

    // Image element (hidden until loaded)
    this.img = document.createElement("img");
    this.img.classList.add("pm-image-view__img");
    this.img.draggable = true;
    this.img.style.display = "none";

    // Alt-missing badge
    this.altBadge = document.createElement("span");
    this.altBadge.classList.add("pm-image-view__alt-badge");
    this.altBadge.setAttribute("aria-hidden", "true");
    this.altBadge.style.display = "none";

    // Loading placeholder
    this.loadingEl = document.createElement("div");
    this.loadingEl.classList.add("pm-image-view__loading");

    // Error state
    this.errorEl = document.createElement("div");
    this.errorEl.classList.add("pm-image-view__error");
    this.errorEl.style.display = "none";

    this.dom.appendChild(this.img);
    this.dom.appendChild(this.altBadge);
    this.dom.appendChild(this.loadingEl);
    this.dom.appendChild(this.errorEl);

    this.renderNode(node);
  }

  /**
   * Called when ProseMirror wants to update this NodeView with a new
   * node. Returns true if we handled the update (same node type,
   * attrs changed). Returns false to trigger a full redraw.
   */
  update(node: PMNode): boolean {
    if (node.type.name !== "image") return false;

    const oldSrc = this.img.dataset.src ?? "";
    const newSrc = typeof node.attrs.src === "string" ? node.attrs.src : "";

    // If src changed, we need to re-fetch
    if (oldSrc !== newSrc) {
      this.revokeBlobUrl();
      this.renderNode(node);
    } else {
      // Just update alt/title without re-fetching
      this.updateAttrs(node);
    }
    return true;
  }

  destroy(): void {
    this.aborted = true;
    this.revokeBlobUrl();
  }

  /** Images should not capture cursor events. */
  stopEvent(): boolean {
    return false;
  }

  // ── Private ──────────────────────────────────────────────────────

  private renderNode(node: PMNode): void {
    const src = typeof node.attrs.src === "string" ? node.attrs.src : "";
    this.img.dataset.src = src;
    this.updateAttrs(node);

    if (src === "") {
      this.showError();
      return;
    }

    // Already a displayable URL (blob: or data: from recent upload)
    if (src.startsWith("blob:") || src.startsWith("data:")) {
      this.showImage(src);
      return;
    }

    // kb-attachment:// URI: fetch and decrypt
    if (src.startsWith(KB_ATTACHMENT_PREFIX)) {
      const attachmentId = src.slice(KB_ATTACHMENT_PREFIX.length);
      this.showLoading();
      void this.fetchAndDecrypt(attachmentId);
      return;
    }

    // External URL (from paste): display directly
    this.showImage(src);
  }

  private async fetchAndDecrypt(attachmentId: string): Promise<void> {
    try {
      const buf = await this.deps.downloadBlob(attachmentId);
      if (this.aborted) return;

      const raw = new Uint8Array(buf);
      const decrypted = await this.deps.orgKeyManager.decrypt(raw);

      const blob = new Blob([new Uint8Array(decrypted)]);
      this.blobUrl = URL.createObjectURL(blob);
      this.showImage(this.blobUrl);
    } catch (err: unknown) {
      if (this.aborted) return;
      console.error("[ImageView] Decrypt failed", { attachmentId, err });
      this.showError();
    }
  }

  private updateAttrs(node: PMNode): void {
    const alt = typeof node.attrs.alt === "string" ? node.attrs.alt : "";
    const title = typeof node.attrs.title === "string" ? node.attrs.title : "";

    this.img.alt = alt;
    if (title) {
      this.img.title = title;
    } else {
      this.img.removeAttribute("title");
    }

    // Alt-missing badge visibility
    if (alt === "") {
      this.altBadge.textContent = "alt";
      this.altBadge.style.display = "";
    } else {
      this.altBadge.style.display = "none";
    }
  }

  private showImage(src: string): void {
    this.img.src = src;
    this.img.style.display = "";
    this.loadingEl.style.display = "none";
    this.errorEl.style.display = "none";
  }

  private showLoading(): void {
    this.img.style.display = "none";
    this.loadingEl.style.display = "";
    this.errorEl.style.display = "none";
  }

  private showError(): void {
    this.img.style.display = "none";
    this.loadingEl.style.display = "none";
    this.errorEl.textContent = "Image could not be loaded";
    this.errorEl.style.display = "";
  }

  private revokeBlobUrl(): void {
    if (this.blobUrl !== null) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }
}
