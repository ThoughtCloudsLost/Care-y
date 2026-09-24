/**
* | output |
* | --- |
* | "When the system finds two client records that may belong to the same person, they appear here as merge candidates. Each pair shows two client aliases with a ..." |
*
* @param {Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_merge_candidates_body: ((inputs?: Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs = {};
