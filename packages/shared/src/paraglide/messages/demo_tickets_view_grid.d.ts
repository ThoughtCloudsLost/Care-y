/**
* | output |
* | --- |
* | "Switching to grid view" |
*
* @param {Demo_Tickets_View_GridInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_view_grid: ((inputs?: Demo_Tickets_View_GridInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Tickets_View_GridInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Tickets_View_GridInputs = {};
