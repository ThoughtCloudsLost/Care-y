/**
* | output |
* | --- |
* | "{count} results" |
*
* @param {Library_Search_Results_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_search_results_count_other: ((inputs: Library_Search_Results_Count_OtherInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Search_Results_Count_OtherInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Search_Results_Count_OtherInputs = {
    count: NonNullable<unknown>;
};
