/**
* | output |
* | --- |
* | "Tickets are organized into queues defined by the organization. The dashboard shows a card for each queue with live open and urgent counts. **Navigation.** Ta..." |
*
* @param {Demo_Narrative_Dashboard_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_queues_body: ((inputs?: Demo_Narrative_Dashboard_Queues_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Queues_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Queues_BodyInputs = {};
