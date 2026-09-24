/**
* | output |
* | --- |
* | "Clear" |
*
* @param {Search_Recents_ClearInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_recents_clear: ((inputs?: Search_Recents_ClearInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Recents_ClearInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Recents_ClearInputs = {};
