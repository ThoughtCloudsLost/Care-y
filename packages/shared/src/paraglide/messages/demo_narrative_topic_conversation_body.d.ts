/**
* | output |
* | --- |
* | "The main body of the ticket detail is a conversation thread showing messages between the volunteer and the client. Messages appear as bubbles, with the volun..." |
*
* @param {Demo_Narrative_Topic_Conversation_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_conversation_body: ((inputs?: Demo_Narrative_Topic_Conversation_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Conversation_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Conversation_BodyInputs = {};
