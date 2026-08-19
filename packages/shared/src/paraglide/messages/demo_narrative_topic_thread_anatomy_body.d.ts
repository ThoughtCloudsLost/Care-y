/**
* | output |
* | --- |
* | "The thread carries more than message bubbles. **Date separators.** These mark where one day ends and the next begins. **Unread divider.** A line marks the fi..." |
*
* @param {Demo_Narrative_Topic_Thread_Anatomy_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_thread_anatomy_body: ((inputs?: Demo_Narrative_Topic_Thread_Anatomy_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Thread_Anatomy_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Thread_Anatomy_BodyInputs = {};
