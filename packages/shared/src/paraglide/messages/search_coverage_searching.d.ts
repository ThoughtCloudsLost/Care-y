/**
* | output |
* | --- |
* | "Searching {searched} of {total}..." |
*
* @param {Search_Coverage_SearchingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_coverage_searching: ((inputs: Search_Coverage_SearchingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Coverage_SearchingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Coverage_SearchingInputs = {
    searched: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
