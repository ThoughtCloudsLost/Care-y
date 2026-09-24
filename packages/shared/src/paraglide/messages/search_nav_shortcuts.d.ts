/**
* | output |
* | --- |
* | "Enter for next, Shift+Enter for previous, Escape to close" |
*
* @param {Search_Nav_ShortcutsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_nav_shortcuts: ((inputs?: Search_Nav_ShortcutsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Nav_ShortcutsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Nav_ShortcutsInputs = {};
