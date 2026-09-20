/**
* | output |
* | --- |
* | "Could not unlink {ticket}." |
*
* @param {Ticket_Link_Case_Remove_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_link_case_remove_error: ((inputs: Ticket_Link_Case_Remove_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Link_Case_Remove_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Link_Case_Remove_ErrorInputs = {
    ticket: NonNullable<unknown>;
};
