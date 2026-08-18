/**
* | output |
* | --- |
* | "A per volunteer ticket list filtered to cases that need immediate action from that specific volunteer. Each volunteer sees only their own tickets that qualif..." |
*
* @param {Demo_Narrative_Dashboard_Needs_Attention_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_needs_attention_body: ((inputs?: Demo_Narrative_Dashboard_Needs_Attention_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Needs_Attention_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Needs_Attention_BodyInputs = {};
