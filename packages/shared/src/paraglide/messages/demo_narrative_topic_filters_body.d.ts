/**
* | output |
* | --- |
* | "Filter pills narrow the ticket list by status, queue, priority, assignee, on hold state, date range, or unread state. Multiple filters can be active at once...." |
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
