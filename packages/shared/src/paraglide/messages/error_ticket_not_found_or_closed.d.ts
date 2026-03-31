/**
* | output |
* | --- |
* | "Ticket not found or already closed." |
*
* @param {Error_Ticket_Not_Found_Or_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_ticket_not_found_or_closed: ((inputs?: Error_Ticket_Not_Found_Or_ClosedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Ticket_Not_Found_Or_ClosedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Ticket_Not_Found_Or_ClosedInputs = {};
