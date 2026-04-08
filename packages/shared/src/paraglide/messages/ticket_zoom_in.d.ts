/**
* | output |
* | --- |
* | "Zoom in" |
*
* @param {Ticket_Zoom_InInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_zoom_in: ((inputs?: Ticket_Zoom_InInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Zoom_InInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Zoom_InInputs = {};
