/**
* | output |
* | --- |
* | "Search navigation" |
*
* @param {Search_Conversation_Nav_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_conversation_nav_label: ((inputs?: Search_Conversation_Nav_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Conversation_Nav_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Conversation_Nav_LabelInputs = {};
