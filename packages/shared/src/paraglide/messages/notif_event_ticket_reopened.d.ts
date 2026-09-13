/**
* | output |
* | --- |
* | "Reopened" |
*
* @param {Notif_Event_Ticket_ReopenedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_event_ticket_reopened: ((inputs?: Notif_Event_Ticket_ReopenedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Event_Ticket_ReopenedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Event_Ticket_ReopenedInputs = {};
