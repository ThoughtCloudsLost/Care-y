/**
* | output |
* | --- |
* | "Metadata" |
*
* @param {Demo_Flow_Kind_MetadataInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_metadata: ((inputs?: Demo_Flow_Kind_MetadataInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Kind_MetadataInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Kind_MetadataInputs = {};
