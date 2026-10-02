/**
* | output |
* | --- |
* | "Each active queue the user belongs to appears as a card. Each card shows a count of open tickets, a count of urgent tickets, and the available balance of the..." |
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
