/**
* | output |
* | --- |
* | "A scan pairs client records that share a phone number or an email address and offers each pair for review or dismissal. The matching runs in the browser; the..." |
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
