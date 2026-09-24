/**
* | output |
* | --- |
* | "Found {found} results across {total} items" |
*
* @param {Search_Full_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_full_summary: ((inputs: Search_Full_SummaryInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Full_SummaryInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Full_SummaryInputs = {
    found: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
