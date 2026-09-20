/**
* | output |
* | --- |
* | "Entries that match, shown as they read in the handbook." |
*
* @param {Demo_Search_Results_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_search_results_desc: ((inputs?: Demo_Search_Results_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Search_Results_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Search_Results_DescInputs = {};
