// Notification message catalogs for i18n.
// English + Spanish at launch, stubbed for expansion.
// Uses simple string interpolation with named parameters.
// No ICU MessageFormat (overkill for fixed-format metadata-only messages).
//
// Queue names are encrypted at rest (ADR-030, org-key tier). The server
// cannot decrypt them, so outbound notifications use generic phrasing.
// Volunteers see the full queue name after logging in to the app.

import { ORG_DELETION_COOLING_OFF_DAYS } from "@care-y/shared";

type SupportedLocale = "en" | "es";

export interface NotificationStrings {
  readonly ticketAssigned: (loginUrl: string) => string;
  readonly ticketCreated: (loginUrl: string) => string;
  readonly ticketEscalated: (loginUrl: string) => string;
  readonly followupAdded: (loginUrl: string) => string;
  readonly mentionNotification: (loginUrl: string) => string;
  readonly voicemailQuarantined: (loginUrl: string) => string;
  /** Names no requester and no data; states the cooling-off period only. */
  readonly orgDeletionRequested: (loginUrl: string) => string;
  readonly orgDeletionCancelled: (loginUrl: string) => string;
  /** A fund ledger entry was recorded. Names no fund, amount or case. */
  readonly fundEntryRecorded: (loginUrl: string) => string;
  readonly smsPing: (loginUrl: string) => string;
  /** Short SMS carrying a phone verification code. No event details. */
  readonly verificationCode: (code: string) => string;
  readonly emailSubjectPrefix: string;
  /** Default footer appended to outbound client emails when the org has an
   *  inbound reply domain configured. Tells the client not to share the
   *  sending address, because it routes to their case. */
  readonly emailReplyFooter: string;
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
  orgDeletionRequested: (url) =>
    `A request was made to delete this organization and all of its data. ` +
    `The deletion runs after a ${String(ORG_DELETION_COOLING_OFF_DAYS)}-day waiting period and can be cancelled until then. ` +
    `Log in to review it: ${url}`,
  orgDeletionCancelled: (url) =>
    `The request to delete this organization was cancelled. No data will be deleted. Log in to review it: ${url}`,
  fundEntryRecorded: (url) =>
    `A new entry was recorded in a fund. Log in to review it: ${url}`,
  smsPing: (url) => `You have a new notification. Visit ${url}`,
  verificationCode: (code) => `Your CARE-Y verification code is ${code}`,
  emailSubjectPrefix: "CARE-Y",
  emailReplyFooter:
    "Please do not share or forward this email. " +
    "The reply address is unique to your case. " +
    "Anyone who has it can send messages on your behalf.",
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
  orgDeletionRequested: (url) =>
    `Se solicito eliminar esta organizacion y todos sus datos. ` +
    `La eliminacion se realizara despues de un periodo de espera de ${String(ORG_DELETION_COOLING_OFF_DAYS)} dias y se puede cancelar hasta entonces. ` +
    `Inicie sesion para revisarla: ${url}`,
  orgDeletionCancelled: (url) =>
    `Se cancelo la solicitud de eliminar esta organizacion. No se eliminara ningun dato. Inicie sesion para revisarla: ${url}`,
  fundEntryRecorded: (url) =>
    `Se registro un nuevo movimiento en un fondo. Inicie sesion para revisarlo: ${url}`,
  smsPing: (url) => `Tiene una nueva notificacion. Visite ${url}`,
  verificationCode: (code) => `Su codigo de verificacion de CARE-Y es ${code}`,
  emailSubjectPrefix: "CARE-Y",
  emailReplyFooter:
    "Por favor, no comparta ni reenvíe este correo. " +
    "La dirección de respuesta es exclusiva de su caso. " +
    "Cualquier persona que la tenga puede enviar mensajes en su nombre.",
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
