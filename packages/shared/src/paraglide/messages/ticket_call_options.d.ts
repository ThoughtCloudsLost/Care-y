/**
* | output |
* | --- |
* | "Call options" |
*
* @param {Ticket_Call_OptionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_call_options: ((inputs?: Ticket_Call_OptionsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Call_OptionsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Call_OptionsInputs = {};
