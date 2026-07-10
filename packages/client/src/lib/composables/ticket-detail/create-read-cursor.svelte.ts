import { cursorSlot } from "@care-y/crypto";
import type { TicketKeyWrap } from "$lib/crypto/ticket-decrypt-cache.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import {
  serializedBufferToBase64,
  type SerializedBuffer,
} from "$lib/utils/buffer-encoding.js";

// ── Config ──

interface ReadCursorData {
  readonly encryptedReadCursor: SerializedBuffer | string;
}

export interface ReadCursorConfig {
  readonly getTicketId: () => string;
  /** Current user id: the read cursor row and its AAD are per-user (ADR-053). */
  readonly getUserId: () => string;
  readonly getTicketKeyWrap: () => TicketKeyWrap | undefined;
  readonly getCursorData: () => ReadCursorData | undefined;
  readonly cryptoBridge: CryptoBridge;
  readonly mutate: (args: {
    ticketId: string;
    encryptedReadCursor: string;
  }) => Promise<unknown>;
}

// ── Return type ──

export interface ReadCursorState {
  readonly readUpTo: Date | null | undefined;
  handleProgress(latestVisibleTimestamp: string): void;
  flush(): Promise<void>;
}

const FLUSH_DELAY_MS = 3000;

export function createReadCursor(config: ReadCursorConfig): ReadCursorState {
  // undefined = still loading, null = unread (dummy or decrypt failed).
  let readUpTo = $state<Date | null | undefined>(undefined);
  let pendingReadTimestamp: string | null = null;
  let cursorUpdateTimer: ReturnType<typeof setTimeout> | null = null;

  // Decrypt the read cursor when query data or key wrap changes.
  $effect(() => {
    const cursor = config.getCursorData();
    const kw = config.getTicketKeyWrap();
    const userId = config.getUserId();
    if (!cursor || !kw || userId === "") return;

    const ticketId = config.getTicketId();
    const ciphertext = serializedBufferToBase64(cursor.encryptedReadCursor);

    config.cryptoBridge
      .decrypt(
        ticketId,
        cursorSlot(userId),
        ticketId,
        kw.ephemeralPoint,
        kw.nonce,
        kw.wrappedKey,
        ciphertext,
      )
      .then((plaintext) => {
        try {
          const parsed: unknown = JSON.parse(plaintext);
          if (
            parsed !== null &&
            typeof parsed === "object" &&
            "readUpTo" in parsed
          ) {
            const ts = (parsed as Record<string, unknown>).readUpTo;
            if (typeof ts === "string") {
              readUpTo = new Date(ts); // eslint-disable-line svelte/prefer-svelte-reactivity -- immutable value, not mutated after assignment
              return;
            }
          }
        } catch {
          // JSON parse failed: treat as unread
        }
        readUpTo = null;
      })
      .catch(() => {
        // AEAD failure (random dummy bytes): all messages are unread.
        readUpTo = null;
      });
  });

  // Teardown-only timer cleanup, deliberately its own effect: cleanups
  // run before every re-run, so hanging this on the decrypt effect let
  // a cursor or key wrap refetch inside the flush window silently
  // cancel an armed write, and a conversation that fits the pane never
  // fires a second report to re-arm it. An effect that reads no
  // reactive state runs once, so this cleanup fires only on unmount.
  $effect(() => {
    return () => {
      if (cursorUpdateTimer) {
        clearTimeout(cursorUpdateTimer);
        cursorUpdateTimer = null;
      }
    };
  });

  function handleProgress(latestVisibleTimestamp: string): void {
    // Never re-persist a cursor the server already holds. The initial
    // visibility report fires on every open of an already-read thread,
    // and scrolling a fully-read thread reports too. Fewer cursor
    // writes also means less row-update metadata on the server.
    if (
      readUpTo instanceof Date &&
      Date.parse(latestVisibleTimestamp) <= readUpTo.getTime()
    ) {
      return;
    }
    if (
      pendingReadTimestamp !== null &&
      latestVisibleTimestamp <= pendingReadTimestamp
    ) {
      return;
    }
    pendingReadTimestamp = latestVisibleTimestamp;

    if (cursorUpdateTimer) clearTimeout(cursorUpdateTimer);
    cursorUpdateTimer = setTimeout(() => {
      void flush();
    }, FLUSH_DELAY_MS);
  }

  async function flush(): Promise<void> {
    const ts = pendingReadTimestamp;
    if (ts === null) return;
    pendingReadTimestamp = null;

    try {
      const ticketId = config.getTicketId();
      const userId = config.getUserId();
      if (userId === "") return;
      const payload = JSON.stringify({ readUpTo: ts });
      const encrypted = await config.cryptoBridge.encrypt(
        ticketId,
        cursorSlot(userId),
        payload,
      );
      await config.mutate({ ticketId, encryptedReadCursor: encrypted });
      readUpTo = new Date(ts); // eslint-disable-line svelte/prefer-svelte-reactivity -- immutable value, not mutated after assignment
    } catch {
      // Failed to update cursor. Not critical; will retry on next scroll.
    }
  }

  return {
    get readUpTo(): Date | null | undefined {
      return readUpTo;
    },
    handleProgress,
    flush,
  };
}
