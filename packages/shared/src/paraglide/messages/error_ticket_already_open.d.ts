/**
* | output |
* | --- |
* | "This {client} already has an open {ticket}." |
*
* @param {Error_Ticket_Already_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_ticket_already_open: ((inputs: Error_Ticket_Already_OpenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Ticket_Already_OpenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Ticket_Already_OpenInputs = {
    client: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};
