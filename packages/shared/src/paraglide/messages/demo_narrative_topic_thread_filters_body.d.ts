/**
* | output |
* | --- |
* | "Inside a ticket, filter by message type, author, or date. Thread filters narrow the visible timeline without a new server request. All messages are already d..." |
*
* @param {Demo_Narrative_Topic_Thread_Filters_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_thread_filters_body: ((inputs?: Demo_Narrative_Topic_Thread_Filters_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Thread_Filters_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Thread_Filters_BodyInputs = {};
