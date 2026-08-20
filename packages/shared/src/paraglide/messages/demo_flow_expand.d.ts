/**
* | output |
* | --- |
* | "Show step details" |
*
* @param {Demo_Flow_ExpandInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_expand: ((inputs?: Demo_Flow_ExpandInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_ExpandInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_ExpandInputs = {};
