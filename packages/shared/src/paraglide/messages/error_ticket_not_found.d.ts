/**
* | output |
* | --- |
* | "{Ticket} not found." |
*
* @param {Error_Ticket_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_ticket_not_found: ((inputs: Error_Ticket_Not_FoundInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Ticket_Not_FoundInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Ticket_Not_FoundInputs = {
    Ticket: NonNullable<unknown>;
};
