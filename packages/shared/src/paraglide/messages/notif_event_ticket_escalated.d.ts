/**
* | output |
* | --- |
* | "Escalated" |
*
* @param {Notif_Event_Ticket_EscalatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_event_ticket_escalated: ((inputs?: Notif_Event_Ticket_EscalatedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Event_Ticket_EscalatedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Event_Ticket_EscalatedInputs = {};
