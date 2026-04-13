/**
* | output |
* | --- |
* | "Clear" |
*
* @param {Search_Recents_ClearInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_recents_clear: ((inputs?: Search_Recents_ClearInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Recents_ClearInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Recents_ClearInputs = {};
