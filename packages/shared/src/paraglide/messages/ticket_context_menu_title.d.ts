/**
* | output |
* | --- |
* | "Message Actions" |
*
* @param {Ticket_Context_Menu_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_context_menu_title: ((inputs?: Ticket_Context_Menu_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Context_Menu_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Context_Menu_TitleInputs = {};
