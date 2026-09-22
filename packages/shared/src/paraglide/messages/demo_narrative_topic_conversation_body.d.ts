/**
* | output |
* | --- |
* | "The case thread carries everything said on the case in one sequence: what the client sent, what the organization sent back, the notes written about it, and t..." |
*
* @param {Demo_Narrative_Topic_Conversation_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_conversation_body: ((inputs?: Demo_Narrative_Topic_Conversation_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Conversation_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Conversation_BodyInputs = {};
