/**
* | output |
* | --- |
* | "Duration" |
*
* @param {Demo_Flow_Detail_DurationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_duration: ((inputs?: Demo_Flow_Detail_DurationInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Detail_DurationInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Detail_DurationInputs = {};
