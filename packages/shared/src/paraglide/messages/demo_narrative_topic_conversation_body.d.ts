/**
* | output |
* | --- |
* | "The unified case thread carries everything said on a ticket in one sequence: what the client sent, what the organization sent back, the notes written about i..." |
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
