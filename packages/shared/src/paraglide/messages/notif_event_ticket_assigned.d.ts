/**
* | output |
* | --- |
* | "Assigned" |
*
* @param {Notif_Event_Ticket_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_event_ticket_assigned: ((inputs?: Notif_Event_Ticket_AssignedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Notif_Event_Ticket_AssignedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Notif_Event_Ticket_AssignedInputs = {};
