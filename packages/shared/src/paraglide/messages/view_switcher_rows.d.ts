/**
* | output |
* | --- |
* | "Compact rows" |
*
* @param {View_Switcher_RowsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const view_switcher_rows: ((inputs?: View_Switcher_RowsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<View_Switcher_RowsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type View_Switcher_RowsInputs = {};
