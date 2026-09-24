/**
* | output |
* | --- |
* | "{Tickets}" |
*
* @param {Client_Tickets_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const client_tickets_heading: ((inputs: Client_Tickets_HeadingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Tickets_HeadingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Tickets_HeadingInputs = {
    Tickets: NonNullable<unknown>;
};
