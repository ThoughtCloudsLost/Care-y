/**
* | output |
* | --- |
* | "{Ticket} closed" |
*
* @param {Audit_Event_Ticket_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_closed: ((inputs: Audit_Event_Ticket_ClosedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Ticket_ClosedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Ticket_ClosedInputs = {
    Ticket: NonNullable<unknown>;
};
