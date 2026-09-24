/**
* | output |
* | --- |
* | "Sort options reorder the ticket list by priority, date, last activity, queue, status, client, or message count. **Server side fields.** Priority, date, last ..." |
*
* @param {Demo_Narrative_Topic_Sort_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_sort_body: ((inputs?: Demo_Narrative_Topic_Sort_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Sort_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Sort_BodyInputs = {};
