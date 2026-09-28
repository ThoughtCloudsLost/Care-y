/**
* | output |
* | --- |
* | "The unified case thread gathers everything said on a ticket into one sequence. It holds what the client sent, what the organization sent back, the notes writ..." |
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
