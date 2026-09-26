/**
* | output |
* | --- |
* | "The ticket list can be filtered by status, queue, priority, assignee, creation date range, unread only, and needs attention only. Several dimensions can be a..." |
*
* @param {Demo_Narrative_Topic_Filters_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_filters_body: ((inputs?: Demo_Narrative_Topic_Filters_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Filters_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Filters_BodyInputs = {};
