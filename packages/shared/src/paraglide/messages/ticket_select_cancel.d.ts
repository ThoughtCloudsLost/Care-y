/**
* | output |
* | --- |
* | "Cancel selection" |
*
* @param {Ticket_Select_CancelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_select_cancel: ((inputs?: Ticket_Select_CancelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Select_CancelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Select_CancelInputs = {};
