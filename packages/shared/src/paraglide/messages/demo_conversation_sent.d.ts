/**
* | output |
* | --- |
* | "Reply sent" |
*
* @param {Demo_Conversation_SentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_sent: ((inputs?: Demo_Conversation_SentInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Conversation_SentInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Conversation_SentInputs = {};
