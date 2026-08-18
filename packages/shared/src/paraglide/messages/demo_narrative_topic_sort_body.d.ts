/**
* | output |
* | --- |
* | "Sort options reorder the ticket list by priority, date, last activity, queue, status, title, assignee, or client. **Server side fields.** Priority, date, las..." |
*
* @param {Demo_Narrative_Topic_Sort_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_sort_body: ((inputs?: Demo_Narrative_Topic_Sort_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Sort_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Sort_BodyInputs = {};
