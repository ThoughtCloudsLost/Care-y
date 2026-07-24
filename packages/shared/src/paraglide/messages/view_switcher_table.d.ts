/**
* | output |
* | --- |
* | "Table" |
*
* @param {View_Switcher_TableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const view_switcher_table: ((inputs?: View_Switcher_TableInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<View_Switcher_TableInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type View_Switcher_TableInputs = {};
