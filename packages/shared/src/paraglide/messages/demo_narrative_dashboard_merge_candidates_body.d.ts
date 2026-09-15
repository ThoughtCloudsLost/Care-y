/**
* | output |
* | --- |
* | "When the system finds two client records that may refer to the same person, it surfaces them in a merge candidates section on the dashboard. Each candidate p..." |
*
* @param {Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_merge_candidates_body: ((inputs?: Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Merge_Candidates_BodyInputs = {};
