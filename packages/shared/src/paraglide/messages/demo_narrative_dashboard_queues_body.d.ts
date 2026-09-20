/**
* | output |
* | --- |
* | "One card per queue defined by the organization, showing live counts of open and urgent tickets. **Live counts.** Counts are real-time database queries, not c..." |
*
* @param {Demo_Narrative_Dashboard_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_queues_body: ((inputs?: Demo_Narrative_Dashboard_Queues_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Queues_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Queues_BodyInputs = {};
