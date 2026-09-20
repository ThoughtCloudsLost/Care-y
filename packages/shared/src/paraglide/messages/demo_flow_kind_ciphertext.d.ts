/**
* | output |
* | --- |
* | "Ciphertext" |
*
* @param {Demo_Flow_Kind_CiphertextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_ciphertext: ((inputs?: Demo_Flow_Kind_CiphertextInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Kind_CiphertextInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Kind_CiphertextInputs = {};
