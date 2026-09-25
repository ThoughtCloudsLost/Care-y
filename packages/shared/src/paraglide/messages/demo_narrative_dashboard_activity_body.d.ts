/**
* | output |
* | --- |
* | "The activity feed shows activities from the audit log for tickets in the queues the signed-in user belongs to, newest first. It loads five at a time. [[#perm..." |
*
* @param {Demo_Narrative_Dashboard_Activity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_activity_body: ((inputs?: Demo_Narrative_Dashboard_Activity_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Activity_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Activity_BodyInputs = {};
