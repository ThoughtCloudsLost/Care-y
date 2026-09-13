/**
* | output |
* | --- |
* | "{Ticket} assigned" |
*
* @param {Audit_Event_Ticket_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_assigned: ((inputs: Audit_Event_Ticket_AssignedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Ticket_AssignedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Ticket_AssignedInputs = {
    Ticket: NonNullable<unknown>;
};
