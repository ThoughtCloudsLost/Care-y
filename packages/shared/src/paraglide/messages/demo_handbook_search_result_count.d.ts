/**
* | output |
* | --- |
* | "{count} results" |
*
* @param {Demo_Handbook_Search_Result_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_handbook_search_result_count: ((inputs: Demo_Handbook_Search_Result_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Handbook_Search_Result_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Handbook_Search_Result_CountInputs = {
    count: NonNullable<unknown>;
};
