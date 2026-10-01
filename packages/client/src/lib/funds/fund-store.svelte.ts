/**
 * Session cache for funds, their sealed balances, and (for auditors
 * only) the ledger.
 *
 * Every surface that shows a fund or a balance calls createFundStore()
 * during component setup. It reads funds.list alone: each fund's sealed
 * payload and sealed running balance, decrypted once per session through
 * the shared OrgDecryptCache. The rows live in the TanStack Query cache
 * under fundKeys, so all surfaces read one cache. Writes and the
 * fund_entry_recorded SSE event invalidate fundKeys.all.
 *
 * The ledger is a separate cache (createFundLedger) that only the audit
 * page opens. Nothing else fetches it: a balance never needs it.
 *
 * Every write that moves money submits the next sealed balance and the
 * version it was computed from. The server applies it only if the
 * version still matches; on FUND_BALANCE_STALE the writer refetches the
 * list, recomputes from the fresh balance, and retries once
 * (writeWithBalance).
 *
 * Reading funds is itself a permission. Without it the store stays
 * disabled, and every surface built on it renders nothing.
 */

import {
  createQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/svelte-query";
import type { TRPCClient } from "@trpc/client";
import type { AppRouter } from "@care-y/server";
import {
  ErrorCode,
  fundIdSchema,
  fundLedgerIdSchema,
  type FundId,
  type FundLedgerId,
  type FundLedgerPayload,
  type FundPayload,
} from "@care-y/shared";
import { trpc } from "$lib/trpc/index.js";
import { fundKeys, queueKeys, ticketKeys } from "$lib/query/keys.js";
import { ClientError, requireRouter } from "$lib/errors.js";
import { decode } from "@care-y/crypto";
import {
  getCurrentPermissions,
  getOrgDecryptCache,
  getOrgKeyManager,
} from "$lib/crypto/context.js";
import { canCall } from "$lib/auth/procedure-gates.js";
import type { OrgKeyManager } from "$lib/crypto/org-key.js";
import { enabledTicketId } from "$lib/tickets/queries.js";
import type { OrgDecryptCache } from "$lib/crypto/org-decrypt-cache.js";
import {
  FundUnavailableError,
  openBalancePayload,
  openFundPayload,
  openLedgerPayload,
  sealBalancePayload,
  sealFundPayload,
  type FundSealer,
} from "./fund-payloads.js";
import {
  EMPTY_TOTALS,
  balanceAfter,
  computeLedgerTotalsByFund,
  groupByFund,
  indexById,
  reversedEntryIds,
  type LedgerTotals,
} from "./balances.js";

export type FundsRouter = NonNullable<TRPCClient<AppRouter>["funds"]>;
type FundList = Awaited<ReturnType<FundsRouter["list"]["query"]>>;
type FundRow = FundList["funds"][number];
type LedgerRow = Awaited<
  ReturnType<FundsRouter["listLedger"]["query"]>
>["entries"][number];

/** A fund's sealed running balance and the version it was written at. */
export interface SealedBalance {
  readonly balanceMinor: number;
  readonly version: number;
}

/** A fund whose payload decrypted and validated. */
export interface FundView {
  readonly id: FundId;
  readonly name: string;
  readonly currency: string;
  /** Non-null once linked to a provider; the raised term shows only then. */
  readonly providerLink: FundPayload["providerLink"];
  readonly isActive: boolean;
  readonly sortOrder: number;
  /** The Org Key generation the row is sealed under. */
  readonly orgKeyGeneration: number;
  /** Null while the sealed balance decrypts, or when it is unreadable. */
  readonly balance: SealedBalance | null;
}

/** A ledger entry whose payload decrypted and validated. */
export interface LedgerEntryView {
  readonly id: FundLedgerId;
  readonly entryDate: LedgerRow["entryDate"];
  readonly payload: FundLedgerPayload;
}

// ── Cache keys ──────────────────────────────────────────────────────

/**
 * A fund payload changes on edit, so its cache key carries updatedAt.
 * An edit made on another device then decrypts fresh on the next fetch.
 */
export function fundCacheKey(row: {
  readonly id: string;
  readonly updatedAt: string | Date;
}): string {
  return `fund:${row.id}:${String(row.updatedAt)}`;
}

/**
 * Every entry bumps the balance version, so keying by version makes each
 * new balance decrypt fresh.
 */
export function fundBalanceCacheKey(row: {
  readonly id: string;
  readonly balanceVersion: number;
}): string {
  return `fund-balance:${row.id}:${String(row.balanceVersion)}`;
}

/** Ledger rows are immutable, so the id alone keys them. */
export function ledgerCacheKey(entryId: string): string {
  return `fund-ledger:${entryId}`;
}

/** The queue's sealed fund id, next to its sealed name, color and icon. */
export function queueFundCacheKey(queueId: string): string {
  return `queue-fund:${queueId}`;
}

/**
 * The fund a queue maps to, or null when the queue has none or the value
 * is still decrypting.
 */
export function decryptQueueFundId(
  orgCache: Pick<OrgDecryptCache, "decrypt">,
  queue: { readonly id: string; readonly encryptedFundId: string | null },
): string | null {
  return orgCache.decrypt(queueFundCacheKey(queue.id), queue.encryptedFundId, {
    table: "queues",
    id: queue.id,
  });
}

/** Refetch funds, the ledger and the fund settings. */
export function invalidateFunds(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: fundKeys.all });
}

