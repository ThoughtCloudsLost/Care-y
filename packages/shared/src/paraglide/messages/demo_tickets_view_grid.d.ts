/**
* | output |
* | --- |
* | "Switching to grid view" |
*
* @param {Demo_Tickets_View_GridInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_view_grid: ((inputs?: Demo_Tickets_View_GridInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Tickets_View_GridInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Tickets_View_GridInputs = {};
