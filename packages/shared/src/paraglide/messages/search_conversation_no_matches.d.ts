/**
* | output |
* | --- |
* | "No matches in this conversation" |
*
* @param {Search_Conversation_No_MatchesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_conversation_no_matches: ((inputs?: Search_Conversation_No_MatchesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Conversation_No_MatchesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Conversation_No_MatchesInputs = {};
