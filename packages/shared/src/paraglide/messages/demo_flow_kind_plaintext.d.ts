/**
* | output |
* | --- |
* | "Plaintext" |
*
* @param {Demo_Flow_Kind_PlaintextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_plaintext: ((inputs?: Demo_Flow_Kind_PlaintextInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Kind_PlaintextInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Kind_PlaintextInputs = {};