// ── Balance writes ──────────────────────────────────────────────────

/**
 * The balance half of every money-moving write. `orgKeyGeneration` is
 * the generation the new balance was sealed under. When the fund row is
 * behind it, `encryptedPayload` carries the fund payload resealed under
 * the same generation, so the server moves the whole row at once.
 */
export interface BalanceWrite {
  readonly fundId: FundId;
  readonly encryptedBalance: string;
  readonly expectedVersion: number;
  readonly orgKeyGeneration: number;
  readonly encryptedPayload?: string;
}

/** Everything a balance write builds on, read from one fund row. */
export interface BalanceSnapshot extends SealedBalance {
  /** The generation the row is sealed under. */
  readonly orgKeyGeneration: number;
  /** The fund's payload, resealed when the row is behind. */
  readonly payload: FundPayload;
}

export interface BalanceWriterDeps {
  /** The fund as the session cache holds it, if its balance is readable. */
  readonly read: (fundId: FundId) => BalanceSnapshot | null;
  /** Refetch funds.list and open the fund's row fresh. */
  readonly reload: (fundId: FundId) => Promise<BalanceSnapshot>;
  /** The Org Key generation the sealer seals under. */
  readonly sealingGeneration: () => Promise<number>;
  readonly sealer: FundSealer;
}

/** The server refused a balance write because another write landed first. */
export function isBalanceStale(err: unknown): boolean {
  return err instanceof Error && err.message === ErrorCode.FUND_BALANCE_STALE;
}

/** Seal `balanceMinor` against a snapshot and run one write. */
async function attemptBalanceWrite<T>(
  deps: BalanceWriterDeps,
  fundId: FundId,
  snapshot: BalanceSnapshot,
  balanceMinor: number,
  write: (balance: BalanceWrite) => Promise<T>,
): Promise<T> {
  const generation = await deps.sealingGeneration();
  const [encryptedBalance, encryptedPayload] = await Promise.all([
    sealBalancePayload(deps.sealer, balanceMinor),
    snapshot.orgKeyGeneration < generation
      ? sealFundPayload(deps.sealer, snapshot.payload)
      : Promise.resolve(undefined),
  ]);
  return write({
    fundId,
    encryptedBalance,
    expectedVersion: snapshot.version,
    orgKeyGeneration: generation,
    ...(encryptedPayload === undefined ? {} : { encryptedPayload }),
  });
}

/**
 * Run a money-moving write with the fund's next sealed balance: the one
 * read plus `deltaMinor`, sent with the version it was read at. When
 * another write landed in between the server answers FUND_BALANCE_STALE;
 * the row is then refetched, the balance recomputed and the write
 * retried once. A second refusal, or any other error, reaches the caller.
 *
 * `write` must be safe to call twice with the same ids: a refused write
 * rolls back in full, so the retry reuses them.
 */
export async function writeWithBalance<T>(
  deps: BalanceWriterDeps,
  fundId: FundId,
  deltaMinor: number,
  write: (balance: BalanceWrite) => Promise<T>,
): Promise<T> {
  const attempt = async (snapshot: BalanceSnapshot): Promise<T> =>
    attemptBalanceWrite(
      deps,
      fundId,
      snapshot,
      balanceAfter(snapshot.balanceMinor, deltaMinor),
      write,
    );

  const first = deps.read(fundId) ?? (await deps.reload(fundId));
  try {
    return await attempt(first);
  } catch (err: unknown) {
    if (!isBalanceStale(err)) throw err;
  }
  return attempt(await deps.reload(fundId));
}

