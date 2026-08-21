/**
* | output |
* | --- |
* | "Plaintext" |
*
* @param {Demo_Flow_Kind_PlaintextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_plaintext: ((inputs?: Demo_Flow_Kind_PlaintextInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Kind_PlaintextInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Kind_PlaintextInputs = {};
