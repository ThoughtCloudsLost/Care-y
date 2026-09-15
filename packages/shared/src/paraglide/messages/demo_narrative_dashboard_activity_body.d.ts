/**
* | output |
* | --- |
* | "A chronological list of recent events scoped to the queues the volunteer can access, so two volunteers with different queue memberships see different feeds. ..." |
*
* @param {Demo_Narrative_Dashboard_Activity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_activity_body: ((inputs?: Demo_Narrative_Dashboard_Activity_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Activity_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Activity_BodyInputs = {};
