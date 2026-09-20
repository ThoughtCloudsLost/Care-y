/**
* | output |
* | --- |
* | "This {client} already has an open {ticket}." |
*
* @param {Error_Ticket_Already_OpenInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_ticket_already_open: ((inputs: Error_Ticket_Already_OpenInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Ticket_Already_OpenInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Ticket_Already_OpenInputs = {
    client: NonNullable<unknown>;
    ticket: NonNullable<unknown>;
};
