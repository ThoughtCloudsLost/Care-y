/**
* | output |
* | --- |
* | "Retrying decryption" |
*
* @param {Demo_Conversation_RetryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_retry: ((inputs?: Demo_Conversation_RetryInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Conversation_RetryInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Conversation_RetryInputs = {};
