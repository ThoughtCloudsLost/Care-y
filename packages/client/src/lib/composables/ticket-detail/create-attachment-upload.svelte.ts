/**
 * Composable managing file attachment uploads for ticket follow-ups.
 *
 * Upload happens before send so large files have independent progress and
 * retry. A failed send does not re-upload. The file key never touches the
 * main thread (ADR-089).
 */

import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import {
  PORTAL_ATTACHMENT_MAX_PLAINTEXT_BYTES,
  PORTAL_ALLOWED_CONTENT_TYPES,
  newAttachmentId,
  type AttachmentLink,
  type AttachmentId,
  type PortalAllowedContentType,
} from "@care-y/shared";
import { encode } from "@care-y/crypto";
import { toastStore } from "$lib/stores/toast.svelte.js";
import * as m from "$lib/paraglide/messages.js";

/** One pending attachment tracked from pick through upload. */
export interface PendingAttachment {
  /**
   * Branded rather than a bare string: this id is minted here and the
   * blob's AAD is built from it, so a plain string reaching the link
   * would be a value nothing can decrypt.
   */
  readonly attachmentId: AttachmentId;
  readonly filename: string;
  readonly sizeBytes: number;
  readonly contentType: PortalAllowedContentType;
  /** Upload lifecycle: encrypting, uploading, done, or failed. */
  readonly status: "encrypting" | "uploading" | "done" | "failed";
  /** Portal copy produced during encryption, sealed to the client key. */
  readonly portalCopy?: {
    ephemeralPoint: string;
    nonce: string;
    ciphertext: string;
  };
}

export interface AttachmentUploadConfig {
  readonly getTicketId: () => string;
  readonly getClientPublic: () => string | null;
  readonly cryptoBridge: CryptoBridge;
  /**
   * Upload mutate. The composable calls this after encryption succeeds.
   * Caller wires it to the ticket router's uploadAttachment mutation.
   */
  readonly uploadMutate: (args: {
    ticketId: string;
    attachmentId: string;
    blob: string;
    sizeBytes: number;
    contentType: PortalAllowedContentType;
    fileKeyWrap: string;
    encryptedFilename: string;
  }) => Promise<unknown>;
}

export interface AttachmentUpload {
  /** All pending attachments, in pick order. */
  readonly pending: readonly PendingAttachment[];
  /** True while any upload is in flight. */
  readonly busy: boolean;
  /** Pick and upload a file. Validates before any request. */
  attach: (file: File) => Promise<void>;
  /** Remove a pending attachment by id. */
  remove: (attachmentId: AttachmentId) => void;
  /** Clear all pending attachments (after a successful send). */
  clear: () => void;
  /** Build the links array for the send mutation. */
  links: () => AttachmentLink[];
}

const MAX_BYTES = PORTAL_ATTACHMENT_MAX_PLAINTEXT_BYTES;

/**
 * Narrows a browser-reported type to one the upload accepts.
 *
 * A guard rather than a bare `includes` check, so the allowed type flows
 * through to the mutation instead of widening to `string` and failing at
 * the boundary where the server's enum is enforced.
 */
function isAllowedContentType(
  value: string,
): value is PortalAllowedContentType {
  return (PORTAL_ALLOWED_CONTENT_TYPES as readonly string[]).includes(value);
}

function formatLimit(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${String(Math.round(mb))} MB`;
}

export function createAttachmentUpload(
  config: AttachmentUploadConfig,
): AttachmentUpload {
  const { getTicketId, getClientPublic, cryptoBridge, uploadMutate } = config;

  let pending = $state<PendingAttachment[]>([]);

  const busy = $derived(
    pending.some((a) => a.status === "encrypting" || a.status === "uploading"),
  );

  function updateEntry(
    attachmentId: string,
    patch: Partial<PendingAttachment>,
  ): void {
    pending = pending.map((a) =>
      a.attachmentId === attachmentId ? { ...a, ...patch } : a,
    );
  }

  async function attach(file: File): Promise<void> {
    // Guard against duplicate activation while an upload is in flight.
    if (busy) return;

    // Validate content type before reading any bytes.
    if (!isAllowedContentType(file.type)) {
      toastStore.show(m.attachment_type_not_allowed(), 3000);
      return;
    }

    // Validate size against the plaintext cap.
    if (file.size > MAX_BYTES) {
      toastStore.show(
        m.attachment_too_large({ limit: formatLimit(MAX_BYTES) }),
        3000,
      );
      return;
    }

    const attachmentId = newAttachmentId();
    const ticketId = getTicketId();
    const clientPublic = getClientPublic();

    pending = [
      ...pending,
      {
        attachmentId,
        filename: file.name,
        sizeBytes: file.size,
        contentType: file.type,
        status: "encrypting",
      },
    ];

    try {
      // Read once. The ArrayBuffer is transferred into the Worker and
      // neutered on this side, so it cannot be reused.
      const data = await file.arrayBuffer();

      const result = await cryptoBridge.encryptAttachment(
        ticketId,
        attachmentId,
        file.name,
        data,
        clientPublic ?? undefined,
      );

      updateEntry(attachmentId, {
        status: "uploading",
        portalCopy: result.portalCopy,
      });

      await uploadMutate({
        ticketId,
        attachmentId,
        blob: encode(new Uint8Array(result.blob)),
        sizeBytes: result.blob.byteLength,
        contentType: file.type,
        fileKeyWrap: result.fileKeyWrap,
        encryptedFilename: result.encryptedFilename,
      });

      updateEntry(attachmentId, { status: "done" });
    } catch {
      updateEntry(attachmentId, { status: "failed" });
      toastStore.show(m.attachment_upload_failed(), 3000);
    }
  }

  function remove(attachmentId: AttachmentId): void {
    pending = pending.filter((a) => a.attachmentId !== attachmentId);
  }

  function clear(): void {
    pending = [];
  }

  function links(): AttachmentLink[] {
    return pending
      .filter((a) => a.status === "done")
      .map((a) => {
        const link: AttachmentLink = { attachmentId: a.attachmentId };
        if (a.portalCopy) {
          return { ...link, portalCopy: a.portalCopy };
        }
        return link;
      });
  }

  return {
    get pending() {
      return pending;
    },
    get busy() {
      return busy;
    },
    attach,
    remove,
    clear,
    links,
  };
}
