/**
* | output |
* | --- |
* | "A chronological list of recent events: new tickets, status changes, and assignments. **Visibility.** The feed is scoped to queues the current volunteer can a..." |
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
