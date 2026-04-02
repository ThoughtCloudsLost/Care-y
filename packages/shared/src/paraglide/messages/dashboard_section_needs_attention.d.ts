/**
* | output |
* | --- |
* | "Needs Attention" |
*
* @param {Dashboard_Section_Needs_AttentionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_needs_attention: ((inputs?: Dashboard_Section_Needs_AttentionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Section_Needs_AttentionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Section_Needs_AttentionInputs = {};
