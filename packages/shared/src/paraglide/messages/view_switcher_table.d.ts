/**
* | output |
* | --- |
* | "Table" |
*
* @param {View_Switcher_TableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const view_switcher_table: ((inputs?: View_Switcher_TableInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<View_Switcher_TableInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type View_Switcher_TableInputs = {};
