/**
* | output |
* | --- |
* | "collapse this interaction" |
*
* @param {Demo_Flow_Slice_CollapseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_slice_collapse: ((inputs?: Demo_Flow_Slice_CollapseInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Slice_CollapseInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Slice_CollapseInputs = {};
