/**
* | output |
* | --- |
* | "Retrying decryption" |
*
* @param {Demo_Conversation_RetryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_retry: ((inputs?: Demo_Conversation_RetryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Conversation_RetryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Conversation_RetryInputs = {};
