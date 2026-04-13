/**
* | output |
* | --- |
* | "{count} results" |
*
* @param {Search_Result_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_result_count: ((inputs: Search_Result_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Result_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Result_CountInputs = {
    count: NonNullable<unknown>;
};
