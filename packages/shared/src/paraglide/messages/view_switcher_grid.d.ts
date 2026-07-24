/**
* | output |
* | --- |
* | "Grid" |
*
* @param {View_Switcher_GridInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const view_switcher_grid: ((inputs?: View_Switcher_GridInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<View_Switcher_GridInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type View_Switcher_GridInputs = {};
