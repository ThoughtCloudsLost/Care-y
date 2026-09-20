/**
* | output |
* | --- |
* | "{count} results" |
*
* @param {Demo_Handbook_Search_Result_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_handbook_search_result_count: ((inputs: Demo_Handbook_Search_Result_CountInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Handbook_Search_Result_CountInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Handbook_Search_Result_CountInputs = {
    count: NonNullable<unknown>;
};
