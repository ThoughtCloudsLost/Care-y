/**
* | output |
* | --- |
* | "No attachments yet." |
*
* @param {Ticket_Panel_No_MediaInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_panel_no_media: ((inputs?: Ticket_Panel_No_MediaInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Panel_No_MediaInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Panel_No_MediaInputs = {};
