/**
 * Reactive cache for ticket-tier (PII) ECIES decryption.
 *
 * Extends AsyncDecryptCache to inherit the SvelteMap + pending Set +
 * CryptoBridge pattern and auto-register with CacheRegistry. The only
 * domain-specific logic is decryptTitle(), which handles the null-keyWrap
 * edge case and serialized-buffer-to-base64 conversion before delegating
 * to the base class decrypt().
 */

import { cursorSlot, followupSlot } from "@care-y/crypto";
import {
  AsyncDecryptCache,
  DECRYPT_ERROR_SENTINEL,
} from "./async-decrypt-cache.js";
import type { CryptoBridge } from "$lib/workers/crypto-bridge.js";
import { CryptoWorkerError } from "$lib/workers/crypto-bridge-errors.js";

export interface TicketKeyWrap {
  readonly ephemeralPoint: string;
  readonly nonce: string;
  readonly wrappedKey: string;
}

export class TicketDecryptCache extends AsyncDecryptCache {
  constructor(bridge: CryptoBridge) {
    super(bridge, "TicketDecryptCache");
  }

  /**
   * Request decryption of a ticket title. Returns the cached plaintext
   * if already decrypted, or undefined if decryption is in-flight or
   * hasn't started yet.
   *
   * Calling this method triggers an async decrypt if the ticket hasn't
   * been seen before. The SvelteMap update will reactively re-render
   * any components reading the return value.
   *
   * When `intakeWrap` is provided (org-key sealed box from
   * intake_key_wraps), the Worker unseals it with orgSecret to recover
   * tk, then decrypts the title using the cached tk. This path applies
   * to intake tickets before their wrap has been converted to ECIES.
   */
  decryptTitle(
    ticketId: string,
    keyWrap: TicketKeyWrap | null,
    encryptedTitle: string,
    intakeWrap?: string | null,
  ): string | undefined {
    if (keyWrap === null) {
      // An intake wrap unseals via orgSecret and caches tk for the decrypt
      if (
        intakeWrap !== undefined &&
        intakeWrap !== null &&
        intakeWrap !== ""
      ) {
        return this.decryptTitleViaIntakeWrap(
          ticketId,
          intakeWrap,
          encryptedTitle,
        );
      }

      // No key wrap and no intake wrap: the ticket cannot be decrypted
      // (missing key material). Defer the cache write to avoid
      // state_unsafe_mutation when called from a render expression.
      if (!this.has(ticketId)) {
        queueMicrotask(() => {
          if (!this.has(ticketId)) {
            this.setError(ticketId);
          }
        });
      }
      return DECRYPT_ERROR_SENTINEL;
    }

    return this.decrypt(
      ticketId,
      ticketId,
      "title",
      keyWrap.ephemeralPoint,
      keyWrap.nonce,
      keyWrap.wrappedKey,
      encryptedTitle,
    );
  }

  /**
   * Request decryption of a ticket description. Same trigger-and-cache
   * pattern as decryptTitle; the "description" slot is a direct ticket
   * field slot like "title". Cached under desc:<ticketId> so it never
   * collides with the title entry.
   *
   * When `intakeWrap` is provided and keyWrap is null, the description
   * is decrypted using the tk already cached by a prior intake title
   * decrypt. The Worker's resolveTk cache lookup succeeds without ECIES.
   */
  decryptDescription(
    ticketId: string,
    keyWrap: TicketKeyWrap | null,
    encryptedDescription: string,
    intakeWrap?: string | null,
  ): string | undefined {
    const cacheKey = `desc:${ticketId}`;
    if (keyWrap === null) {
      // Intake wrap present: tk should already be cached in the Worker
      // from a prior title decrypt. Attempt decryption directly.
      if (
        intakeWrap !== undefined &&
        intakeWrap !== null &&
        intakeWrap !== ""
      ) {
        return this.decryptDescViaIntakeWrap(
          cacheKey,
          ticketId,
          intakeWrap,
          encryptedDescription,
        );
      }

      if (!this.has(cacheKey)) {
        queueMicrotask(() => {
          if (!this.has(cacheKey)) {
            this.setError(cacheKey);
          }
        });
      }
      return DECRYPT_ERROR_SENTINEL;
    }

    return this.decrypt(
      cacheKey,
      ticketId,
      "description",
      keyWrap.ephemeralPoint,
      keyWrap.nonce,
      keyWrap.wrappedKey,
      encryptedDescription,
    );
  }

