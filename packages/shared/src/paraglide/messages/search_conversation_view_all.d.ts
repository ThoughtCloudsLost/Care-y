/**
* | output |
* | --- |
* | "View all {count} matches in conversation" |
*
* @param {Search_Conversation_View_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_conversation_view_all: ((inputs: Search_Conversation_View_AllInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Conversation_View_AllInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Conversation_View_AllInputs = {
    count: NonNullable<unknown>;
};
