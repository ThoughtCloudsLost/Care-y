/**
* | output |
* | --- |
* | "Cannot close {ticket} with unresolved dependencies." |
*
* @param {Error_Ticket_Unresolved_DepsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_ticket_unresolved_deps: ((inputs: Error_Ticket_Unresolved_DepsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Ticket_Unresolved_DepsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Ticket_Unresolved_DepsInputs = {
    ticket: NonNullable<unknown>;
};
