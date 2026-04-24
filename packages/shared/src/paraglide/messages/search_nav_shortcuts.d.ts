/**
* | output |
* | --- |
* | "Enter for next, Shift+Enter for previous, Escape to close" |
*
* @param {Search_Nav_ShortcutsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_nav_shortcuts: ((inputs?: Search_Nav_ShortcutsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Nav_ShortcutsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Nav_ShortcutsInputs = {};
