/**
* | output |
* | --- |
* | "Every call placed or received on a ticket appears in the thread as a follow-up. The follow-up records the outcome, and a connected call also records its dura..." |
*
* @param {Demo_Narrative_Topic_Call_Log_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_call_log_body: ((inputs?: Demo_Narrative_Topic_Call_Log_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Call_Log_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Call_Log_BodyInputs = {};
