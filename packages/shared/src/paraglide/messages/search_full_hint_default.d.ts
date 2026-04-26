/**
* | output |
* | --- |
* | "Showing results from decrypted data. Tap to search encrypted items." |
*
* @param {Search_Full_Hint_DefaultInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_hint_default: ((inputs?: Search_Full_Hint_DefaultInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Full_Hint_DefaultInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Full_Hint_DefaultInputs = {};
