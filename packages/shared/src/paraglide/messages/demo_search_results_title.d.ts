/**
* | output |
* | --- |
* | "Search results" |
*
* @param {Demo_Search_Results_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_search_results_title: ((inputs?: Demo_Search_Results_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Search_Results_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Search_Results_TitleInputs = {};
