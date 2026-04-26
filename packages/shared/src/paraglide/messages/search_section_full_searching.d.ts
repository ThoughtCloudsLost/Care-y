/**
* | output |
* | --- |
* | "Searching {searched} of {total}..." |
*
* @param {Search_Section_Full_SearchingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_section_full_searching: ((inputs: Search_Section_Full_SearchingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Section_Full_SearchingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Section_Full_SearchingInputs = {
    searched: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
