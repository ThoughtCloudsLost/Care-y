/**
* | output |
* | --- |
* | "New {ticket}" |
*
* @param {Notif_Event_Ticket_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_event_ticket_created: ((inputs: Notif_Event_Ticket_CreatedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Event_Ticket_CreatedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Event_Ticket_CreatedInputs = {
    ticket: NonNullable<unknown>;
};
