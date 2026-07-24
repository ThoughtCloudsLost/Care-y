/**
* | output |
* | --- |
* | "Locked {ticket}" |
*
* @param {Dashboard_Encrypted_TicketInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_encrypted_ticket: ((inputs: Dashboard_Encrypted_TicketInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Encrypted_TicketInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Encrypted_TicketInputs = {
    ticket: NonNullable<unknown>;
    Ticket: NonNullable<unknown>;
};
