import { createContext } from "svelte";

export interface TicketsLayoutCtx {
  readonly openTicket: (ticketId: string) => void;
  readonly selectedTicketId: () => string | undefined;
}

export const [getTicketsLayoutCtx, setTicketsLayoutCtx] =
  createContext<TicketsLayoutCtx>();
