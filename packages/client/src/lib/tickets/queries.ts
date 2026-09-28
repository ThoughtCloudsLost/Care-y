/**
 * Shared TanStack Query factories for the tickets sub-router.
 *
 * Deduplicates identical createQuery calls scattered across components.
 * Each factory accepts the already-null-checked ticketRouter and returns
 * a reactive query instance.
 */

import {
  createQuery,
  type CreateInfiniteQueryOptions,
  type CreateQueryResult,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/svelte-query";
import type { TRPCClient } from "@trpc/client";
import type { AppRouter } from "@care-y/server";
import {
  volunteerKeys,
  ticketKeys,
  ticketsKeys,
  noteTypeKeys,
} from "$lib/query/keys";
import type { TicketForServerFilter } from "$lib/tickets/ticket-list-utils.js";
import type { TicketListServerParams } from "$lib/stores/filters.svelte.js";
import { isCryptoKeyed } from "$lib/crypto/crypto-keyed.svelte.js";
import {
  fetchReadStateWindow,
  fetchSweepToExhaustion,
  type ReadStateWindow,
  type SweepReadStateEntry,
} from "$lib/tickets/create-list-read-state.svelte.js";

export type TicketRouter = NonNullable<TRPCClient<AppRouter>["tickets"]>;

/** One row of a tickets.list page. */
export type TicketListRow = Awaited<
  ReturnType<TicketRouter["list"]["query"]>
>[number];

export type TicketListQueryOptions = CreateInfiniteQueryOptions<
  TicketListRow[],
  Error,
  InfiniteData<TicketListRow[]>,
  QueryKey,
  string | undefined
>;

/**
 * Options for a paged tickets.list query. The key sits under
 * ticketsKeys.lists(), where shell search, the detail view and the
 * list-wide optimistic updates find the rows. Paging follows the last
 * row's id while pages come back full.
 */
export function ticketListQueryOptions(
  ticketRouter: TicketRouter,
  params: TicketListServerParams,
): TicketListQueryOptions {
  return {
    queryKey: ticketsKeys.list(params),
    queryFn: async ({ pageParam }) =>
      ticketRouter.list.query({ ...params, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length >= params.limit
        ? lastPage[lastPage.length - 1]?.id
        : undefined,
  };
}

export interface ReadStateQueries {
  /** Every cursor row the user holds, paged to exhaustion. */
  readonly sweepQuery: CreateQueryResult<SweepReadStateEntry[]>;
  /** Per-ticket read state for the ids the list displays. */
  readonly windowQuery: CreateQueryResult<ReadStateWindow>;
}

/**
 * The two read-state queries a ticket list feeds to createListReadState.
 * Both wait for the crypto session, since cursors decrypt in the Worker.
 * `windowIds` is every row the list displays.
 */
export function createReadStateQueries(
  ticketRouter: TicketRouter,
  windowIds: () => readonly string[],
): ReadStateQueries {
  const sweepQuery = createQuery(() => ({
    queryKey: ticketsKeys.readStateSweep(),
    queryFn: async () =>
      fetchSweepToExhaustion(async (cursor) =>
        ticketRouter.readStateSweep.query({ cursor }),
      ),
    enabled: isCryptoKeyed(),
  }));

  const windowQuery = createQuery(() => {
    const ids = windowIds();
    return {
      queryKey: ticketsKeys.readState(ids),
      queryFn: async () =>
        fetchReadStateWindow(ids, async (batch) =>
          ticketRouter.listReadState.query({ ticketIds: batch }),
        ),
      enabled: isCryptoKeyed() && ids.length > 0,
    };
  });

  return { sweepQuery, windowQuery };
}
type VolunteersData = Awaited<
  ReturnType<TicketRouter["listVolunteers"]["query"]>
>;
type CountsData = Awaited<ReturnType<TicketRouter["counts"]["query"]>>;
type ParticipantsData = Awaited<
  ReturnType<TicketRouter["listParticipants"]["query"]>
>;
export type NoteTypesRouter = NonNullable<TicketRouter["noteTypes"]>;
type NoteTypesData = Awaited<
  ReturnType<NoteTypesRouter["listActive"]["query"]>
>;
type AllNoteTypesData = Awaited<ReturnType<NoteTypesRouter["list"]["query"]>>;

/**
 * Returns true when the ticketId is a non-empty string.
 * Use as the `enabled` guard on per-ticket queries so
 * the guard is consistent across all call sites.
 */
export function enabledTicketId(ticketId: string): boolean {
  return typeof ticketId === "string" && ticketId !== "";
}

export function createVolunteersQuery(
  ticketRouter: TicketRouter,
): CreateQueryResult<VolunteersData> {
  return createQuery(() => ({
    queryKey: volunteerKeys.all,
    queryFn: async () => ticketRouter.listVolunteers.query(),
    staleTime: 5 * 60 * 1000,
  }));
}

export function createParticipantsQuery(
  ticketRouter: TicketRouter,
  ticketId: () => string,
): CreateQueryResult<ParticipantsData> {
  return createQuery(() => ({
    queryKey: ticketKeys.participants(ticketId()),
    queryFn: async () =>
      ticketRouter.listParticipants.query({ ticketId: ticketId() }),
    enabled: ticketId() !== "",
    staleTime: 5 * 60 * 1000,
  }));
}

export function createCountsQuery(
  ticketRouter: TicketRouter,
): CreateQueryResult<CountsData> {
  return createQuery(() => ({
    queryKey: ticketsKeys.counts(),
    queryFn: async () => ticketRouter.counts.query(),
  }));
}

export function createNoteTypesQuery(
  noteTypesRouter: NoteTypesRouter,
): CreateQueryResult<NoteTypesData> {
  return createQuery(() => ({
    queryKey: noteTypeKeys.all,
    queryFn: async () => noteTypesRouter.listActive.query(),
    staleTime: 5 * 60 * 1000,
  }));
}

export function createAllNoteTypesQuery(
  noteTypesRouter: NoteTypesRouter,
): CreateQueryResult<AllNoteTypesData> {
  return createQuery(() => ({
    queryKey: noteTypeKeys.full(),
    queryFn: async () => noteTypesRouter.list.query(),
    staleTime: 5 * 60 * 1000,
  }));
}

/** Server caps the page at 500. */
const FACET_INDEX_PAGE_SIZE = 500;
/** Row ceiling. Past it the index is incomplete and its counts are floors. */
const FACET_INDEX_MAX_ROWS = 5000;

export { FACET_INDEX_PAGE_SIZE, FACET_INDEX_MAX_ROWS };

export interface FacetIndexData {
  readonly rows: readonly TicketForServerFilter[];
  /** True only when paging ended because the server ran out of rows. */
  readonly complete: boolean;
}

/**
 * Fetches every ticket's plaintext metadata (status, priority, queue, assignee,
 * date, follow-up count, response flag) in paginated sweeps and returns it as
 * a flat array.
 * The consuming code (computeFacets in facet-filters.ts) uses these rows to
 * derive filter option counts entirely in the browser.
 *
 * When `complete` is false, the row set was truncated (either by a page fetch
 * failure or by hitting the row ceiling). Every count derived from an
 * incomplete index is a lower bound, not an exact total.
 *
 * Read state is deliberately absent from the projection. The read cursor is
 * encrypted and only the browser can compare it, so unread and needs-attention
 * facets are computed against a separate client-side cursor store.
 */
/**
 * The paging loop, exported so tests exercise this code rather than a
 * re-implementation of it. A test that mirrors the loop proves only that
 * the mirror works.
 */
export async function fetchFacetIndex(
  ticketRouter: TicketRouter,
): Promise<FacetIndexData> {
  const rows: TicketForServerFilter[] = [];
  let cursor: string | undefined;

  for (;;) {
    if (rows.length >= FACET_INDEX_MAX_ROWS) {
      return { rows, complete: false };
    }

    let page: Awaited<ReturnType<TicketRouter["facetIndex"]["query"]>>;
    try {
      page = await ticketRouter.facetIndex.query({
        cursor,
        limit: FACET_INDEX_PAGE_SIZE,
      });
    } catch {
      // A single failed page must not blank every filter count on the
      // page. The rows already gathered still yield correct floors, so
      // return them and mark the index incomplete.
      return { rows, complete: false };
    }

    rows.push(...page.items);

    // Termination is the cursor, never the page length: a short page is
    // not proof the server ran out of rows.
    if (page.nextCursor === null) {
      return { rows, complete: true };
    }

    cursor = page.nextCursor;
  }
}

export function createFacetIndexQuery(
  ticketRouter: TicketRouter,
  enabled: () => boolean,
): CreateQueryResult<FacetIndexData> {
  return createQuery(() => ({
    queryKey: ticketsKeys.facetIndex(),
    enabled: enabled(),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<FacetIndexData> => fetchFacetIndex(ticketRouter),
  }));
}
