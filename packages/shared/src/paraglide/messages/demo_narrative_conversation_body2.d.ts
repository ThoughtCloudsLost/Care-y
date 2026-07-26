/**
* | output |
* | --- |
* | "Internal notes between volunteers are also encrypted. The server relays ciphertext without ever reading the content." |
*
* @param {Demo_Narrative_Conversation_Body2Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_conversation_body2: ((inputs?: Demo_Narrative_Conversation_Body2Inputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Conversation_Body2Inputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Conversation_Body2Inputs = {};
