/**
* | output |
* | --- |
* | "A per-volunteer list of tickets needing immediate action. **What qualifies.** A ticket appears here when it is open, not on hold, marked urgent or high prior..." |
*
* @param {Demo_Narrative_Dashboard_Needs_Attention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_needs_attention_body: ((inputs?: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Needs_Attention_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Needs_Attention_BodyInputs = {};
