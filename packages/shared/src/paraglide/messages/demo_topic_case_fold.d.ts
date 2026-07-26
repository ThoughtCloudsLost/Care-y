/**
* | output |
* | --- |
* | "Case details" |
*
* @param {Demo_Topic_Case_FoldInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_case_fold: ((inputs?: Demo_Topic_Case_FoldInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Topic_Case_FoldInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Topic_Case_FoldInputs = {};
