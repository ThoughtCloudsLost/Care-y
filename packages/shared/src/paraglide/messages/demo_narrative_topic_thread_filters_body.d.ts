/**
* | output |
* | --- |
* | "Filters narrow the ticket's case thread by kind of entry, by author, and by a date range, and the three combine. [[#client-data]] **What does the server answ..." |
*
* @param {Demo_Narrative_Topic_Thread_Filters_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_thread_filters_body: ((inputs?: Demo_Narrative_Topic_Thread_Filters_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Thread_Filters_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Thread_Filters_BodyInputs = {};
