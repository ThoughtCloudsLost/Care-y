/**
* | output |
* | --- |
* | "collapse this interaction" |
*
* @param {Demo_Flow_Slice_CollapseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_slice_collapse: ((inputs?: Demo_Flow_Slice_CollapseInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Slice_CollapseInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Slice_CollapseInputs = {};
