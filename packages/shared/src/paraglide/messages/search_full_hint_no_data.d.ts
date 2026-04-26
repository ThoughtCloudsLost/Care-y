/**
* | output |
* | --- |
* | "No data loaded yet. Tap to search everything you have access to." |
*
* @param {Search_Full_Hint_No_DataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_hint_no_data: ((inputs?: Search_Full_Hint_No_DataInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Full_Hint_No_DataInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Full_Hint_No_DataInputs = {};
