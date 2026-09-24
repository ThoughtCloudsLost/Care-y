/**
* | output |
* | --- |
* | "In this conversation" |
*
* @param {Search_Section_ConversationInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_section_conversation: ((inputs?: Search_Section_ConversationInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Section_ConversationInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Section_ConversationInputs = {};
