/**
* | output |
* | --- |
* | "An open ticket in the user's queues with nobody assigned waits here. Taking one records the account against the ticket and moves it into [My tickets](#dashbo..." |
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
