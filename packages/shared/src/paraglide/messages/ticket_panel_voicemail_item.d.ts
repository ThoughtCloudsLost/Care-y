/**
* | output |
* | --- |
* | "Voicemail" |
*
* @param {Ticket_Panel_Voicemail_ItemInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_voicemail_item: ((inputs?: Ticket_Panel_Voicemail_ItemInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Panel_Voicemail_ItemInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Panel_Voicemail_ItemInputs = {};
