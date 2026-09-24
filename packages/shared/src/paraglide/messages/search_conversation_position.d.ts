/**
* | output |
* | --- |
* | "{current} of {total}" |
*
* @param {Search_Conversation_PositionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_conversation_position: ((inputs: Search_Conversation_PositionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Conversation_PositionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Conversation_PositionInputs = {
    current: NonNullable<unknown>;
    total: NonNullable<unknown>;
};
