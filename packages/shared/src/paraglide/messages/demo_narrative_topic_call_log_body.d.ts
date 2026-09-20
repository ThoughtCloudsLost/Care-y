/**
* | output |
* | --- |
* | "Every call attempt between a volunteer and a client is logged in the thread with its outcome so the history of reaching a client stays visible inside the cas..." |
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
