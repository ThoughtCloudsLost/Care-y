/**
* | output |
* | --- |
* | "The activity feed shows recent case events. Names and details are encrypted in the database and only appear after the browser decrypts them with the organiza..." |
*
* @param {Demo_Narrative_Topic_Dashboard_Activity_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_dashboard_activity_body: ((inputs?: Demo_Narrative_Topic_Dashboard_Activity_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Dashboard_Activity_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Dashboard_Activity_BodyInputs = {};
