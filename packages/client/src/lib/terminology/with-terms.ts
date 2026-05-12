import { getTerminology } from "./context.js";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface TermsParams {
  volunteer: string;
  volunteers: string;
  client: string;
  clients: string;
  ticket: string;
  tickets: string;
  manager: string;
  managers: string;
  queue: string;
  queues: string;
  knowledgeBase: string;
  Volunteer: string;
  Volunteers: string;
  Client: string;
  Clients: string;
  Ticket: string;
  Tickets: string;
  Manager: string;
  Managers: string;
  Queue: string;
  Queues: string;
  KnowledgeBase: string;
}

export function withTerms(): TermsParams;
export function withTerms<T extends Record<string, unknown>>(
  extra: T,
): TermsParams & T;
export function withTerms<T extends Record<string, unknown>>(
  extra?: T,
): TermsParams | (TermsParams & T) {
  const resolve = getTerminology();
  const t = resolve();
  const base: TermsParams = {
    volunteer: t.volunteer,
    volunteers: t.volunteers,
    client: t.client,
    clients: t.clients,
    ticket: t.ticket,
    tickets: t.tickets,
    manager: t.manager,
    managers: t.managers,
    queue: t.queue,
    queues: t.queues,
    knowledgeBase: t.knowledgeBase,
    Volunteer: capitalize(t.volunteer),
    Volunteers: capitalize(t.volunteers),
    Client: capitalize(t.client),
    Clients: capitalize(t.clients),
    Ticket: capitalize(t.ticket),
    Tickets: capitalize(t.tickets),
    Manager: capitalize(t.manager),
    Managers: capitalize(t.managers),
    Queue: capitalize(t.queue),
    Queues: capitalize(t.queues),
    KnowledgeBase: capitalize(t.knowledgeBase),
  };
  if (extra !== undefined) {
    return Object.assign(base, extra);
  }
  return base;
}
