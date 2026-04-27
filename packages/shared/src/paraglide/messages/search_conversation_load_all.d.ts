/**
* | output |
* | --- |
* | "Load all messages to search" |
*
* @param {Search_Conversation_Load_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_conversation_load_all: ((inputs?: Search_Conversation_Load_AllInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Conversation_Load_AllInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Conversation_Load_AllInputs = {};
