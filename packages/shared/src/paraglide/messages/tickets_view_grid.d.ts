/**
* | output |
* | --- |
* | "Grid view" |
*
* @param {Tickets_View_GridInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_view_grid: ((inputs?: Tickets_View_GridInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_View_GridInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_View_GridInputs = {};
