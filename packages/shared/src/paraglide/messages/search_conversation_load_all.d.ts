/**
* | output |
* | --- |
* | "Load all messages to search" |
*
* @param {Search_Conversation_Load_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_conversation_load_all: ((inputs?: Search_Conversation_Load_AllInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Conversation_Load_AllInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Conversation_Load_AllInputs = {};
