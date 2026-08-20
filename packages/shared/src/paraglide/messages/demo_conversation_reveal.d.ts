/**
* | output |
* | --- |
* | "Decrypting messages" |
*
* @param {Demo_Conversation_RevealInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_conversation_reveal: ((inputs?: Demo_Conversation_RevealInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Conversation_RevealInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Conversation_RevealInputs = {};
