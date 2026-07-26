/**
* | output |
* | --- |
* | "No {tickets} for this {client}." |
*
* @param {Client_No_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_no_tickets: ((inputs: Client_No_TicketsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_No_TicketsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_No_TicketsInputs = {
    tickets: NonNullable<unknown>;
    client: NonNullable<unknown>;
};
