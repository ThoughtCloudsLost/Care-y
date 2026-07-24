/**
 * Queue color/icon resolution.
 *
 * Queue color and icon are org-key encrypted picker tokens (tenant
 * migration 078). This module is the single place that turns a queue
 * record into renderable appearance values: it decrypts through the
 * shared OrgDecryptCache and falls back to the defaults for queues
 * created before the migration, unknown tokens, and pending decrypts.
 */

import type { Component } from "svelte";
import { Folder } from "@lucide/svelte";
import {
  ICON_BY_ID,
  COLOR_HEX_BY_ID,
} from "$lib/components/inputs/picker-options.js";
import type { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";
import type { SerializedBuffer } from "$lib/utils/buffer-encoding.js";

/** Default picker tokens for queues without a stored value. */
export const QUEUE_DEFAULT_COLOR = "grey";
export const QUEUE_DEFAULT_ICON = "folder";

export interface QueueAppearance {
  readonly colorId: string;
  readonly colorHex: string;
  readonly iconId: string;
  readonly icon: Component;
}

/**
 * Resolve already-decrypted picker tokens to renderable values.
 * Unknown or missing tokens resolve to the queue defaults.
 */
export function resolveQueueAppearance(
  colorId: string | null | undefined,
  iconId: string | null | undefined,
): QueueAppearance {
  const cid =
    colorId != null && colorId in COLOR_HEX_BY_ID
      ? colorId
      : QUEUE_DEFAULT_COLOR;
  const iid =
    iconId != null && iconId in ICON_BY_ID ? iconId : QUEUE_DEFAULT_ICON;
  return {
    colorId: cid,
    // eslint-disable-next-line security/detect-object-injection -- cid validated by `in` check above
    colorHex: COLOR_HEX_BY_ID[cid] ?? "var(--muted, #8e8e93)",
    iconId: iid,
    // eslint-disable-next-line security/detect-object-injection -- iid validated by `in` check above
    icon: ICON_BY_ID[iid] ?? Folder,
  };
}

export interface QueueAppearanceSource {
  readonly id: string;
  readonly encryptedColor: SerializedBuffer | Uint8Array | null;
  readonly encryptedIcon: SerializedBuffer | Uint8Array | null;
}

/**
 * Decrypt a queue's appearance tokens through the shared cache and
 * resolve them. Safe in `$derived` and templates: while a decrypt is
 * pending the defaults render, and the cache fill re-triggers rendering.
 */
export function decryptQueueAppearance(
  orgCache: OrgDecryptCache,
  queue: QueueAppearanceSource,
): QueueAppearance {
  const colorId = orgCache.decrypt(
    `queue-color:${queue.id}`,
    queue.encryptedColor,
  );
  const iconId = orgCache.decrypt(
    `queue-icon:${queue.id}`,
    queue.encryptedIcon,
  );
  return resolveQueueAppearance(colorId, iconId);
}

/** Cache keys to clear when a queue's appearance is edited. */
export function queueAppearanceCacheKeys(queueId: string): string[] {
  return [`queue-color:${queueId}`, `queue-icon:${queueId}`];
}
