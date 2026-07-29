import { followupSlot } from "@care-y/crypto";
import { SvelteSet } from "svelte/reactivity";
import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";
import type { FollowUpDecryptCache } from "$lib/crypto/follow-up-decrypt-cache.js";
import type { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";
import {
  resolveAsyncDecrypt,
  matchDecryptResult,
} from "$lib/crypto/decrypt-result.js";
import { formatRelativeTime } from "$lib/utils/format-time.js";
import {
  resolveVolunteerName,
  type VolunteerRecord,
} from "$lib/tickets/resolve-volunteer.js";
import type { toastStore as ToastStoreType } from "$lib/stores/toast.svelte.js";

type ToastStore = typeof ToastStoreType;

// ── Follow-up shape (subset of the full server type) ──

export interface SelectableFollowUp {
  readonly id: string;
  readonly source: string;
  readonly type: string;
  readonly createdBy: string | null;
  readonly createdAt: string;
  readonly encryptedContent: string;
}

// ── Config ──

export interface SelectModeConfig {
  readonly getTicketId: () => string;
  readonly getClientAlias: () => string;
  readonly getVolunteerMap: () => Map<string, VolunteerRecord>;
  readonly orgCache: OrgDecryptCache;
  readonly followUpCache: FollowUpDecryptCache;
  readonly getTicketKeyWrap: () => TicketKeyWrap | null | undefined;
  readonly toastStore: ToastStore;
  readonly labels: {
    readonly oneCopied: string;
    readonly manyCopied: (count: string) => string;
    readonly copyFailed: string;
  };
}

// ── Return type ──

export interface SelectModeState {
  readonly active: boolean;
  readonly selectedIds: SvelteSet<string>;
  enter(): void;
  exit(): void;
  toggle(id: string): void;
  copySelected(orderedFollowUps: readonly SelectableFollowUp[]): Promise<void>;
}

export function createSelectMode(config: SelectModeConfig): SelectModeState {
  let active = $state(false);
  const selectedIds = new SvelteSet<string>();

  function enter(): void {
    active = true;
    selectedIds.clear();
  }

  function exit(): void {
    active = false;
    selectedIds.clear();
  }

  function toggle(id: string): void {
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
  }

  async function copySelected(
    orderedFollowUps: readonly SelectableFollowUp[],
  ): Promise<void> {
    if (selectedIds.size === 0) return;

    const selected = orderedFollowUps.filter((fu) => selectedIds.has(fu.id));
    if (selected.length === 0) return;

    const lines: string[] = [];
    for (const fu of selected) {
      const time = formatRelativeTime(new Date(fu.createdAt)); // eslint-disable-line svelte/prefer-svelte-reactivity -- local throwaway value, not reactive state
      let author: string;
      if (fu.source === "system") {
        author = "[System]";
      } else if (fu.source === "client") {
        author = config.getClientAlias();
      } else {
        const name = resolveVolunteerName(
          fu.createdBy,
          config.getVolunteerMap(),
          config.orgCache,
        );
        author = name ?? "Volunteer";
        if (fu.type === "internal_note") {
          author = `${author} (internal note)`;
        }
      }

      let content = "";
      const keyWrap = config.getTicketKeyWrap();
      if (keyWrap) {
        const raw = config.followUpCache.decryptContent(
          fu.id,
          config.getTicketId(),
          followupSlot(fu.id),
          keyWrap,
          fu.encryptedContent,
        );
        const result = resolveAsyncDecrypt(raw, true);
        content = matchDecryptResult(result, {
          loading: () => "[encrypted]",
          ready: (v) => v,
          denied: () => "[access denied]",
          error: () => "[decryption error]",
        });
      }

      lines.push(`[${time}] ${author}: ${content}`);
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      const count = selected.length;
      config.toastStore.show(
        count === 1
          ? config.labels.oneCopied
          : config.labels.manyCopied(String(count)),
      );
    } catch {
      config.toastStore.show(config.labels.copyFailed);
    }
    exit();
  }

  return {
    get active(): boolean {
      return active;
    },
    get selectedIds(): SvelteSet<string> {
      return selectedIds;
    },
    enter,
    exit,
    toggle,
    copySelected,
  };
}
