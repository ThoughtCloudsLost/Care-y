/**
* | output |
* | --- |
* | "{count} results" |
*
* @param {Library_Search_Results_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_search_results_count_other: ((inputs: Library_Search_Results_Count_OtherInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Search_Results_Count_OtherInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Search_Results_Count_OtherInputs = {
    count: NonNullable<unknown>;
};