  /**
   * Decrypt description for an intake ticket. Chains unseal (if tk is
   * not already cached) then decrypts. Uses the same intakePending guard.
   */
  private decryptDescViaIntakeWrap(
    cacheKey: string,
    ticketId: string,
    intakeWrap: string,
    encryptedDescription: string,
  ): string | undefined {
    const cached = this.get(cacheKey);
    if (cached !== undefined) return cached;
    if (this.intakePending.has(cacheKey)) return undefined;
    if (this.bridge.getState() === "DESTROYED") return undefined;

    this.intakePending.add(cacheKey);

    // Unseal tk (may already be cached from title decrypt; the Worker
    // handles that idempotently) then decrypt description.
    void this.bridge
      .unwrapIntakeTk(ticketId, intakeWrap)
      .then(async () =>
        this.bridge.decrypt(
          ticketId,
          "description",
          ticketId,
          "",
          "",
          "",
          encryptedDescription,
        ),
      )
      .then((plaintext) => {
        this.seed(cacheKey, plaintext);
      })
      .catch((err: unknown) => {
        if (
          err instanceof CryptoWorkerError &&
          err.code === "BRIDGE_DESTROYED"
        ) {
          return;
        }
        this.setError(cacheKey);
        if (import.meta.env.DEV) {
          console.warn(
            "[TicketDecryptCache] intakeWrap desc decrypt failed for",
            ticketId,
            err,
          );
        }
      })
      .finally(() => {
        this.intakePending.delete(cacheKey);
      });

    return undefined;
  }

  /**
   * Request decryption of a follow-up's encrypted content using the
   * ticket's key wrap. Same trigger-and-cache pattern as decryptTitle.
   * The Worker reuses the ticket key cached from title decryption.
   */
  decryptFollowUp(
    ticketId: string,
    followupId: string,
    keyWrap: TicketKeyWrap,
    ciphertext: string,
  ): string | undefined {
    return this.decrypt(
      `fu:${ticketId}:${followupId}`,
      ticketId,
      followupSlot(followupId),
      keyWrap.ephemeralPoint,
      keyWrap.nonce,
      keyWrap.wrappedKey,
      ciphertext,
    );
  }

  /** In-flight intake wrap operations, keyed by ticketId. */
  private readonly intakePending = new Set<string>();

  /**
   * Decrypt a ticket title via an intake wrap (org-key sealed box) when
   * the volunteer has no ECIES wrap. The Worker unseals with orgSecret
   * via crypto_box_seal_open, caches tk, then decrypts the title content.
   *
   * Uses the same cache key as standard decryptTitle (ticketId) so
   * subsequent renders pick up the result regardless of the wrap source.
   */
  private decryptTitleViaIntakeWrap(
    ticketId: string,
    intakeWrap: string,
    encryptedTitle: string,
  ): string | undefined {
    const cached = this.get(ticketId);
    if (cached !== undefined) return cached;
    if (this.intakePending.has(ticketId)) return undefined;
    if (this.bridge.getState() === "DESTROYED") return undefined;

    this.intakePending.add(ticketId);

    // Chain: unseal tk into Worker cache, then decrypt the title using
    // the now-cached tk. The Worker's resolveTk checks the cache before
    // attempting ECIES, so the empty key-wrap strings never reach decode.
    void this.bridge
      .unwrapIntakeTk(ticketId, intakeWrap)
      .then(async () =>
        this.bridge.decrypt(
          ticketId,
          "title",
          ticketId,
          "",
          "",
          "",
          encryptedTitle,
        ),
      )
      .then((plaintext) => {
        this.seed(ticketId, plaintext);
      })
      .catch((err: unknown) => {
        if (
          err instanceof CryptoWorkerError &&
          err.code === "BRIDGE_DESTROYED"
        ) {
          return;
        }
        this.setError(ticketId);
        if (import.meta.env.DEV) {
          console.warn(
            "[TicketDecryptCache] intakeWrap decrypt failed for",
            ticketId,
            err,
          );
        }
      })
      .finally(() => {
        this.intakePending.delete(ticketId);
      });

    return undefined;
  }

  clearFollowUps(): void {
    this.deleteByPrefix("fu:");
  }

  /**
   * Request decryption of a per-user read cursor blob for the tickets
   * list. Returns the decrypted JSON payload string ({"readUpTo": ...}),
   * undefined while pending, or the error sentinel when the blob is a
   * first-open dummy row or otherwise fails AEAD (both read as "no real
   * cursor" and therefore not unread).
   *
   * The cache key carries a ciphertext prefix so a cursor update (new
   * random ciphertext) re-decrypts instead of serving a stale readUpTo.
   * The bridge call mirrors the detail composable's exactly: per-user
   * AAD slot, the row's own key wrap, and the ticket id as the Worker
   * key-cache id so cursor versions share one unwrapped ticket key.
   *
   * Lifecycle: a successful read-cursor flush evicts the ticket's
   * cursor: prefix (detail orchestrator) so versions do not pile up as
   * the user reads. Residual growth from sweep refetches of other-device
   * updates remains, bounded by the user's open-ticket count; accepted.
   */
  decryptReadCursor(
    ticketId: string,
    userId: string,
    keyWrap: TicketKeyWrap | null,
    encryptedReadCursor: string,
  ): string | undefined {
    const cacheKey = `cursor:${ticketId}:${encryptedReadCursor.slice(0, 24)}`;
    if (keyWrap === null) {
      if (!this.has(cacheKey)) {
        queueMicrotask(() => {
          if (!this.has(cacheKey)) {
            this.setError(cacheKey);
          }
        });
      }
      return DECRYPT_ERROR_SENTINEL;
    }

    return this.decrypt(
      cacheKey,
      ticketId,
      cursorSlot(userId),
      keyWrap.ephemeralPoint,
      keyWrap.nonce,
      keyWrap.wrappedKey,
      encryptedReadCursor,
      ticketId,
    );
  }
}
