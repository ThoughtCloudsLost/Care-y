/**
* | output |
* | --- |
* | "Locked {ticket}" |
*
* @param {Dashboard_Encrypted_TicketInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_encrypted_ticket: ((inputs: Dashboard_Encrypted_TicketInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Encrypted_TicketInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Encrypted_TicketInputs = {
    ticket: NonNullable<unknown>;
    Ticket: NonNullable<unknown>;
};
