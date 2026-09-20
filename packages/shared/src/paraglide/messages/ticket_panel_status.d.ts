/**
* | output |
* | --- |
* | "Status" |
*
* @param {Ticket_Panel_StatusInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_status: ((inputs?: Ticket_Panel_StatusInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Panel_StatusInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Panel_StatusInputs = {};
