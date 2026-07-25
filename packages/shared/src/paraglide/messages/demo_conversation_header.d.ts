/**
* | output |
* | --- |
* | "Viewing the conversation" |
*
* @param {Demo_Conversation_HeaderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_header: ((inputs?: Demo_Conversation_HeaderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Conversation_HeaderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Conversation_HeaderInputs = {};
