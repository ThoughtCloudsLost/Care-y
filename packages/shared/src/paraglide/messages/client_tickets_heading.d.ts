/**
* | output |
* | --- |
* | "{Tickets}" |
*
* @param {Client_Tickets_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const client_tickets_heading: ((inputs: Client_Tickets_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Client_Tickets_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Client_Tickets_HeadingInputs = {
    Tickets: NonNullable<unknown>;
};
