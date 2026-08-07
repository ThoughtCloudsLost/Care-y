// Notification message catalogs for i18n.
// English + Spanish at launch, stubbed for expansion.
// Uses simple string interpolation with named parameters.
// No ICU MessageFormat (overkill for fixed-format metadata-only messages).
//
// Queue names are encrypted at rest (ADR-030, org-key tier). The server
// cannot decrypt them, so outbound notifications use generic phrasing.
// Volunteers see the full queue name after logging in to the app.

type SupportedLocale = "en" | "es";

export interface NotificationStrings {
  readonly ticketAssigned: (loginUrl: string) => string;
  readonly ticketCreated: (loginUrl: string) => string;
  readonly ticketEscalated: (loginUrl: string) => string;
  readonly followupAdded: (loginUrl: string) => string;
  readonly mentionNotification: (loginUrl: string) => string;
  readonly voicemailQuarantined: (loginUrl: string) => string;
  readonly smsPing: (loginUrl: string) => string;
  /** Short SMS carrying a phone verification code. No event details. */
  readonly verificationCode: (code: string) => string;
  readonly emailSubjectPrefix: string;
}

const EN: NotificationStrings = {
  ticketAssigned: (url) =>
    `A ticket has been assigned to you. Log in to view it: ${url}`,
  ticketCreated: (url) => `A new ticket has arrived. Log in to view it: ${url}`,
  ticketEscalated: (url) =>
    `A ticket has been escalated. Log in to review it: ${url}`,
  followupAdded: (url) =>
    `A ticket you are following has a new update. Log in to view it: ${url}`,
  mentionNotification: (url) =>
    `You were mentioned in a ticket note. Log in to view it: ${url}`,
  voicemailQuarantined: (url) =>
    `A voicemail could not be routed automatically and was quarantined. Log in to review it: ${url}`,
  smsPing: (url) => `You have a new notification. Visit ${url}`,
  verificationCode: (code) => `Your CARE-Y verification code is ${code}`,
  emailSubjectPrefix: "CARE-Y",
};

const ES: NotificationStrings = {
  ticketAssigned: (url) =>
    `Se le ha asignado un caso. Inicie sesion para verlo: ${url}`,
  ticketCreated: (url) =>
    `Ha llegado un nuevo caso. Inicie sesion para verlo: ${url}`,
  ticketEscalated: (url) =>
    `Un caso ha sido escalado. Inicie sesion para revisarlo: ${url}`,
  followupAdded: (url) =>
    `Un caso que sigue tiene una nueva actualizacion. Inicie sesion para verlo: ${url}`,
  mentionNotification: (url) =>
    `Se le ha mencionado en una nota de un caso. Inicie sesion para verlo: ${url}`,
  voicemailQuarantined: (url) =>
    `Un correo de voz no pudo ser dirigido automaticamente y fue puesto en cuarentena. Inicie sesion para revisarlo: ${url}`,
  smsPing: (url) => `Tiene una nueva notificacion. Visite ${url}`,
  verificationCode: (code) => `Su codigo de verificacion de CARE-Y es ${code}`,
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
