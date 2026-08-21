/**
* | output |
* | --- |
* | "Source" |
*
* @param {Demo_Flow_Detail_SourceInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_source: ((inputs?: Demo_Flow_Detail_SourceInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Detail_SourceInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Detail_SourceInputs = {};
