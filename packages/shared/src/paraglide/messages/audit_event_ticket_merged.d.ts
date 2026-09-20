/**
* | output |
* | --- |
* | "{Ticket} merged" |
*
* @param {Audit_Event_Ticket_MergedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_merged: ((inputs: Audit_Event_Ticket_MergedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Ticket_MergedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Ticket_MergedInputs = {
    Ticket: NonNullable<unknown>;
};
