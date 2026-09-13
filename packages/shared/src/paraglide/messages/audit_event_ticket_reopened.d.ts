/**
* | output |
* | --- |
* | "{Ticket} reopened" |
*
* @param {Audit_Event_Ticket_ReopenedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_reopened: ((inputs: Audit_Event_Ticket_ReopenedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Ticket_ReopenedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Ticket_ReopenedInputs = {
    Ticket: NonNullable<unknown>;
};