/**
 * Overwrite a fund's balance with an absolute figure, once. Used by the
 * recompute from the ledger: a stale refusal means an entry landed
 * meanwhile, so the ledger sum itself is out of date and a retry would
 * write the wrong figure. The error reaches the caller instead.
 */
export async function setBalanceOnce<T>(
  deps: BalanceWriterDeps,
  fundId: FundId,
  balanceMinor: number,
  write: (balance: BalanceWrite) => Promise<T>,
): Promise<T> {
  const snapshot = deps.read(fundId) ?? (await deps.reload(fundId));
  return attemptBalanceWrite(deps, fundId, snapshot, balanceMinor, write);
}

/** No known generation matches the org public key this session holds. */
export class SealingGenerationError extends ClientError {
  constructor() {
    super("Org key generation unknown");
    this.name = "SealingGenerationError";
  }
}

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a.at(i) !== b.at(i)) return false;
  }
  return true;
}

/**
 * The generation this session's org key seals under: the generation
 * whose public key matches the one the session loaded at unlock. Asked
 * of the server on each write, so a rotation since unlock shows up as a
 * mismatch rather than a mislabelled row.
 */
async function sealingGeneration(
  orgKeyManager: Pick<OrgKeyManager, "getPublicKey">,
): Promise<number> {
  const wrapped = await trpc.keys.getWrappedOrgKey.query();
  const current = orgKeyManager.getPublicKey();
  if (wrapped === null || current === null) throw new SealingGenerationError();
  const match = wrapped.generations.find((g) =>
    sameBytes(decode(g.publicKey), current),
  );
  if (match === undefined) throw new SealingGenerationError();
  return match.generation;
}

export interface BalanceWriter {
  /** Add `deltaMinor` to the fund's balance with the write. */
  write<T>(
    fundId: FundId,
    deltaMinor: number,
    run: (balance: BalanceWrite) => Promise<T>,
  ): Promise<T>;
  /** Replace the fund's balance with `balanceMinor`, no retry. */
  set<T>(
    fundId: FundId,
    balanceMinor: number,
    run: (balance: BalanceWrite) => Promise<T>,
  ): Promise<T>;
}

/**
 * Bind the balance writes to the session: reads come from the store,
 * reloads refetch funds.list into the shared cache and decrypt the fresh
 * row directly. Call during component setup.
 */
export function createBalanceWriter(store: FundStore): BalanceWriter {
  const queryClient = useQueryClient();
  const orgKeyManager = getOrgKeyManager();

  const deps: BalanceWriterDeps = {
    read: (fundId) => {
      const fund = store.fund(fundId);
      if (fund?.balance == null) return null;
      return {
        ...fund.balance,
        orgKeyGeneration: fund.orgKeyGeneration,
        payload: {
          v: 1,
          name: fund.name,
          currency: fund.currency,
          providerLink: fund.providerLink,
        },
      };
    },
    reload: async (fundId) => {
      const list = await queryClient.fetchQuery({
        queryKey: fundKeys.list(),
        queryFn: async (): Promise<FundList> =>
          requireRouter(trpc.funds, "funds").list.query(),
        staleTime: 0,
      });
      const row = list.funds.find((f) => f.id === fundId);
      if (row === undefined) throw new FundUnavailableError();
      const [balanceText, payloadText] = await Promise.all([
        orgKeyManager.decryptText(row.encryptedBalance),
        orgKeyManager.decryptText(row.encryptedPayload),
      ]);
      const balance = openBalancePayload(balanceText);
      const payload = openFundPayload(payloadText);
      if (balance === null || payload === null) {
        throw new FundUnavailableError();
      }
      return {
        balanceMinor: balance.balanceMinor,
        version: row.balanceVersion,
        orgKeyGeneration: row.orgKeyGeneration,
        payload,
      };
    },
    sealingGeneration: async () => sealingGeneration(orgKeyManager),
    sealer: orgKeyManager,
  };

  return {
    write: async (fundId, deltaMinor, run) =>
      writeWithBalance(deps, fundId, deltaMinor, run),
    set: async (fundId, balanceMinor, run) =>
      setBalanceOnce(deps, fundId, balanceMinor, run),
  };
}

// ── Fund store ──────────────────────────────────────────────────────

