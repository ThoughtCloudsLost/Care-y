/**
* | output |
* | --- |
* | "{Ticket} escalated" |
*
* @param {Audit_Event_Ticket_EscalatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_escalated: ((inputs: Audit_Event_Ticket_EscalatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Ticket_EscalatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Ticket_EscalatedInputs = {
    Ticket: NonNullable<unknown>;
};
