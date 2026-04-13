/**
* | output |
* | --- |
* | "Load more" |
*
* @param {Ticket_Panel_Load_MoreInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_load_more: ((inputs?: Ticket_Panel_Load_MoreInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Panel_Load_MoreInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Panel_Load_MoreInputs = {};
