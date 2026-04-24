/**
* | output |
* | --- |
* | "Select messages" |
*
* @param {Ticket_Select_ModeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_select_mode: ((inputs?: Ticket_Select_ModeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Select_ModeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Select_ModeInputs = {};
