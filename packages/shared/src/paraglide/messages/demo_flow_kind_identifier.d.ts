/**
* | output |
* | --- |
* | "Identifier" |
*
* @param {Demo_Flow_Kind_IdentifierInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_identifier: ((inputs?: Demo_Flow_Kind_IdentifierInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Kind_IdentifierInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Kind_IdentifierInputs = {};
