/**
* | output |
* | --- |
* | "This section lists open tickets with no assignee from the queues the signed-in user belongs to. Tickets on hold are excluded. The lane has a filter button th..." |
*
* @param {Demo_Narrative_Dashboard_Unassigned_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_unassigned_body: ((inputs?: Demo_Narrative_Dashboard_Unassigned_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Unassigned_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Unassigned_BodyInputs = {};
