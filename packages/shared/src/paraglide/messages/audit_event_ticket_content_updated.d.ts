/**
* | output |
* | --- |
* | "{Ticket} content updated" |
*
* @param {Audit_Event_Ticket_Content_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_ticket_content_updated: ((inputs: Audit_Event_Ticket_Content_UpdatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Ticket_Content_UpdatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Ticket_Content_UpdatedInputs = {
    Ticket: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};
