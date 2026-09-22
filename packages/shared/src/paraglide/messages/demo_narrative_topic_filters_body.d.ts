/**
* | output |
* | --- |
* | "Filters narrow the case list by status, queue, priority, assignee, on-hold state, creation date range, unread state and needs-attention, and several can be a..." |
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
