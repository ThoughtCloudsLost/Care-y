/**
* | output |
* | --- |
* | "Zoom out" |
*
* @param {Ticket_Zoom_OutInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_zoom_out: ((inputs?: Ticket_Zoom_OutInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Zoom_OutInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Zoom_OutInputs = {};
