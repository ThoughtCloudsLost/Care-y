/**
* | output |
* | --- |
* | "Found {found} results across {total} items" |
*
* @param {Search_Full_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_full_summary: ((inputs: Search_Full_SummaryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Full_SummaryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Full_SummaryInputs = {
    found: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
