/**
* | output |
* | --- |
* | "Tickets are grouped by queue, with live open and urgent counts for each. The numbers come from real queries against the in-browser database and update when y..." |
*
* @param {Demo_Narrative_Topic_Dashboard_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_dashboard_queues_body: ((inputs?: Demo_Narrative_Topic_Dashboard_Queues_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Dashboard_Queues_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Dashboard_Queues_BodyInputs = {};
