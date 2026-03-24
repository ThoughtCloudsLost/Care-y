// Notification message catalogs for i18n.
// English + Spanish at launch, stubbed for expansion.
// Uses simple string interpolation with named parameters.
// No ICU MessageFormat (overkill for fixed-format metadata-only messages).

type SupportedLocale = "en" | "es";

export interface NotificationStrings {
  readonly ticketAssigned: (queueName: string, loginUrl: string) => string;
  readonly ticketCreated: (queueName: string, loginUrl: string) => string;
  readonly ticketEscalated: (queueName: string, loginUrl: string) => string;
  readonly followupAdded: (queueName: string, loginUrl: string) => string;
  readonly mentionNotification: (queueName: string, loginUrl: string) => string;
  readonly smsPing: (loginUrl: string) => string;
  readonly emailSubjectPrefix: string;
}

const EN: NotificationStrings = {
  ticketAssigned: (q, url) =>
    `A ticket in queue "${q}" has been assigned to you. Log in to view it: ${url}`,
  ticketCreated: (q, url) =>
    `A new ticket has arrived in queue "${q}". Log in to view it: ${url}`,
  ticketEscalated: (q, url) =>
    `A ticket in queue "${q}" has been escalated. Log in to review it: ${url}`,
  followupAdded: (q, url) =>
    `A ticket you are following in queue "${q}" has a new update. Log in to view it: ${url}`,
  mentionNotification: (q, url) =>
    `You were mentioned in a note on a ticket in queue "${q}". Log in to view it: ${url}`,
  smsPing: (url) => `You have a new notification. Visit ${url}`,
  emailSubjectPrefix: "CARE-Y",
};

const ES: NotificationStrings = {
  ticketAssigned: (q, url) =>
    `Se le ha asignado un caso en la cola "${q}". Inicie sesion para verlo: ${url}`,
  ticketCreated: (q, url) =>
    `Ha llegado un nuevo caso a la cola "${q}". Inicie sesion para verlo: ${url}`,
  ticketEscalated: (q, url) =>
    `Un caso en la cola "${q}" ha sido escalado. Inicie sesion para revisarlo: ${url}`,
  followupAdded: (q, url) =>
    `Un caso que sigue en la cola "${q}" tiene una nueva actualizacion. Inicie sesion para verlo: ${url}`,
  mentionNotification: (q, url) =>
    `Se le ha mencionado en una nota de un caso en la cola "${q}". Inicie sesion para verlo: ${url}`,
  smsPing: (url) => `Tiene una nueva notificacion. Visite ${url}`,
  emailSubjectPrefix: "CARE-Y",
};

/** Returns notification strings for the given locale. Falls back to English. */
export function getStrings(locale: string): NotificationStrings {
  const key = locale.slice(0, 2).toLowerCase();
  if (key === "es") return ES;
  return EN;
}

/** Builds the login URL for an org from its slug. */
export function buildLoginUrl(orgSlug: string): string {
  return `https://${orgSlug}.care-y.app/login`;
}

export type { SupportedLocale };
