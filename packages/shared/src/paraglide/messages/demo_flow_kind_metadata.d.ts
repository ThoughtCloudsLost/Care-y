/**
* | output |
* | --- |
* | "Metadata" |
*
* @param {Demo_Flow_Kind_MetadataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_metadata: ((inputs?: Demo_Flow_Kind_MetadataInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Kind_MetadataInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Kind_MetadataInputs = {};
