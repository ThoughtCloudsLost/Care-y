/**
* | output |
* | --- |
* | "View mode" |
*
* @param {Ticket_View_ModeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_view_mode: ((inputs?: Ticket_View_ModeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_View_ModeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_View_ModeInputs = {};
