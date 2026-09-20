/**
* | output |
* | --- |
* | "{Ticket} created" |
*
* @param {Audit_Event_Ticket_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_created: ((inputs: Audit_Event_Ticket_CreatedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Ticket_CreatedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Ticket_CreatedInputs = {
    Ticket: NonNullable<unknown>;
};
