/**
 * Shared TanStack Query factories for the tickets sub-router.
 *
 * Deduplicates identical createQuery calls scattered across components.
 * Each factory accepts the already-null-checked ticketRouter and returns
 * a reactive query instance.
 */

import { createQuery, type CreateQueryResult } from "@tanstack/svelte-query";
import type { TRPCClient } from "@trpc/client";
import type { AppRouter } from "@care-y/server";

type TicketRouter = NonNullable<TRPCClient<AppRouter>["tickets"]>;
type VolunteersData = Awaited<
  ReturnType<TicketRouter["listVolunteers"]["query"]>
>;
type CountsData = Awaited<ReturnType<TicketRouter["counts"]["query"]>>;
type ParticipantsData = Awaited<
  ReturnType<TicketRouter["listParticipants"]["query"]>
>;

export function createVolunteersQuery(
  ticketRouter: TicketRouter,
): CreateQueryResult<VolunteersData> {
  return createQuery(() => ({
    queryKey: ["volunteers"] as const,
    queryFn: async () => ticketRouter.listVolunteers.query(),
    staleTime: 5 * 60 * 1000,
  }));
}

export function createParticipantsQuery(
  ticketRouter: TicketRouter,
  ticketId: () => string,
): CreateQueryResult<ParticipantsData> {
  return createQuery(() => ({
    queryKey: ["ticket", ticketId(), "participants"] as const,
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
    queryKey: ["tickets", "counts"] as const,
    queryFn: async () => ticketRouter.counts.query(),
  }));
}
