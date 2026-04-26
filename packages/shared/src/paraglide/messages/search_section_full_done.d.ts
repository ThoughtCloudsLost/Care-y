/**
* | output |
* | --- |
* | "All decrypted" |
*
* @param {Search_Section_Full_DoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_section_full_done: ((inputs?: Search_Section_Full_DoneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Section_Full_DoneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Section_Full_DoneInputs = {};
