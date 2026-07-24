/**
* | output |
* | --- |
* | "Needs attention" |
*
* @param {Tickets_Filter_Needs_AttentionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_needs_attention: ((inputs?: Tickets_Filter_Needs_AttentionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_Needs_AttentionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_Needs_AttentionInputs = {};
