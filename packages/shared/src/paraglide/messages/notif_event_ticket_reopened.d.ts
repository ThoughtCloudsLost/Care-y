/**
* | output |
* | --- |
* | "Reopened" |
*
* @param {Notif_Event_Ticket_ReopenedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_event_ticket_reopened: ((inputs?: Notif_Event_Ticket_ReopenedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Event_Ticket_ReopenedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Event_Ticket_ReopenedInputs = {};
