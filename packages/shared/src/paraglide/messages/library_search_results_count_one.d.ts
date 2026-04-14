/**
* | output |
* | --- |
* | "{count} result" |
*
* @param {Library_Search_Results_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_search_results_count_one: ((inputs: Library_Search_Results_Count_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Library_Search_Results_Count_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Library_Search_Results_Count_OneInputs = {
    count: NonNullable<unknown>;
};
