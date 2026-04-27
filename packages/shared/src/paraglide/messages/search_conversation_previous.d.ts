/**
* | output |
* | --- |
* | "Previous match" |
*
* @param {Search_Conversation_PreviousInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_conversation_previous: ((inputs?: Search_Conversation_PreviousInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Conversation_PreviousInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Conversation_PreviousInputs = {};
