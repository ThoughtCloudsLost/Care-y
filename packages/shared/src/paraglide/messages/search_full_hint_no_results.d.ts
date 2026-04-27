/**
* | output |
* | --- |
* | "No matches in decrypted data. Tap to search encrypted items." |
*
* @param {Search_Full_Hint_No_ResultsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_hint_no_results: ((inputs?: Search_Full_Hint_No_ResultsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Full_Hint_No_ResultsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Full_Hint_No_ResultsInputs = {};
