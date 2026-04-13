/**
* | output |
* | --- |
* | "Toggle zoom" |
*
* @param {Ticket_Zoom_ToggleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_zoom_toggle: ((inputs?: Ticket_Zoom_ToggleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Ticket_Zoom_ToggleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Ticket_Zoom_ToggleInputs = {};
