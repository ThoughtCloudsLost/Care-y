/**
 * ProseMirror NodeView for form content images.
 *
 * Resolves `form-asset://{blobId}` URIs to the public serving endpoint
 * `/api/forms/{orgSlug}/{blobId}`. Unlike the KB image NodeView, no
 * client-side decrypt is needed: the server handler derives the
 * branding key and serves the image directly.
 *
 * For blob: URLs (from a just-uploaded image before save), displays
 * directly. Shows an alt-missing badge when alt text is empty.
 */

import type { Node as PMNode } from "prosemirror-model";
import type { EditorView, NodeView } from "prosemirror-view";

const FORM_ASSET_PREFIX = "form-asset://";

/**
 * Factory that returns a ProseMirror NodeView constructor for form
 * content images. The orgSlug is captured at creation time and used
 * to build the serving URL.
 *
 * Usage:
 * ```ts
 * nodeViews: { image: createFormAssetImageView(orgSlug) }
 * ```
 */
export function createFormAssetImageView(
  orgSlug: string | null,
): (
  node: PMNode,
  view: EditorView,
  getPos: () => number | undefined,
) => NodeView {
  return (node, _view, _getPos) => new FormAssetImageView(node, orgSlug);
}

class FormAssetImageView implements NodeView {
  readonly dom: HTMLElement;
  private readonly img: HTMLImageElement;
  private readonly altBadge: HTMLSpanElement;
  private readonly orgSlug: string | null;

  constructor(node: PMNode, orgSlug: string | null) {
    this.orgSlug = orgSlug;

    // Outer wrapper
    this.dom = document.createElement("span");
    this.dom.classList.add("pm-form-image-view");
    this.dom.contentEditable = "false";

    // Image element
    this.img = document.createElement("img");
    this.img.classList.add("pm-form-image-view__img");
    this.img.draggable = true;

    // Alt-missing badge
    this.altBadge = document.createElement("span");
    this.altBadge.classList.add("pm-form-image-view__alt-badge");
    this.altBadge.setAttribute("aria-hidden", "true");
    this.altBadge.style.display = "none";

    this.dom.appendChild(this.img);
    this.dom.appendChild(this.altBadge);

    this.renderNode(node);
  }

  update(node: PMNode): boolean {
    if (node.type.name !== "image") return false;
    this.renderNode(node);
    return true;
  }

  destroy(): void {
    // No blob URLs to revoke (server-served images use regular URLs)
  }

  stopEvent(): boolean {
    return false;
  }

  // ── Private ──────────────────────────────────────────────────────

  private renderNode(node: PMNode): void {
    const src = typeof node.attrs.src === "string" ? node.attrs.src : "";
    const alt = typeof node.attrs.alt === "string" ? node.attrs.alt : "";
    const title = typeof node.attrs.title === "string" ? node.attrs.title : "";

    // Resolve form-asset:// URIs to the public serving endpoint
    let resolvedSrc = src;
    if (src.startsWith(FORM_ASSET_PREFIX) && this.orgSlug !== null) {
      const blobId = src.slice(FORM_ASSET_PREFIX.length);
      resolvedSrc = `/api/forms/${this.orgSlug}/${blobId}`;
    }

    this.img.src = resolvedSrc;
    this.img.alt = alt;
    if (title) {
      this.img.title = title;
    } else {
      this.img.removeAttribute("title");
    }

    // Alt-missing badge
    if (alt === "") {
      this.altBadge.textContent = "alt";
      this.altBadge.style.display = "";
    } else {
      this.altBadge.style.display = "none";
    }
  }
}
