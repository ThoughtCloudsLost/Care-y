/**
* | output |
* | --- |
* | "No activity yet. Use the phone and each step of the flow appears here." |
*
* @param {Demo_Flow_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_empty: ((inputs?: Demo_Flow_EmptyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_EmptyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_EmptyInputs = {};
