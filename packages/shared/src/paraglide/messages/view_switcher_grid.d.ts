/**
* | output |
* | --- |
* | "Grid" |
*
* @param {View_Switcher_GridInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const view_switcher_grid: ((inputs?: View_Switcher_GridInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<View_Switcher_GridInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type View_Switcher_GridInputs = {};
