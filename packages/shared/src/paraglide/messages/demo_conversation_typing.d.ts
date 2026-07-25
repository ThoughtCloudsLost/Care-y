/**
* | output |
* | --- |
* | "Sending a reply" |
*
* @param {Demo_Conversation_TypingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_typing: ((inputs?: Demo_Conversation_TypingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Conversation_TypingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Conversation_TypingInputs = {};
