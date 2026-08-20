/**
* | output |
* | --- |
* | "Each message in a ticket is individually encrypted. Volunteers decrypt them in their browser, reply, and the response is encrypted before leaving the device." |
*
* @param {Demo_Narrative_Conversation_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_conversation_body: ((inputs?: Demo_Narrative_Conversation_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Conversation_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Conversation_BodyInputs = {};
