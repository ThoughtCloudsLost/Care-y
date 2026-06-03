/**
* | output |
* | --- |
* | "{Ticket} not found or already open." |
*
* @param {Error_Ticket_Not_Found_Or_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_ticket_not_found_or_open: ((inputs: Error_Ticket_Not_Found_Or_OpenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Ticket_Not_Found_Or_OpenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Ticket_Not_Found_Or_OpenInputs = {
    Ticket: NonNullable<unknown>;
};
