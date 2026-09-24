/**
* | output |
* | --- |
* | "Could not link {ticket}." |
*
* @param {Ticket_Link_Case_Add_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_link_case_add_error: ((inputs: Ticket_Link_Case_Add_ErrorInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Link_Case_Add_ErrorInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Link_Case_Add_ErrorInputs = {
    ticket: NonNullable<unknown>;
};