export interface FundStore {
  /**
   * False when the server does not mount the funds router or the session
   * may not read funds. Surfaces hide themselves while this is false.
   */
  readonly enabled: boolean;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
  /** Some payloads or balances are still waiting on the crypto Worker. */
  readonly decrypting: boolean;
  /**
   * Funds whose payload or balance failed to decrypt or validate.
   * Surfaces say the figures may be incomplete while this is above zero.
   */
  readonly unreadableCount: number;
  /** Every readable fund, active or not, in sort order. */
  readonly funds: readonly FundView[];
  /** Readable active funds, in sort order. Pickers list these. */
  readonly activeFunds: readonly FundView[];
  fund(fundId: string): FundView | undefined;
  refetch(): void;
}

interface Opened<T> {
  readonly items: T[];
  readonly pending: number;
  readonly unreadable: number;
}

/**
 * Decrypt through the org cache. Undefined while the Worker is still
 * working, null once decryption failed, else the plaintext.
 */
function openCached(
  orgCache: OrgDecryptCache,
  key: string,
  ciphertext: string,
  origin: { readonly table: "funds" | "fund_ledger"; readonly id: string },
): string | null | undefined {
  const plaintext = orgCache.decrypt(key, ciphertext, origin);
  if (plaintext === null && !orgCache.isFailed(key)) return undefined;
  return plaintext;
}

function openFunds(
  rows: readonly FundRow[],
  orgCache: OrgDecryptCache,
): Opened<FundView> {
  const items: FundView[] = [];
  let pending = 0;
  let unreadable = 0;
  for (const row of rows) {
    const origin = { table: "funds", id: row.id } as const;
    const payloadText = openCached(
      orgCache,
      fundCacheKey(row),
      row.encryptedPayload,
      origin,
    );
    const balanceText = openCached(
      orgCache,
      fundBalanceCacheKey(row),
      row.encryptedBalance,
      origin,
    );
    if (payloadText === undefined) {
      pending++;
      continue;
    }
    const payload = openFundPayload(payloadText);
    const id = fundIdSchema.safeParse(row.id);
    if (payload === null || !id.success) {
      unreadable++;
      continue;
    }
    let balance: SealedBalance | null = null;
    if (balanceText === undefined) {
      pending++;
    } else {
      const opened = openBalancePayload(balanceText);
      if (opened === null) {
        unreadable++;
      } else {
        balance = {
          balanceMinor: opened.balanceMinor,
          version: row.balanceVersion,
        };
      }
    }
    items.push({
      id: id.data,
      name: payload.name,
      currency: payload.currency,
      providerLink: payload.providerLink,
      isActive: row.isActive,
      sortOrder: row.sortOrder,
      orgKeyGeneration: row.orgKeyGeneration,
      balance,
    });
  }
  items.sort((a, b) => a.sortOrder - b.sortOrder);
  return { items, pending, unreadable };
}

/**
 * Bind the fund session cache to the calling component. Call at the top
 * of a component script block: it creates a query and reads context.
 */
export function createFundStore(): FundStore {
  const mounted = trpc.funds !== undefined;
  const orgCache = getOrgDecryptCache();
  const permissionsGetter = getCurrentPermissions();
  const enabled = $derived(
    mounted && canCall(permissionsGetter(), "funds.list"),
  );

  const fundsQuery = createQuery(() => ({
    queryKey: fundKeys.list(),
    queryFn: async (): Promise<FundList> =>
      requireRouter(trpc.funds, "funds").list.query(),
    enabled,
  }));

  const opened = $derived(openFunds(fundsQuery.data?.funds ?? [], orgCache));
  const fundById = $derived(indexById(opened.items));
  const activeFunds = $derived(opened.items.filter((f) => f.isActive));

  return {
    get enabled() {
      return enabled;
    },
    get isLoading() {
      return fundsQuery.isLoading;
    },
    get isError() {
      return fundsQuery.isError;
    },
    get error() {
      return fundsQuery.error;
    },
    get decrypting() {
      return opened.pending > 0;
    },
    get unreadableCount() {
      return opened.unreadable;
    },
    get funds() {
      return opened.items;
    },
    get activeFunds() {
      return activeFunds;
    },
    fund(fundId) {
      return fundById.get(fundId);
    },
    refetch() {
      void fundsQuery.refetch();
    },
  };
}

// ── Case fund ───────────────────────────────────────────────────────

export interface CaseFund {
  /** The fund the case's queue maps to, once decrypted. */
  readonly fundId: string | null;
  /** That fund, when the session can read it. */
  readonly fund: FundView | undefined;
}

/**
 * The fund a case draws on by default: its queue's sealed fund id,
 * decrypted from the queue list. Reads the same ticket and queue queries
 * as CaseHeader, so it adds no requests. Call during component setup.
 */
