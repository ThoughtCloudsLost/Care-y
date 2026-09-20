/**
* | output |
* | --- |
* | "Call options" |
*
* @param {Ticket_Call_OptionsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_call_options: ((inputs?: Ticket_Call_OptionsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Call_OptionsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Call_OptionsInputs = {};
