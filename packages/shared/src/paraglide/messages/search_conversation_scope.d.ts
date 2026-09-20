/**
* | output |
* | --- |
* | "Searched {searched} of {total} messages" |
*
* @param {Search_Conversation_ScopeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_conversation_scope: ((inputs: Search_Conversation_ScopeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Conversation_ScopeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Conversation_ScopeInputs = {
    searched: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