export function createCaseFund(
  getTicketId: () => string,
  store: FundStore,
): CaseFund {
  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const orgCache = getOrgDecryptCache();

  const ticketQuery = createQuery(() => ({
    queryKey: ticketKeys.detail(getTicketId()),
    queryFn: async () => ticketRouter.get.query({ ticketId: getTicketId() }),
    enabled: enabledTicketId(getTicketId()),
  }));

  const queuesQuery = createQuery(() => ({
    queryKey: queueKeys.all,
    queryFn: async () => ticketRouter.listQueues.query(),
    enabled: store.enabled,
  }));

  // Without fund access the queue's sealed fund id is never opened.
  const fundId = $derived.by((): string | null => {
    if (!store.enabled) return null;
    const queueId = ticketQuery.data?.queueId;
    const queue = (queuesQuery.data ?? []).find((q) => q.id === queueId);
    return queue === undefined ? null : decryptQueueFundId(orgCache, queue);
  });

  return {
    get fundId() {
      return fundId;
    },
    get fund() {
      return fundId === null ? undefined : store.fund(fundId);
    },
  };
}

// ── Ledger (audit page only) ────────────────────────────────────────

export interface FundLedger {
  /** False without the audit permission. */
  readonly enabled: boolean;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: Error | null;
  readonly decrypting: boolean;
  /** Entries that failed to decrypt or validate; totals leave them out. */
  readonly unreadableCount: number;
  /** Ids of entries a later reversal cancels. */
  readonly reversedIds: ReadonlySet<string>;
  /** A fund's readable entries, newest first. */
  entries(fundId: string): readonly LedgerEntryView[];
  /** A fund's ledger summed, to check against its sealed balance. */
  totals(fundId: string): LedgerTotals;
  refetch(): void;
}

function openLedger(
  rows: readonly LedgerRow[],
  orgCache: OrgDecryptCache,
): Opened<LedgerEntryView> {
  const items: LedgerEntryView[] = [];
  let pending = 0;
  let unreadable = 0;
  for (const row of rows) {
    const plaintext = openCached(
      orgCache,
      ledgerCacheKey(row.id),
      row.encryptedPayload,
      { table: "fund_ledger", id: row.id },
    );
    if (plaintext === undefined) {
      pending++;
      continue;
    }
    const payload = openLedgerPayload(plaintext);
    const id = fundLedgerIdSchema.safeParse(row.id);
    if (payload === null || !id.success) {
      unreadable++;
      continue;
    }
    items.push({ id: id.data, entryDate: row.entryDate, payload });
  }
  return { items, pending, unreadable };
}

/** Newest first by the client clock inside the payload. */
function byRecordedAtDesc(a: LedgerEntryView, b: LedgerEntryView): number {
  return b.payload.recordedAt.localeCompare(a.payload.recordedAt);
}

/**
 * The full ledger, for the audit page. Grouping by fund happens after
 * decryption: a ledger row carries no fund id in the clear. Call during
 * component setup.
 */
export function createFundLedger(): FundLedger {
  const mounted = trpc.funds !== undefined;
  const orgCache = getOrgDecryptCache();
  const permissionsGetter = getCurrentPermissions();
  const enabled = $derived(
    mounted && canCall(permissionsGetter(), "funds.listLedger"),
  );

  const ledgerQuery = createQuery(() => ({
    queryKey: fundKeys.ledger(),
    queryFn: async () => requireRouter(trpc.funds, "funds").listLedger.query(),
    enabled,
  }));

  const opened = $derived(
    openLedger(ledgerQuery.data?.entries ?? [], orgCache),
  );
  const entriesByFund = $derived.by(() => {
    const grouped = groupByFund(opened.items);
    for (const list of grouped.values()) list.sort(byRecordedAtDesc);
    return grouped;
  });
  const totals = $derived(computeLedgerTotalsByFund(opened.items));
  const reversed = $derived(reversedEntryIds(opened.items));

  return {
    get enabled() {
      return enabled;
    },
    get isLoading() {
      return ledgerQuery.isLoading;
    },
    get isError() {
      return ledgerQuery.isError;
    },
    get error() {
      return ledgerQuery.error;
    },
    get decrypting() {
      return opened.pending > 0;
    },
    get unreadableCount() {
      return opened.unreadable;
    },
    get reversedIds() {
      return reversed;
    },
    entries(fundId) {
      return entriesByFund.get(fundId) ?? [];
    },
    totals(fundId) {
      return totals.get(fundId) ?? EMPTY_TOTALS;
    },
    refetch() {
      void ledgerQuery.refetch();
    },
  };
}
