/**
* | output |
* | --- |
* | "Input" |
*
* @param {Demo_Flow_Detail_InputInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_input: ((inputs?: Demo_Flow_Detail_InputInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Detail_InputInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Detail_InputInputs = {};
